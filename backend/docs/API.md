# API DOCUMENTATION — Portal News

> Backend tham chiếu: `c:\Project\NodeJS\Nodejs` (Express 5 ESM, MySQL/mysql2, JWT, zod, CASL). 
Database : username:root,password:sudo1234@
database:portal_news
> Frontend: `c:\Project\NodeJS\React` — mỗi endpoint dưới đây ánh xạ trực tiếp tới trang UI tương ứng.
> Database: xem `database/schema.sql`, `database/data.sql` & `database/events.sql`.

---

## 1. TỔNG QUAN

### 1.1. Base URL & Content-Type
```
Base URL: http://localhost:4000/api
Header:   Content-Type: application/json  (trừ upload: multipart/form-data)
Auth:     Authorization: Bearer <accessToken>
          Cookie: refreshToken=<token>   (httpOnly, dùng cho /auth/refresh)
```

### 1.2. Response envelope (bắt buộc với MỌI endpoint)
```jsonc
// THÀNH CÔNG
{
  "success": true,
  "data": { ... },          // payload chính
  "meta": { ... }           // chỉ có khi là danh sách (pagination)
}

// THẤT BẠI
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",   // mã máy đọc được
    "message": "Tiêu đề là bắt buộc", // thông báo người đọc
    "details": [ { "field": "title", "message": "..." } ]  // optional (zod)
  }
}
```

### 1.3. Phân trang
Request: `?page=1&limit=20` (limit tối đa 100)
```jsonc
"meta": { "page": 1, "limit": 20, "totalItems": 128, "totalPages": 7 }
```

### 1.4. Mã lỗi chuẩn
| HTTP | code | Trường hợp |
|---|---|---|
| 400 | `VALIDATION_ERROR` | body/query sai zod schema |
| 401 | `UNAUTHENTICATED` | thiếu/sai/expired accessToken |
| 401 | `INVALID_CREDENTIALS` | sai email hoặc mật khẩu |
| 403 | `FORBIDDEN` | đúng đăng nhập nhưng thiếu quyền (CASL/RBAC) |
| 403 | `ACCOUNT_BLOCKED` | user.status = BLOCKED |
| 404 | `NOT_FOUND` | không tìm thấy tài nguyên |
| 409 | `CONFLICT` | slug/email đã tồn tại, đã báo cáo rồi... |
| 429 | `RATE_LIMITED` | spam request / spam đăng nhập |
| 503 | `MAINTENANCE` | settings.maintenance_mode = true |

### 1.5. Enum chuẩn (đồng bộ frontend ↔ DB)
```
articles.status : DRAFT | PENDING | PUBLISHED | REJECTED | SCHEDULED | UNPUBLISHED
users.status    : ACTIVE | BLOCKED
roles.code      : ADMIN | EDITOR | AUTHOR | SUBSCRIBER
comments.status : VISIBLE | HIDDEN | DELETED
reports.reason  : SPAM | HATE_SPEECH | FAKE_NEWS | OTHER
notifications   : COMMENT | LIKE | SYSTEM
ads.position    : SIDEBAR | TOP_HOMEPAGE | IN_ARTICLE
audit.status    : SUCCESS | WARNING | FAILED
```

### 1.6. Shape `ArticleCard` (dùng chung cho mọi danh sách bài — khớp `mockArticles.js`)
```jsonc
{
  "id": 1,
  "slug": "dong-doi-cu-ke-manh-khoe-tranh-ronaldo-sut-phat",
  "title": "Đồng đội cũ kể mánh khóe tranh Ronaldo sút phạt",
  "excerpt": "Những câu chuyện đằng sau hậu trường...",
  "image": "https://images.unsplash.com/photo-1508098682722-...",
  "category": { "name": "Thể thao", "slug": "the-thao" },
  "author": { "id": 10, "name": "VnExpress", "avatar": "https://..." },
  "publishedAt": "2026-10-07T03:00:00.000Z",
  "views": 12500,
  "readingTime": 4,           // phút → UI nối chuỗi "4 phút đọc"
  "isFeatured": true
}
```
> **Lưu ý:** `views` trả về số nguyên (UI tự format "12.5k"); `publishedAt` trả ISO-8601 (UI tự RelativeTime bằng `src/ulitis/formatTime.js`).

---

## 2. AUTH — `/api/auth`

### 2.1. `POST /api/auth/register` — Đăng ký (RegisterPage)
Quyền: public. Kiểm tra `settings.enable_register`.

**Request**
```json
{ "name": "Nguyễn Văn A", "email": "name@example.com", "password": "Password@123" }
```
**Response `201`**
```json
{
  "success": true,
  "data": {
    "user": { "id": 16, "name": "Nguyễn Văn A", "email": "name@example.com",
              "role": "SUBSCRIBER", "avatar": null },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "rt_..."
  }
}
```
**Lỗi:** `409 CONFLICT` (email đã có) · `400 VALIDATION_ERROR` (mật khẩu < 6 ký tự) · `403 FORBIDDEN` (tắt đăng ký)

