import { getAdminArticlesService,getAdminArticlePreviewService,approveAdminArticleService,rejectAdminArticleService,unpublishAdminArticleService,toggleAdminArticleFeatureService } from "../services/adminArticle.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

export async function getAdminArticlesController(req, res) {
  const { status, q, page, limit } = req.validated.query;

  const result = await getAdminArticlesService({
    status,
    q,
    page,
    limit,
  });

  return sendPaginated(
    res,
    { items: result.items },
    result.pagination
  );
}
export async function getAdminArticlePreviewController(req, res) {
  const { id } = req.validated.params;

  const article = await getAdminArticlePreviewService(id);

  return sendSuccess(res, { article });
}
export async function approveAdminArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await approveAdminArticleService(id);

  return sendSuccess(res, {
    message: "Duyệt bài viết thành công.",
    article: result,
  });
}
export async function rejectAdminArticleController(req, res) {
  const { id } = req.validated.params;
  const { reason } = req.validated.body;

  const result = await rejectAdminArticleService({
    id,
    reason,
  });

  return sendSuccess(res, {
    message: "Từ chối bài viết thành công.",
    article: result,
  });
}
export async function unpublishAdminArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await unpublishAdminArticleService(id);

  return sendSuccess(res, {
    message: "Gỡ bài viết khỏi trạng thái xuất bản thành công.",
    article: result,
  });
}
export async function toggleAdminArticleFeatureController(req, res) {
  const { id } = req.validated.params;

  const result = await toggleAdminArticleFeatureService(id);

  return sendSuccess(res, {
    message: result.isFeatured
      ? "Đã bật trạng thái bài viết nổi bật."
      : "Đã tắt trạng thái bài viết nổi bật.",
    article: result,
  });
}