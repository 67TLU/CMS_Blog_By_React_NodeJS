import { pool } from "../config/database.js";

/**
 * Đếm tổng số bài viết công khai.
 */
export async function countPublishedArticles() {
  const [rows] = await pool.execute(`
    SELECT COUNT(*) AS total
    FROM articles AS a
    INNER JOIN categories AS c ON c.id = a.category_id
    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
  `);

  return Number(rows[0].total);
}

/**
 * Lấy danh sách bài viết đã xuất bản.
 */
export async function findPublishedArticles({ limit, offset }) {
  const [rows] = await pool.execute(
    `
      SELECT
        a.id,
        a.slug,
        a.title,
        a.excerpt,
        a.cover_image AS coverImage,
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

      INNER JOIN categories AS c
        ON c.id = a.category_id

      INNER JOIN users AS u
        ON u.id = a.author_id

      WHERE a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'

      ORDER BY a.published_at DESC, a.id DESC

      LIMIT ? OFFSET ?
    `,
    [limit, offset],
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    publishedAt: row.publishedAt,
    views: row.views,
    readingTime: row.readingTime,
    isFeatured: Boolean(row.isFeatured),

    category: {
      name: row.categoryName,
      slug: row.categorySlug,
    },

    author: {
      id: row.authorId,
      name: row.authorName,
      avatar: row.authorAvatar,
    },
  }));
}
/**
 * Tìm một bài đã xuất bản theo ID hoặc slug.
 */
export async function findPublishedArticleByIdOrSlug(idOrSlug) {
  const isNumericId = /^[1-9]\d*$/.test(idOrSlug);

  let sql = `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.content,
      a.cover_image AS coverImage,
      a.published_at AS publishedAt,
      a.views,
      a.likes_count AS likesCount,
      a.comments_count AS commentsCount,
      a.reading_time AS readingTime,
      a.is_featured AS isFeatured,

      c.id AS categoryId,
      c.name AS categoryName,
      c.slug AS categorySlug,

      u.id AS authorId,
      u.name AS authorName,
      u.avatar_url AS authorAvatar,
      u.bio AS authorBio,
      u.expertise AS authorExpertise

    FROM articles AS a

    INNER JOIN categories AS c
      ON c.id = a.category_id

    INNER JOIN users AS u
      ON u.id = a.author_id

    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
      AND
  `;

  const values = [];

  if (isNumericId) {
    sql += "a.id = ?";
    values.push(idOrSlug);
  } else {
    sql += "a.slug = ?";
    values.push(idOrSlug);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, values);

  return rows[0] ?? null;
}

/**
 * Lấy các thẻ gắn với bài viết.
 */
export async function findTagsByArticleId(articleId) {
  const [rows] = await pool.execute(
    `
      SELECT t.id, t.name, t.slug
      FROM article_tags AS at
      INNER JOIN tags AS t
        ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name ASC
    `,
    [articleId],
  );

  return rows;
}

/**
 * Lấy bài cùng chuyên mục và bài được đọc nhiều.
 * Trả về dữ liệu dạng ArticleCard theo docs/API.md.
 */
export async function findRelatedArticles({
  articleId,
  categoryId,
  limit = 3,
}) {
  const [rows] = await pool.execute(
    `
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

      INNER JOIN categories AS c
        ON c.id = a.category_id

      INNER JOIN users AS u
        ON u.id = a.author_id

      WHERE a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'
        AND a.category_id = ?
        AND a.id <> ?

      ORDER BY a.published_at DESC, a.id DESC
      LIMIT ?
    `,
    [categoryId, articleId, limit],
  );

  return rows.map(mapArticleCard);
}

/**
 * Lấy bài viết được đọc nhiều nhất, ngoại trừ bài hiện tại.
 */
export async function findPopularArticles({
  excludeArticleId,
  limit = 4,
}) {
  const [rows] = await pool.execute(
    `
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

      INNER JOIN categories AS c
        ON c.id = a.category_id

      INNER JOIN users AS u
        ON u.id = a.author_id

      WHERE a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'
        AND a.id <> ?

      ORDER BY a.views DESC, a.published_at DESC, a.id DESC
      LIMIT ?
    `,
    [excludeArticleId, limit],
  );

  return rows.map(mapArticleCard);
}

function mapArticleCard(row) {
  return {
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
  };
}
// Lấy tin nóng: bài PUBLISHED được đánh dấu featured mới nhất
export async function findBreakingArticle() {
  const [rows] = await pool.execute(`
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
    WHERE a.status = 'PUBLISHED'
      AND a.is_featured = 1
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY a.published_at DESC, a.id DESC
    LIMIT 1
  `);

  return rows[0] ? mapArticleCard(rows[0]) : null;
}

// Lấy bài viết nổi bật cho ô lớn
export async function findFeaturedArticles() {
  const [rows] = await pool.execute(`
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
    WHERE a.status = 'PUBLISHED'
      AND a.is_featured = 1
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY a.published_at DESC, a.id DESC
    LIMIT 1
  `);

  return rows.map(mapArticleCard);
}