### 2.2. `POST /api/auth/login` — Đăng nhập (LoginPage)
**Request**
```json
{ "email": "admin@portalnews.com", "password": "Password@123" }
```
**Response `200`**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "rt_...",
    "user": {
      "id": 1, "name": "Quản trị", "email": "admin@portalnews.com",
      "role": "ADMIN", "avatar": "https://www.chess.com/...",
      "permissions": ["ARTICLE_CREATE","ARTICLE_EDIT_OWN","ARTICLE_EDIT_ALL",
                      "ARTICLE_DELETE","ARTICLE_APPROVE","CATEGORY_MANAGE",
                      "USER_MANAGE","SYSTEM_SETTINGS"]
    }
  }
}
```
> `permissions[]` trả về đây để `AuthContext` nạp thẳng vào CASL `defineAbilityFor(user)` phía client.
**Lỗi:** `401 INVALID_CREDENTIALS` · `403 ACCOUNT_BLOCKED` (user 6 — Lê Hoàng C trong seed)

### 2.3. `POST /api/auth/refresh` — Gia hạn token
Cookie `refreshToken`. **Response `200`:** `{ "accessToken": "...", "user": { ... } }`
**Lỗi:** `401 UNAUTHENTICATED` (token hết hạn/đã thu hồi → đá về `/login`)

### 2.4. `POST /api/auth/logout`
**Response `200:** `{ "message": "Đã đăng xuất" }` (đánh dấu `refresh_tokens.revoked = 1`)

### 2.5. `GET /api/auth/me` — Phiên hiện tại (AuthContext khi F5 trang)
Quyền: auth. **Response `200`**
```json
{ "success": true, "data": {
    "id": 1, "name": "Quản trị", "email": "admin@portalnews.com",
    "role": "ADMIN", "avatar": "...", "bio": null,
    "permissions": ["ARTICLE_CREATE", "..."]
} }
```

### 2.6. `POST /api/auth/forgot-password` — (ForgotPasswordPage)
**Request:** `{ "email": "name@example.com" }`
**Response `200`:** `{ "message": "Đã gửi link khôi phục tới email của bạn" }`
> **Bắt buộc luôn trả 200** kể cả email không tồn tại (tránh lộ tài khoản). Backend dùng `nodemailer` + bảng `password_resets` (hạn 15 phút).

### 2.7. `POST /api/auth/reset-password`
**Request:** `{ "token": "...", "password": "MoiMatKhau@123" }` → **Response `200`:** `{ "message": "Đặt lại mật khẩu thành công" }`
**Lỗi:** `400` token sai/hết hạn/đã dùng.

### 2.8. `GET /api/auth/google` + `GET /api/auth/google/callback` (passport-google-oauth20)
Redirect → set cookie → redirect về `http://localhost:5173/`.

---

---

## 3. PUBLIC ARTICLES — `/api/articles`

### 3.1. `GET /api/articles/home` — Trang chủ (HomePage)
Quyền: public. Response tổng hợp **một lần gọi** cho cả trang:

**Response `200`**
```jsonc
{
  "success": true,
  "data": {
    "breaking":  { /* ArticleCard — is_featured mới nhất (dải "Tin nóng") */ },
    "featured":  [ /* ArticleCard[1] — ô lớn bên trái */ ],
    "topStories":[ /* ArticleCard[4] — cột "Câu chuyện hàng đầu" */ ],
    "latest":    [ /* ArticleCard[] — lưới "Tin tức mới nhất", sort publishedAt DESC */ ],
    "categories":[ { "name": "Công nghệ", "slug": "cong-nghe" }, "..." ]
  },
  "meta": { "latestTotal": 128 }
}
```
> `GET /api/articles?page=1&limit=8` chỉ trả `latest` + meta để frontend bấm **"Xem thêm bài viết khác"** (HomePage `visibleCount += 4`).

### 3.2. `GET /api/articles/:idOrSlug` — Chi tiết bài (ArticleDetailPage)
Nhận theo `id` số hoặc `slug`. **Response `200`**
```jsonc
{
  "success": true,
  "data": {
    "id": 1, "slug": "dong-doi-cu-ke-manh-khoe...", "title": "...",
    "excerpt": "...",
    "content": "<p>Trong một cuộc phỏng vấn...</p>",
    "coverImage": "https://images.unsplash.com/...",
    "category": { "id": 3, "name": "Thể thao", "slug": "the-thao" },
    "author": { "id": 10, "name": "VnExpress", "avatar": "https://...",
                 "bio": "Chuyên mục Thể thao", "expertise": null },
    "tags": [ { "name": "Năng lượng xanh", "slug": "nang-luong-xanh" } ],
    "views": 12500, "likesCount": 128, "commentsCount": 5, "readingTime": 4,
    "publishedAt": "2026-10-07T03:00:00.000Z",
    "isFeatured": true,
    "isLiked": false, "isBookmarked": false, "isFollowingAuthor": false,
    "canEdit": false,                    // user.role==='ADMIN' || user.id===author.id
    "related": [ /* ArticleCard[3] — cùng chuyên mục, khác id */ ],
    "popular": [ /* ArticleCard[4] — views DESC, sidebar "Đọc nhiều nhất" */ ]
  }
}
```
**Lỗi:** `404 NOT_FOUND` — khi slug không tồn tại (không fallback về bài đầu như mock hiện tại).

