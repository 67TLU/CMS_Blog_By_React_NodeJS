-- ============================================================================
-- PORTAL NEWS — SEED DATA (khớp dữ liệu mock trên React frontend)
-- Chạy sau khi đã tạo schema:  mysql -u root -p portal_news < database/seed.sql
--
-- Tài khoản demo (MẬT KHẨU: "Password@123"):
--   hash bên dưới là PLACEHOLDER — sinh hash thật trước khi đăng nhập:
--     node -e "import('bcrypt').then(b=>b.default.hash('Password@123',10)).then(console.log)"
--   rồi UPDATE password_hash của các user tương ứng.
-- ============================================================================
USE portal_news;

-- ============================================================================
-- A. ROLES + PERMISSIONS (đúng mockRoleMatrix / RolePermissionsPage)
-- ============================================================================
INSERT INTO roles (id, code, name, description) VALUES
  (1,'ADMIN','Quản trị viên','Toàn quyền (can manage all — ability.js)'),
  (2,'EDITOR','Biên tập viên','Duyệt bài, CRUD Post, kiểm duyệt comment'),
  (3,'AUTHOR','Tác giả','Tạo/sửa bài của mình, gửi duyệt'),
  (4,'SUBSCRIBER','Độc giả','Đọc, bình luận, lưu bài, theo dõi');

INSERT INTO permissions (id, key_name, label) VALUES
  (1,'ARTICLE_CREATE','Tạo mới bài viết'),
  (2,'ARTICLE_EDIT_OWN','Sửa bài viết của chính mình'),
  (3,'ARTICLE_EDIT_ALL','Sửa tất cả bài viết'),
  (4,'ARTICLE_DELETE','Xóa bài viết'),
  (5,'ARTICLE_APPROVE','Phê duyệt bài viết (Biên tập viên)'),
  (6,'CATEGORY_MANAGE','Quản lý Chuyên mục & Tags'),
  (7,'USER_MANAGE','Quản lý Người dùng & Phân quyền'),
  (8,'SYSTEM_SETTINGS','Cấu hình Hệ thống');

-- ADMIN: đủ 8 | EDITOR: 6 | AUTHOR: 2 | SUBSCRIBER: 0
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),
  (2,1),(2,2),(2,3),(2,4),(2,5),(2,6),
  (3,1),(3,2);

