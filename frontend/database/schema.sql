-- ============================================================================
-- PORTAL NEWS — MYSQL 8.x SCHEMA (27 bảng)
-- Tài liệu kèm theo: docs/API.md, docs/ERD.md
-- Charset: utf8mb4 (hỗ trợ tiếng Việt), Engine: InnoDB
-- Tạo DB: mysql -u root -p < database/schema.sql
-- ============================================================================
CREATE DATABASE IF NOT EXISTS portal_news
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portal_news;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- NHÓM A — AUTH & RBAC
-- ============================================================================

-- A1. roles ------------------------------------------------------------------
CREATE TABLE roles (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(32)  NOT NULL COMMENT 'ADMIN | EDITOR | AUTHOR | SUBSCRIBER',
  name        VARCHAR(64)  NOT NULL,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_code (code)
) ENGINE=InnoDB COMMENT='Vai trò hệ thống (khớp RolePermissionsPage)';

-- A2. permissions ------------------------------------------------------------
CREATE TABLE permissions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  key_name   VARCHAR(64)  NOT NULL COMMENT 'ARTICLE_CREATE, ARTICLE_EDIT_OWN, ...',
  label      VARCHAR(128) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permissions_key (key_name)
) ENGINE=InnoDB COMMENT='8 quyền tĩnh theo mockPermissions (RolePermissionsPage)';

-- A3. role_permissions -------------------------------------------------------
CREATE TABLE role_permissions (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  KEY idx_rp_permission (permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id)
    REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id)
    REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Ma trận RBAC — đúng mockRoleMatrix';

-- A4. users ------------------------------------------------------------------
CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(190)  NOT NULL,
  password_hash  VARCHAR(255)  NULL COMMENT 'NULL nếu login Google',
  avatar_url     VARCHAR(500)  NULL,
  bio            TEXT          NULL COMMENT 'Giới thiệu tác giả (AuthorPublicProfilePage)',
  expertise      VARCHAR(128)  NULL COMMENT 'Chức danh, ví dụ: Chuyên gia Công nghệ & AI',
  role_id        BIGINT UNSIGNED NOT NULL,
  status         ENUM('ACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE'
                 COMMENT 'Khớp cột Trạng thái ở UserManagementPage',
  email_verified TINYINT(1)    NOT NULL DEFAULT 0,
  google_id      VARCHAR(64)   NULL COMMENT 'passport-google-oauth20',
  last_login_at  DATETIME      NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_google (google_id),
  KEY idx_users_role (role_id),
  KEY idx_users_status (status),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id)
    REFERENCES roles (id)
) ENGINE=InnoDB;

-- A5. refresh_tokens ---------------------------------------------------------
CREATE TABLE refresh_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)     NOT NULL COMMENT 'SHA-256 của refresh token',
  expires_at DATETIME     NOT NULL,
  revoked    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rt_user (user_id),
  KEY idx_rt_token (token_hash),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- A6. password_resets --------------------------------------------------------
CREATE TABLE password_resets (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)     NOT NULL,
  expires_at DATETIME     NOT NULL COMMENT 'Tối đa 15 phút',
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pr_user (user_id),
  KEY idx_pr_token (token_hash),
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- NHÓM B — NỘI DUNG (khớp mockArticles, ArticleContext, Create/EditArticlePage)
-- ============================================================================

-- B1. categories (self-ref cha/con) ------------------------------------------
CREATE TABLE categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(120)  NOT NULL,
  parent_id   BIGINT UNSIGNED NULL COMMENT 'NULL = chuyên mục gốc',
  description VARCHAR(500)  NULL,
  position    INT           NOT NULL DEFAULT 0,
  status      ENUM('ACTIVE','HIDDEN') NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
    REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Chuyên mục nhiều cấp (CategoryTagManagementPage)';

-- B2. tags --------------------------------------------------------------------
CREATE TABLE tags (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(80) NOT NULL,
  slug       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tags_slug (slug)
) ENGINE=InnoDB;