### 3.3. `POST /api/articles/:id/view` — Ghi nhận lượt xem
Public, gọi 1 lần khi mở trang (debounce theo IP+article/ngày). **Response `200`:** `{ "views": 12501 }`

### 3.4. `GET /api/articles/search` — Tìm kiếm (SearchPage)
Query: `?q=AI&category=Công nghệ&page=1&limit=10`
**Response `200`**
```jsonc
{ "success": true,
  "data": { "items": [ /* ArticleCard */ ] },
  "meta": { "page": 1, "limit": 10, "totalItems": 3, "totalPages": 1 } }
```
> Search bằng `MATCH(title, excerpt) AGAINST(... IN BOOLEAN MODE)` (FULLTEXT index) — fallback `LIKE '%q%'`.

### 3.5. `GET /api/articles/category/:slug` — Chuyên mục (CategoryPage)
Query: `?sort=latest|popular|featured&page&limit`
**Response `200`:** `{ "data": { "category": { id, name, slug, description }, "items": [ArticleCard] }, "meta": {...} }`
> `?slug=all` → bỏ lọc chuyên mục. `404` nếu slug không tồn tại.

### 3.6. `GET /api/articles/tag/:slug` — Thẻ (TagPage)
**Response `200`:** `{ "data": { "tag": { id, name, slug }, "items": [ArticleCard] }, "meta": {...} }`
> `meta.totalItems` = số bài gắn tag (hiện UI "Tổng hợp N bài viết").

### 3.7. Tương tác (yêu cầu đăng nhập)
| Endpoint | Response `data` |
|---|---|
| `POST /api/articles/:id/like` | `{ "likesCount": 129, "isLiked": true }` |
| `DELETE /api/articles/:id/like` | `{ "likesCount": 128, "isLiked": false }` |
| `POST /api/articles/:id/bookmark` | `{ "isBookmarked": true }` |
| `DELETE /api/articles/:id/bookmark` | `{ "isBookmarked": false }` |
> `401 UNAUTHENTICATED` nếu chưa đăng nhập → frontend `useAccessLogin()` mở dialog (đã có sẵn trong DialogProvider).

---

## 4. COMMENTS — `/api/articles/:id/comments` & `/api/comments`

### 4.1. `GET /api/articles/:id/comments` — Danh sách (CommentSection)
Query: `?sort=newest|most_liked&page=1&limit=10`

**Response `200`** — comment gốc kèm mảng `replies` (khớp cấu trúc UI 2 tầng):
```jsonc
{
  "success": true,
  "data": {
    "total": 2,                       // số comment gốc → header "Bình luận (2)"
    "items": [ {
      "id": 1,
      "content": "Bài viết phân tích rất sâu sắc...",
      "createdAt": "2026-10-07T01:23:45.000Z",
      "isEdited": false,
      "likesCount": 18,
      "isLiked": false,
      "status": "VISIBLE",
      "author": { "id": 7, "name": "Trần Minh", "avatar": "https://...", "role": "SUBSCRIBER" },
      "replies": [ {
        "id": 2,
        "content": "Cảm ơn bạn! ...",
        "createdAt": "2026-10-06T14:15:30.000Z",
        "likesCount": 9, "isLiked": false,
        "author": { "id": 3, "name": "Minh Châu", "avatar": "...", "role": "AUTHOR" },
        "replyTo": { "id": 1, "authorName": "Trần Minh" }   // → hiển thị "@Trần Minh"
      } ]
    } ]
  },
  "meta": { "page": 1, "limit": 10, "totalItems": 2, "totalPages": 1 }
}
```
> UI chỉ render 1 reply đầu, phần còn lại giữ trong `replies[]` chờ bấm "Xem thêm N phản hồi".
> `sort=newest` → `createdAt DESC`; `sort=most_liked` → `likes_count DESC` (cả 2 cấp).

### 4.2. `POST /api/articles/:id/comments` — Đăng bình luận / trả lời
**Request** (gốc): `{ "content": "Bài viết rất hữu ích!" }`
**Request** (trả lời): `{ "content": "Cảm ơn bạn!", "parentId": 1, "replyToId": 1 }`
**Response `201`** — object Comment shape như trên (gốc thì `replies: []`).
> Side-effect: tạo `notifications` (type `COMMENT`) cho chủ bài / người bị reply.
**Lỗi:** `400` content rỗng hoặc > 2000 ký tự · `404` article/comment cha không tồn tại.

### 4.3. `PATCH /api/comments/:id` — Sửa (nút "Sửa" — CASL `update`)
**Request:** `{ "content": "Nội dung đã sửa" }` → **Response `200`:** Comment với `"isEdited": true`

