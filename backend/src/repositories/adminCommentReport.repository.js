import { pool } from "../config/database.js";

export async function countCommentReports({ status }) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM comment_reports AS cr
  `;

  const params = [];

  if (status) {
    sql += " WHERE cr.status = ?";
    params.push(status);
  }

  const [rows] = await pool.execute(sql, params);

  return Number(rows[0].total);
}

export async function findCommentReports({
  status,
  limit,
  offset,
}) {
  let sql = `
    SELECT
      cr.id,
      cr.comment_id AS commentId,
      c.content AS commentContent,
      cr.reporter_id AS reporterId,
      u.name AS reporter,
      cr.reason,
      cr.note,
      cr.status,
      cr.created_at AS createdAt
    FROM comment_reports AS cr
    INNER JOIN comments AS c
      ON c.id = cr.comment_id
    INNER JOIN users AS u
      ON u.id = cr.reporter_id
  `;

  const params = [];

  if (status) {
    sql += " WHERE cr.status = ?";
    params.push(status);
  }

  sql += `
    ORDER BY cr.created_at DESC, cr.id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [rows] = await pool.execute(sql, params);

  return rows.map((row) => ({
    id: row.id,
    comment: {
      id: row.commentId,
      content: row.commentContent,
    },
    reporter: row.reporter,
    reason: row.reason,
    note: row.note,
    status: row.status,
    createdAt: row.createdAt,
  }));
}
export async function handleCommentReport({
  reportId,
  handlerId,
  status,
  action,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Khóa báo cáo để tránh xử lý đồng thời.
    const [reports] = await connection.execute(
      `SELECT id, comment_id AS commentId, status
       FROM comment_reports
       WHERE id = ?
       FOR UPDATE`,
      [reportId]
    );

    const report = reports[0];

    if (!report) {
      await connection.rollback();
      return { error: "NOT_FOUND" };
    }

    if (report.status !== "PENDING") {
      await connection.rollback();
      return { error: "ALREADY_HANDLED" };
    }

    // Chỉ thay đổi bình luận khi chấp nhận báo cáo.
    if (status === "RESOLVED" && action !== "NONE") {
      const commentStatus =
        action === "HIDE_COMMENT" ? "HIDDEN" : "DELETED";

      const [result] = await connection.execute(
        `UPDATE comments
         SET status = ?
         WHERE id = ? AND status = 'VISIBLE'`,
        [commentStatus, report.commentId]
      );

      // Bình luận có thể đã bị xóa hoặc ẩn trước đó.
      if (result.affectedRows === 0) {
        const [comments] = await connection.execute(
          `SELECT id, status
           FROM comments
           WHERE id = ?`,
          [report.commentId]
        );

        if (!comments.length) {
          await connection.rollback();
          return { error: "COMMENT_NOT_FOUND" };
        }

        if (comments[0].status !== commentStatus) {
          await connection.rollback();
          return { error: "COMMENT_NOT_VISIBLE" };
        }
      }
    }

    await connection.execute(
      `UPDATE comment_reports
       SET status = ?,
           handled_by = ?,
           handled_at = NOW(),
           action_taken = ?
       WHERE id = ?`,
      [status, handlerId, action, reportId]
    );

    await connection.commit();

    return {
      id: reportId,
      commentId: report.commentId,
      status,
      action,
      handledBy: handlerId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}