-- B3. articles ----------------------------------------------------------------
CREATE TABLE articles (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(191)  NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  excerpt       VARCHAR(500)  NULL COMMENT 'Tóm tắt 1-2 câu',
  content       LONGTEXT      NULL COMMENT 'HTML từ RichEditor/Docx',
  cover_image   VARCHAR(500)  NULL COMMENT 'URL ảnh bìa (Featured Image)',
  category_id   BIGINT UNSIGNED NOT NULL,
  author_id     BIGINT UNSIGNED NOT NULL,
  status        ENUM('DRAFT','PENDING','PUBLISHED','REJECTED','SCHEDULED','UNPUBLISHED')
                NOT NULL DEFAULT 'DRAFT'
                COMMENT 'Trạng thái luồng duyệt: draft/pending/published/rejected + scheduled',
  is_featured   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Tin nổi bật / Tin nóng',
  reject_reason VARCHAR(500)  NULL COMMENT 'Lý do từ chối (rejectArticle)',
  reading_time  TINYINT UNSIGNED NULL COMMENT 'Số phút đọc (readingTime)',
  views         INT UNSIGNED  NOT NULL DEFAULT 0,
  likes_count   INT UNSIGNED  NOT NULL DEFAULT 0,
  comments_count INT UNSIGNED NOT NULL DEFAULT 0,
  published_at  DATETIME      NULL,
  scheduled_at  DATETIME      NULL COMMENT 'Lịch hẹn giờ xuất bản (PublishSchedulePage)',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME      NULL COMMENT 'Soft delete',
  PRIMARY KEY (id),
  UNIQUE KEY uk_articles_slug (slug),
  KEY idx_articles_status_pub (status, published_at DESC),
  KEY idx_articles_category (category_id, status),
  KEY idx_articles_author (author_id, status),
  KEY idx_articles_scheduled (status, scheduled_at),
  KEY idx_articles_featured (is_featured, status),
  FULLTEXT KEY ft_articles_search (title, excerpt),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id)
    REFERENCES categories (id),
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id)
    REFERENCES users (id)
) ENGINE=InnoDB COMMENT='Bài viết — trái tim của portal';

