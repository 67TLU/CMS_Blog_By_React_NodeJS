-- ============================================================================
-- PORTAL NEWS — MYSQL SCHEDULED EVENTS (Sự kiện định kỳ bảo trì & dọn dẹp)
-- File này là TÙY CHỌN, dùng khi bạn muốn tự động hóa dọn dẹp database bằng MySQL.
--
-- Hướng dẫn kích hoạt & sử dụng:
--   1. Kích hoạt Event Scheduler trong MySQL:
--      SET GLOBAL event_scheduler = ON;
--      (Hoặc thêm `event_scheduler=ON` vào file my.cnf / my.ini để luôn bật khi khởi động)
--
--   2. Chạy file SQL này:
--      mysql -u root -p portal_news < database/events.sql
--
-- Lưu ý:
--   - Tất cả các event đều được viết dạng câu lệnh đơn, tương thích 100% với MySQL CLI,
--     phpMyAdmin, MySQL Workbench, DBeaver mà không gặp lỗi DELIMITER.
-- ============================================================================

USE portal_news;

-- Bật Event Scheduler nếu chưa bật
SET GLOBAL event_scheduler = ON;

-- ── Event 1: Dọn refresh_tokens hết hạn hoặc đã revoked (chạy mỗi 1 giờ) ─────
DROP EVENT IF EXISTS evt_clean_expired_refresh_tokens;
CREATE EVENT evt_clean_expired_refresh_tokens
  ON SCHEDULE EVERY 1 HOUR
  STARTS CURRENT_TIMESTAMP
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Xóa refresh token đã hết hạn hoặc đã bị thu hồi'
  DO DELETE FROM refresh_tokens
     WHERE expires_at < NOW() OR revoked = 1;

-- ── Event 2: Dọn password_resets hết hạn hoặc đã sử dụng (chạy mỗi 1 giờ) ───
DROP EVENT IF EXISTS evt_clean_expired_password_resets;
CREATE EVENT evt_clean_expired_password_resets
  ON SCHEDULE EVERY 1 HOUR
  STARTS CURRENT_TIMESTAMP
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Xóa token đặt lại mật khẩu đã hết hạn (>15 phút) hoặc đã dùng'
  DO DELETE FROM password_resets
     WHERE expires_at < NOW() OR used = 1;

-- ── Event 3: Dọn audit_logs cũ > 90 ngày (chạy mỗi ngày lúc 03:00 sáng) ──────
DROP EVENT IF EXISTS evt_clean_old_audit_logs;
CREATE EVENT evt_clean_old_audit_logs
  ON SCHEDULE EVERY 1 DAY
  STARTS DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 03:00:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Lưu giữ nhật ký kiểm toán hệ thống tối đa 90 ngày'
  DO DELETE FROM audit_logs
     WHERE created_at < NOW() - INTERVAL 90 DAY;

-- ── Event 4: Dọn notifications cũ (chạy mỗi ngày lúc 03:30 sáng) ────────────
DROP EVENT IF EXISTS evt_clean_old_notifications;
CREATE EVENT evt_clean_old_notifications
  ON SCHEDULE EVERY 1 DAY
  STARTS DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 03:30:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Xóa thông báo đã đọc sau 30 ngày; thông báo chưa đọc sau 90 ngày'
  DO DELETE FROM notifications
     WHERE (is_read = 1 AND created_at < NOW() - INTERVAL 30 DAY)
        OR (is_read = 0 AND created_at < NOW() - INTERVAL 90 DAY);

-- ── Event 5: Giới hạn reading_history tối đa 200 bản ghi/user (chạy mỗi tuần) ─
DROP EVENT IF EXISTS evt_trim_reading_history;
CREATE EVENT evt_trim_reading_history
  ON SCHEDULE EVERY 1 WEEK
  STARTS DATE_FORMAT(NOW() + INTERVAL 7 DAY, '%Y-%m-%d 04:00:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Giữ tối đa 200 bài lịch sử đọc gần nhất cho mỗi tài khoản độc giả'
  DO DELETE rh FROM reading_history rh
     INNER JOIN (
       SELECT id FROM (
         SELECT id,
                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY read_at DESC) AS rn
         FROM reading_history
       ) ranked
       WHERE rn > 200
     ) old_rows ON rh.id = old_rows.id;

-- ── Event 6: Dọn ad_events cũ > 60 ngày (chạy mỗi ngày lúc 04:00 sáng) ───────
DROP EVENT IF EXISTS evt_clean_old_ad_events;
CREATE EVENT evt_clean_old_ad_events
  ON SCHEDULE EVERY 1 DAY
  STARTS DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 04:00:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Xóa sự kiện view/click quảng cáo cũ hơn 60 ngày'
  DO DELETE FROM ad_events
     WHERE created_at < NOW() - INTERVAL 60 DAY;

-- ── Event 7: Dọn article_stats_daily cũ > 365 ngày (chạy hàng tháng) ──────────
DROP EVENT IF EXISTS evt_clean_old_article_stats;
CREATE EVENT evt_clean_old_article_stats
  ON SCHEDULE EVERY 1 MONTH
  STARTS DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01 05:00:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Lưu giữ dữ liệu thống kê biểu đồ hàng ngày trong vòng 1 năm'
  DO DELETE FROM article_stats_daily
     WHERE stat_date < CURDATE() - INTERVAL 365 DAY;

-- ── Event 8: Soft-delete bài unpublished > 2 năm không tương tác (hàng tháng) ─
DROP EVENT IF EXISTS evt_archive_old_articles;
CREATE EVENT evt_archive_old_articles
  ON SCHEDULE EVERY 1 MONTH
  STARTS DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01 05:30:00')
  ON COMPLETION PRESERVE
  ENABLE
  COMMENT 'Lưu trữ (soft-delete) bài viết gỡ bỏ đã lâu và không còn tương tác'
  DO UPDATE articles
     SET deleted_at = NOW()
     WHERE status = 'UNPUBLISHED'
       AND deleted_at IS NULL
       AND updated_at < NOW() - INTERVAL 2 YEAR
       AND views = 0;

-- ── Kiểm tra danh sách các events hiện có trong database ─────────────────────
SELECT
  EVENT_NAME,
  STATUS,
  EVENT_TYPE,
  INTERVAL_VALUE,
  INTERVAL_FIELD,
  LAST_EXECUTED,
  NEXT_NOT_FOR_REPLICATION,
  EVENT_COMMENT
FROM information_schema.EVENTS
WHERE EVENT_SCHEMA = 'portal_news'
ORDER BY EVENT_NAME;
