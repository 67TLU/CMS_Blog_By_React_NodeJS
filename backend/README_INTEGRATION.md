# Hướng dẫn tích hợp các API bổ sung

## 1. Cài đặt và chạy

```bash
npm install
cp .env.example .env
# Sửa thông tin MySQL/JWT/SMTP/Google OAuth trong .env
npm run dev
```

Server mặc định chạy ở `http://localhost:4000`. Không chia sẻ file `.env` hoặc các secret trong đó.

## 2. Các biến môi trường bổ sung

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: gửi email khôi phục mật khẩu. Có thể thay bằng `SMTP_URL`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`: Google OAuth. Callback URL trong Google Cloud phải trùng chính xác với `GOOGLE_CALLBACK_URL`.
- `PUBLIC_BASE_URL`: origin tạo URL ảnh/file, ví dụ `http://localhost:4000`. Nếu để trống, API trả đường dẫn `/Uploads/...` tương đối.
- `FRONTEND_URL`: origin frontend; hỗ trợ danh sách origin phân cách dấu phẩy cho CORS.

Nếu SMTP chưa cấu hình, endpoint quên mật khẩu vẫn trả thông báo chung để không tiết lộ email có tài khoản hay không. Trong môi trường development, link khôi phục được ghi vào log; không dùng cách này trong production.

## 3. Upload file

- Avatar: `PATCH /api/users/me/avatar`, `multipart/form-data`, field `avatar`, JPG/PNG tối đa 2 MB.
- Media: `POST /api/media`, `multipart/form-data`, field `file`, JPG/PNG/WEBP/DOCX tối đa 5 MB.
- File được lưu ở `src/uploads/` và phục vụ dưới `/Uploads/`. Hãy cấu hình reverse proxy/CDN và chính sách lưu file phù hợp khi deploy.

## 4. Google OAuth phía frontend

Sau khi Google xác thực thành công, backend đặt refresh token vào cookie HttpOnly và chuyển hướng về `FRONTEND_URL/login#oauth=success&accessToken=...`. Frontend cần đọc fragment hash một lần, lưu access token theo chính sách bảo mật của ứng dụng rồi xóa fragment khỏi thanh địa chỉ. Không log token hoặc gửi token qua analytics.

## 5. Xuất bản theo lịch

Server kiểm tra bài `SCHEDULED` đến hạn mỗi 30 giây và chuyển sang `PUBLISHED`, đồng thời tạo notification cho tác giả. Chỉ chạy một instance scheduler cho cùng database nếu cần tránh xử lý đồng thời ở môi trường production; nếu scale nhiều instance, hãy chuyển scheduler sang worker riêng hoặc dùng cơ chế lock phân tán.

## 6. Những điểm cần biết

- API trả envelope theo quy ước sẵn có (`success`, `data`, `meta` hoặc `error`).
- `/api/bookmarks` vẫn được giữ nguyên; `/api/users/me/bookmarks` là alias theo cấu trúc User Center.
- `maintenance_mode` và `enable_register` lấy từ bảng `settings` với `scope='PUBLIC'`.
- Đặt lại mật khẩu thu hồi các refresh token đang tồn tại của người dùng.
- Bổ sung mới dùng các bảng có trong `database/schema.sql`; không cần tạo thêm bảng mới.
- Sau khi thay đổi schema/seed, hãy kiểm tra roles (`ADMIN`, `EDITOR`, `AUTHOR`, `SUBSCRIBER`), permissions, và role_permissions đã được khởi tạo.
