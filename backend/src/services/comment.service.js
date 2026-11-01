import {
  createComment,
    countRootComments,
  findRootComments,
  findRepliesByRootIds,
    findCommentById,
  updateCommentContent,
    deleteCommentById,
    changeCommentLike,
    createCommentReport
} from "../repositories/comment.repository.js";
import { ApiError } from "../utils/ApiError.js";
export async function getArticleComments({
  articleId,
  page,
  limit,
  sort,
}) {
  // Kiểm tra bài viết có tồn tại và đang được công khai
  const { pool } = await import("../config/database.js");

  const [articles] = await pool.execute(
    `
      SELECT a.id
      FROM articles AS a
      INNER JOIN categories AS c
        ON c.id = a.category_id
      WHERE a.id = ?
        AND a.status = 'PUBLISHED'
        AND a.deleted_at IS NULL
        AND c.status = 'ACTIVE'
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

  const total = await countRootComments(articleId);
  const offset = (page - 1) * limit;

  const items = await findRootComments({
    articleId,
    limit,
    offset,
    sort,
  });

  const rootIds = items.map((comment) => comment.id);

  const replies = await findRepliesByRootIds({
    articleId,
    rootIds,
    sort,
  });

  const repliesByParent = new Map();

  for (const reply of replies) {
    const parentId = String(reply.parentId);

    if (!repliesByParent.has(parentId)) {
      repliesByParent.set(parentId, []);
    }

    repliesByParent.get(parentId).push(reply);
  }

  for (const comment of items) {
    comment.replies =
      repliesByParent.get(String(comment.id)) ?? [];
  }

  return {
    total,
    items,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
export async function createCommentService({
  articleId,
  userId,
  content,
  parentId,
  replyToId,
}) {
  return createComment({
    articleId,
    userId,
    content,
    parentId,
    replyToId,
  });
}
export async function updateCommentService({
  commentId,
  userId,
  content,
}) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.status !== "VISIBLE") {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Không tìm thấy bình luận."
    );
  }

  if (String(comment.user_id) !== String(userId)) {
    throw new ApiError(
      403,
      "COMMENT_UPDATE_FORBIDDEN",
      "Bạn không có quyền chỉnh sửa bình luận này."
    );
  }

  return updateCommentContent(commentId, content);
}
export async function deleteCommentService({ commentId, userId, role }) {
  const comment = await findCommentById(commentId);

  if (!comment) {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Không tìm thấy bình luận."
    );
  }

  const isOwner = String(comment.user_id) === String(userId);
  const canDeleteOthers = ["ADMIN", "EDITOR"].includes(role);

  if (!isOwner && !canDeleteOthers) {
    throw new ApiError(
      403,
      "COMMENT_DELETE_FORBIDDEN",
      "Bạn không có quyền xóa bình luận này."
    );
  }

  await deleteCommentById(commentId);

  return {
    message: "Đã xóa bình luận",
  };
}
export async function likeCommentService({ commentId, userId }) {
  const result = await changeCommentLike({
    commentId,
    userId,
    liked: true,
  });

  if (!result) {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Không tìm thấy bình luận."
    );
  }

  return result;
}

export async function unlikeCommentService({ commentId, userId }) {
  const result = await changeCommentLike({
    commentId,
    userId,
    liked: false,
  });

  if (!result) {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Không tìm thấy bình luận."
    );
  }

  return result;
}
export async function createCommentReportService({
  commentId,
  reporterId,
  reason,
  note,
}) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.status !== "VISIBLE") {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Không tìm thấy bình luận."
    );
  }

  try {
    return await createCommentReport({
      commentId,
      reporterId,
      reason,
      note,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(
        409,
        "COMMENT_ALREADY_REPORTED",
        "Bạn đã báo cáo bình luận này rồi."
      );
    }

    throw error;
  }
}