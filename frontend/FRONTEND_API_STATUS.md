# Frontend API Integration Status

## Đã nối giao diện với API

| Khu vực | Kết nối chính |
|---|---|
| Authentication | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, forgot/reset password, Google OAuth redirect |
| Public news | `/articles/home`, `/articles`, `/articles/:idOrSlug`, `/articles/search`, `/articles/category/:slug`, `/articles/tag/:slug`, `/authors/:id`, `/authors/:id/articles` |
| Article interactions | article view/like/bookmark; comment list/create/reply/edit/delete/like/report |
| User center | `/users/me`, profile/avatar update, bookmarks, reading history, notifications, follow/unfollow author |
| Author Studio | dashboard, list/create/edit/delete/submit articles, schedule, analytics, media upload/list/delete |
| Admin | dashboard, users/status/role, article moderation, comment reports, categories, tags, menu/reorder, role permissions, ads, audit logs, settings |
| Public site | dynamic Header/Footer menu, public settings, contact form |

## Các lưu ý

- Frontend dùng `src/lib/api.js` làm lớp gọi API chung; `src/lib/articleAdapter.js` chuẩn hóa dữ liệu bài viết.
- Backend có một thay đổi tương thích trong `src/repositories/article.repository.js`: `findActiveCategories()` trả thêm `id` để form soạn bài gửi `categoryId` đúng.
- Các API cần đăng nhập sẽ trả lỗi nếu không có phiên hợp lệ; API quản trị còn yêu cầu role phù hợp.
- Google OAuth và email reset mật khẩu cần credentials thật từ môi trường của bạn.
- ESLint đã chạy thành công trên `src` không có lỗi hoặc cảnh báo. Chưa kiểm thử runtime từng endpoint bằng Postman với database của người dùng.
