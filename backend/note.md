# 1. Sơ đồ tổng thể website

```text
NEWS / BLOG WEBSITE
│
├── 1. PUBLIC WEBSITE
│   │
│   ├── Trang chủ
│   ├── Chuyên mục
│   ├── Trang bài viết
│   ├── Tìm kiếm
│   ├── Tag
│   ├── Tác giả
│   ├── Giới thiệu
│   ├── Liên hệ
│   │
│   └── Các chức năng người dùng
│       ├── Đăng ký
│       ├── Đăng nhập
│       ├── Quên mật khẩu
│       ├── Hồ sơ
│       ├── Lưu bài
│       ├── Lịch sử đọc
│       ├── Bình luận
│       ├── Theo dõi tác giả
│       └── Thông báo
│
├── 2. AUTHOR / WRITER AREA
│   │
│   ├── Dashboard tác giả
│   ├── Bài viết của tôi
│   ├── Tạo bài viết
│   ├── Chỉnh sửa bài
│   ├── Bản nháp
│   ├── Bài chờ duyệt
│   ├── Bài đã xuất bản
│   ├── Lịch xuất bản
│   ├── Media
│   └── Thống kê bài viết
│
├── 3. ADMIN PANEL
│   │
│   ├── Dashboard
│   ├── Quản lý bài viết
│   ├── Quản lý chuyên mục
│   ├── Quản lý tag
│   ├── Quản lý tác giả
│   ├── Quản lý người dùng
│   ├── Quản lý bình luận
│   ├── Quản lý media
│   ├── Quản lý quảng cáo
│   ├── Quản lý menu
│   ├── Thống kê
│   ├── Báo cáo
│   ├── Role & Permission
│   ├── Audit Log
│   └── Cài đặt hệ thống
│
└── 4. SYSTEM
    │
    ├── Authentication
    ├── Authorization
    ├── Notification
    ├── Search
    ├── Upload
    ├── Logging
    ├── Cache
    ├── Rate Limit
    └── Error handling
```

---

# 2. Cây routing của phần website công khai

Bạn có thể hình dung React Router như sau:

```text
/
│
├── /
│   └── Trang chủ
│
├── /category/:slug
│   └── Chuyên mục
│
├── /article/:slug
│   └── Chi tiết bài viết
│
├── /search
│   └── Tìm kiếm
│
├── /tag/:slug
│   └── Bài viết theo tag
│
├── /author/:slug
│   └── Trang tác giả
│
├── /about
│   └── Giới thiệu
│
├── /contact
│   └── Liên hệ
│
├── /login
│   └── Đăng nhập
│
├── /register
│   └── Đăng ký
│
├── /forgot-password
│   └── Quên mật khẩu
│
└── /user
    │
    ├── /profile
    ├── /saved
    ├── /history
    ├── /comments
    ├── /following
    └── /notifications
```

---

# 3. Trang chủ `/`

Đây là trang quan trọng nhất.

```text
HOME
│
├── Header
│   ├── Logo
│   ├── Menu chuyên mục
│   ├── Search
│   ├── Login / Avatar
│   └── Notification
│
├── Breaking News
│
├── Featured News
│   ├── Bài nổi bật lớn
│   ├── Bài nổi bật phụ
│   └── Bài nổi bật phụ
│
├── Latest News
│   ├── Article Card
│   ├── Article Card
│   ├── Article Card
│   └── Pagination / Load more
│
├── Popular News
│   ├── Most viewed
│   ├── Most commented
│   └── Trending
│
├── Category Sections
│   ├── Công nghệ
│   ├── Kinh tế
│   ├── Thể thao
│   ├── Giải trí
│   └── ...
│
├── Recommended
│
├── Newsletter
│
└── Footer
    ├── About
    ├── Categories
    ├── Social
    ├── Contact
    └── Copyright
```

### Nhiệm vụ của từng phần

**Header**

Điều hướng toàn site.

**Breaking News**

Hiển thị tin nóng / tin mới nhất.

**Featured News**

Editor chọn những bài muốn đẩy lên vị trí nổi bật.

**Latest News**

Danh sách bài mới xuất bản.

**Popular News**

Tính theo lượt xem, tương tác hoặc thuật toán.

**Category Sections**

Mỗi chuyên mục lấy ra một số bài tiêu biểu.