-- ============================================================================
-- A. USERS — password_hash placeholder ("Password@123")
-- ============================================================================
INSERT INTO users (id, name, email, password_hash, avatar_url, bio, expertise, role_id, status, email_verified) VALUES
 (1,'Quản trị','admin@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000','https://www.chess.com/bundles/web/images/noavatar_l.84a92436.gif',NULL,NULL,1,'ACTIVE',1),
 (2,'Biên tập viên Nam','editor@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,'Biên tập trưởng',2,'ACTIVE',1),
 (3,'Minh Châu','author.chau@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80','Nhà báo công nghệ với hơn 8 năm kinh nghiệm theo dõi xu hướng Trí tuệ nhân tạo, Bán dẫn và Bối cảnh khởi nghiệp công nghệ toàn cầu.','Chuyên gia Công nghệ & AI',3,'ACTIVE',1),
 (4,'Nguyễn Văn A','nguyenvana@gmail.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (5,'Trần Thị B','tranthib@gmail.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (6,'Lê Hoàng C','lehoangc@gmail.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,2,'BLOCKED',1),
 (7,'Trần Minh','tranhminh@example.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',NULL,NULL,4,'ACTIVE',1),
 (8,'Lê Hoàng','lehoang@example.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000','https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',NULL,NULL,4,'ACTIVE',1),
 (9,'Nguyễn Văn A','nguyenvana.reader@example.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,4,'ACTIVE',1),
 (10,'VnExpress','desk.vnexpress@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,'Chuyên mục Thể thao',NULL,3,'ACTIVE',1),
 (11,'Tuổi trẻ','desk.tuoitre@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (12,'Tiền Phong','desk.tienphong@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (13,'Trung tâm Khí tượng','desk.kqt@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (14,'Coderabbit','desk.coderabbit@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1),
 (15,'Căn hộ Alone','desk.canhoalone@portalnews.com','$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH000',NULL,NULL,NULL,3,'ACTIVE',1);

-- ============================================================================
-- B. CATEGORIES + TAGS (CategoryTagManagementPage / CreateArticlePage)
-- ============================================================================
INSERT INTO categories (id, name, slug, parent_id, description, position) VALUES
 (1,'Công nghệ','cong-nghe',NULL,'Tin tức công nghệ, AI, bán dẫn',1),
 (11,'Trí tuệ nhân tạo (AI)','ai',1,'Chuyên mục con về AI',2),
 (2,'Tài chính','tai-chinh',NULL,'Thị trường tài chính, bất động sản',3),
 (3,'Thể thao','the-thao',NULL,'Bóng đá và thể thao',4),
 (4,'Tin tức','tin-tuc',NULL,'Tin nóng trong nước',5),
 (5,'Thời tiết','thoi-tiet',NULL,'Dự báo thời tiết',6);

INSERT INTO tags (id, name, slug) VALUES
 (1,'Semiconductor','semiconductor'),
 (2,'Fintech 2026','fintech-2026'),
 (3,'Năng lượng xanh','nang-luong-xanh'),
 (4,'AI','ai-tag'),
 (5,'Tech','tech');

-- ============================================================================
-- B. ARTICLES
--   1–6 : Published (mockArticles.js)   7–9 : Pending (chờ duyệt)
--   10  : Draft        11 : Scheduled    12 : Rejected (reject_reason)
-- ============================================================================
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id,
                      status, is_featured, reading_time, views, published_at, scheduled_at, created_at) VALUES
 (1,'dong-doi-cu-ke-manh-khoe-tranh-ronaldo-sut-phat',
  'Đồng đội cũ kể mánh khóe tranh Ronaldo sút phạt',
  'Những câu chuyện đằng sau hậu trường của siêu sao người Bồ Đào Nha luôn thu hút sự chú ý lớn từ người hâm mộ.',
  '<p>Trong một cuộc phỏng vấn mới đây, cựu cầu thủ từng thi đấu cùng Cristiano Ronaldo đã chia sẻ về những kỷ niệm thú vị trên sân tập cũng như trong các trận đấu chính thức.</p><p>Theo chia sẻ, Ronaldo luôn là người tập luyện chăm chỉ nhất đội. Anh thường ở lại sau các buổi tập chính để rèn luyện thêm kỹ năng sút phạt đền và sút phạt trực tiếp.</p><blockquote>"Nếu bạn muốn tranh quyền sút phạt với Ronaldo, bạn phải có một lý do cực kỳ thuyết phục hoặc đơn giản là anh ấy tự nguyện nhường cho bạn." - Cựu đồng đội chia sẻ.</blockquote><p>Ngoài ra, tinh thần chuyên nghiệp và chế độ dinh dưỡng nghiêm ngặt cũng là chìa khóa giúp siêu sao này duy trì phong độ đỉnh cao trong suốt nhiều năm qua.</p>',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
  3,10,'PUBLISHED',1,4,12500,'2026-10-07 03:00:00',NULL,'2026-10-06 20:00:00'),
 (2,'tranh-luan-chuyen-can-bo-an-trua-trong-gio-lam-viec',
  'Tranh luận chuyện cán bộ ăn trưa trong giờ làm việc',
  'Ý kiến trái chiều về việc quản lý thời gian làm việc của cán bộ công chức.',
  NULL,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  4,11,'PUBLISHED',0,NULL,8200,'2026-10-05 09:00:00',NULL,'2026-10-05 08:00:00'),
 (3,'chay-hang-can-ho-mat-bien-nha-trang',
  'Cháy hàng căn hộ mặt biển Nha Trang giá từ 1,3 tỷ',
  'Thị trường bất động sản ven biển ghi nhận lượng giao dịch tăng đột biến.',
  NULL,
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
  2,15,'PUBLISHED',0,NULL,15100,'2026-10-04 10:00:00',NULL,'2026-10-04 09:00:00');

INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id,
                      status, is_featured, reading_time, views, published_at, scheduled_at, created_at) VALUES
 (4,'winning-the-war-on-bugs-ai-for-smarter-code-reviews',
  'Winning the War on Bugs - AI for Smarter Code Reviews',
  'Công cụ AI mới giúp phát hiện lỗi lập trình tự động vô cùng hiệu quả.',
  '<p>Công cụ AI mới tích hợp phân tích ngữ cảnh giúp phát hiện lỗi lập trình tự động trong các code review.</p>',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  1,14,'PUBLISHED',0,NULL,20400,'2026-10-03 12:00:00',NULL,'2026-10-03 11:00:00'),
 (5,'hlv-kim-sang-sik-thang-than-nhan-trach-nhiem',
  'Không đổ lỗi trọng tài, HLV Kim Sang-sik thẳng thắn nhận trách nhiệm',
  'Phát biểu của HLV trưởng tuyển Việt Nam sau trận đấu đầy tiếc nuối.',
  NULL,
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  3,12,'PUBLISHED',0,NULL,9800,'2026-10-07 01:00:00',NULL,'2026-10-07 00:00:00'),
 (6,'du-bao-thoi-tiet-ha-noi-nhiet-do-24-do-c',
  'Dự báo thời tiết: Hà Nội nhiệt độ 24°C, độ ẩm 73%',
  'Thời tiết mát mẻ kéo dài trong các ngày tới.',
  NULL,
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80',
  5,13,'PUBLISHED',1,NULL,5300,'2026-10-07 06:00:00',NULL,'2026-10-07 05:00:00');

-- Bài chờ duyệt (ArticleModerationPage + ArticleContext), draft, scheduled, rejected
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id,
                      status, is_featured, views, published_at, scheduled_at, created_at) VALUES
 (7,'danh-gia-chipset-ai-the-he-moi-flagship-2026',
  'Đánh giá chi tiết chipset AI thế hệ mới trên các dòng flagship 2026',
  'Thử nghiệm hiệu năng AI trên các dòng chip mới nhất.',
  '<p>Nội dung chờ kiểm duyệt...</p>',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
  1,4,'PENDING',0,0,NULL,NULL,'2026-10-07 07:50:00'),
 (8,'du-bao-xu-huong-thi-truong-tai-chinh-toan-cau-quy-4',
  'Dự báo xu hướng thị trường tài chính toàn cầu quý IV',
  'Bối cảnh lãi suất, lạm phát và dòng vốn toàn cầu.',
  '<p>Nội dung chờ kiểm duyệt...</p>',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80',
  2,5,'PENDING',0,0,NULL,NULL,'2026-10-07 07:10:00'),
 (9,'ket-qua-luat-tran-champions-league-rang-sang-nay',
  'Kết quả lượt trận Champions League rạng sáng nay',
  'Tổng hợp tỷ số và điểm nhấn các trận cầu lớn.',
  NULL,NULL,3,6,'PENDING',0,0,NULL,NULL,'2026-10-07 05:40:00'),
 (10,'ghi-chep-ve-phat-trien-nang-luong-xanh',
  'Ghi chép về sự phát triển của Năng lượng Xanh',
  'Bản nháp về năng lượng tái tạo.',
  NULL,NULL,2,3,'DRAFT',0,0,NULL,NULL,'2026-10-05 14:20:00'),
 (11,'phan-tich-xu-huong-cong-nghe-nam-2027',
  'Phân tích xu hướng công nghệ năm 2027',
  'Bài đã hẹn giờ tự động xuất bản.',
  NULL,NULL,1,3,'SCHEDULED',0,0,NULL,'2026-10-10 08:00:00','2026-10-06 10:00:00'),
 (12,'bai-vi-du-bi-tu-choi',
  'Bài viết mẫu bị từ chối',
  'Cần bổ sung nguồn tham khảo.',
  NULL,NULL,4,3,'REJECTED',0,0,NULL,NULL,'2026-10-02 09:00:00');

UPDATE articles
   SET reject_reason = 'Nội dung chưa đủ nguồn tham khảo, vui lòng bổ sung link dẫn chứng.'
 WHERE id = 12;

INSERT INTO article_tags (article_id, tag_id) VALUES
 (4,1),(4,4),(4,5),(11,4),(11,5),(1,3);

-- ============================================================================
-- C. COMMENTS (CommentSection.jsx — 2 comment gốc, 5 replies lồng)
-- ============================================================================
INSERT INTO comments (id, article_id, user_id, parent_id, reply_to_id, content, likes_count, created_at) VALUES
 (1,1,7,NULL,NULL,'Bài viết phân tích rất sâu sắc về xu hướng AI năm 2026. Mong tòa soạn có thêm bài viết về mảng bán dẫn!',18,'2026-10-07 01:23:45'),
 (2,1,3,1,NULL,'Cảm ơn bạn! Bài phân tích về thị trường Bán dẫn sẽ lên sóng vào tuần sau nhé.',9,'2026-10-06 14:15:30'),
 (3,1,9,1,1,'Tôi cũng rất quan tâm đến chủ đề này và mong chờ bài viết tiếp theo.',4,'2026-10-07 01:22:25'),
 (4,1,8,1,2,'Hy vọng bài viết tiếp theo sẽ phân tích sâu hơn về thị trường chip.',2,'2026-10-07 00:52:00'),
 (5,1,8,NULL,NULL,'Liệu ứng dụng này có tích hợp thêm tính năng nghe đọc báo tự động (Text-to-Speech) không ạ?',5,'2026-10-07 00:22:25');

-- 3 báo cáo đang chờ (AdminDashboard: "Báo cáo vi phạm: 3")
INSERT INTO comment_reports (id, comment_id, reporter_id, reason, note, status, created_at) VALUES
 (1,5,7,'SPAM',NULL,'PENDING','2026-10-07 02:00:00'),
 (2,4,9,'HATE_SPEECH',NULL,'PENDING','2026-10-07 02:10:00'),
 (3,1,8,'FAKE_NEWS',NULL,'PENDING','2026-10-07 02:20:00');

-- ============================================================================
-- D. NOTIFICATIONS (đúng 3 type ở NotificationsPage) — gửi cho user 3
-- ============================================================================
INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES
 (1,3,'COMMENT','Nguyễn Văn B đã trả lời bình luận của bạn','Tôi cũng rất quan tâm đến chủ đề này...','/article/dong-doi-cu-ke-manh-khoe-tranh-ronaldo-sut-phat',0,'2026-10-07 01:22:25'),
 (2,3,'SYSTEM','Bài viết "Xu hướng AI 2026" của bạn đã được phê duyệt',NULL,'/author/articles',0,'2026-10-07 05:00:00'),
 (3,3,'LIKE','Trần Thị C đã thích bài viết của bạn',NULL,'/author/articles',1,'2026-10-06 09:00:00');

-- ============================================================================
-- D. MENU (MenuManagementPage — 5 item Header + 4 Footer)
-- ============================================================================
INSERT INTO menu_items (id, label, url, target, location, position) VALUES
 (1,'Trang chủ','/','_self','HEADER',1),
 (2,'Tin Công nghệ','/category/cong-nghe','_self','HEADER',2),
 (3,'Thị trường Tài chính','/category/tai-chinh','_self','HEADER',3),
 (4,'Thời tiết & Thiên văn','/weather','_self','HEADER',4),
 (5,'Trực tiếp Bóng đá','/sports/live','_blank','HEADER',5),
 (6,'Giới thiệu','/about','_self','FOOTER',1),
 (7,'Liên hệ','/contact','_self','FOOTER',2),
 (8,'Chuyên mục Thể thao','/category/the-thao','_self','FOOTER',3),
 (9,'Chuyên mục Tin tức','/category/tin-tuc','_self','FOOTER',4);

-- ============================================================================
-- D. ADVERTISEMENTS (AdsManagementPage)
-- ============================================================================
INSERT INTO advertisements (id, title, position, image_url, link_url, is_active, views, clicks) VALUES
 (1,'Banner Sidebar - VinFast','SIDEBAR','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&q=80','https://vinfast.vn',1,45000,1240),
 (2,'Banner Leaderboard Top Trang chủ','TOP_HOMEPAGE','https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80','https://techcombank.vn',1,120000,3890),
 (3,'In-article Native Ads - Techcombank','IN_ARTICLE','https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80','https://techcombank.vn',0,28000,890);

-- ============================================================================
-- D. SETTINGS (SystemSettingsPage)
-- ============================================================================
INSERT INTO settings (`key`, value, scope) VALUES
 ('site_name','Portal News 2026','PUBLIC'),
 ('site_description','Cổng thông tin tin tức đa phương tiện cập nhật liên tục 24/7','PUBLIC'),
 ('contact_email','admin@portalnews.com','PUBLIC'),
 ('maintenance_mode','false','PUBLIC'),
 ('enable_register','true','PUBLIC'),
 ('contact_address','Tầng 8, Tòa nhà Press Tower, 123 Đường Cầu Giấy, Hà Nội','PUBLIC'),
 ('contact_hotline','+84 (0) 24 3888 9999','PUBLIC');

-- ============================================================================
-- D. AUDIT LOGS (AuditLogPage + widget "Nhật ký hệ thống" ở AdminDashboard)
-- ============================================================================
INSERT INTO audit_logs (id, user_id, user_label, action, entity, entity_id, ip, status, created_at) VALUES
 (1,1,'Admin Hoang','Đã phê duyệt bài viết #102','article','102','14.232.208.10','SUCCESS','2026-10-07 07:50:00'),
 (2,1,'Editor Nam','Thay đổi phân quyền User #u3 sang AUTHOR','user','3','118.70.12.44','SUCCESS','2026-10-07 07:00:00'),
 (3,NULL,'Unknown','Đăng nhập thất bại (Sai mật khẩu 5 lần)','auth',NULL,'27.72.61.102','WARNING','2026-10-07 05:00:00'),
 (4,1,'Admin','Đã xuất bản bài viết #1','article','1','14.232.208.10','SUCCESS','2026-10-07 03:00:00'),
 (5,1,'Admin','Cập nhật quyền vai trò Editor','role','2','14.232.208.10','SUCCESS','2026-10-07 02:00:00');

-- ============================================================================
-- D. MEDIA (MediaLibraryPage)
-- ============================================================================
INSERT INTO media (id, uploader_id, filename, original_name, url, mime_type, size_bytes) VALUES
 (1,3,'ai-chipset-2026.jpg','ai-chipset-2026.jpg','https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80','image/jpeg',1258291),
 (2,3,'market-chart.png','market-chart.png','https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80','image/png',870400),
 (3,3,'football-stadium.jpg','football-stadium.jpg','https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80','image/jpeg',2516582);

-- ============================================================================
-- C. BOOKMARKS / READING HISTORY / FOLLOWS (demo bằng user 1)
-- ============================================================================
INSERT INTO bookmarks (user_id, article_id, created_at) VALUES
 (1,1,'2026-10-07 08:00:00'),(1,2,'2026-10-07 08:05:00'),(1,3,'2026-10-07 08:10:00');

INSERT INTO reading_history (user_id, article_id, read_at) VALUES
 (1,1,'2026-10-07 08:00:00'),(1,2,'2026-10-06 14:30:00'),(1,3,'2026-10-05 10:00:00');

INSERT INTO follows (follower_id, author_id, created_at) VALUES
 (7,3,'2026-10-06 12:00:00'),(8,3,'2026-10-06 13:00:00'),(9,3,'2026-10-07 09:00:00');

-- ============================================================================
-- D. CONTACT MESSAGES (ContactPage) + BIỂU ĐỒ ANALYTICS 7 NGÀY
-- ============================================================================
INSERT INTO contact_messages (id, name, email, subject, content, status) VALUES
 (1,'Đặng Thị Mai','mai@example.com','Hợp tác quảng cáo','Chúng tôi muốn đặt banner sidebar trong tháng 11.','NEW'),
 (2,'Phan Văn Hùng','hung@example.com','Góp ý bài viết','Chuyên mục Công nghệ nên có thêm bài về an ninh mạng.','REPLIED');

INSERT INTO article_stats_daily (article_id, stat_date, views, likes, comments, bookmarks) VALUES
 (1,'2026-10-01',400,12,3,5),(1,'2026-10-02',650,18,5,7),(1,'2026-10-03',300,8,2,3),
 (1,'2026-10-04',850,25,9,11),(1,'2026-10-05',950,30,12,14),(1,'2026-10-06',500,15,4,6),
 (1,'2026-10-07',750,22,8,9),
 (4,'2026-10-01',300,9,2,4),(4,'2026-10-02',420,11,3,5),(4,'2026-10-03',510,14,4,6),
 (4,'2026-10-04',680,20,7,8),(4,'2026-10-05',720,21,6,9),(4,'2026-10-06',540,16,5,7),
 (4,'2026-10-07',610,18,6,8);

-- ============================================================================
-- KẾT THUẠC SEED
--   roles 4 | permissions 8 | role_permissions 16 | users 15
--   categories 6 | tags 5 | articles 12 (6 published, 3 pending, 1 draft,
--   1 scheduled, 1 rejected) | comments 5 | reports 3 | notifications 3
--   menu 9 | ads 3 | settings 7 | audit_logs 5 | media 3
--   bookmarks 3 | history 3 | follows 3 | contacts 2 | stats 14
-- ============================================================================