### 4.4. `DELETE /api/comments/:id` — Xóa (CASL `delete`)
Quyền: chủ comment **hoặc** `EDITOR` (xóa mọi comment) **hoặc** `ADMIN`.
**Response `200`:** `{ "message": "Đã xóa bình luận" }` (hard-delete, cascade comment con).

### 4.5. `POST` / `DELETE` `/api/comments/:id/like`
**Response:** `{ "likesCount": 19, "isLiked": true|false }`

### 4.6. `POST /api/comments/:id/reports` — Báo cáo (ReportCommentDialog)
**Request:** `{ "reason": "SPAM", "note": "Chứa link quảng cáo" }`
`reason ∈ SPAM | HATE_SPEECH | FAKE_NEWS | OTHER` (bắt buộc; `note` bắt buộc khi `OTHER`).
**Response `201`:** `{ "id": 1, "status": "PENDING", "message": "Đã gửi báo cáo tới Ban quản trị" }`
**Lỗi:** `409 CONFLICT` — đã báo cáo comment này rồi.

---

## 5. USER CENTER — `/api/users/me` (Profile, Bookmarks, History, Notifications)

### 5.1. `GET /api/users/me` — Hồ sơ + thống kê (ProfilePage)
**Response `200`**
```jsonc
{
  "success": true,
  "data": {
    "id": 1, "name": "Quản trị", "email": "admin@portalnews.com",
    "avatar": "https://...", "bio": null, "role": "ADMIN",
    "stats": { "bookmarks": 3, "history": 3, "notifications": 2, "comments": 9 }
  }
}
```
> `stats` khớp 4 card ở ProfilePage (`Bài đã lưu / Lịch sử đọc / Thông báo / Bình luận`).

### 5.2. `PATCH /api/users/me` — Cập nhật hồ sơ
**Request:** `{ "name": "...", "bio": "..." }` → **Response `200`:** user object đã cập nhật.

### 5.3. `PATCH /api/users/me/avatar` — Đổi avatar (multipart)
`multipart/form-data`, field `avatar` (jpg/png ≤ 2MB) → **Response `200`:** `{ "avatarUrl": "http://.../Uploads/xyz.jpg" }`

### 5.4. `GET /api/users/me/bookmarks` — Bài viết đã lưu (BookmarksPage)
**Response `200`**
```jsonc
{ "success": true,
  "data": { "items": [ { /* ArticleCard */, "bookmarkedAt": "2026-10-07T08:00:00Z" } ] },
  "meta": { "page": 1, "limit": 20, "totalItems": 3, "totalPages": 1 } }
```

### 5.5. `GET /api/users/me/history` — Lịch sử đọc (ReadingHistoryPage)
**Response `200`:** `{ "data": { "items": [ { /* ArticleCard */, "readAt": "2026-10-06T14:30:00Z" } ] }, "meta": {...} }`

### 5.6. Xóa lịch sử
| Endpoint | Response |
|---|---|
| `DELETE /api/users/me/history` | `{ "message": "Đã xóa toàn bộ lịch sử" }` |
| `DELETE /api/users/me/history/:articleId` | `{ "message": "Đã xóa 1 mục" }` |

### 5.7. `GET /api/users/me/notifications` — Trung tâm thông báo (NotificationsPage)
Query: `?unreadOnly=true&page&limit`
**Response `200`**
```jsonc
{ "success": true,
  "data": {
    "unreadCount": 2,
    "items": [ {
      "id": 1, "type": "COMMENT",
      "title": "Nguyễn Văn B đã trả lời bình luận của bạn",
      "time": "2026-10-07T01:22:25.000Z",     // UI formatRelativeTime
      "isRead": false,
      "link": "/article/dong-doi-cu-ke-manh-khoe..."
    } ]
  },
  "meta": { "page": 1, "limit": 20, "totalItems": 3, "totalPages": 1 } }
```

### 5.8. Đánh dấu đã đọc
| Endpoint | Response |
|---|---|
| `PATCH /api/users/me/notifications/:id/read` | `{ "unreadCount": 1 }` |
| `PATCH /api/users/me/notifications/read-all` | `{ "unreadCount": 0 }` |

### 5.9. Theo dõi / Bỏ theo dõi tác giả
| Endpoint | Response |
|---|---|
| `POST /api/users/me/follows/:authorId` | `{ "isFollowing": true, "followersCount": 4 }` |
| `DELETE /api/users/me/follows/:authorId` | `{ "isFollowing": false, "followersCount": 3 }` |

---

## 6. PUBLIC AUTHOR — `/api/authors`

### 6.1. `GET /api/authors/:id` — Trang tác giả (AuthorPublicProfilePage)
**Response `200`**
```jsonc
{ "success": true, "data": {
    "id": 3, "name": "Minh Châu",
    "avatar": "https://images.unsplash.com/photo-1534528741775-...",
    "expertise": "Chuyên gia Công nghệ & AI",
    "bio": "Nhà báo công nghệ với hơn 8 năm kinh nghiệm...",
    "articleCount": 4, "followerCount": 3,
    "isFollowing": false,                 // theo user hiện tại
    "articles": [ /* ArticleCard[] — bài PUBLISHED của tác giả */ ]
} }
```

