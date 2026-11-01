import { pool } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

async function changeArticleLike({ articleId, userId, action }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Chỉ cho phép Like bài viết đã xuất bản và chưa bị xóa.
    // Khóa dòng bài viết để tránh hai yêu cầu đồng thời làm lệch bộ đếm.
    const [articles] = await connection.execute(
      `
        SELECT a.id
        FROM articles AS a
        INNER JOIN categories AS c ON c.id = a.category_id
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

    let isLiked = false;

    if (action === "like") {
      // Khóa chính (article_id, user_id) ngăn Like trùng.
      const [result] = await connection.execute(
        `
          INSERT IGNORE INTO article_likes (article_id, user_id)
          VALUES (?, ?)
        `,
        [articleId, userId]
      );

      // Chỉ tăng bộ đếm nếu thực sự tạo được lượt Like mới.
      if (result.affectedRows === 1) {
        await connection.execute(
          `
            UPDATE articles
            SET likes_count = likes_count + 1
            WHERE id = ?
          `,
          [articleId]
        );
      }

      isLiked = true;
    } else {
      const [result] = await connection.execute(
        `
          DELETE FROM article_likes
          WHERE article_id = ?
            AND user_id = ?
        `,
        [articleId, userId]
      );

      // Chỉ giảm bộ đếm nếu thực sự xóa được lượt Like.
      if (result.affectedRows === 1) {
        await connection.execute(
          `
            UPDATE articles
            SET likes_count = GREATEST(likes_count - 1, 0)
            WHERE id = ?
          `,
          [articleId]
        );
      }

      isLiked = false;
    }

    const [rows] = await connection.execute(
      `
        SELECT likes_count AS likesCount
        FROM articles
        WHERE id = ?
      `,
      [articleId]
    );

    await connection.commit();

    return {
      articleId,
      isLiked,
      likesCount: rows[0].likesCount,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function likeArticle({ articleId, userId }) {
  return changeArticleLike({
    articleId,
    userId,
    action: "like",
  });
}

export async function unlikeArticle({ articleId, userId }) {
  return changeArticleLike({
    articleId,
    userId,
    action: "unlike",
  });
}