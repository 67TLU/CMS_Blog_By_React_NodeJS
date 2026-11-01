import { pool } from "../config/database.js";
import { sendToUser } from "../utils/sse.manager.js";

export async function getNotifications(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, skip]
  );
  const [total] = await pool.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ?`,
    [userId]
  );
  return { notifications: notifications, total: total[0].count };
}

export async function getUnreadCount(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  return rows[0].count;
}

export async function markAsRead(notificationId, userId) {
  const [result] = await pool.query(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

export async function markAllAsRead(userId) {
  const [result] = await pool.query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  return result.affectedRows > 0;
}

export async function createNotification({ user_id, type, title, body, link }) {
  console.log("Creating notification:", { user_id, type, title, body, link });
  const VALID_TYPES = new Set(["SYSTEM", "LIKE", "COMMENT"]);
  console.log("Valid types:", VALID_TYPES);
  if (!VALID_TYPES.has(type)) {
    throw new Error("Invalid notification type");
  }
  if (!user_id || !title) {
    throw new Error("user_id and title are required");
  }

  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link, is_read) VALUES (?, ?, ?, ?, ?, 0)`,
    [user_id, type, title, body, link]
  );
  const notificationId = result.insertId;

  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE id = ?`,
    [notificationId]
  );

  // Send SSE event
  sendToUser(user_id.toString(), "new_notification", rows[0]);

  return rows[0];
}