import { pool } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

export async function createComment({
  articleId,
  userId,
  content,
  parentId = null,
  replyToId = null,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra bài viết có thể nhận bình luận
    const [articles] = await connection.execute(
      `
        SELECT a.id
        FROM articles AS a
        INNER JOIN categories AS c
          ON c.id = a.category_id
        WHERE a.id = ?
          AND a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
          AND c.status = 'ACTIVE'
        FOR UPDATE
      `,
      [articleId]
    );

    if (articles.length === 0) {
      throw new ApiError(
        404,
        "ARTICLE_NOT_FOUND",
        "Không tìm thấy bài viết."
      );
    }

    // 2. Nếu là trả lời, kiểm tra bình luận gốc
    if (parentId !== null) {
      const [parents] = await connection.execute(
        `
          SELECT id
          FROM comments
          WHERE id = ?
            AND article_id = ?
            AND parent_id IS NULL
            AND status = 'VISIBLE'
        `,
        [parentId, articleId]
      );

      if (parents.length === 0) {
        throw new ApiError(
          404,
          "PARENT_COMMENT_NOT_FOUND",
          "Không tìm thấy bình luận gốc."
        );
      }
    }

    // 3. Nếu có replyToId, kiểm tra bình luận được trả lời
    if (replyToId !== null) {
      const [targets] = await connection.execute(
        `
          SELECT id, parent_id
          FROM comments
          WHERE id = ?
            AND article_id = ?
            AND status = 'VISIBLE'
        `,
        [replyToId, articleId]
      );

      if (targets.length === 0) {
        throw new ApiError(
          404,
          "REPLY_TARGET_NOT_FOUND",
          "Không tìm thấy bình luận cần trả lời."
        );
      }

      const target = targets[0];

      // Chỉ được trả lời bình luận gốc
      // hoặc trả lời một phản hồi thuộc đúng bình luận gốc đó
      if (
        Number(target.id) !== parentId &&
        Number(target.parent_id) !== parentId
      ) {
        throw new ApiError(
          400,
          "INVALID_REPLY_TARGET",
          "Bình luận được trả lời không thuộc nhóm bình luận này."
        );
      }
    }

    // 4. Tạo bình luận
    const [result] = await connection.execute(
      `
        INSERT INTO comments (
          article_id,
          user_id,
          parent_id,
          reply_to_id,
          content
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        articleId,
        userId,
        parentId,
        replyToId,
        content,
      ]
    );

    const commentId = result.insertId;

    // 5. Lấy bình luận vừa tạo kèm thông tin tác giả
    const [rows] = await connection.execute(
      `
        SELECT
          c.id,
          c.article_id AS articleId,
          c.parent_id AS parentId,
          c.reply_to_id AS replyToId,
          c.content,
          c.status,
          c.likes_count AS likesCount,
          c.is_edited AS isEdited,
          c.created_at AS createdAt,
          u.id AS authorId,
          u.name AS authorName,
          u.avatar_url AS authorAvatar,
          r.code AS authorRole
        FROM comments AS c
        INNER JOIN users AS u
          ON u.id = c.user_id
        INNER JOIN roles AS r
          ON r.id = u.role_id
        WHERE c.id = ?
      `,
      [commentId]
    );

    const row = rows[0];

    // 6. Lấy thông tin bình luận được trả lời, nếu có
    let replyTo = null;

    if (row.replyToId !== null) {
      const [replyRows] = await connection.execute(
        `
          SELECT
            c.id,
            u.name AS authorName
          FROM comments AS c
          INNER JOIN users AS u
            ON u.id = c.user_id
          WHERE c.id = ?
        `,
        [row.replyToId]
      );

      if (replyRows.length > 0) {
        replyTo = {
          id: replyRows[0].id,
          authorName: replyRows[0].authorName,
        };
      }
    }

    await connection.commit();

    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      isEdited: Boolean(row.isEdited),
      likesCount: row.likesCount,
      isLiked: false,
      status: row.status,

      author: {
        id: row.authorId,
        name: row.authorName,
        avatar: row.authorAvatar,
        role: row.authorRole,
      },

      ...(row.parentId === null ? { replies: [] } : {}),
      ...(replyTo ? { replyTo } : {}),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function countRootComments(articleId) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM comments
      WHERE article_id = ?
        AND parent_id IS NULL
        AND status = 'VISIBLE'
    `,
    [articleId]
  );

  return Number(rows[0].total);
}

export async function findRootComments({
  articleId,
  limit,
  offset,
  sort,
}) {
  // sort chỉ nhận giá trị từ schema đã kiểm tra
  const orderBy =
    sort === "most_liked"
      ? "c.likes_count DESC, c.created_at DESC, c.id DESC"
      : "c.created_at DESC, c.id DESC";

  const [rows] = await pool.execute(
    `
      SELECT
        c.id,
        c.content,
        c.status,
        c.likes_count AS likesCount,
        c.is_edited AS isEdited,
        c.created_at AS createdAt,
        u.id AS authorId,
        u.name AS authorName,
        u.avatar_url AS authorAvatar,
        r.code AS authorRole
      FROM comments AS c
      INNER JOIN users AS u
        ON u.id = c.user_id
      INNER JOIN roles AS r
        ON r.id = u.role_id
      WHERE c.article_id = ?
        AND c.parent_id IS NULL
        AND c.status = 'VISIBLE'
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [articleId, limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    isEdited: Boolean(row.isEdited),
    likesCount: Number(row.likesCount),
    isLiked: false,
    status: row.status,

    author: {
      id: row.authorId,
      name: row.authorName,
      avatar: row.authorAvatar,
      role: row.authorRole,
    },

    replies: [],
  }));
}

export async function findRepliesByRootIds({
  articleId,
  rootIds,
  sort,
}) {
  if (rootIds.length === 0) {
    return [];
  }

  const placeholders = rootIds.map(() => "?").join(", ");

  const orderBy =
    sort === "most_liked"
      ? "c.likes_count DESC, c.created_at DESC, c.id DESC"
      : "c.created_at DESC, c.id DESC";

  const [rows] = await pool.execute(
    `
      SELECT
        c.id,
        c.parent_id AS parentId,
        c.reply_to_id AS replyToId,
        c.content,
        c.status,
        c.likes_count AS likesCount,
        c.is_edited AS isEdited,
        c.created_at AS createdAt,

        u.id AS authorId,
        u.name AS authorName,
        u.avatar_url AS authorAvatar,
        r.code AS authorRole,

        replyUser.name AS replyToAuthorName

      FROM comments AS c

      INNER JOIN users AS u
        ON u.id = c.user_id

      INNER JOIN roles AS r
        ON r.id = u.role_id

      LEFT JOIN comments AS replyComment
        ON replyComment.id = c.reply_to_id

      LEFT JOIN users AS replyUser
        ON replyUser.id = replyComment.user_id

      WHERE c.article_id = ?
        AND c.parent_id IN (${placeholders})
        AND c.status = 'VISIBLE'

      ORDER BY ${orderBy}
    `,
    [articleId, ...rootIds]
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    isEdited: Boolean(row.isEdited),
    likesCount: Number(row.likesCount),
    isLiked: false,
    status: row.status,

    author: {
      id: row.authorId,
      name: row.authorName,
      avatar: row.authorAvatar,
      role: row.authorRole,
    },

    ...(row.replyToId !== null
      ? {
          replyTo: {
            id: row.replyToId,
            authorName: row.replyToAuthorName,
          },
        }
      : {}),
  }));
}
export async function findCommentById(commentId) {
  const [rows] = await pool.execute(
    `SELECT id, article_id, user_id, content, status
     FROM comments
     WHERE id = ?
     LIMIT 1`,
    [commentId]
  );

  return rows[0] ?? null;
}

export async function updateCommentContent(commentId, content) {
  await pool.execute(
    `UPDATE comments
     SET content = ?, is_edited = 1
     WHERE id = ?`,
    [content, commentId]
  );

  const [rows] = await pool.execute(
    `SELECT
       c.id,
       c.article_id AS articleId,
       c.user_id AS userId,
       c.content,
       c.is_edited AS isEdited,
       c.updated_at AS updatedAt
     FROM comments AS c
     WHERE c.id = ?
     LIMIT 1`,
    [commentId]
  );

  return rows[0] ?? null;
}
export async function deleteCommentById(commentId) {
  const [result] = await pool.execute(
    `DELETE FROM comments
     WHERE id = ?`,
    [commentId]
  );

  return result.affectedRows > 0;
}
export async function changeCommentLike({ commentId, userId, liked }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Khóa dòng bình luận để tránh cập nhật số lượt thích đồng thời.
    const [comments] = await connection.execute(
      `SELECT id
       FROM comments
       WHERE id = ? AND status = 'VISIBLE'
       FOR UPDATE`,
      [commentId]
    );

    if (comments.length === 0) {
      await connection.rollback();
      return null;
    }

    if (liked) {
      // Khóa chính (comment_id, user_id) ngăn Like trùng.
      const [result] = await connection.execute(
        `INSERT IGNORE INTO comment_likes (comment_id, user_id)
         VALUES (?, ?)`,
        [commentId, userId]
      );

      // Chỉ tăng bộ đếm khi thực sự thêm được lượt Like mới.
      if (result.affectedRows > 0) {
        await connection.execute(
          `UPDATE comments
           SET likes_count = likes_count + 1
           WHERE id = ?`,
          [commentId]
        );
      }
    } else {
      const [result] = await connection.execute(
        `DELETE FROM comment_likes
         WHERE comment_id = ? AND user_id = ?`,
        [commentId, userId]
      );

      // Chỉ giảm bộ đếm khi thực sự xóa được lượt Like.
      if (result.affectedRows > 0) {
        await connection.execute(
          `UPDATE comments
           SET likes_count = GREATEST(likes_count - 1, 0)
           WHERE id = ?`,
          [commentId]
        );
      }
    }

    const [rows] = await connection.execute(
      `SELECT
         c.likes_count AS likesCount,
         EXISTS (
           SELECT 1
           FROM comment_likes AS cl
           WHERE cl.comment_id = c.id
             AND cl.user_id = ?
         ) AS isLiked
       FROM comments AS c
       WHERE c.id = ?`,
      [userId, commentId]
    );

    await connection.commit();

    return {
      likesCount: rows[0].likesCount,
      isLiked: Boolean(rows[0].isLiked),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function createCommentReport({
  commentId,
  reporterId,
  reason,
  note,
}) {
  const [result] = await pool.execute(
    `INSERT INTO comment_reports (
       comment_id,
       reporter_id,
       reason,
       note
     )
     VALUES (?, ?, ?, ?)`,
    [commentId, reporterId, reason, note ?? null]
  );

  return {
    id: result.insertId,
    commentId,
    reporterId,
    reason,
    note: note ?? null,
  };
}