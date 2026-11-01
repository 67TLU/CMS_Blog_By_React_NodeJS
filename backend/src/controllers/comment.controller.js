import {
  createCommentService,
  getArticleComments,
  updateCommentService,
  deleteCommentService,
    likeCommentService,
  unlikeCommentService,
  createCommentReportService 
} from "../services/comment.service.js";

import {
  sendCreated,
  sendSuccess
} from "../utils/response.js";

export async function createCommentController(req, res) {
  const { id } = req.validated.params;
  const {
    content,
    parentId,
    replyToId,
  } = req.validated.body;

  const comment = await createCommentService({
    articleId: id,
    userId: req.user.id,
    content,
    parentId,
    replyToId,
  });

  return sendCreated(res, comment);
}
export async function getArticleCommentsController(req, res) {
  const { id } = req.validated.params;
  const { page, limit, sort } = req.validated.query;

  const result = await getArticleComments({
    articleId: id,
    page,
    limit,
    sort,
  });

  return sendSuccess(
    res,
    {
      total: result.total,
      items: result.items,
    },
    {
      meta: result.pagination,
    }
  );
}
export async function updateCommentController(req, res) {
  const { id } = req.validated.params;
  const { content } = req.validated.body;

  const comment = await updateCommentService({
    commentId: id,
    userId: req.user.id,
    content,
  });

  return sendSuccess(res, comment);
}
export async function deleteCommentController(req, res) {
  const { id } = req.validated.params;

  const result = await deleteCommentService({
    commentId: id,
    userId: req.user.id,
    role: req.user.role,
  });

  return sendSuccess(res, result);
}
export async function likeCommentController(req, res) {
  const { id } = req.validated.params;

  const result = await likeCommentService({
    commentId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}

export async function unlikeCommentController(req, res) {
  const { id } = req.validated.params;

  const result = await unlikeCommentService({
    commentId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}
export async function createCommentReportController(req, res) {
  const { id } = req.validated.params;
  const { reason, note } = req.validated.body;

  const report = await createCommentReportService({
    commentId: id,
    reporterId: req.user.id,
    reason,
    note,
  });

  return sendCreated(res, report);
}