**Recommended**

Có thể dựa vào lịch sử đọc, category người dùng quan tâm...

---

# 4. Trang chuyên mục

Ví dụ:

```text
/category/technology
```

Cấu trúc:

```text
CATEGORY PAGE
│
├── Breadcrumb
│
├── Category Header
│   ├── Tên chuyên mục
│   └── Mô tả
│
├── Featured Articles
│
├── Article List
│   ├── Article Card
│   ├── Article Card
│   ├── Article Card
│   └── ...
│
├── Filter
│   ├── Mới nhất
│   ├── Nhiều lượt xem
│   └── Nổi bật
│
├── Pagination
│
└── Sidebar
    ├── Popular
    ├── Trending
    ├── Advertisement
    └── Tags
```

Ở đây bạn có thể luyện rất nhiều thứ React:

* pagination
* filter
* sorting
* query params
* loading
* empty state
* error state
* fetch API
* reusable ArticleCard

---

# 5. Trang bài viết

Ví dụ:

```text
/article/react-server-components
```

Đây là trang phức tạp nhất phía frontend.

```text
ARTICLE PAGE
│
├── Breadcrumb
│
├── Category
│
├── Title
│
├── Subtitle / Excerpt
│
├── Author
│   ├── Avatar
│   ├── Name
│   └── Published date
│
├── Article Meta
│   ├── Views
│   ├── Reading time
│   └── Updated time
│
├── Action
│   ├── Like
│   ├── Save
│   ├── Share
│   └── Report
│
├── Featured Image
│
├── Article Content
│   ├── Paragraph
│   ├── Image
│   ├── Heading
│   ├── Quote
│   ├── Code
│   ├── Video
│   └── ...
│
├── Tags
│
├── Author Box
│
├── Related Articles
│
├── Recommended Articles
│
├── Comments
│   ├── Comment Form
│   ├── Comment
│   │   ├── Reply
│   │   ├── Like
│   │   └── Report
│   └── Pagination
│
└── Sidebar
    ├── Table of Contents
    ├── Popular
    └── Advertisement
```

---

# 6. Tìm kiếm

```text
/search?q=react
```

```text
SEARCH PAGE
│
├── Search Input
│
├── Search Result Summary
│
├── Filter
│   ├── Category
│   ├── Author
│   ├── Date
│   └── Tag
│
├── Sort
│   ├── Relevant
│   ├── Newest
│   └── Most viewed
│
├── Results
│   └── Article Card
│
└── Pagination
```

---

# 7. Trang tác giả

```text
/author/:slug
```

```text
AUTHOR PAGE
│
├── Cover
├── Avatar
├── Name
├── Bio
├── Social Links
├── Follower Count
├── Follow Button
│
├── Author Articles
│
├── Most Popular Articles
│
└── Pagination
```

---

# 8. Khu vực User

Sau khi đăng nhập:

```text
/user
│
├── Dashboard
│
├── Profile
│   ├── Avatar
│   ├── Name
│   ├── Email
│   ├── Bio
│   └── Change Password
│
├── Saved Articles
│
├── Reading History
│
├── My Comments
│
├── Following
│   ├── Authors
│   └── Categories
│
├── Notifications
│
└── Settings
    ├── Account
    ├── Notification
    └── Privacy
```

---

# 9. Role của hệ thống

Đối với website báo/blog, mình khuyên dùng mô hình:

```text
Guest
   │
   └── chưa đăng nhập

Member
   │
   └── độc giả

Author
   │
   └── viết bài

Editor
   │
   └── kiểm duyệt / biên tập bài

Moderator
   │
   └── quản lý bình luận

Admin
   │
   └── quản trị hệ thống

Super Admin
   │
   └── toàn quyền
```

Tức là **7 mức truy cập** nếu tính cả Guest.

Nhưng `Guest` không nhất thiết phải là role trong database. Bạn có thể coi đó là:

```text
User chưa đăng nhập
```

Còn trong DB:

```text
MEMBER
AUTHOR
EDITOR
MODERATOR
ADMIN
SUPER_ADMIN
```

---

# 10. Permission nên thiết kế như thế nào?

Đừng chỉ làm:

```text
role = admin
```

rồi code:

```js
if (user.role === "admin") ...
```

