import { addClient, removeClient } from "../utils/sse.manager.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { notifications, total } = await getNotifications(userId, page, limit);

    return res.json({
      success: true,
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);

    return res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ok = await markAsRead(Number(id), userId);

    if (!ok) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.json({
      success: true,
      data: { marked: true },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const ok = await markAllAsRead(userId);

    return res.json({
      success: true,
      data: { markedAll: ok },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export function connectSSE(req, res) {
  const userId = req.user.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders?.();

  // Giữ lại client kết nối SSE
  addClient(userId.toString(), res);

  res.write('event: connected\n');
  res.write('data: {"message":"Connected"}\n\n');

  req.on('close', () => {
    removeClient(userId, res);
  });
}