-- B4. article_tags -----------------------------------------------------------
CREATE TABLE article_tags (
  article_id BIGINT UNSIGNED NOT NULL,
  tag_id     BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  KEY idx_at_tag (tag_id),
  CONSTRAINT fk_at_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_at_tag FOREIGN KEY (tag_id)
    REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- B5. article_revisions (Giai đoạn 2 — Revision) ------------------------------
CREATE TABLE article_revisions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  article_id BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    LONGTEXT     NOT NULL,
  editor_id  BIGINT UNSIGNED NULL,
  note       VARCHAR(255) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rev_article (article_id, created_at DESC),
  CONSTRAINT fk_rev_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_editor FOREIGN KEY (editor_id)
    REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- NHÓM C — COMMUNITY (CommentSection, ReportCommentDialog, Bookmarks, ...)
-- ============================================================================

-- C1. comments (gốc + lồng 2 tầng) -------------------------------------------
CREATE TABLE comments (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  article_id   BIGINT UNSIGNED NOT NULL,
  user_id      BIGINT UNSIGNED NOT NULL,
  parent_id    BIGINT UNSIGNED NULL COMMENT 'NULL = bình luận gốc; không NULL = reply cấp 1',
  reply_to_id  BIGINT UNSIGNED NULL COMMENT 'Bình luận cụ thể đang trả lời (replyToId)',
  content      VARCHAR(2000) NOT NULL,
  status       ENUM('VISIBLE','HIDDEN','DELETED') NOT NULL DEFAULT 'VISIBLE'
               COMMENT 'HIDDEN khi admin xử lý báo cáo',
  likes_count  INT UNSIGNED NOT NULL DEFAULT 0,
  is_edited    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_article (article_id, parent_id, created_at),
  KEY idx_comments_user (user_id),
  KEY idx_comments_likes (article_id, likes_count DESC),
  CONSTRAINT fk_comments_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id)
    REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_reply_to FOREIGN KEY (reply_to_id)
    REFERENCES comments (id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Bình luận nhiều tầng — lọc NEWEST / MOST_LIKED';

-- C2. comment_likes ----------------------------------------------------------
CREATE TABLE comment_likes (
  comment_id BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  KEY idx_cl_user (user_id),
  CONSTRAINT fk_cl_comment FOREIGN KEY (comment_id)
    REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_cl_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- C3. article_likes ----------------------------------------------------------
CREATE TABLE article_likes (
  article_id BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, user_id),
  KEY idx_al_user (user_id),
  CONSTRAINT fk_al_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_al_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Nút Like trên ArticleDetailPage';

-- C4. bookmarks (Bài viết đã lưu) --------------------------------------------
CREATE TABLE bookmarks (
  user_id    BIGINT UNSIGNED NOT NULL,
  article_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, article_id),
  KEY idx_bm_article (article_id),
  CONSTRAINT fk_bm_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bm_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- C5. reading_history (Lịch sử đọc) ------------------------------------------
CREATE TABLE reading_history (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  article_id BIGINT UNSIGNED NOT NULL,
  read_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_rh_user_article (user_id, article_id),
  KEY idx_rh_user_time (user_id, read_at DESC),
  CONSTRAINT fk_rh_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_rh_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- C6. follows (Theo dõi tác giả) ---------------------------------------------
CREATE TABLE follows (
  follower_id BIGINT UNSIGNED NOT NULL COMMENT 'Độc giả theo dõi',
  author_id   BIGINT UNSIGNED NOT NULL COMMENT 'Tác giả được theo dõi',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, author_id),
  KEY idx_follows_author (author_id),
  CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_follows_author FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Nút Theo dõi ở AuthorPublicProfilePage';

-- C7. comment_reports (Báo cáo vi phạm) --------------------------------------
CREATE TABLE comment_reports (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comment_id   BIGINT UNSIGNED NOT NULL,
  reporter_id  BIGINT UNSIGNED NOT NULL,
  reason       ENUM('SPAM','HATE_SPEECH','FAKE_NEWS','OTHER') NOT NULL
               COMMENT '4 lý do đúng ReportCommentDialog',
  note         VARCHAR(500) NULL COMMENT 'Ghi chú khi chọn OTHER',
  status       ENUM('PENDING','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  handled_by   BIGINT UNSIGNED NULL,
  handled_at   DATETIME NULL,
  action_taken VARCHAR(100) NULL COMMENT 'HIDE_COMMENT | DELETE_COMMENT',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_report_once (comment_id, reporter_id),
  KEY idx_reports_status (status, created_at DESC),
  CONSTRAINT fk_cr_comment FOREIGN KEY (comment_id)
    REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_cr_reporter FOREIGN KEY (reporter_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_cr_handler FOREIGN KEY (handled_by)
    REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- NHÓM D — HỆ THỐNG & QUẢN TRỊ (các trang Admin + System)
-- ============================================================================

-- D1. notifications ----------------------------------------------------------
CREATE TABLE notifications (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       ENUM('COMMENT','LIKE','SYSTEM') NOT NULL COMMENT 'Đúng 3 type ở NotificationsPage',
  title      VARCHAR(255) NOT NULL,
  body       VARCHAR(500) NULL,
  link       VARCHAR(500) NULL COMMENT 'Đường dẫn điều hướng khi bấm vào',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user (user_id, is_read, created_at DESC),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- D2. media (Thư viện Media) -------------------------------------------------
CREATE TABLE media (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uploader_id   BIGINT UNSIGNED NOT NULL,
  filename      VARCHAR(255) NOT NULL COMMENT 'Tên file trên server (Uploads/)',
  original_name VARCHAR(255) NOT NULL,
  url           VARCHAR(500) NOT NULL COMMENT 'Đường dẫn public',
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_uploader (uploader_id, created_at DESC),
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploader_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='MediaLibraryPage — multer upload';

-- D3. menu_items -------------------------------------------------------------
CREATE TABLE menu_items (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label     VARCHAR(80) NOT NULL,
  url       VARCHAR(255) NOT NULL,
  target    ENUM('_self','_blank') NOT NULL DEFAULT '_self',
  location  ENUM('HEADER','FOOTER') NOT NULL DEFAULT 'HEADER',
  position  INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị (kéo-thả)',
  status    ENUM('ACTIVE','HIDDEN') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menu_loc (location, position)
) ENGINE=InnoDB COMMENT='MenuManagementPage — Header/Footer';

-- D4. advertisements ---------------------------------------------------------
CREATE TABLE advertisements (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title      VARCHAR(150) NOT NULL,
  position   ENUM('SIDEBAR','TOP_HOMEPAGE','IN_ARTICLE') NOT NULL,
  image_url  VARCHAR(500) NULL,
  link_url   VARCHAR(500) NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  views      INT UNSIGNED NOT NULL DEFAULT 0,
  clicks     INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ads_active (is_active, position)
) ENGINE=InnoDB COMMENT='AdsManagementPage — Sidebar/Top/In-article';

-- D5. ad_events (tính CTR & Revenue) -----------------------------------------
CREATE TABLE ad_events (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ad_id      BIGINT UNSIGNED NOT NULL,
  type       ENUM('VIEW','CLICK') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ade_ad (ad_id, type, created_at),
  CONSTRAINT fk_ade_ad FOREIGN KEY (ad_id)
    REFERENCES advertisements (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- D6. settings (key-value) ---------------------------------------------------
CREATE TABLE settings (
  `key`     VARCHAR(64) NOT NULL COMMENT 'site_name, maintenance_mode, ...',
  value     TEXT NULL,
  scope     ENUM('PUBLIC','ADMIN') NOT NULL DEFAULT 'ADMIN',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB COMMENT='SystemSettingsPage';

-- D7. audit_logs -------------------------------------------------------------
CREATE TABLE audit_logs (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NULL COMMENT 'NULL = Unknown (login fail)',
  user_label VARCHAR(64) NOT NULL COMMENT 'Tên hiển thị chụp nhanh',
  action     VARCHAR(255) NOT NULL,
  entity     VARCHAR(64)  NULL,
  entity_id  VARCHAR(64)  NULL,
  ip         VARCHAR(45)  NOT NULL COMMENT 'IPv4/IPv6',
  status     ENUM('SUCCESS','WARNING','FAILED') NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_time (created_at DESC),
  KEY idx_audit_user (user_id, created_at DESC),
  KEY idx_audit_status (status, created_at DESC),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='AuditLogPage + widget Nhật ký hệ thống';

-- D8. contact_messages -------------------------------------------------------
CREATE TABLE contact_messages (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  status     ENUM('NEW','REPLIED','SPAM') NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_status (status, created_at DESC)
) ENGINE=InnoDB COMMENT='Form Liên hệ (ContactPage)';

-- D9. article_stats_daily (dữ liệu biểu đồ Analytics) ------------------------
CREATE TABLE article_stats_daily (
  article_id  BIGINT UNSIGNED NOT NULL,
  stat_date   DATE NOT NULL,
  views       INT UNSIGNED NOT NULL DEFAULT 0,
  likes       INT UNSIGNED NOT NULL DEFAULT 0,
  comments    INT UNSIGNED NOT NULL DEFAULT 0,
  bookmarks   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, stat_date),
  KEY idx_asd_date (stat_date),
  CONSTRAINT fk_asd_article FOREIGN KEY (article_id)
    REFERENCES articles (id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Biểu đồ 7/30 ngày ở ArticleAnalyticsPage & AdminDashboard';

-- ============================================================================
-- KẾT THUẠC — TỔNG 27 BẢNG
--   A. users, roles, permissions, role_permissions, refresh_tokens, password_resets (6)
--   B. categories, tags, articles, article_tags, article_revisions (5)
--   C. comments, comment_likes, article_likes, bookmarks, reading_history,
--      follows, comment_reports (7)
--   D. notifications, media, menu_items, advertisements, ad_events, settings,
--      audit_logs, contact_messages, article_stats_daily (9)
-- ============================================================================