Sau này hệ thống sẽ rất khó mở rộng.

Nên có:

```text
ROLE
  ↓
PERMISSIONS
```

Ví dụ:

```text
ARTICLE
├── article.read
├── article.create
├── article.edit
├── article.edit.own
├── article.delete
├── article.delete.own
├── article.submit
├── article.review
├── article.approve
├── article.publish
├── article.unpublish
└── article.schedule
```

---

# 11. Permission cho từng role

## Guest

```text
article.read
category.read
author.read
search
```

Có thể:

```text
Xem bài
Xem chuyên mục
Tìm kiếm
Xem tác giả
```

Không thể:

```text
Comment
Like
Save
Follow
```

---

# 12. Member

```text
Guest permission
+
comment.create
comment.edit.own
comment.delete.own
article.save
article.like
author.follow
category.follow
notification.read
profile.edit
```

---

# 13. Author

```text
Member
+
article.create
article.edit.own
article.delete.own
article.submit
media.upload
article.view.analytics
```

Author **không được tự ý publish**.

Ví dụ:

```text
Author
   ↓
Tạo bài
   ↓
Draft
   ↓
Submit
   ↓
Editor
```

---

# 14. Editor

```text
article.read
article.edit.any
article.review
article.approve
article.reject
article.publish
article.unpublish
article.schedule

category.create
category.edit
category.delete

tag.create
tag.edit
tag.delete

media.manage
```

Editor là người chịu trách nhiệm nội dung.

---

# 15. Moderator

Tập trung vào community:

```text
comment.read
comment.hide
comment.delete
comment.restore
comment.warn
comment.ban-user
report.review
```

---

# 16. Admin

```text
user.read
user.create
user.edit
user.disable

role.read

category.manage
tag.manage
media.manage

comment.manage

advertisement.manage

site-settings.manage

analytics.read
audit-log.read
```

Admin quản lý hệ thống nhưng không nhất thiết phải là người chịu trách nhiệm biên tập từng bài.

---

# 17. Super Admin

Toàn quyền:

```text
*
```

và có thể:

```text
Tạo role
Xóa role
Gán permission
Thay đổi permission
Quản lý admin
Xem audit log
```

---

# 18. Luồng tạo bài viết

Đây là phần rất quan trọng của website báo.

Không nên làm:

```text
Author → Publish ngay
```

Nên:

```text
                   ┌─────────────┐
                   │    Draft    │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Submitted  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  In Review  │
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      Changes Requested           Approved
              │                       │
              │                       ▼
              │                 ┌──────────┐
              │                 │Scheduled │
              │                 └────┬─────┘
              │                      │
              └──→ Author            ▼
                                ┌──────────┐
                                │Published │
                                └────┬─────┘
                                     │
                                     ▼
                                ┌─────────┐
                                │Archived │
                                └─────────┘
```

Các trạng thái có thể là:

```text
DRAFT
SUBMITTED
IN_REVIEW
CHANGES_REQUESTED
APPROVED
SCHEDULED
PUBLISHED
UNPUBLISHED
ARCHIVED
REJECTED
```

---

# 19. Trang Author Dashboard

```text
/author
│
├── Dashboard
│   ├── Total articles
│   ├── Published
│   ├── Draft
│   ├── Pending review
│   ├── Views
│   ├── Likes
│   └── Comments
│
├── My Articles
│   ├── All
│   ├── Draft
│   ├── Pending
│   ├── Published
│   └── Rejected
│
├── Create Article
│
├── Edit Article
│
├── Media
│
├── Schedule
│
└── Analytics
```

---

# 20. Form tạo bài viết

Đây không chỉ là:

```text
Title
Content
Submit
```

Mà nên có:

```text
CREATE ARTICLE
│
├── Title
├── Slug
├── Subtitle
├── Excerpt
├── Content Editor
│
├── Featured Image
│
├── Category
├── Tags
│
├── Author
│
├── SEO
│   ├── SEO Title
│   ├── Meta Description
│   └── Canonical URL
│
├── Publish Settings
│   ├── Publish now
│   ├── Schedule
│   └── Save draft
│
├── Visibility
│   ├── Public
│   ├── Private
│   └── Members only
│
└── Actions
    ├── Save Draft
    ├── Preview
    ├── Submit Review
    └── Cancel
```