### 6.2. `GET /api/authors/:id/articles` — Phân trang bài của tác giả
Query: `?page&limit` → `{ "data": { "items": [ArticleCard] }, "meta": {...} }`

---

## 7. AUTHOR STUDIO — `/api/author/*` (yêu cầu role AUTHOR / EDITOR / ADMIN)

### 7.1. `GET /api/author/dashboard` — Dashboard tác giả (AuthorDashboard)
**Response `200`**
```jsonc
{ "success": true, "data": {
    "stats": { "total": 12, "published": 8, "pending": 2, "views": 45200 },
    "recentArticles": [ {
      "id": 1, "title": "...", "coverImage": "https://...",
      "category": "Thể thao", "publishedAt": "2026-10-07T03:00:00Z",
      "status": "PUBLISHED"
    } ]
} }
```

### 7.2. `GET /api/author/articles` — Bài viết của tôi (MyArticlesPage)
Query: `?status=ALL|DRAFT|PENDING|PUBLISHED|REJECTED|SCHEDULED&page&limit&q=`
**Response `200`**
```jsonc
{ "success": true,
  "data": { "items": [ {
      "id": 101, "title": "Kỷ nguyên Chip bán dẫn AI...",
      "category": "Công nghệ", "status": "PUBLISHED",
      "views": 4520, "createdAt": "2026-09-20T00:00:00Z"
  } ] },
  "meta": { "page": 1, "limit": 10, "totalItems": 12, "totalPages": 2 } }
```
> **Quyền:** chỉ trả bài của chính mình; `ADMIN/EDITOR` truyền `?all=true` để thấy tất cả (mặc định `/admin/articles`).

### 7.3. `POST /api/articles` — Tạo bài (CreateArticlePage)
Quyền: `ARTICLE_CREATE`. **Request**
```json
{
  "title": "Tiêu đề bài viết",
  "excerpt": "Tóm tắt 1-2 câu",
  "content": "<p>HTML từ RichEditor</p>",
  "categoryId": 1,
  "coverImage": "https://images.unsplash.com/...",
  "tagIds": [1, 4],
  "action": "SUBMIT"          // "DRAFT" = Lưu bản nháp | "SUBMIT" = Gửi duyệt
}
```
**Response `201`:** `{ "id": 13, "slug": "tieu-de-bai-viet", "status": "PENDING" }` (DRAFT → `status: "DRAFT"`)
**Lỗi:** `400` thiếu title/content · `409` slug trùng · `403` thiếu quyền.

### 7.4. `GET /api/articles/:id/edit` — Nạp bài vào form sửa (EditArticlePage)
Quyền: chủ bài hoặc `ARTICLE_EDIT_ALL`. **Response `200`**
```jsonc
{ "success": true, "data": {
    "id": 101, "title": "...", "excerpt": "...", "content": "...",
    "categoryId": 1, "coverImage": "...", "tagIds": [1,5],
    "status": "PUBLISHED", "rejectReason": null,
    "lastSavedAt": "2026-10-07T06:00:00Z"
} }
```

### 7.5. `PATCH /api/articles/:id` — Lưu chỉnh sửa
**Request:** các field cần sửa (giống 7.3, không bắt buộc đủ) + `action?: "DRAFT"|"SUBMIT"`
**Response `200`:** `{ "id": 101, "status": "DRAFT", "updatedAt": "..." }`

### 7.6. `DELETE /api/articles/:id` — Xóa bài (MyArticlesPage)
Quyền: `ARTICLE_DELETE` (chủ bài nếu chỉ có `ARTICLE_EDIT_OWN`). → `{ "message": "Đã xóa bài viết" }`

### 7.7. `POST /api/articles/:id/submit` — Gửi duyệt lại (từ DRAFT/REJECTED)
→ **Response `200`:** `{ "id": 101, "status": "PENDING" }` (tạo notification SYSTEM cho author nếu approve sau đó)

### 7.8. `GET /api/author/schedule` — Lịch xuất bản (PublishSchedulePage)
**Response `200`:** `{ "data": { "items": [ { "id": 11, "title": "...", "category": "Công nghệ", "scheduledAt": "2026-10-10T08:00:00Z", "status": "SCHEDULED" } ] } }`

### 7.9. `POST /api/articles/:id/schedule` & `PATCH /api/articles/:id/schedule`
**Request:** `{ "scheduledAt": "2026-10-10T08:00:00" }` → **Response `200`:** `{ "scheduledAt": "...", "status": "SCHEDULED" }`
> Backend dùng MySQL Event / node-cron đến giờ chuyển `SCHEDULED → PUBLISHED`.