// Lấy 4 bài có lượt xem cao nhất
export async function findTopStories(limit = 4) {
  const [rows] = await pool.execute(`
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
    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY a.views DESC, a.published_at DESC, a.id DESC
    LIMIT ?
  `, [limit]);

  return rows.map(mapArticleCard);
}

// Lấy bài mới nhất cho trang chủ
export async function findLatestHomeArticles(limit = 8) {
  const [rows] = await pool.execute(`
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
    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY a.published_at DESC, a.id DESC
    LIMIT ?
  `, [limit]);

  return rows.map(mapArticleCard);
}

// Lấy các chuyên mục đang hoạt động
export async function findActiveCategories() {
  const [rows] = await pool.execute(`
    SELECT id, name, slug
    FROM categories
    WHERE status = 'ACTIVE'
    ORDER BY position ASC, name ASC
  `);

  return rows;
}
// Đếm tổng số bài viết phù hợp với từ khóa và chuyên mục
export async function countSearchArticles({ q, category }) {
  const keyword = `%${q}%`;

  let sql = `
    SELECT COUNT(*) AS total
    FROM articles AS a
    INNER JOIN categories AS c ON c.id = a.category_id
    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
      AND (
        MATCH(a.title, a.excerpt)
          AGAINST (? IN BOOLEAN MODE)
        OR a.title LIKE ?
        OR a.excerpt LIKE ?
      )
  `;

  const values = [q, keyword, keyword];

  if (category) {
    sql += " AND c.name = ?";
    values.push(category);
  }

  const [rows] = await pool.execute(sql, values);

  return Number(rows[0].total);
}

// Lấy danh sách bài viết phù hợp với từ khóa và chuyên mục
export async function findSearchArticles({
  q,
  category,
  limit,
  offset,
}) {
  const keyword = `%${q}%`;

  let sql = `
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
    WHERE a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
      AND (
        MATCH(a.title, a.excerpt)
          AGAINST (? IN BOOLEAN MODE)
        OR a.title LIKE ?
        OR a.excerpt LIKE ?
      )
  `;

  const values = [q, keyword, keyword];

  if (category) {
    sql += " AND c.name = ?";
    values.push(category);
  }

  sql += `
    ORDER BY a.published_at DESC, a.id DESC
    LIMIT ? OFFSET ?
  `;

  values.push(limit, offset);

  const [rows] = await pool.execute(sql, values);

  return rows.map(mapArticleCard);
}
// Tìm chuyên mục đang hoạt động theo slug
export async function findActiveCategoryBySlug(slug) {
  const sql = `
    SELECT id, name, slug, description
    FROM categories
    WHERE slug = ?
      AND status = 'ACTIVE'
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [slug]);

  return rows[0] ?? null;
}

// Đếm số bài viết đã xuất bản trong chuyên mục
export async function countCategoryArticles(categoryId) {
  const sql = `
    SELECT COUNT(*) AS total
    FROM articles AS a
    WHERE a.category_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
  `;

  const [rows] = await pool.execute(sql, [categoryId]);

  return Number(rows[0].total);
}

// Lấy danh sách bài viết theo chuyên mục
export async function findCategoryArticles({
  categoryId,
  limit,
  offset,
  sort,
}) {
  const sortOptions = {
    latest: "a.published_at DESC, a.id DESC",
    popular: "a.views DESC, a.published_at DESC",
    featured: "a.is_featured DESC, a.published_at DESC, a.id DESC",
  };

  // Chỉ sử dụng các câu ORDER BY được cho phép
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
    INNER JOIN categories AS c
      ON c.id = a.category_id
    INNER JOIN users AS u
      ON u.id = a.author_id
    WHERE a.category_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [
    categoryId,
    limit,
    offset,
  ]);

  return rows.map(mapArticleCard);
}
// Tìm tag theo slug
export async function findTagBySlug(slug) {
  const sql = `
    SELECT id, name, slug
    FROM tags
    WHERE slug = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [slug]);

  return rows[0] ?? null;
}

// Đếm số bài viết đã xuất bản có tag này
export async function countTagArticles(tagId) {
  const sql = `
    SELECT COUNT(DISTINCT a.id) AS total
    FROM articles AS a
    INNER JOIN article_tags AS at
      ON at.article_id = a.id
    INNER JOIN categories AS c
      ON c.id = a.category_id
    WHERE at.tag_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
  `;

  const [rows] = await pool.execute(sql, [tagId]);

  return Number(rows[0].total);
}

// Lấy bài viết theo tag
export async function findTagArticles({
  tagId,
  limit,
  offset,
  sort,
}) {
  const sortOptions = {
    latest: "a.published_at DESC, a.id DESC",
    popular: "a.views DESC, a.published_at DESC",
    featured: "a.is_featured DESC, a.published_at DESC, a.id DESC",
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
    INNER JOIN article_tags AS at
      ON at.article_id = a.id
    INNER JOIN categories AS c
      ON c.id = a.category_id
    INNER JOIN users AS u
      ON u.id = a.author_id
    WHERE at.tag_id = ?
      AND a.status = 'PUBLISHED'
      AND a.deleted_at IS NULL
      AND c.status = 'ACTIVE'
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [
    tagId,
    limit,
    offset,
  ]);

  return rows.map(mapArticleCard);
}