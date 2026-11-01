import { pool } from "../config/database.js";

export async function findPublicAuthorById(id) {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.avatar_url AS avatar,
      u.bio,
      u.expertise,
      r.code AS role
    FROM users AS u
    INNER JOIN roles AS r ON r.id = u.role_id
    WHERE u.id = ?
      AND u.status = 'ACTIVE'
      AND r.code IN ('AUTHOR', 'EDITOR', 'ADMIN')
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [id]);

  return rows[0] ?? null;
}

export async function countAuthorPublishedArticles(authorId) {
  const sql = `
    SELECT COUNT(*) AS total
    FROM articles AS a
    INNER JOIN categories AS c ON c.id = a.category_id
    WHERE a.author_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
  `;

  const [rows] = await pool.execute(sql, [authorId]);

  return Number(rows[0].total);
}

export async function findAuthorPublishedArticles({
  authorId,
  limit,
  offset,
  sort,
}) {
  const sortOptions = {
    latest: "a.published_at DESC, a.id DESC",
    popular: "a.views DESC, a.published_at DESC",
  };

  const orderBy = sortOptions[sort] ?? sortOptions.latest;

  const sql = `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.cover_image AS image,
      a.published_at AS publishedAt,
      a.views,
      a.reading_time AS readingTime,
      a.is_featured AS isFeatured,
      c.name AS categoryName,
      c.slug AS categorySlug,
      u.id AS authorId,
      u.name AS authorName,
      u.avatar_url AS authorAvatar
    FROM articles AS a
    INNER JOIN categories AS c ON c.id = a.category_id
    INNER JOIN users AS u ON u.id = a.author_id
    WHERE a.author_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
      AND u.status = 'ACTIVE'
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [
    authorId,
    limit,
    offset,
  ]);

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
  }));
}