# Portal News — hướng dẫn chạy Frontend + Backend

## 1. Cấu trúc dự án

- `frontend/`: React 19 + Vite, các trang công khai, khu vực người dùng, Author Studio và Admin.
- `backend/`: Node.js + Express + MySQL API.
- `frontend/src/lib/api.js`: lớp gọi API chung, gửi access token, gửi cookie refresh, xử lý lỗi và upload `FormData`.
- `frontend/src/lib/articleAdapter.js`: chuẩn hóa dữ liệu bài viết từ API về định dạng dùng chung cho UI.
- `frontend/FRONTEND_API_STATUS.md`: danh sách khu vực và API đã nối.

## 2. Cấu hình môi trường

### Frontend

Tạo `.env` trong thư mục `frontend` dựa trên `.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_PROXY_TARGET=http://localhost:4000
VITE_NAME_WEB=Portal News
```

### Backend

Tạo `.env` trong thư mục `backend` dựa trên `.env.example`. Điền thông tin MySQL và JWT secret của riêng bạn. Không dùng secret mẫu trong môi trường thật.

Các biến quan trọng:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portal_news
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
```

Giữ các biến khác có sẵn trong `.env.example`; chỉ cấu hình SMTP và Google OAuth khi muốn bật các chức năng đó.

## 3. Chuẩn bị database và khởi động

1. Tạo database MySQL theo tên trong `.env`.
2. Chạy `backend/database/schema.sql`.
3. Chạy seed phù hợp trong `backend/database/seed.sql` nếu cần dữ liệu mẫu. Tránh chạy seed lặp lại trên database đang có dữ liệu.
4. Trong terminal thứ nhất:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. Trong terminal thứ hai:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Mở địa chỉ Vite hiển thị trong terminal, thường là `http://localhost:5173`.

## 4. Các luồng đã nối với API

- Đăng nhập, đăng ký, đăng xuất, refresh phiên, lấy người dùng hiện tại và Google OAuth callback.
- Quên mật khẩu và trang đặt lại mật khẩu `/reset-password`.
- Trang chủ, danh sách bài viết có phân trang, chi tiết bài, tìm kiếm, danh mục, tag, hồ sơ tác giả.
- Lượt xem, thích bài viết, lưu/bỏ lưu bài viết, bình luận, trả lời, sửa/xóa, thích và báo cáo bình luận.
- Hồ sơ người dùng, cập nhật thông tin, tải avatar, bookmark, lịch sử đọc, thông báo, theo dõi tác giả.
- Author Studio: dashboard, bài viết của tôi, tạo/sửa/gửi duyệt/xóa bài, lịch xuất bản, analytics, media upload/delete.
- Admin: dashboard, duyệt bài, quản lý user và role, categories/tags, menu, role permissions, quảng cáo, audit logs và settings.
- Menu Header/Footer, public settings và form liên hệ.

## 5. Kiểm tra nhanh

- Backend health: `GET http://localhost:4000/health`.
- API root: `GET http://localhost:4000/api`.
- Khi mở trang web, nếu không tải được dữ liệu hãy kiểm tra `VITE_API_URL`, `FRONTEND_URL`, trạng thái backend và kết nối MySQL.
- API quản trị yêu cầu tài khoản có role phù hợp; đăng ký thông thường tạo tài khoản `SUBSCRIBER`, không tự tạo tài khoản ADMIN.
- Quên mật khẩu cần SMTP. Nếu chưa cấu hình SMTP, backend development chỉ ghi liên kết reset vào log; giao diện không tự tạo token.
- Google OAuth cần cấu hình `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` và khai báo callback URL tương ứng ở Google Cloud Console.
- Upload media chấp nhận JPG, PNG, WEBP hoặc DOCX, tối đa 5 MB theo cấu hình backend.

## 6. Ghi chú tích hợp

- `GET /api/articles/home` trả danh sách categories có `id`, `name`, `slug` để form soạn bài gửi đúng `categoryId`.
- Access token được lưu trong `sessionStorage`; refresh token nằm trong cookie `HttpOnly` do backend quản lý.
- Các API list sử dụng `data.items` hoặc `data` tùy response contract của backend; frontend đã xử lý các định dạng này ở các trang tương ứng.
- Bản này đã chạy ESLint trên `src` không có lỗi cú pháp/lint error; còn một số cảnh báo dependency của React Hooks. Chưa thể xác nhận mọi API runtime khi không có database, SMTP và OAuth credentials của môi trường của bạn.