### 7.10. `GET /api/author/analytics` — Thống kê (ArticleAnalyticsPage)
Query: `?range=7d|30d`
**Response `200`**
```jsonc
{ "success": true, "data": {
    "totals": { "views": 45280, "likes": 3120, "comments": 890,
                "avgReadTime": "4m 12s", "viewsDeltaPct": 18 },
    "chart": [ { "day": "Thứ 2", "views": 400 }, { "day": "Thứ 3", "views": 650 },
               { "day": "Thứ 4", "views": 300 }, { "day": "Thứ 5", "views": 850 },
               { "day": "Thứ 6", "views": 950 }, { "day": "Thứ 7", "views": 500 },
               { "day": "Chủ Nhật", "views": 750 } ],
    "topArticles": [ { "id": 1, "title": "...", "views": 12500, "likes": 128, "comments": 5 } ]
} }
```
> `chart` aggregate từ `article_stats_daily`; labels thứ trong tuần tính theo ngày hiện tại.

### 7.11. Media (MediaLibraryPage)
| Endpoint | Request | Response `data` |
|---|---|---|
| `GET /api/media?page` | — | `{ "items": [ { "id":1, "name":"ai-chipset-2026.jpg", "size":"1.2 MB", "url":"https://..." } ] }` (size do server format) |
| `POST /api/media` | `multipart`, field `file` (≤5MB, jpg/png/webp/docx) | `201 { "id": 4, "name": "...", "size": "850 KB", "url": "..." }` |
| `DELETE /api/media/:id` | — | `{ "message": "Đã xóa file" }` (chỉ uploader hoặc ADMIN) |

---

## 8. ADMIN — `/api/admin/*`
> **Middleware chung:** xác thực JWT → kiểm tra quyền theo `role_permissions`
> (`USER_MANAGE` cho users/roles, `CATEGORY_MANAGE` cho categories/tags/menu, `ARTICLE_APPROVE` cho duyệt bài, `SYSTEM_SETTINGS` cho settings/ads/logs). Thiếu quyền → `403 FORBIDDEN`.
> Mọi thao tác ghi vào `audit_logs`.

### 8.1. `GET /api/admin/dashboard` — Bảng điều khiển (AdminDashboard)
**Response `200`**
```jsonc
{ "success": true, "data": {
    "stats": {
      "totalArticles": 1248, "articlesToday": 12,       // card "Tổng bài viết"
      "pending": 14,                                     // card "Bài chờ kiểm duyệt"
      "totalUsers": 8920, "newUsersThisMonth": 145,      // card "Tổng Thành viên"
      "reports": 3                                       // card "Báo cáo vi phạm"
    },
    "pendingArticles": [                                 // widget trái
      { "id": 7, "title": "Đánh giá chi tiết chipset AI...",
        "author": "Nguyễn Văn A", "category": "Công nghệ",
        "submittedAt": "2026-10-07T07:50:00Z" }
    ],
    "recentLogs": [                                      // widget "Nhật ký hệ thống"
      { "action": "Đã xuất bản bài viết #1", "user": "Admin",
        "time": "2026-10-07T03:00:00Z", "color": "green" }  // color: green|blue|red|purple
    ]
} }
```

### 8.2. Duyệt bài (ArticleModerationPage)
| Endpoint | Request | Response `data` |
|---|---|---|
| `GET /api/admin/articles?status=PENDING&page` | — | `{ "items": [ { "id":7, "title":"...", "author":"Nguyễn Văn A", "category":"Công nghệ", "submittedAt":"...", "coverImage":"..." } ], "meta": {...} }` |
| `GET /api/admin/articles/:id/preview` | — | object Article đầy đủ (nút "Xem thử") |
| `POST /api/admin/articles/:id/approve` | — | `{ "id": 7, "status": "PUBLISHED", "publishedAt": "..." }` + notification SYSTEM cho author |
| `POST /api/admin/articles/:id/reject` | `{ "reason": "Chưa đủ nguồn" }` | `{ "id": 7, "status": "REJECTED", "rejectReason": "Chưa đủ nguồn" }` + notification |
| `POST /api/admin/articles/:id/unpublish` | — | `{ "id": 7, "status": "UNPUBLISHED" }` |
| `POST /api/admin/articles/:id/feature` | `{ "isFeatured": true }` | `{ "id": 7, "isFeatured": true }` |

### 8.3. `GET /api/admin/users` — Quản lý người dùng (UserManagementPage)
Query: `?search=&role=AUTHOR&status=ACTIVE&page&limit`
**Response `200`**
```jsonc
{ "success": true,
  "data": { "items": [ {
      "id": 4, "name": "Nguyễn Văn A", "email": "nguyenvana@gmail.com",
      "role": "AUTHOR", "status": "ACTIVE",
      "createdAt": "2026-09-01T00:00:00Z", "lastLoginAt": "2026-10-07T06:00:00Z"
  } ] },
  "meta": { "page": 1, "limit": 20, "totalItems": 15, "totalPages": 1 } }
```
| Thao tác | Endpoint | Response |
|---|---|---|
| Khóa / mở khóa | `PATCH /api/admin/users/:id/status` body `{ "status": "BLOCKED" }` | `{ "id": 6, "status": "BLOCKED" }` |
| Đổi vai trò | `PATCH /api/admin/users/:id/role` body `{ "role": "AUTHOR" }` | `{ "id": 5, "role": "AUTHOR" }` |
> Không cho đổi role của chính mình → `400`. User bị khóa không đăng nhập được → `403 ACCOUNT_BLOCKED`.

