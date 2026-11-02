-- ============================================================================
-- PORTAL NEWS — MYSQL SEED DATA (Dữ liệu mẫu hoàn chỉnh cho hệ thống)
-- Gộp toàn bộ dữ liệu mock React frontend & dữ liệu bài viết demo
--
-- Thứ tự chạy:
--   1. Tạo schema:  mysql -u root -p < database/schema.sql
--   2. Nạp dữ liệu: mysql -u root -p portal_news < database/data.sql
--   3. (Tùy chọn)   mysql -u root -p portal_news < database/events.sql
--
-- Tài khoản demo (TẤT CẢ ĐỀU CÓ MẬT KHẨU: "Password@123"):
--   - Quản trị viên (ADMIN):       admin@portalnews.com
--   - Biên tập viên (EDITOR):     editor@portalnews.com
--   - Tác giả (AUTHOR):           author.chau@portalnews.com
--   - Độc giả (SUBSCRIBER):       tranhminh@example.com
--
-- Mật khẩu đã được hash bằng bcrypt (cost 10) tương thích hoàn toàn backend.
-- ============================================================================

USE portal_news;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- A. ROLES (Vai trò hệ thống)
-- ============================================================================
INSERT INTO roles (id, code, name, description) VALUES
  (1, 'ADMIN', 'Quản trị viên', 'Toàn quyền quản trị hệ thống (can manage all)'),
  (2, 'EDITOR', 'Biên tập viên', 'Duyệt bài viết, quản lý bài và kiểm duyệt bình luận'),
  (3, 'AUTHOR', 'Tác giả', 'Tạo, chỉnh sửa bài viết của chính mình và gửi duyệt'),
  (4, 'SUBSCRIBER', 'Độc giả', 'Đọc bài, bình luận, lưu bài viết và theo dõi tác giả')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- ============================================================================
-- A. PERMISSIONS (8 quyền tĩnh hệ thống)
-- ============================================================================
INSERT INTO permissions (id, key_name, label) VALUES
  (1, 'ARTICLE_CREATE', 'Tạo mới bài viết'),
  (2, 'ARTICLE_EDIT_OWN', 'Sửa bài viết của chính mình'),
  (3, 'ARTICLE_EDIT_ALL', 'Sửa tất cả bài viết'),
  (4, 'ARTICLE_DELETE', 'Xóa bài viết'),
  (5, 'ARTICLE_APPROVE', 'Phê duyệt bài viết (Biên tập viên)'),
  (6, 'CATEGORY_MANAGE', 'Quản lý Chuyên mục & Tags'),
  (7, 'USER_MANAGE', 'Quản lý Người dùng & Phân quyền'),
  (8, 'SYSTEM_SETTINGS', 'Cấu hình Hệ thống')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- ============================================================================
-- A. ROLE_PERMISSIONS (Ma trận RBAC)
-- ADMIN: 8 quyền | EDITOR: 6 quyền | AUTHOR: 2 quyền | SUBSCRIBER: 0 quyền
-- ============================================================================
DELETE FROM role_permissions;
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
  (3, 1), (3, 2);

