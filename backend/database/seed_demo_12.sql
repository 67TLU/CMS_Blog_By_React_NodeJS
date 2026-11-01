-- PORTAL NEWS seed demo 12 bai (13-24). Chay: mysql -h localhost -P 3306 -u root -p portal_news < database/seed_demo_12.sql
USE portal_news;
SET NAMES utf8mb4;
INSERT IGNORE INTO tags (id, name, slug) VALUES
 (6,'Bong da','bong-da'),(7,'Doi tuyen Viet Nam','doi-tuyen-viet-nam'),
 (8,'Smartphone AI','smartphone-ai'),(9,'Gia vang','gia-vang'),(10,'Chung khoan','chung-khoan'),
 (11,'Metro','metro-saigon'),(12,'Tet Nguyen dan','tet-nguyen-dan'),(13,'Bao','bao-bien-dong'),
 (14,'iPhone 17','iphone-17'),(15,'Tuyen sinh 2026','tuyen-sinh-2026');
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(13,'galaxy-ai-cuoc-dua-smartphone-ai-2026','Galaxy AI va cuoc dua smartphone AI 2026','Tro ly AI tren dien thoai chuyen sang dua trai nghiem thuc te: dich truc tiep va pin thong minh.','<p>Cuoc dua smartphone AI nam 2026 khong con la chuyen ai co nhieu tinh nang nhat. Samsung day manh Galaxy AI voi dich cuoc goi truc tiep 20 ngon ngu, trong khi Apple tap trung xu ly on-device.</p><p>Theo IDC, 68% nguoi dung Viet Nam san sang doi may neu tro ly AI giup tiet kiem 30 phut moi ngay.</p>', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',1,3,'PUBLISHED',1,5,18200,320,2,'2026-10-13 08:30:00','2026-10-13 07:00:00'),
(14,'gpt5-suy-luan-re-hon-nhanh-hon','Mo hinh suy luan GPT-5: re hon, nhanh hon','GPT-5 cho phep suy luan chuoi dai gap 3 lan, chi phi API giam 40%.','<p>OpenAI vua cong bo GPT-5 voi kien truc suy luan moi. Do chinh xac dat 71% trong bai kiem tra GPQA, vuot xa muc 53% cua GPT-4o.</p><p>Gia API giam 40%, mo duong cho startup Viet tich hop AI vao cham soc khach hang va giao duc.</p>','https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',11,3,'PUBLISHED',0,6,15400,280,0,'2026-10-12 14:00:00','2026-10-12 13:00:00'),
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(16,'chung-khoan-vuot-1800-diem','Chung khoan vuot 1.800 diem, khoi ngoai mua rong','VN-Index but pha nho nhom ngan hang va cong nghe, thanh khoan 28.000 ty.','<p>VN-Index tang 18.4 diem len 1.812 diem voi 280 ma tang gia. Khoi ngoai mua rong hon 1.200 ty dong, tap trung HPG, SSI, MWG.</p>', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',2,5,'PUBLISHED',0,5,12800,190,0,'2026-10-13 15:30:00','2026-10-13 14:00:00'),
(17,'u23-viet-nam-thang-thai-lan-phut-90','U23 Viet Nam thang nghet tho Thai Lan phut 90+3','Pha danh dau nguoc cua Van Thuan giup U23 Viet Nam gianh tron 3 diem.','<p>Tren san My Dinh, U23 Viet Nam thang 3-2 truoc Thai Lan. Phut 90+3, Van Thuan bat cao danh dau an dinh chien thang.</p>', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',3,10,'PUBLISHED',1,3,25600,520,2,'2026-10-13 21:45:00','2026-10-13 21:00:00'),
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(19,'metro-so-1-tang-chuyen-cuoi-nam','Metro so 1 tang chuyen dip cuoi nam','Tu 15/10 metro chay 200 chuyen/ngay, gian cach 4 phut gio cao diem.','<p>Tuyen metro so 1 tang tan suat tu 160 len 200 chuyen moi ngay. Luong khach dat 85.000 luot/ngay, gap 3 lan ke hoach.</p>', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',4,11,'PUBLISHED',0,3,9600,150,0,'2026-10-11 10:20:00','2026-10-11 09:30:00'),
(20,'de-xuat-nghi-tet-9-ngay-2027','De xuat nghi Tet 9 ngay nam 2027','Bo Noi vu de xuat nghi tu 29 Chap den het mung 8 Gieng.','<p>Cong chuc se nghi Tet 9 ngay lien tuc, gom 5 ngay chinh thuc va 4 ngay cuoi tuan hoan doi. 78% lao dong ung ho ky nghi dai.</p>', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',4,11,'PUBLISHED',0,3,13400,230,0,'2026-10-10 08:00:00','2026-10-10 07:00:00'),
INSERT INTO articles (id, slug, title, excerpt, content, cover_image, category_id, author_id, status, is_featured, reading_time, views, likes_count, comments_count, published_at, created_at) VALUES
(22,'khong-khi-lanh-ha-noi-ret-12-do','Khong khi lanh tang cuong, Ha Noi ret 12 do','Dot ret dau mua cham nguong ret dam, Sa Pa co the xuong 5 do.','<p>Tu dem mai, Ha Noi chuyen ret 12-14 do, kem mua phun. Vung nui Lang Son, Cao Bang ret dam 7-9 do.</p>', 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=800&q=80',5,13,'PUBLISHED',0,2,7400,110,0,'2026-10-09 16:00:00','2026-10-09 15:00:00'),
(23,'iphone-17-pro-max-chay-hang','iPhone 17 Pro Max chay hang sau 2 gio mo ban','Ban titan sa mac het hang dau tien, gia xach tay chenh 4 trieu.','<p>15.000 don dat truoc trong 2 gio, gap doi iPhone 16. Chip A19 Pro, camera tele 48MP zoom 10x, pin 5.000mAh.</p>', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',1,14,'PUBLISHED',0,4,16900,300,0,'2026-10-11 13:40:00','2026-10-11 12:00:00'),
(24,'tuyen-sinh-2026-bo-xet-hoc-ba','Tuyen sinh 2026: nhieu truong bo xet hoc ba','Bach khoa, KTQD, Ngoai thuong chuyen sang xet diem thi THPT.','<p>Hang loat truong top bo xet hoc ba vi lo ngai lam phat diem. Diem thi THPT va danh gia nang luc chiem 70-80% chi tieu.</p>', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',4,4,'PUBLISHED',0,5,14200,240,1,'2026-10-08 09:10:00','2026-10-08 08:00:00');
INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES
 (13,4),(13,5),(13,8),(14,4),(14,5),(15,2),(15,9),(16,2),(16,10),
 (17,6),(17,7),(18,6),(19,4),(19,11),(20,4),(20,12),
 (21,13),(22,13),(23,4),(23,5),(23,14),(24,15);
INSERT INTO comments (id, article_id, user_id, parent_id, reply_to_id, content, likes_count, created_at) VALUES
 (6,13,7,NULL,NULL,'Bai so sanh chi tiet qua, minh phan van giua S24 Ultra va iPhone 16 Pro.',12,'2026-10-13 09:10:00'),
 (7,13,3,6,NULL,'Cam on ban! Ban pin test 48h se len song cuoi tuan nay nhe.',6,'2026-10-13 10:02:00'),
 (8,15,8,NULL,NULL,'Vang len 150 trieu chong mat that, khong dam luot song luc nay.',15,'2026-10-14 07:40:00'),
INSERT IGNORE INTO article_likes (article_id, user_id, created_at) VALUES
 (13,7,'2026-10-13 09:00:00'),(13,8,'2026-10-13 09:20:00'),
 (15,7,'2026-10-14 07:30:00'),(15,8,'2026-10-14 07:35:00'),
 (17,7,'2026-10-13 22:00:00'),(17,9,'2026-10-13 22:20:00'),
 (21,7,'2026-10-14 06:50:00'),(23,8,'2026-10-11 14:00:00');
INSERT IGNORE INTO bookmarks (user_id, article_id, created_at) VALUES
 (7,13,'2026-10-13 09:05:00'),(7,15,'2026-10-14 07:32:00'),(7,17,'2026-10-13 22:02:00'),
 (8,21,'2026-10-14 06:55:00'),(8,23,'2026-10-11 14:05:00');
INSERT IGNORE INTO reading_history (user_id, article_id, read_at) VALUES
 (7,15,'2026-10-14 07:31:00'),(7,17,'2026-10-13 22:01:00'),(7,21,'2026-10-14 06:52:00'),
 (8,13,'2026-10-13 09:06:00'),(8,24,'2026-10-08 10:20:00');

 (9,17,9,NULL,NULL,'Van Thuan danh dau qua dang cap! Viet Nam vo dich!',22,'2026-10-13 22:05:00'),
 (10,17,7,9,NULL,'Dong y, hiep 2 HLV thay nguoi qua hay.',8,'2026-10-13 22:30:00'),
 (11,21,8,NULL,NULL,'Nha minh o Hoi An, nuoc da len toi san. Mong bao suy yeu.',9,'2026-10-14 07:00:00'),
 (12,24,9,NULL,NULL,'Bo xet hoc ba la dung, thiet cho cac ban hoc that.',11,'2026-10-08 10:15:00');

(21,'bao-so-9-giat-cap-14-vao-bien-dong','Bao so 9 giat cap 14 vao Bien Dong, mien Trung mua lon','Tam bao cach Hoang Sa 450km, du bao do bo Quang Binh - Hue sang 16/10.','<p>Bao so 9 manh cap 11, giat cap 14, di chuyen 20km/h. Vung bien Hoang Sa gio cap 9-10, song cao 6-8m.</p>', 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',5,13,'PUBLISHED',1,4,19700,380,1,'2026-10-14 06:30:00','2026-10-14 05:45:00');

(18,'arsenal-dai-chien-man-city','Arsenal dai chien Man City dinh doat ngoi dau','Phao thu tiep don Man City tai Emirates luc 23h30 Chu nhat.','<p>Arsenal dan dau voi 19 diem sau 8 vong, hon Man City 2 diem. Haaland da co 11 ban tu dau mua, doi dau Saliba la tam diem.</p>', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',3,12,'PUBLISHED',0,4,11800,210,0,'2026-10-12 09:00:00','2026-10-12 08:00:00');

(15,'gia-vang-lap-dinh-150-trieu','Gia vang lap dinh 150 trieu dong luong','Vang SJC vuot moc lich su khi cang thang dia chinh tri leo thang.','<p>Sang nay, gia vang SJC niem yet o muc 148.5 - 150 trieu dong luong, tang 2.3 trieu chi sau mot dem.</p><p>Chuyen gia khuyen nghi chi danh 10-15% tai san cho vang va mua tich luy tung phan, tranh luot song.</p>','https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80',2,4,'PUBLISHED',1,4,22100,410,1,'2026-10-14 07:15:00','2026-10-14 06:00:00');