### 8.4. `GET /api/admin/categories` — Chuyên mục (CategoryTagManagementPage)
**Response `200`:** `{ "data": { "items": [ { "id":1, "name":"Công nghệ", "slug":"cong-nghe", "parent":null, "articleCount":124 } ] } }`
(`parent` = id chuyên mục cha, UI vẽ "└──" cho mục con)
| Endpoint | Request | Response |
|---|---|---|
| `POST /api/admin/categories` | `{ "name":"AI", "slug":"ai", "parentId":1, "description":"..." }` | `201 { item }` |
| `PATCH /api/admin/categories/:id` | `{ "name", "slug", "parentId", "position" }` | `{ item }` |
| `DELETE /api/admin/categories/:id` | — | `{ "message" }` · `409` nếu còn bài viết |

### 8.5. `GET /api/admin/tags` — Tags
**Response `200`:** `{ "data": { "items": [ { "id":1, "name":"Semiconductor", "slug":"semiconductor", "articleCount":15 } ] } }`
`POST /api/admin/tags { name, slug? }` → `201 { item }` · `DELETE /api/admin/tags/:id` → `{ message }` (`409` nếu đang gắn bài, hoặc gỡ tag khỏi bài tùy policy).

---

### 8.6. Menu (MenuManagementPage)
| Endpoint | Request / Response `data` |
|---|---|
| `GET /api/admin/menu` | `{ "items": [ { "id":1, "label":"Trang chủ", "url":"/", "target":"_self", "location":"HEADER", "position":1 } ] }` |
| `POST /api/admin/menu` | body `{ label, url, target, location }` → `201 { item }` |
| `PATCH /api/admin/menu/:id` | body `{ label?, url?, target?, location? }` → `{ item }` |
| `PUT /api/admin/menu/reorder` | body `{ "ids": [3,1,2,5,4] }` (thứ tự mới) → `{ "items": [...] }` |
| `DELETE /api/admin/menu/:id` | → `{ "message": "Đã xóa liên kết" }` |

### 8.7. `GET /api/admin/roles` — Ma trận phân quyền (RolePermissionsPage)
**Response `200`** — trả đúng shape `mockRoleMatrix` + `mockPermissions`:
```jsonc
{ "success": true, "data": {
    "permissions": [ { "key": "ARTICLE_CREATE", "label": "Tạo mới bài viết" }, "..." ],
    "roles": [ { "code": "ADMIN", "name": "Quản trị viên",
                 "permissions": ["ARTICLE_CREATE","ARTICLE_EDIT_OWN","ARTICLE_EDIT_ALL",
                                 "ARTICLE_DELETE","ARTICLE_APPROVE","CATEGORY_MANAGE",
                                 "USER_MANAGE","SYSTEM_SETTINGS"] },
               { "code": "EDITOR",   "permissions": ["ARTICLE_CREATE","ARTICLE_EDIT_OWN","ARTICLE_EDIT_ALL","ARTICLE_DELETE","ARTICLE_APPROVE","CATEGORY_MANAGE"] },
               { "code": "AUTHOR",    "permissions": ["ARTICLE_CREATE","ARTICLE_EDIT_OWN"] },
               { "code": "SUBSCRIBER","permissions": [] } ]
} }
```
### 8.8. `PUT /api/admin/roles/:code/permissions` — Lưu ma trận
**Request:** `{ "permissions": ["ARTICLE_CREATE","ARTICLE_EDIT_OWN"] }`
**Response `200`:** `{ "code": "AUTHOR", "permissions": [...] }`
> **Bất biến:** `ADMIN` luôn giữ đủ 8 quyền — body thiếu quyền của ADMIN → `400` (UI cũng disable checkbox).
> Ghi `audit_logs` ("Cập nhật quyền vai trò ...").

### 8.9. Quảng cáo (AdsManagementPage)
| Endpoint | Request / Response `data` |
|---|---|
| `GET /api/admin/advertisements` | `{ "items": [ { "id":1, "title":"Banner Sidebar - VinFast", "position":"SIDEBAR", "views":45000, "clicks":1240, "active":true } ], "stats": { "revenue": 4850, "totalClicks": 6020, "ctr": "3.1%", "activeAds": "2/3" } }` |
| `POST /api/admin/advertisements` | `{ title, position, imageUrl, linkUrl }` → `201 { item }` |
| `PATCH /api/admin/advertisements/:id` | `{ isActive?, title?, position? }` → `{ item }` (nút bật/tắt) |
| `DELETE /api/admin/advertisements/:id` | → `{ message }` |
| `POST /api/advertisements/:id/event` | `{ "type": "VIEW" \| "CLICK" }` → `{ views, clicks }` — public, frontend gọi khi render banner / nhấp |