-- ============================================================================
-- A. USERS (Tài khoản người dùng demo)
-- Mật khẩu mặc định: Password@123
-- Hash: $2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6
-- ============================================================================
INSERT INTO users (id, name, email, password_hash, avatar_url, bio, expertise, role_id, status, email_verified) VALUES
  (1, 'Quản trị viên', 'admin@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', 'https://www.chess.com/bundles/web/images/noavatar_l.84a92436.gif', 'Quản trị viên cấp cao của hệ thống Portal News.', 'System Admin', 1, 'ACTIVE', 1),
  (2, 'Biên tập viên Nam', 'editor@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Chịu trách nhiệm biên tập và duyệt nội dung tin tức.', 'Biên tập trưởng', 2, 'ACTIVE', 1),
  (3, 'Minh Châu', 'author.chau@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', 'Nhà báo công nghệ với hơn 8 năm kinh nghiệm theo dõi xu hướng Trí tuệ nhân tạo, Bán dẫn và Bối cảnh khởi nghiệp công nghệ toàn cầu.', 'Chuyên gia Công nghệ & AI', 3, 'ACTIVE', 1),
  (4, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Cộng tác viên mảng giáo dục và đời sống.', 'Phóng viên', 3, 'ACTIVE', 1),
  (5, 'Trần Thị B', 'tranthib@gmail.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Chuyên viên phân tích thị trường tài chính.', 'Chuyên viên phân tích', 3, 'ACTIVE', 1),
  (6, 'Lê Hoàng C', 'lehoangc@gmail.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, NULL, NULL, 2, 'BLOCKED', 1),
  (7, 'Trần Minh', 'tranhminh@example.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', NULL, NULL, 4, 'ACTIVE', 1),
  (8, 'Lê Hoàng', 'lehoang@example.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80', NULL, NULL, 4, 'ACTIVE', 1),
  (9, 'Nguyễn Văn A (Độc giả)', 'nguyenvana.reader@example.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, NULL, NULL, 4, 'ACTIVE', 1),
  (10, 'VnExpress Desk', 'desk.vnexpress@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Bàn biên tập Thể thao & Tin tức', 'Ban Thể thao', 3, 'ACTIVE', 1),
  (11, 'Tuổi Trẻ Desk', 'desk.tuoitre@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Bàn biên tập Thời sự & Đô thị', 'Ban Thời sự', 3, 'ACTIVE', 1),
  (12, 'Tiền Phong Desk', 'desk.tienphong@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Bàn tin tức Thể thao Quốc tế', 'Ban Thể thao', 3, 'ACTIVE', 1),
  (13, 'Trung tâm Khí tượng Desk', 'desk.kqt@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Chuyên trang cập nhật Dự báo Thời tiết', 'Ban Dự báo', 3, 'ACTIVE', 1),
  (14, 'CodeRabbit Desk', 'desk.coderabbit@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Kênh tin tức công nghệ và lập trình phần mềm', 'Tech Reviewer', 3, 'ACTIVE', 1),
  (15, 'Căn hộ Alone Desk', 'desk.canhoalone@portalnews.com', '$2b$10$8bzFJN78e9QTFmSGbKenA.D2T2VJNMz.OaN5rpXFoRwGaGjvLv3g6', NULL, 'Chuyên mục Bất động sản và Nhà đất', 'BĐS Review', 3, 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), role_id = VALUES(role_id), status = VALUES(status);

-- ============================================================================
-- B. CATEGORIES (Chuyên mục bài viết)
-- ============================================================================
INSERT INTO categories (id, name, slug, parent_id, description, position, status) VALUES
  (1, 'Công nghệ', 'cong-nghe', NULL, 'Tin tức công nghệ, AI, bán dẫn, thiết bị di động', 1, 'ACTIVE'),
  (11, 'Trí tuệ nhân tạo (AI)', 'ai', 1, 'Chuyên mục con chuyên sâu về mô hình AI, ứng dụng trí tuệ nhân tạo', 2, 'ACTIVE'),
  (2, 'Tài chính', 'tai-chinh', NULL, 'Thị trường tài chính, chứng khoán, bất động sản, giá vàng', 3, 'ACTIVE'),
  (3, 'Thể thao', 'the-thao', NULL, 'Bóng đá trong nước và quốc tế, các giải đấu hàng đầu', 4, 'ACTIVE'),
  (4, 'Tin tức', 'tin-tuc', NULL, 'Tin tức thời sự xã hội, chính sách và đô thị', 5, 'ACTIVE'),
  (5, 'Thời tiết', 'thoi-tiet', NULL, 'Dự báo thời tiết các vùng miền và cảnh báo thiên tai', 6, 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description);

-- ============================================================================
-- B. TAGS (Thẻ bài viết)
-- ============================================================================
INSERT INTO tags (id, name, slug) VALUES
  (1, 'Semiconductor', 'semiconductor'),
  (2, 'Fintech 2026', 'fintech-2026'),
  (3, 'Năng lượng xanh', 'nang-luong-xanh'),
  (4, 'AI', 'ai-tag'),
  (5, 'Tech', 'tech'),
  (6, 'Bóng đá', 'bong-da'),
  (7, 'Đội tuyển Việt Nam', 'doi-tuyen-viet-nam'),
  (8, 'Smartphone AI', 'smartphone-ai'),
  (9, 'Giá vàng', 'gia-vang'),
  (10, 'Chứng khoán', 'chung-khoan'),
  (11, 'Metro', 'metro-saigon'),
  (12, 'Tết Nguyên đán', 'tet-nguyen-dan'),
  (13, 'Bão', 'bao-bien-dong'),
  (14, 'iPhone 17', 'iphone-17'),
  (15, 'Tuyển sinh 2026', 'tuyen-sinh-2026')
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug);

-- ============================================================================
-- B. ARTICLES (24 bài viết mẫu: đầy đủ trạng thái và chuyên mục)
--   Bài 1–6:   Published (Khớp mockArticles.js)
--   Bài 7–9:   Pending (Chờ duyệt trên ArticleModerationPage)
--   Bài 10:    Draft (Bản nháp)
--   Bài 11:    Scheduled (Đã lên lịch xuất bản)
--   Bài 12:    Rejected (Đã bị từ chối phê duyệt kèm lý do)
--   Bài 13–24: Published phong phú các chủ đề AI, Vàng, Chứng khoán, Thể thao, Thời tiết
-- ============================================================================
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id,
                      status, is_featured, reject_reason, reading_time, views, likes_count, comments_count,
                      published_at, scheduled_at, created_at) VALUES
  (1, 'dong-doi-cu-ke-manh-khoe-tranh-ronaldo-sut-phat',
   'Đồng đội cũ kể mánh khóe tranh Ronaldo sút phạt',
   'Những câu chuyện đằng sau hậu trường của siêu sao người Bồ Đào Nha luôn thu hút sự chú ý lớn từ người hâm mộ.',
   '<p>Trong một cuộc phỏng vấn mới đây, cựu cầu thủ từng thi đấu cùng Cristiano Ronaldo đã chia sẻ về những kỷ niệm thú vị trên sân tập cũng như trong các trận đấu chính thức.</p><p>Theo chia sẻ, Ronaldo luôn là người tập luyện chăm chỉ nhất đội. Anh thường ở lại sau các buổi tập chính để rèn luyện thêm kỹ năng sút phạt đền và sút phạt trực tiếp.</p><blockquote>"Nếu bạn muốn tranh quyền sút phạt với Ronaldo, bạn phải có một lý do cực kỳ thuyết phục hoặc đơn giản là anh ấy tự nguyện nhường cho bạn." - Cựu đồng đội chia sẻ.</blockquote><p>Ngoài ra, tinh thần chuyên nghiệp và chế độ dinh dưỡng nghiêm ngặt cũng là chìa khóa giúp siêu sao này duy trì phong độ đỉnh cao trong suốt nhiều năm qua.</p>',
   'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
   3, 10, 'PUBLISHED', 1, NULL, 4, 12500, 30, 5, '2026-10-07 03:00:00', NULL, '2026-10-06 20:00:00'),

  (2, 'tranh-luan-chuyen-can-bo-an-trua-trong-gio-lam-viec',
   'Tranh luận chuyện cán bộ ăn trưa trong giờ làm việc',
   'Ý kiến trái chiều về việc quản lý thời gian làm việc của cán bộ công chức.',
   '<p>Vấn đề quản lý thời gian và tác phong công vụ tiếp tục nhận được nhiều ý kiến đa chiều từ các chuyên gia quản lý công và người dân.</p>',
   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
   4, 11, 'PUBLISHED', 0, NULL, 3, 8200, 15, 0, '2026-10-05 09:00:00', NULL, '2026-10-05 08:00:00'),

  (3, 'chay-hang-can-ho-mat-bien-nha-trang',
   'Cháy hàng căn hộ mặt biển Nha Trang giá từ 1,3 tỷ',
   'Thị trường bất động sản ven biển ghi nhận lượng giao dịch tăng đột biến.',
   '<p>Thị trường bất động sản nghỉ dưỡng ghi nhận sự phục hồi mạnh mẽ với dòng sản phẩm căn hộ hướng biển tại Nha Trang và Đà Nẵng.</p>',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
   2, 15, 'PUBLISHED', 0, NULL, 4, 15100, 42, 0, '2026-10-04 10:00:00', NULL, '2026-10-04 09:00:00'),

  (4, 'winning-the-war-on-bugs-ai-for-smarter-code-reviews',
   'Winning the War on Bugs - AI for Smarter Code Reviews',
   'Công cụ AI mới giúp phát hiện lỗi lập trình tự động vô cùng hiệu quả.',
   '<p>Công cụ AI mới tích hợp phân tích ngữ cảnh giúp phát hiện lỗi lập trình tự động trong các code review phức tạp.</p>',
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
   1, 14, 'PUBLISHED', 0, NULL, 5, 20400, 68, 0, '2026-10-03 12:00:00', NULL, '2026-10-03 11:00:00'),

  (5, 'hlv-kim-sang-sik-thang-than-nhan-trach-nhiem',
   'Không đổ lỗi trọng tài, HLV Kim Sang-sik thẳng thắn nhận trách nhiệm',
   'Phát biểu của HLV trưởng tuyển Việt Nam sau trận đấu đầy tiếc nuối.',
   '<p>HLV Kim Sang-sik khẳng định toàn đội sẽ rút kinh nghiệm sâu sắc và chuẩn bị kỹ lưỡng cho chặng đường tiếp theo.</p>',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
   3, 12, 'PUBLISHED', 0, NULL, 3, 9800, 25, 0, '2026-10-07 01:00:00', NULL, '2026-10-07 00:00:00'),

  (6, 'du-bao-thoi-tiet-ha-noi-nhiet-do-24-do-c',
   'Dự báo thời tiết: Hà Nội nhiệt độ 24°C, độ ẩm 73%',
   'Thời tiết mát mẻ kéo dài trong các ngày tới.',
   '<p>Không khí se lạnh vào sáng sớm và đêm, thời tiết lý tưởng cho các hoạt động ngoài trời tại thủ đô.</p>',
   'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80',
   5, 13, 'PUBLISHED', 1, NULL, 2, 5300, 18, 0, '2026-10-07 06:00:00', NULL, '2026-10-07 05:00:00'),

  (7, 'danh-gia-chipset-ai-the-he-moi-flagship-2026',
   'Đánh giá chi tiết chipset AI thế hệ mới trên các dòng flagship 2026',
   'Thử nghiệm hiệu năng AI trên các dòng chip mới nhất.',
   '<p>Nội dung đang chờ kiểm duyệt bởi Ban biên tập...</p>',
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
   1, 4, 'PENDING', 0, NULL, 4, 0, 0, 0, NULL, NULL, '2026-10-07 07:50:00'),

  (8, 'du-bao-xu-huong-thi-truong-tai-chinh-toan-cau-quy-4',
   'Dự báo xu hướng thị trường tài chính toàn cầu quý IV',
   'Bối cảnh lãi suất, lạm phát và dòng vốn toàn cầu.',
   '<p>Nội dung đang chờ kiểm duyệt bởi Ban biên tập...</p>',
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80',
   2, 5, 'PENDING', 0, NULL, 5, 0, 0, 0, NULL, NULL, '2026-10-07 07:10:00'),

  (9, 'ket-qua-luat-tran-champions-league-rang-sang-nay',
   'Kết quả lượt trận Champions League rạng sáng nay',
   'Tổng hợp tỷ số và điểm nhấn các trận cầu lớn.',
   '<p>Cập nhật kết quả chi tiết các trận đấu cúp C1 rạng sáng nay.</p>',
   'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
   3, 6, 'PENDING', 0, NULL, 3, 0, 0, 0, NULL, NULL, '2026-10-07 05:40:00'),

  (10, 'ghi-chep-ve-phat-trien-nang-luong-xanh',
   'Ghi chép về sự phát triển của Năng lượng Xanh',
   'Bản nháp về năng lượng tái tạo.',
   '<p>Bản thảo nghiên cứu chuyển dịch năng lượng tại khu vực Đông Nam Á.</p>',
   'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
   2, 3, 'DRAFT', 0, NULL, 3, 0, 0, 0, NULL, NULL, '2026-10-05 14:20:00'),

  (11, 'phan-tich-xu-huong-cong-nghe-nam-2027',
   'Phân tích xu hướng công nghệ năm 2027',
   'Bài đã hẹn giờ tự động xuất bản.',
   '<p>Bài viết dự báo các công nghệ đột phá sẽ định hình lại thị trường vào năm 2027.</p>',
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
   1, 3, 'SCHEDULED', 0, NULL, 4, 0, 0, 0, NULL, '2026-10-10 08:00:00', '2026-10-06 10:00:00'),

  (12, 'bai-vi-du-bi-tu-choi',
   'Bài viết mẫu bị từ chối',
   'Cần bổ sung nguồn tham khảo dẫn chứng.',
   '<p>Nội dung sơ sài cần bổ sung thêm số liệu cụ thể.</p>',
   'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80',
   4, 3, 'REJECTED', 0, 'Nội dung chưa đủ nguồn tham khảo, vui lòng bổ sung link dẫn chứng.', 2, 0, 0, 0, NULL, NULL, '2026-10-02 09:00:00'),

  (13, 'galaxy-ai-cuoc-dua-smartphone-ai-2026',
   'Galaxy AI và cuộc đua smartphone AI 2026',
   'Trợ lý AI trên điện thoại chuyển sang đua trải nghiệm thực tế.',
   '<p>Cuộc đua smartphone AI năm 2026 không còn là chuyện ai có nhiều tính năng nhất. Samsung đẩy mạnh Galaxy AI dịch cuộc gọi trực tiếp 20 ngôn ngữ, trong khi Apple tập trung xử lý an toàn on-device.</p>',
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
   1, 3, 'PUBLISHED', 1, NULL, 5, 18200, 320, 2, '2026-10-13 08:30:00', NULL, '2026-10-13 07:00:00'),

  (14, 'gpt5-suy-luan-re-hon-nhanh-hon',
   'Mô hình suy luận GPT-5: rẻ hơn, nhanh hơn',
   'GPT-5 cho phép suy luận chuỗi dài gấp 3 lần, chi phí API giảm 40%.',
   '<p>OpenAI công bố GPT-5 với kiến trúc suy luận mới. Độ chính xác đạt 71% bài kiểm tra GPQA, giá API giảm 40% mở đường cho ứng dụng doanh nghiệp.</p>',
   'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
   11, 3, 'PUBLISHED', 0, NULL, 6, 15400, 280, 0, '2026-10-12 14:00:00', NULL, '2026-10-12 13:00:00'),

  (15, 'gia-vang-lap-dinh-150-trieu',
   'Giá vàng lập đỉnh 150 triệu đồng/lượng',
   'Vàng SJC vượt mốc lịch sử khi căng thẳng địa chính trị leo thang.',
   '<p>Sáng nay vàng SJC niêm yết mức 148.5 - 150 triệu đồng/lượng. Các chuyên gia khuyến nghị chỉ nên dành 10-15% tổng tài sản cho vàng và mua tích lũy thận trọng.</p>',
   'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80',
   2, 4, 'PUBLISHED', 1, NULL, 4, 22100, 410, 1, '2026-10-14 07:15:00', NULL, '2026-10-14 06:00:00'),

  (16, 'chung-khoan-vuot-1800-diem',
   'Chứng khoán vượt 1.800 điểm, khối ngoại mua ròng',
   'VN-Index bứt phá mạnh mẽ, thanh khoản đạt kỷ lục.',
   '<p>VN-Index tăng 18.4 điểm lên 1.812 điểm với 280 mã tăng giá. Khối ngoại mua ròng hơn 1.200 tỷ đồng, tập trung các mã bluechip đầu ngành.</p>',
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
   2, 5, 'PUBLISHED', 0, NULL, 5, 12800, 190, 0, '2026-10-13 15:30:00', NULL, '2026-10-13 14:00:00'),

  (17, 'u23-viet-nam-thang-thai-lan',
   'U23 Việt Nam thắng kịch tính Thái Lan 3-2',
   'Văn Thuận đánh đầu ấn định chiến thắng nghẹt thở ở phút bù giờ.',
   '<p>Trên sân Mỹ Đình rực lửa, U23 Việt Nam đã cống hiến màn rượt đuổi tỷ số ngoạn mục, giành trọn 3 điểm để vươn lên dẫn đầu bảng đấu.</p>',
   'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
   3, 10, 'PUBLISHED', 1, NULL, 3, 25600, 520, 2, '2026-10-13 21:45:00', NULL, '2026-10-13 21:00:00'),

  (18, 'arsenal-dai-chien-man-city',
   'Arsenal đại chiến Man City: Trận cầu định đoạt ngôi đầu',
   'Pháo thủ tiếp đón đương kim vô địch tại Emirates.',
   '<p>Arsenal đang dẫn đầu bảng xếp hạng tiếp đón Man City bám đuổi quyết liệt phía sau. Cuộc đối đầu giữa Haaland và Saliba hứa hẹn nhiều kịch tính đỉnh cao.</p>',
   'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
   3, 12, 'PUBLISHED', 0, NULL, 4, 11800, 210, 0, '2026-10-12 09:00:00', NULL, '2026-10-12 08:00:00'),

  (19, 'metro-so-1-tang-chuyen',
   'Metro số 1 tăng chuyến dịp cuối năm phục vụ người dân',
   'Từ giữa tháng 10 metro chạy 200 chuyến/ngày, giãn cách 4 phút.',
   '<p>Tuyến Metro Bến Thành - Suối Tiên tăng tần suất phục vụ lượng khách đạt trên 85.000 lượt/ngày, vượt xa kỳ vọng ban đầu.</p>',
   'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
   4, 11, 'PUBLISHED', 0, NULL, 3, 9600, 150, 0, '2026-10-11 10:20:00', NULL, '2026-10-11 09:30:00'),

  (20, 'nghi-tet-9-ngay-2027',
   'Đề xuất nghỉ Tết Nguyên đán 9 ngày năm 2027',
   'Nghỉ liên tục từ 29 tháng Chạp đến hết mùng 8 tháng Giêng.',
   '<p>Phương án hoán đổi ngày làm việc giúp người lao động và công chức có kỳ nghỉ dài ngày trọn vẹn bên gia đình, nhận được 78% ý kiến đồng thuận.</p>',
   'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
   4, 11, 'PUBLISHED', 0, NULL, 3, 13400, 230, 0, '2026-10-10 08:00:00', NULL, '2026-10-10 07:00:00'),

  (21, 'bao-so-9-vao-bien-dong',
   'Bão số 9 giật cấp 14 tiến vào Biển Đông',
   'Tâm bão cách Hoàng Sa 450km, cảnh báo mưa lớn diện rộng miền Trung.',
   '<p>Bão số 9 di chuyển nhanh với sức gió giật cấp 14, gây sóng lớn từ 6-8m ở khu vực quần đảo Hoàng Sa và vùng biển ven bờ miền Trung.</p>',
   'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
   5, 13, 'PUBLISHED', 1, NULL, 4, 19700, 380, 1, '2026-10-14 06:30:00', NULL, '2026-10-14 05:45:00'),

  (22, 'ha-noi-ret-12-do',
   'Hà Nội đón đợt rét đầu mùa xuống 12°C cuối tuần',
   'Vùng núi cao Sa Pa có thể xuống 5°C, xuất hiện sương muối.',
   '<p>Không khí lạnh tăng cường tràn về khiến nhiệt độ toàn miền Bắc giảm sâu kèm mưa nhỏ rải rác, người dân cần chú ý giữ ấm.</p>',
   'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=800&q=80',
   5, 13, 'PUBLISHED', 0, NULL, 2, 7400, 110, 0, '2026-10-09 16:00:00', NULL, '2026-10-09 15:00:00'),

  (23, 'iphone-17-chay-hang',
   'iPhone 17 Pro Max cháy hàng sau 2 giờ mở bán',
   'Phiên bản titan sa mạc hết hàng đầu tiên trên toàn quốc.',
   '<p>Hơn 15.000 đơn đặt hàng trước được ghi nhận chỉ trong vòng 2 giờ. Sức hút đến từ chip A19 Pro mới cùng hệ thống camera tele cải tiến vượt trội.</p>',
   'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
   1, 14, 'PUBLISHED', 0, NULL, 4, 16900, 300, 0, '2026-10-11 13:40:00', NULL, '2026-10-11 12:00:00'),

  (24, 'tuyen-sinh-bo-xet-hoc-ba',
   'Tuyển sinh 2026: Hàng loạt trường đại học tốp đầu bỏ xét học bạ',
   'Bách khoa, Kinh tế Quốc dân ưu tiên điểm thi tốt nghiệp và đánh giá năng lực.',
   '<p>Các trường điều chỉnh phương thức tuyển sinh nhằm nâng cao chất lượng đầu vào, dành tới 70-80% chỉ tiêu cho các kỳ thi chuẩn hóa độc lập.</p>',
   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
   4, 4, 'PUBLISHED', 0, NULL, 5, 14200, 240, 1, '2026-10-08 09:10:00', NULL, '2026-10-08 08:00:00')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  excerpt = VALUES(excerpt),
  content = VALUES(content),
  status = VALUES(status),
  views = VALUES(views),
  likes_count = VALUES(likes_count),
  comments_count = VALUES(comments_count);

-- ============================================================================
-- B. ARTICLE_TAGS (Gắn thẻ cho các bài viết)
-- ============================================================================
DELETE FROM article_tags;
INSERT INTO article_tags (article_id, tag_id) VALUES
  (1, 3), (4, 1), (4, 4), (4, 5), (11, 4), (11, 5),
  (13, 4), (13, 5), (13, 8),
  (14, 4), (14, 5),
  (15, 2), (15, 9),
  (16, 2), (16, 10),
  (17, 6), (17, 7),
  (18, 6),
  (19, 4), (19, 11),
  (20, 4), (20, 12),
  (21, 13),
  (22, 13),
  (23, 4), (23, 5), (23, 14),
  (24, 15);

-- ============================================================================
-- C. COMMENTS (Bình luận & phản hồi đa cấp)
-- ============================================================================
INSERT INTO comments (id, article_id, user_id, parent_id, reply_to_id, content, likes_count, created_at) VALUES
  (1, 1, 7, NULL, NULL, 'Bài viết phân tích rất sâu sắc về xu hướng AI năm 2026. Mong tòa soạn có thêm bài viết về mảng bán dẫn!', 18, '2026-10-07 01:23:45'),
  (2, 1, 3, 1, NULL, 'Cảm ơn bạn! Bài phân tích về thị trường Bán dẫn sẽ lên sóng vào tuần sau nhé.', 9, '2026-10-06 14:15:30'),
  (3, 1, 9, 1, 1, 'Tôi cũng rất quan tâm đến chủ đề này và mong chờ bài viết tiếp theo.', 4, '2026-10-07 01:22:25'),
  (4, 1, 8, 1, 2, 'Hy vọng bài viết tiếp theo sẽ phân tích sâu hơn về thị trường chip xử lý.', 2, '2026-10-07 00:52:00'),
  (5, 1, 8, NULL, NULL, 'Liệu ứng dụng này có tích hợp thêm tính năng nghe đọc báo tự động (Text-to-Speech) không ạ?', 5, '2026-10-07 00:22:25'),
  (6, 13, 7, NULL, NULL, 'Bài so sánh chi tiết quá, mình đang phân vân giữa S24 Ultra và iPhone 16 Pro.', 12, '2026-10-13 09:10:00'),
  (7, 13, 3, 6, NULL, 'Cảm ơn bạn! Bản test pin thực tế 48h sẽ lên sóng cuối tuần này nhé.', 6, '2026-10-13 10:02:00'),
  (8, 15, 8, NULL, NULL, 'Vàng lên 150 triệu chóng mặt thật, thời điểm này không nên lướt sóng.', 15, '2026-10-14 07:40:00'),
  (9, 17, 9, NULL, NULL, 'Văn Thuận đánh đầu quá đẳng cấp! Việt Nam vô địch!', 22, '2026-10-13 22:05:00'),
  (10, 17, 7, 9, NULL, 'Đồng ý, hiệp 2 HLV thay người quá hay.', 8, '2026-10-13 22:30:00'),
  (11, 21, 8, NULL, NULL, 'Nhà mình ở Hội An nước đã mấp mé sân, mong bão nhanh suy yếu.', 9, '2026-10-14 07:00:00'),
  (12, 24, 9, NULL, NULL, 'Bỏ xét học bạ là rất đúng, công bằng hơn cho các bạn học thật thi thật.', 11, '2026-10-08 10:15:00')
ON DUPLICATE KEY UPDATE content = VALUES(content), likes_count = VALUES(likes_count);

-- ============================================================================
-- C. COMMENT_REPORTS (Báo cáo vi phạm bình luận)
-- ============================================================================
INSERT INTO comment_reports (id, comment_id, reporter_id, reason, note, status, created_at) VALUES
  (1, 5, 7, 'SPAM', NULL, 'PENDING', '2026-10-07 02:00:00'),
  (2, 4, 9, 'HATE_SPEECH', NULL, 'PENDING', '2026-10-07 02:10:00'),
  (3, 1, 8, 'FAKE_NEWS', NULL, 'PENDING', '2026-10-07 02:20:00')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ============================================================================
-- C. ARTICLE_LIKES (Lượt thích bài viết)
-- ============================================================================
INSERT IGNORE INTO article_likes (article_id, user_id, created_at) VALUES
  (13, 7, '2026-10-13 09:00:00'),
  (13, 8, '2026-10-13 09:20:00'),
  (15, 7, '2026-10-14 07:30:00'),
  (15, 8, '2026-10-14 07:35:00'),
  (17, 7, '2026-10-13 22:00:00'),
  (17, 9, '2026-10-13 22:20:00'),
  (21, 7, '2026-10-14 06:50:00'),
  (23, 8, '2026-10-11 14:00:00');

-- ============================================================================
-- C. BOOKMARKS (Bài viết đã lưu)
-- ============================================================================
INSERT IGNORE INTO bookmarks (user_id, article_id, created_at) VALUES
  (1, 1, '2026-10-07 08:00:00'),
  (1, 2, '2026-10-07 08:05:00'),
  (1, 3, '2026-10-07 08:10:00'),
  (7, 13, '2026-10-13 09:05:00'),
  (7, 15, '2026-10-14 07:32:00'),
  (7, 17, '2026-10-13 22:02:00'),
  (8, 21, '2026-10-14 06:55:00'),
  (8, 23, '2026-10-11 14:05:00');

-- ============================================================================
-- C. READING_HISTORY (Lịch sử đọc bài)
-- ============================================================================
INSERT INTO reading_history (user_id, article_id, read_at) VALUES
  (1, 1, '2026-10-07 08:00:00'),
  (1, 2, '2026-10-06 14:30:00'),
  (1, 3, '2026-10-05 10:00:00'),
  (7, 15, '2026-10-14 07:31:00'),
  (7, 17, '2026-10-13 22:01:00'),
  (7, 21, '2026-10-14 06:52:00'),
  (8, 13, '2026-10-13 09:06:00'),
  (8, 24, '2026-10-08 10:20:00')
ON DUPLICATE KEY UPDATE read_at = VALUES(read_at);

-- ============================================================================
-- C. FOLLOWS (Theo dõi tác giả)
-- ============================================================================
INSERT IGNORE INTO follows (follower_id, author_id, created_at) VALUES
  (7, 3, '2026-10-06 12:00:00'),
  (8, 3, '2026-10-06 13:00:00'),
  (9, 3, '2026-10-07 09:00:00');

-- ============================================================================
-- D. NOTIFICATIONS (Thông báo hệ thống & tương tác)
-- ============================================================================
INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES
  (1, 3, 'COMMENT', 'Nguyễn Văn B đã trả lời bình luận của bạn', 'Tôi cũng rất quan tâm đến chủ đề này...', '/article/dong-doi-cu-ke-manh-khoe-tranh-ronaldo-sut-phat', 0, '2026-10-07 01:22:25'),
  (2, 3, 'SYSTEM', 'Bài viết "Xu hướng AI 2026" của bạn đã được phê duyệt', NULL, '/author/articles', 0, '2026-10-07 05:00:00'),
  (3, 3, 'LIKE', 'Trần Thị C đã thích bài viết của bạn', NULL, '/author/articles', 1, '2026-10-06 09:00:00')
ON DUPLICATE KEY UPDATE title = VALUES(title), is_read = VALUES(is_read);

-- ============================================================================
-- D. MENU_ITEMS (Menu điều hướng Header & Footer)
-- ============================================================================
INSERT INTO menu_items (id, label, url, target, location, position) VALUES
  (1, 'Trang chủ', '/', '_self', 'HEADER', 1),
  (2, 'Tin Công nghệ', '/category/cong-nghe', '_self', 'HEADER', 2),
  (3, 'Thị trường Tài chính', '/category/tai-chinh', '_self', 'HEADER', 3),
  (4, 'Thời tiết & Thiên văn', '/weather', '_self', 'HEADER', 4),
  (5, 'Trực tiếp Bóng đá', '/sports/live', '_blank', 'HEADER', 5),
  (6, 'Giới thiệu', '/about', '_self', 'FOOTER', 1),
  (7, 'Liên hệ', '/contact', '_self', 'FOOTER', 2),
  (8, 'Chuyên mục Thể thao', '/category/the-thao', '_self', 'FOOTER', 3),
  (9, 'Chuyên mục Tin tức', '/category/tin-tuc', '_self', 'FOOTER', 4)
ON DUPLICATE KEY UPDATE label = VALUES(label), url = VALUES(url), position = VALUES(position);

-- ============================================================================
-- D. ADVERTISEMENTS (Quảng cáo website)
-- ============================================================================
INSERT INTO advertisements (id, title, position, image_url, link_url, is_active, views, clicks) VALUES
  (1, 'Banner Sidebar - VinFast', 'SIDEBAR', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&q=80', 'https://vinfast.vn', 1, 45000, 1240),
  (2, 'Banner Leaderboard Top Trang chủ', 'TOP_HOMEPAGE', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://techcombank.vn', 1, 120000, 3890),
  (3, 'In-article Native Ads - Techcombank', 'IN_ARTICLE', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80', 'https://techcombank.vn', 0, 28000, 890)
ON DUPLICATE KEY UPDATE title = VALUES(title), is_active = VALUES(is_active);

-- ============================================================================
-- D. SETTINGS (Cài đặt hệ thống key-value)
-- ============================================================================
INSERT INTO settings (`key`, value, scope) VALUES
  ('site_name', 'Portal News 2026', 'PUBLIC'),
  ('site_description', 'Cổng thông tin tin tức đa phương tiện cập nhật liên tục 24/7', 'PUBLIC'),
  ('contact_email', 'admin@portalnews.com', 'PUBLIC'),
  ('maintenance_mode', 'false', 'PUBLIC'),
  ('enable_register', 'true', 'PUBLIC'),
  ('contact_address', 'Tầng 8, Tòa nhà Press Tower, 123 Đường Cầu Giấy, Hà Nội', 'PUBLIC'),
  ('contact_hotline', '+84 (0) 24 3888 9999', 'PUBLIC')
ON DUPLICATE KEY UPDATE value = VALUES(value), scope = VALUES(scope);

-- ============================================================================
-- D. AUDIT_LOGS (Nhật ký kiểm toán hệ thống)
-- ============================================================================
INSERT INTO audit_logs (id, user_id, user_label, action, entity, entity_id, ip, status, created_at) VALUES
  (1, 1, 'Admin Hoang', 'Đã phê duyệt bài viết #102', 'article', '102', '14.232.208.10', 'SUCCESS', '2026-10-07 07:50:00'),
  (2, 1, 'Editor Nam', 'Thay đổi phân quyền User #u3 sang AUTHOR', 'user', '3', '118.70.12.44', 'SUCCESS', '2026-10-07 07:00:00'),
  (3, NULL, 'Unknown', 'Đăng nhập thất bại (Sai mật khẩu 5 lần)', 'auth', NULL, '27.72.61.102', 'WARNING', '2026-10-07 05:00:00'),
  (4, 1, 'Admin', 'Đã xuất bản bài viết #1', 'article', '1', '14.232.208.10', 'SUCCESS', '2026-10-07 03:00:00'),
  (5, 1, 'Admin', 'Cập nhật quyền vai trò Editor', 'role', '2', '14.232.208.10', 'SUCCESS', '2026-10-07 02:00:00')
ON DUPLICATE KEY UPDATE action = VALUES(action);

-- ============================================================================
-- D. MEDIA (Thư viện media demo)
-- ============================================================================
INSERT INTO media (id, uploader_id, filename, original_name, url, mime_type, size_bytes) VALUES
  (1, 3, 'ai-chipset-2026.jpg', 'ai-chipset-2026.jpg', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', 'image/jpeg', 1258291),
  (2, 3, 'market-chart.png', 'market-chart.png', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', 'image/png', 870400),
  (3, 3, 'football-stadium.jpg', 'football-stadium.jpg', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80', 'image/jpeg', 2516582)
ON DUPLICATE KEY UPDATE original_name = VALUES(original_name);

-- ============================================================================
-- D. CONTACT_MESSAGES (Tin nhắn liên hệ từ độc giả)
-- ============================================================================
INSERT INTO contact_messages (id, name, email, subject, content, status) VALUES
  (1, 'Đặng Thị Mai', 'mai@example.com', 'Hợp tác quảng cáo', 'Chúng tôi muốn đặt banner sidebar trong tháng 11.', 'NEW'),
  (2, 'Phan Văn Hùng', 'hung@example.com', 'Góp ý bài viết', 'Chuyên mục Công nghệ nên có thêm bài về an ninh mạng.', 'REPLIED')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ============================================================================
-- D. ARTICLE_STATS_DAILY (Thống kê biểu đồ Analytics 7 ngày)
-- ============================================================================
INSERT INTO article_stats_daily (article_id, stat_date, views, likes, comments, bookmarks) VALUES
  (1, '2026-10-01', 400, 12, 3, 5),
  (1, '2026-10-02', 650, 18, 5, 7),
  (1, '2026-10-03', 300, 8, 2, 3),
  (1, '2026-10-04', 850, 25, 9, 11),
  (1, '2026-10-05', 950, 30, 12, 14),
  (1, '2026-10-06', 500, 15, 4, 6),
  (1, '2026-10-07', 750, 22, 8, 9),
  (4, '2026-10-01', 300, 9, 2, 4),
  (4, '2026-10-02', 420, 11, 3, 5),
  (4, '2026-10-03', 510, 14, 4, 6),
  (4, '2026-10-04', 680, 20, 7, 8),
  (4, '2026-10-05', 720, 21, 6, 9),
  (4, '2026-10-06', 540, 16, 5, 7),
  (4, '2026-10-07', 610, 18, 6, 8)
ON DUPLICATE KEY UPDATE views = VALUES(views), likes = VALUES(likes);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- KẾT THÚC NẠP DỮ LIỆU
-- Tổng kết:
--   - 4 roles, 8 permissions, 16 role_permissions
--   - 15 users (Admin, Editor, Author, Subscriber, Bàn chuyên đề)
--   - 6 categories, 15 tags
--   - 24 articles (đầy đủ các chủ đề & trạng thái)
--   - 12 comments, 3 reports, 8 likes, 8 bookmarks, 8 reading_history, 3 follows
--   - 3 notifications, 9 menu_items, 3 ads, 7 settings, 5 audit_logs, 3 media
--   - 2 contacts, 14 daily analytics stats
-- ============================================================================
