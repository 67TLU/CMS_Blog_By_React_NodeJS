import { pool } from '../config/database.js';

/**
 * Chuyển các bài đến hạn từ SCHEDULED sang PUBLISHED.
 * Chạy theo chu kỳ; điều kiện UPDATE bảo đảm một bài chỉ được xuất bản một lần.
 */
export async function publishDueArticles() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [due] = await conn.execute("SELECT id,author_id,title FROM articles WHERE status='SCHEDULED' AND scheduled_at<=NOW() AND deleted_at IS NULL FOR UPDATE");
    if (!due.length) { await conn.commit(); return 0; }
    const ids = due.map(x => x.id);
    const placeholders = ids.map(() => '?').join(',');
    await conn.execute(`UPDATE articles SET status='PUBLISHED',published_at=COALESCE(scheduled_at,NOW()) WHERE id IN (${placeholders}) AND status='SCHEDULED'`, ids);
    for (const article of due) {
      await conn.execute("INSERT INTO notifications (user_id,type,title,body,link) VALUES (?,'SYSTEM',?,?,?)", [article.author_id, 'Bài viết đã được xuất bản', `Bài viết “${article.title}” đã được xuất bản theo lịch.`, `/articles/${article.id}`]);
    }
    await conn.commit();
    return due.length;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}
