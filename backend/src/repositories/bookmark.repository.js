import { pool } from "../config/database.js";

export async function countUserBookmarks(userId) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM bookmarks AS b
      INNER JOIN articles AS a
        ON a.id = b.article_id
      INNER JOIN categories AS c
        ON c.id = a.category_id
      WHERE b.user_id = ?
        AND a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'
    `,
    [userId]
  );

  return Number(rows[0].total);
}

export async function findUserBookmarks({
  userId,
  limit,
  offset,
}) {
  const [rows] = await pool.execute(
    `
      SELECT
        a.id,
        a.slug,
        a.title,
        a.excerpt,
        a.cover_image,
        c.name AS categoryName,
        c.slug AS categorySlug,
        u.id AS authorId,
        u.name AS authorName,
        u.avatar_url AS authorAvatar,
        a.published_at AS publishedAt,
        a.views,
        a.reading_time AS readingTime,
        a.is_featured AS isFeatured,
        b.created_at AS bookmarkedAt
      FROM bookmarks AS b
      INNER JOIN articles AS a
        ON a.id = b.article_id
      INNER JOIN categories AS c
        ON c.id = a.category_id
      INNER JOIN users AS u
        ON u.id = a.author_id
      WHERE b.user_id = ?
        AND a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'
      ORDER BY b.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `,
    [userId, limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,

    category: {
      name: row.categoryName,
      slug: row.categorySlug,
    },

    author: {
      id: row.authorId,
      name: row.authorName,
      avatar: row.authorAvatar,
    },

    publishedAt: row.publishedAt,
    views: row.views,
    readingTime: row.readingTime,
    isFeatured: Boolean(row.isFeatured),
    bookmarkedAt: row.bookmarkedAt,
  }));
}