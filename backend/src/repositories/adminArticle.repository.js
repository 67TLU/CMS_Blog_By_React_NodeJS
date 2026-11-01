import { pool } from "../config/database.js";

export async function countAdminArticles({ status, q }) {
  const conditions = [
    "a.deleted_at IS NULL",
    "a.status = ?",
  ];

  const params = [status];

  if (q) {
    conditions.push(
      "(a.title LIKE ? OR u.name LIKE ? OR c.name LIKE ?)"
    );

    const keyword = `%${q}%`;

    params.push(keyword, keyword, keyword);
  }

  const sql = `
    SELECT COUNT(*) AS total
    FROM articles a
    INNER JOIN users u ON u.id = a.author_id
    INNER JOIN categories c ON c.id = a.category_id
    WHERE ${conditions.join(" AND ")}
  `;

  const [rows] = await pool.execute(sql, params);

  return Number(rows[0].total);
}

export async function findAdminArticles({
  status,
  q,
  limit,
  offset,
}) {
  const conditions = [
    "a.deleted_at IS NULL",
    "a.status = ?",
  ];

  const params = [status];

  if (q) {
    conditions.push(
      "(a.title LIKE ? OR u.name LIKE ? OR c.name LIKE ?)"
    );

    const keyword = `%${q}%`;

    params.push(keyword, keyword, keyword);
  }

  const sql = `
    SELECT
      a.id,
      a.title,
      a.status,
      a.cover_image AS coverImage,
      a.created_at AS submittedAt,
      c.name AS category,
      u.name AS author
    FROM articles a
    INNER JOIN users u ON u.id = a.author_id
    INNER JOIN categories c ON c.id = a.category_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.created_at DESC, a.id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [rows] = await pool.execute(sql, params);

  return rows;
}
export async function findAdminArticlePreviewById(id) {
  const sql = `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.content,
      a.cover_image AS coverImage,

      a.category_id AS categoryId,
      c.name AS category,

      a.author_id AS authorId,
      u.name AS author,
      u.avatar_url AS authorAvatar,
      u.bio AS authorBio,
      u.expertise AS authorExpertise,

      a.status,
      a.is_featured AS isFeatured,
      a.reject_reason AS rejectReason,
      a.reading_time AS readingTime,
      a.views,
      a.likes_count AS likesCount,
      a.comments_count AS commentsCount,

      a.published_at AS publishedAt,
      a.scheduled_at AS scheduledAt,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt

    FROM articles a

    INNER JOIN users u
      ON u.id = a.author_id

    INNER JOIN categories c
      ON c.id = a.category_id

    WHERE a.id = ?
      AND a.deleted_at IS NULL

    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [id]);

  return rows[0] ?? null;
}
export async function approveAdminArticle(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Khóa bản ghi để tránh hai yêu cầu duyệt cùng lúc.
    const [rows] = await connection.execute(
      `
        SELECT id, status
        FROM articles
        WHERE id = ?
          AND deleted_at IS NULL
        FOR UPDATE
      `,
      [id]
    );

    const article = rows[0];

    if (!article) {
      await connection.rollback();
      return { error: "NOT_FOUND" };
    }

    if (article.status !== "PENDING") {
      await connection.rollback();
      return {
        error: "INVALID_STATUS",
        currentStatus: article.status,
      };
    }

    await connection.execute(
      `
        UPDATE articles
        SET
          status = 'PUBLISHED',
          published_at = NOW(),
          reject_reason = NULL
        WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    return {
      id: article.id,
      previousStatus: "PENDING",
      status: "PUBLISHED",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function rejectAdminArticle({ id, reason }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT id, status
        FROM articles
        WHERE id = ?
          AND deleted_at IS NULL
        FOR UPDATE
      `,
      [id]
    );

    const article = rows[0];

    if (!article) {
      await connection.rollback();
      return { error: "NOT_FOUND" };
    }

    if (article.status !== "PENDING") {
      await connection.rollback();

      return {
        error: "INVALID_STATUS",
        currentStatus: article.status,
      };
    }

    await connection.execute(
      `
        UPDATE articles
        SET
          status = 'REJECTED',
          reject_reason = ?
        WHERE id = ?
      `,
      [reason, id]
    );

    await connection.commit();

    return {
      id: article.id,
      previousStatus: "PENDING",
      status: "REJECTED",
      rejectReason: reason,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function unpublishAdminArticle(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT id, status
        FROM articles
        WHERE id = ?
          AND deleted_at IS NULL
        FOR UPDATE
      `,
      [id]
    );

    const article = rows[0];

    if (!article) {
      await connection.rollback();
      return { error: "NOT_FOUND" };
    }

    if (article.status !== "PUBLISHED") {
      await connection.rollback();

      return {
        error: "INVALID_STATUS",
        currentStatus: article.status,
      };
    }

    await connection.execute(
      `
        UPDATE articles
        SET status = 'UNPUBLISHED'
        WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    return {
      id: article.id,
      previousStatus: "PUBLISHED",
      status: "UNPUBLISHED",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function toggleAdminArticleFeature(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT id, status, is_featured AS isFeatured
        FROM articles
        WHERE id = ?
          AND deleted_at IS NULL
        FOR UPDATE
      `,
      [id]
    );

    const article = rows[0];

    if (!article) {
      await connection.rollback();
      return { error: "NOT_FOUND" };
    }

    if (article.status !== "PUBLISHED") {
      await connection.rollback();

      return {
        error: "INVALID_STATUS",
        currentStatus: article.status,
      };
    }

    const newIsFeatured = article.isFeatured ? 0 : 1;

    await connection.execute(
      `
        UPDATE articles
        SET is_featured = ?
        WHERE id = ?
      `,
      [newIsFeatured, id]
    );

    await connection.commit();

    return {
      id: article.id,
      status: article.status,
      isFeatured: Boolean(newIsFeatured),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}