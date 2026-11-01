-- File kiểm tra sau khi chạy schema.sql + seed.sql
USE portal_news;

SELECT 'tables' AS obj, COUNT(*) AS n FROM information_schema.tables WHERE table_schema='portal_news'
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL SELECT 'articles', COUNT(*) FROM articles
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'comment_reports', COUNT(*) FROM comment_reports
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL SELECT 'advertisements', COUNT(*) FROM advertisements
UNION ALL SELECT 'settings', COUNT(*) FROM settings
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'article_stats_daily', COUNT(*) FROM article_stats_daily;

SELECT status, COUNT(*) AS cnt FROM articles GROUP BY status;

SELECT r.code, COUNT(rp.permission_id) AS perms
  FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
 GROUP BY r.id, r.code ORDER BY r.id;

-- Kiểm tra không còn FK thiếu (0 dòng = OK)
SELECT COUNT(*) AS orphan_articles FROM articles a
  LEFT JOIN categories c ON c.id = a.category_id
 WHERE c.id IS NULL;