---

# 21. Admin Panel

Cây tổng thể:

```text
/admin
│
├── Dashboard
│
├── Articles
│   ├── All Articles
│   ├── Pending Review
│   ├── Published
│   ├── Draft
│   ├── Scheduled
│   ├── Archived
│   └── Trash
│
├── Categories
│
├── Tags
│
├── Authors
│
├── Users
│
├── Comments
│
├── Reports
│
├── Media
│
├── Advertisements
│
├── Menus
│
├── Analytics
│
├── Notifications
│
├── Roles
│
├── Permissions
│
├── Audit Logs
│
└── Settings
```

---

# 22. Admin Article Management

```text
ARTICLES
│
├── Search
├── Filter
│   ├── Category
│   ├── Author
│   ├── Status
│   ├── Date
│   └── Tag
│
├── Sort
│
├── Bulk Actions
│   ├── Publish
│   ├── Unpublish
│   ├── Archive
│   ├── Delete
│   └── Change category
│
└── Table
    ├── Title
    ├── Author
    ├── Category
    ├── Status
    ├── Views
    ├── Comments
    ├── Created
    ├── Updated
    └── Actions
```

Đây chính là dạng bài tập React rất tốt:

```text
pagination
filter
search
sort
bulk action
edit
delete
status
modal
confirmation
loading
empty
error
```

---

# 23. Category management

```text
Categories
│
├── Create
├── Edit
├── Delete
├── Enable / Disable
│
└── Category
    ├── Name
    ├── Slug
    ├── Description
    ├── Image
    ├── Parent Category
    ├── Display Order
    └── Status
```

Bạn có thể hỗ trợ category dạng cây:

```text
Technology
│
├── Programming
│   ├── JavaScript
│   ├── React
│   └── NodeJS
│
├── AI
│
└── Hardware
```

---

# 24. Tag management

Khác với category:

```text
Category
→ cấu trúc nội dung chính

Tag
→ từ khóa mô tả bài viết
```

Ví dụ:

```text
Article:
"React Server Components"

Category:
Technology > Programming

Tags:
React
JavaScript
Frontend
NextJS
```

---

# 25. Comment system

```text
COMMENTS
│
├── Pending
├── Approved
├── Hidden
├── Reported
└── Deleted
```

Một comment:

```text
Comment
│
├── User
├── Article
├── Content
├── Parent Comment
├── Status
├── Like Count
├── Report Count
├── Created At
└── Updated At
```

Có thể hỗ trợ:

```text
Comment
   └── Reply
       └── Reply
```

---

# 26. Report system

Người dùng có thể:

```text
Report Article
Report Comment
Report User
```

Ví dụ:

```text
REPORT
│
├── Reporter
├── Target
├── Type
├── Reason
├── Description
├── Status
├── Moderator
└── Resolution
```

Trạng thái:

```text
PENDING
INVESTIGATING
RESOLVED
REJECTED
```

---

# 27. Notification

Ví dụ:

```text
Notification
│
├── Có người reply comment
├── Bài viết được duyệt
├── Bài viết bị từ chối
├── Có người follow
├── Có bài mới từ author đang follow
├── Hệ thống thông báo
└── ...
```

Frontend:

```text
Header
└── Bell
    └── Notification dropdown
```

Backend:

```text
notifications
```

---

# 28. Media Library

Đây là phần rất dễ bị bỏ quên.

Không nên để Author upload ảnh xong rồi “vứt URL vào article”.

Nên có:

```text
MEDIA
│
├── Images
├── Videos
├── Documents
│
├── Upload
├── Search
├── Filter
├── Delete
├── Rename
└── Copy URL
```

Một media:

```text
Media
├── filename
├── originalName
├── url
├── type
├── size
├── width
├── height
├── uploader
├── createdAt
└── metadata
```

---

# 29. Advertisement

Website báo thường có:

```text
Advertisement
│
├── Header Ad
├── Sidebar Ad
├── In-Article Ad
├── Footer Ad
└── Popup / Overlay
```

Admin:

```text
Create Ad
Edit Ad
Enable
Disable
Schedule
Track impressions
Track clicks
```

---

# 30. Analytics

Không chỉ thống kê toàn website.

Có thể chia:

```text
ANALYTICS
│
├── Website
│   ├── Visitors
│   ├── Page Views
│   ├── Sessions
│   └── Traffic Sources
│
├── Articles
│   ├── Views
│   ├── Likes
│   ├── Comments
│   ├── Shares
│   └── Reading time
│
├── Authors
│   ├── Articles
│   ├── Views
│   └── Engagement
│
└── Categories
    ├── Views
    └── Engagement
```

---

# 31. Database nên có những bảng gì?

Nếu dùng NodeJS + SQL, có thể bắt đầu từ:

```text
users
roles
permissions
role_permissions
user_roles
```

Nội dung:

```text
articles
article_categories
categories
tags
article_tags
```

Tác giả:

```text
authors
```

Media:

```text
media
article_media
```

Community:

```text
comments
comment_likes
comment_reports
article_likes
article_saves
```

Theo dõi:

```text
author_follows
category_follows
```

History:

```text
reading_history
```

Notification:

```text
notifications
```

Report:

```text
reports
```

Quản trị:

```text
audit_logs
```

Advertisement:

```text
advertisements
advertisement_events
```

---

# 32. Quan hệ dữ liệu chính

Có thể hình dung:

```text
USER
 │
 ├───────────────┐
 │               │
 ▼               ▼
COMMENTS       ARTICLES
 │               │
 │               ├── CATEGORY
 │               │
 │               ├── TAGS
 │               │
 │               └── MEDIA
 │
 ├── LIKES
 ├── SAVED ARTICLES
 ├── FOLLOW AUTHORS
 ├── FOLLOW CATEGORIES
 ├── NOTIFICATIONS
 └── READING HISTORY
```

Và:

```text
USER
 │
 └── ROLE
      │
      └── PERMISSION
```

---

# 33. API backend nên chia module

Thay vì viết một đống route:

```text
/app.js
```

nên tổ chức:

```text
API
│
├── /api/auth
│
├── /api/users
│
├── /api/articles
│
├── /api/categories
│
├── /api/tags
│
├── /api/authors
│
├── /api/comments
│
├── /api/media
│
├── /api/notifications
│
├── /api/reports
│
├── /api/analytics
│
├── /api/advertisements
│
└── /api/admin
```

Ví dụ article:

```text
GET    /articles
GET    /articles/:id
POST   /articles
PATCH  /articles/:id
DELETE /articles/:id

POST   /articles/:id/submit
POST   /articles/:id/approve
POST   /articles/:id/reject
POST   /articles/:id/publish
POST   /articles/:id/unpublish
POST   /articles/:id/schedule
```

---

# 34. Authentication + Authorization

Backend có thể đi theo:

```text
Request
   ↓
Authentication
   ↓
User
   ↓
Role
   ↓
Permission
   ↓
Controller
```

Ví dụ:

```text
POST /articles/:id/publish
           ↓
Authenticate
           ↓
User ?
           ↓
Permission: article.publish ?
           ↓
YES → publish
NO  → 403 Forbidden
```

Đây chính là nơi để bạn luyện:

```text
JWT
Access Token
Refresh Token
Middleware
RBAC
Permission
Protected Route
```

---

# 35. Cấu trúc React frontend

Mình khuyên làm kiểu:

```text
src/
│
├── app/
│   ├── router/
│   ├── providers/
│   └── store/
│
├── pages/
│   ├── Home/
│   ├── Category/
│   ├── Article/
│   ├── Search/
│   ├── Author/
│   ├── Login/
│   ├── Register/
│   ├── User/
│   ├── AuthorDashboard/
│   └── Admin/
│
├── components/
│   ├── Header/
│   ├── Footer/
│   ├── ArticleCard/
│   ├── Comment/
│   ├── Pagination/
│   ├── SearchBox/
│   ├── Modal/
│   ├── Table/
│   └── ...
│
├── features/
│   ├── auth/
│   ├── articles/
│   ├── comments/
│   ├── notifications/
│   └── users/
│
├── layouts/
│   ├── PublicLayout/
│   ├── UserLayout/
│   ├── AuthorLayout/
│   └── AdminLayout/
│
├── services/
│   ├── authApi.js
│   ├── articleApi.js
│   ├── userApi.js
│   └── ...
│
├── hooks/
│
├── utils/
│
└── styles/
```

---

