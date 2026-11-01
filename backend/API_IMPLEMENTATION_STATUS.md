# Trạng thái các API bổ sung

## Đã nối route và thêm handler

- Auth: forgot password, reset password, Google OAuth start/callback.
- User Center: profile/stats, profile update, avatar upload, bookmarks, reading history, clear/delete history, notifications/read/read-all, follow/unfollow author.
- Author Studio: dashboard, own articles list, create/edit/delete/submit article, schedule publication, schedule list, analytics.
- Media: list/upload/delete with uploader/admin checks.
- Admin: dashboard, users list/status/role, tags CRUD subset, menu CRUD/reorder, role/permission matrix update, advertisements CRUD/event, audit logs, settings read/write, category tree.
- Public/System: public settings, public menu, contact submission, ad event, system health.
- Background: scheduled article publisher.
- System guards: maintenance mode and registration toggle.

## Kiểm tra đã thực hiện

- `node --check` trên toàn bộ file JavaScript trong `src/`.
- Import smoke test `import('./src/app.js')`.

## Cần kiểm tra trong môi trường của bạn

- Chạy API với database thực tế và kiểm thử từng endpoint bằng Postman; smoke test trên không thay thế kiểm thử tích hợp DB.
- Cấu hình SMTP/Google OAuth và kiểm thử callback bằng frontend thật.
- Kiểm thử upload trên hệ điều hành/deployment thực tế; production nên lưu media ngoài filesystem local hoặc dùng object storage.
- Nếu frontend có schema response cố định, đối chiếu các trường trả về của từng endpoint với component đang sử dụng.
