-- PORTAL NEWS seed demo 12 bai (13-24). Pass MySQL: sudo1234@
-- Chay: mysql -h localhost -P 3306 -u root -p portal_news < database/seed_demo_12_fixed.sql
USE portal_news;
SET NAMES utf8mb4;
INSERT IGNORE INTO tags (id, name, slug) VALUES
 (6,'Bong da','bong-da'),(7,'Doi tuyen Viet Nam','doi-tuyen-viet-nam'),
 (8,'Smartphone AI','smartphone-ai'),(9,'Gia vang','gia-vang'),(10,'Chung khoan','chung-khoan'),
 (11,'Metro','metro-saigon'),(12,'Tet Nguyen dan','tet-nguyen-dan'),(13,'Bao','bao-bien-dong'),
 (14,'iPhone 17','iphone-17'),(15,'Tuyen sinh 2026','tuyen-sinh-2026');
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(13,'galaxy-ai-cuoc-dua-smartphone-ai-2026','Galaxy AI va cuoc dua smartphone AI 2026','Tro ly AI tren dien thoai chuyen sang dua trai nghiem thuc te.','<p>Cuoc dua smartphone AI 2026: Samsung day manh Galaxy AI dich 20 ngon ngu, Apple tap trung on-device.</p>', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',1,3,'PUBLISHED',1,5,18200,320,2,'2026-10-13 08:30:00','2026-10-13 07:00:00'),
(14,'gpt5-suy-luan-re-hon-nhanh-hon','Mo hinh GPT-5 re hon nhanh hon','GPT-5 suy luan chuoi dai gap 3 lan, API giam 40%.','<p>OpenAI cong bo GPT-5, do chinh xac 71% GPQA, gia API giam 40%.</p>','https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',11,3,'PUBLISHED',0,6,15400,280,0,'2026-10-12 14:00:00','2026-10-12 13:00:00'),
(15,'gia-vang-lap-dinh-150-trieu','Gia vang lap dinh 150 trieu','Vang SJC vuot moc lich su, chuyen gia khuyen chia von.','<p>Sang nay vang SJC 148.5-150 trieu/luong. Chi nen danh 10-15% tai san cho vang.</p>','https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80',2,4,'PUBLISHED',1,4,22100,410,1,'2026-10-14 07:15:00','2026-10-14 06:00:00');
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(16,'chung-khoan-vuot-1800-diem','Chung khoan vuot 1800 diem','VN-Index but pha, khoi ngoai mua rong 1200 ty.','<p>VN-Index tang 18.4 diem len 1812 diem, khoi ngoai mua rong HPG SSI MWG.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',2,5,'PUBLISHED',0,5,12800,190,0,'2026-10-13 15:30:00','2026-10-13 14:00:00'),
(17,'u23-viet-nam-thang-thai-lan','U23 Viet Nam thang Thai Lan 3-2','Van Thuan danh dau phut 90+3 an dinh chien thang.','<p>U23 Viet Nam thang 3-2 truoc Thai Lan tren san My Dinh, len dau bang.</p>', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',3,10,'PUBLISHED',1,3,25600,520,2,'2026-10-13 21:45:00','2026-10-13 21:00:00'),
(18,'arsenal-dai-chien-man-city','Arsenal dai chien Man City','Phao thu tiep Man City tai Emirates 23h30.','<p>Arsenal 19 diem tiep Man City 17 diem. Haaland 11 ban doi dau Saliba.</p>', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',3,12,'PUBLISHED',0,4,11800,210,0,'2026-10-12 09:00:00','2026-10-12 08:00:00');

INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(19,'metro-so-1-tang-chuyen','Metro so 1 tang chuyen cuoi nam','Tu 15/10 chay 200 chuyen/ngay, gian cach 4 phut.','<p>Metro Ben Thanh - Suoi Tien dat 85.000 luot/ngay, gap 3 lan ke hoach.</p>', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',4,11,'PUBLISHED',0,3,9600,150,0,'2026-10-11 10:20:00','2026-10-11 09:30:00'),
(20,'nghi-tet-9-ngay-2027','De xuat nghi Tet 9 ngay 2027','Nghi tu 29 Chap den het mung 8 Gieng.','<p> Cong chuc nghi 9 ngay lien tuc, 78% lao dong ung ho.</p>', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',4,11,'PUBLISHED',0,3,13400,230,0,'2026-10-10 08:00:00','2026-10-10 07:00:00'),
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(21,'bao-so-9-vao-bien-dong','Bao so 9 giat cap 14 vao Bien Dong','Tam bao cach Hoang Sa 450km, mien Trung mua 5 ngay.','<p>Bao cap 11 giat cap 14, bien Hoang Sa song 6-8m.</p>', 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',5,13,'PUBLISHED',1,4,19700,380,1,'2026-10-14 06:30:00','2026-10-14 05:45:00'),
(22,'ha-noi-ret-12-do','Ha Noi ret 12 do cuoi tuan','Sa Pa 5 do, Fansipan 2 do, co suong muoi.','<p>Ha Noi 12-14 do kem mua phun, vung nui ret dam 7-9 do.</p>', 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=800&q=80',5,13,'PUBLISHED',0,2,7400,110,0,'2026-10-09 16:00:00','2026-10-09 15:00:00');
(23,'iphone-17-chay-hang','iPhone 17 Pro Max chay hang 2 gio','Ban titan sa mac het dau tien, doi tra may 3 tuan.','<p>15.000 don 2 gio, chip A19 Pro, camera 48MP zoom 10x.</p>', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',1,14,'PUBLISHED',0,4,16900,300,0,'2026-10-11 13:40:00','2026-10-11 12:00:00'),
(24,'tuyen-sinh-bo-xet-hoc-ba','Tuyen sinh 2026 bo xet hoc ba','Bach khoa KTQD Ngoai thuong xet diem thi THPT.','<p>Diem thi THPT chiem 70-80% chi tieu, diem chuan co the tang 1 diem.</p>', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',4,4,'PUBLISHED',0,5,14200,240,1,'2026-10-08 09:10:00','2026-10-08 08:00:00');
INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES
 (13,4),(13,5),(13,8),(14,4),(14,5),(15,2),(15,9),(16,2),(16,10),(17,6),(17,7),(18,6),(19,4),(19,11),(20,4),(20,12),(21,13),(22,13),(23,4),(23,5),(23,14),(24,15);
INSERT INTO comments (id, article_id, user_id, parent_id, reply_to_id, content, likes_count, created_at) VALUES
 (6,13,7,NULL,NULL,'Bai so sanh chi tiet, phan van S24 Ultra hay iPhone 16 Pro.',12,'2026-10-13 09:10:00'),
 (7,13,3,6,NULL,'Cam on ban! Ban pin test 48h len song cuoi tuan nay.',6,'2026-10-13 10:02:00'),
 (8,15,8,NULL,NULL,'Vang 150 trieu chong mat, khong dam luot song.',15,'2026-10-14 07:40:00'),
 (9,17,9,NULL,NULL,'Van Thuan danh dau dang cap! Viet Nam vo dich!',22,'2026-10-13 22:05:00'),
 (10,17,7,9,NULL,'Dong y, hiep 2 thay nguoi qua hay.',8,'2026-10-13 22:30:00'),
 (11,21,8,NULL,NULL,'Nha o Hoi An nuoc len toi san, mong bao suy yeu.',9,'2026-10-14 07:00:00'),
 (12,24,9,NULL,NULL,'Bo hoc ba la dung, thiet cho ban hoc that.',11,'2026-10-08 10:15:00');
INSERT IGNORE INTO article_likes (article_id, user_id, created_at) VALUES
 (13,7,'2026-10-13 09:00:00'),(13,8,'2026-10-13 09:20:00'),(15,7,'2026-10-14 07:30:00'),
 (17,7,'2026-10-13 22:00:00'),(17,9,'2026-10-13 22:20:00'),(21,7,'2026-10-14 06:50:00'),(23,8,'2026-10-11 14:00:00');
INSERT IGNORE INTO bookmarks (user_id, article_id, created_at) VALUES
 (7,13,'2026-10-13 09:05:00'),(7,15,'2026-10-14 07:32:00'),(7,17,'2026-10-13 22:02:00'),(8,21,'2026-10-14 06:55:00'),(8,23,'2026-10-11 14:05:00');
INSERT IGNORE INTO reading_history (user_id, article_id, read_at) VALUES
 (7,15,'2026-10-14 07:31:00'),(7,17,'2026-10-13 22:01:00'),(7,21,'2026-10-14 06:52:00'),(8,13,'2026-10-13 09:06:00'),(8,24,'2026-10-08 10:20:00');