# 36. Layout nên chia như thế này

Đây là điểm rất quan trọng khi làm React.

```text
App
│
├── PublicLayout
│   ├── Header
│   ├── Main
│   └── Footer
│
├── UserLayout
│   ├── Header
│   ├── Sidebar
│   └── Main
│
├── AuthorLayout
│   ├── Sidebar
│   ├── Header
│   └── Main
│
└── AdminLayout
    ├── Sidebar
    ├── Header
    └── Main
```

Vì vậy:

```text
/admin/users
/admin/articles
/admin/comments
```

không cần tự tạo Header/Sidebar lại.

---

# 37. Permission ở frontend

Frontend không chỉ:

```jsx
if (user.role === "admin")
```

mà nên có:

```text
user.permissions
```

Ví dụ:

```text
[
  "article.read",
  "article.create",
  "article.edit.own",
  "article.submit"
]
```

Component:

```text
Can("article.publish")
       ↓
   Có quyền?
   /      \
 YES       NO
  ↓         ↓
Render    Hide
```

Nhưng nhớ rằng:

**Frontend chỉ dùng để ẩn/hiện UI.**

Quyền thực sự vẫn phải kiểm tra ở **backend**.

---

# 38. Những chức năng rất đáng thêm

Sau phiên bản cơ bản, website này còn có thể mở rộng:

```text
Content
├── Draft
├── Revision
├── Version history
├── Schedule
├── Featured article
├── Breaking news
├── Trending
├── Related articles
├── Recommendation
└── Editorial workflow
```

User:

```text
├── Bookmark
├── Reading history
├── Follow author
├── Follow category
├── Notification
├── Like
├── Comment
└── Share
```

Admin:

```text
├── Dashboard
├── Analytics
├── Reports
├── Audit log
├── Role/Permission
├── Advertisement
└── Site settings
```

---

# 39. Một số tính năng nâng cao rất phù hợp để luyện fullstack

Khi bản cơ bản chạy ổn, bạn có thể thêm:

```text
1. Full-text search
2. Elasticsearch / OpenSearch
3. Redis cache
4. Rate limiting
5. WebSocket notification
6. SSE notification
7. Background job
8. Email notification
9. Scheduled publishing
10. Image processing
11. CDN
12. View counting chống gian lận
13. Revision history
14. Audit log
15. Soft delete
16. Restore deleted article
17. Role/permission động
18. SEO
19. Sitemap
20. RSS
```

---

# 40. Bản đồ chức năng hoàn chỉnh

Nếu gom toàn bộ hệ thống lại thì sẽ thành:

```text
                         NEWS / BLOG
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
      READER              CONTENT                ADMIN
        │                     │                      │
        │                     │                      │
   ┌────┼─────┐        ┌──────┼──────┐       ┌──────┼───────┐
   │    │     │        │      │      │       │      │       │
   ▼    ▼     ▼        ▼      ▼      ▼       ▼      ▼       ▼
 Search Save Comment  Article Category Tag   User  Comment  Role
   │      │      │       │       │      │      │      │       │
   │      │      │       │       │      │      │      │       │
   └──────┴──────┴───────┴───────┴──────┴──────┴──────┴───────┘
                              │
                              ▼
                    AUTH + AUTHORIZATION
                              │
                              ▼
                         DATABASE
```

---

# 41. Thứ tự nên làm dự án

Đây là phần mình khuyên bạn đặc biệt nên làm theo, vì nếu làm toàn bộ cùng lúc sẽ rất dễ rối.

### Giai đoạn 1 — Public website

```text
Home
→ Category
→ Article Detail
→ Search
→ Author
```

Làm được:

```text
React Router
API
Fetch
Loading
Error
Pagination
Filter
Reusable components
```

### Giai đoạn 2 — Authentication

```text
Register
Login
Logout
Refresh Token
Profile
Protected Route
```

### Giai đoạn 3 — Member

```text
Like
Comment
Save
History
Follow
Notification
```

### Giai đoạn 4 — Author

```text
Create Article
Edit Article
Draft
Submit
Upload image
Preview
Schedule
Analytics
```

### Giai đoạn 5 — Editor

```text
Review
Approve
Reject
Request changes
Publish
Unpublish
Schedule
```

### Giai đoạn 6 — Admin

