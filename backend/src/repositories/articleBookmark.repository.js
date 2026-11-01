import { pool } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

async function changeBookmark({ articleId, userId, action }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Kiểm tra bài viết có tồn tại và đang được công khai không
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

    let isBookmarked = false;

    if (action === "bookmark") {
      // INSERT IGNORE tránh lưu trùng bài viết
      await connection.execute(
        `
          INSERT IGNORE INTO bookmarks (user_id, article_id)
          VALUES (?, ?)
        `,
        [userId, articleId]
      );

      isBookmarked = true;
    } else {
      await connection.execute(
        `
          DELETE FROM bookmarks
          WHERE user_id = ?
            AND article_id = ?
        `,
        [userId, articleId]
      );

      isBookmarked = false;
    }

    await connection.commit();

    return {
      articleId,
      isBookmarked,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function bookmarkArticle({ articleId, userId }) {
  return changeBookmark({
    articleId,
    userId,
    action: "bookmark",
  });
}

export async function unbookmarkArticle({ articleId, userId }) {
  return changeBookmark({
    articleId,
    userId,
    action: "unbookmark",
  });
}