### 8.10. Báo cáo bình luận (ReportCommentDialog → xử lý ở admin)
| Endpoint | Request / Response |
|---|---|
| `GET /api/admin/comment-reports?status=PENDING` | `{ "items": [ { "id":1, "comment": { "id":5, "content":"..." }, "reporter": "Trần Minh", "reason":"SPAM", "status":"PENDING", "createdAt":"..." } ], "meta": {...} }` |
| `PATCH /api/admin/comment-reports/:id` | `{ "status": "RESOLVED", "action": "HIDE_COMMENT" }` → `{ report }` · `action ∈ HIDE_COMMENT \| DELETE_COMMENT \| NONE` |

### 8.11. `GET /api/admin/audit-logs` — Nhật ký (AuditLogPage)
Query: `?user=&status=SUCCESS|WARNING|FAILED&from=2026-10-01&to=2026-10-07&page&limit`
**Response `200`**
```jsonc
{ "success": true,
  "data": { "items": [ {
      "id": 3, "user": "Unknown",
      "action": "Đăng nhập thất bại (Sai mật khẩu 5 lần)",
      "ip": "27.72.61.102", "status": "WARNING",
      "time": "2026-10-07T05:00:00Z"
  } ] },
  "meta": { "page": 1, "limit": 20, "totalItems": 5, "totalPages": 1 } }
```

### 8.12. Cài đặt hệ thống (SystemSettingsPage)
| Endpoint | Request / Response |
|---|---|
| `GET /api/admin/settings` | `{ "site_name": "Portal News 2026", "site_description": "...", "contact_email": "admin@portalnews.com", "maintenance_mode": false, "enable_register": true }` |
| `PUT /api/admin/settings` | body key/value như trên → `{ ...settings }` · ghi audit_log |

---

## 9. SYSTEM & KHÁC

### 9.1. `GET /api/settings/public` — Cấu hình công khai (PublicLayout / MaintenancePage)
**Response `200`:** `{ "data": { "siteName": "Portal News 2026", "siteDescription": "...", "contactEmail": "...", "contactAddress": "...", "contactHotline": "...", "maintenanceMode": false, "enableRegister": true } }`
> Khi `maintenanceMode = true`, middleware trả `503 MAINTENANCE` cho endpoint public (trừ `/api/auth/*`, `/api/admin/*`, `/api/settings/public`).

### 9.2. `GET /api/menu?location=HEADER|FOOTER` — Menu (PublicLayout)
**Response `200`:** `{ "data": { "items": [ { "id":1, "label":"Trang chủ", "url":"/", "target":"_self" } ] } }`

### 9.3. `POST /api/contact` — Form liên hệ (ContactPage)
**Request:** `{ "name": "Nguyễn Văn A", "email": "a@example.com", "subject": "Hợp tác quảng cáo", "content": "..." }`
**Response `201`:** `{ "message": "Đã gửi tin nhắn thành công!" }`
**Lỗi:** `400` thiếu trường · `429 RATE_LIMITED` (1 submissions / phút / IP).

### 9.4. `GET /api/system/health`
**Response `200`:** `{ "status": "ok", "uptime": 12345, "db": "connected" }`

---

## 10. MA TRẬN QUYỀN TÓM TẮT (middleware)

| Endpoint nhóm | GUEST | SUBSCRIBER | AUTHOR | EDITOR | ADMIN |
|---|:--:|:--:|:--:|:--:|:--:|
| Đọc bài / comment / search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Đăng/sửa/xóa comment của mình | ❌ | ✅ | ✅ | ✅ | ✅ |
| Lưu bài, lịch sử, thông báo, follow | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tạo/sửa bài của mình, gửi duyệt | ❌ | ❌ | ✅ | ✅ | ✅ |
| Duyệt/từ chối bài, xóa mọi comment | ❌ | ❌ | ❌ | ✅ | ✅ |
| Sửa mọi bài (`ARTICLE_EDIT_ALL`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Quản lý user/role/ads/logs/settings | ❌ | ❌ | ❌ | ❌ | ✅ |

> Khớp 1-1 với `src/ability/ability.js` (frontend) và bảng `role_permissions` (seed).

## 11. THÀNH PHẦN ĐIỀU KHIỂN GỢI Ý (chưa nằm trong repo)
```
src/services/            ← phía React (axios instance + interceptor JWT)
  http.js  authApi.js  articleApi.js  commentApi.js  userApi.js
  authorApi.js  adminApi.js  menuApi.js  settingsApi.js
.env (React):  VITE_API_URL=http://localhost:4000/api
.env (Nodejs): DB_HOST/DB_USER/DB_PASS/DB_NAME=portal_news, JWT_SECRET, JWT_REFRESH_SECRET, SMTP_*
```