```text
Users
Categories
Tags
Comments
Media
Reports
Advertisements
Settings
Analytics
```

### Giai đoạn 7 — Authorization nâng cao

```text
RBAC
Permission
Role management
Permission management
Audit log
```

### Giai đoạn 8 — Advanced Fullstack

```text
Redis
Search engine
WebSocket / SSE
Queue
Email
Scheduled jobs
Caching
Image processing
SEO
```

---

# 42. Nếu đây là project để luyện React + NodeJS của bạn

Mình sẽ **không khuyên bạn làm tất cả ngay từ đầu**.

Nên xây thành 3 mức:

```text
LEVEL 1
BLOG CƠ BẢN
│
├── Home
├── Category
├── Article
├── Search
├── Login
└── Admin CRUD Article
```

↓

```text
LEVEL 2
BLOG FULLSTACK
│
├── Member
├── Author
├── Editor
├── Comment
├── Like
├── Save
├── Follow
├── Notification
├── Upload
├── Pagination
├── Filter
├── Search
└── RBAC
```

↓

```text
LEVEL 3
NEWS PLATFORM
│
├── Editorial workflow
├── Revision
├── Scheduling
├── Analytics
├── Recommendation
├── Full-text search
├── Redis
├── WebSocket/SSE
├── Queue
├── Advertisement
├── Audit log
├── SEO
└── Advanced permissions
```
//Bổ sung thêm 
1. NHÓM TÍNH NĂNG ĐỘC GIẢ (PUBLIC) VẪN CÒN THIẾU
Chức năng Bình luận chuyên sâu (Nested Comments UI):

Hiển thị danh sách bình luận nhiều tầng (Trả lời bình luận của bình luận khác).

Lọc bình luận (Mới nhất, Nhiều like nhất).

Giao diện Báo cáo vi phạm bình luận (Report Comment modal).

Trang Giới thiệu (/about) & Trang Liên hệ (/contact):

Form gửi thông tin liên hệ, bản đồ, thông tin Tòa soạn/Biên tập viên.

Bộ lọc Tag (/tag/:slug):

Trang danh sách bài viết hiển thị theo thẻ Tag riêng biệt kèm đếm số lượng bài viết liên quan.

2. AUTHOR STUDIO (MỞ RỘNG)
Chỉnh sửa bài viết (/author/edit/:id):

Luồng load lại bài viết cũ vào Editor (Rich Text Editor / Markdown) để sửa và lưu lại dưới dạng Bản nháp (Draft) hoặc gửi duyệt lại.

Giao diện Thống kê bài viết chi tiết (Article Analytics):

Bảng/Biểu đồ đo lường chi tiết lượt xem (Views), lượt lưu (Bookmarks), thời gian đọc trung bình của từng bài viết cụ thể.

3. ADMIN PANEL (BỔ SUNG QUẢN TRỊ NỘI DUNG MỀM)
Quản lý Menu & Navigation (/admin/menu):

Giao diện Kéo-Thả (Drag & Drop) hoặc sắp xếp thứ tự hiển thị của các Chuyên mục trên Header/Footer.

Quản lý Chuyên mục & Tag (/admin/categories, /admin/tags):

Modal/Form Thêm/Sửa/Xóa Chuyên mục (Slug, Icon, Chuyên mục cha/con), Thẻ Tag.

Quản lý Phân quyền (Role & Permission Matrix):

Bảng ma trận checkbox phân quyền chi tiết (VD: Admin, Editor, Writer, Subscriber) được phép làm gì (Read, Create, Edit, Delete, Approve).

4. BỔ SUNG TRẠNG THÁI HỆ THỐNG (SYSTEM UI STATES)
Một ứng dụng Frontend đẹp cần mô phỏng đầy đủ các trạng thái thực tế:

Màn hình Loading / Skeleton Loader: Giả lập hiệu ứng đang tải bài viết (Skeleton placeholder) trước khi render dữ liệu mock.

Trang Lỗi hệ thống: Trang 404 Not Found, 403 Forbidden (khi user không đủ quyền vào Admin), và Trang bảo trì 503.

Toast Notification Global: Hệ thống thông báo nổi (Pop-up Toast) khi user thao tác thành công (ví dụ: "Đã lưu bài viết", "Đăng bình luận thành công", "Đã copy link").