import {
  countAdminArticles,
  findAdminArticles,
  findAdminArticlePreviewById,
  approveAdminArticle,
  rejectAdminArticle,
  unpublishAdminArticle,
  toggleAdminArticleFeature
} from "../repositories/adminArticle.repository.js";
import { ApiError } from "../utils/ApiError.js";
export async function getAdminArticlesService({
  status,
  q,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    findAdminArticles({
      status,
      q,
      limit,
      offset,
    }),

    countAdminArticles({
      status,
      q,
    }),
  ]);

  return {
    items,

    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
export async function getAdminArticlePreviewService(id) {
  const article = await findAdminArticlePreviewById(id);

  if (!article) {
    throw new ApiError(
      404,
      "ARTICLE_NOT_FOUND",
      "Không tìm thấy bài viết."
    );
  }

  return article;
}
export async function approveAdminArticleService(id) {
  const result = await approveAdminArticle(id);

  if (result?.error === "NOT_FOUND") {
    throw new ApiError(
      404,
      "ARTICLE_NOT_FOUND",
      "Không tìm thấy bài viết."
    );
  }

  if (result?.error === "INVALID_STATUS") {
    throw new ApiError(
      409,
      "ARTICLE_INVALID_STATUS",
      `Không thể duyệt bài viết có trạng thái ${result.currentStatus}. Chỉ bài viết PENDING mới được duyệt.`
    );
  }

  return result;
}
export async function rejectAdminArticleService({ id, reason }) {
  const result = await rejectAdminArticle({ id, reason });

  if (result?.error === "NOT_FOUND") {
    throw new ApiError(
      404,
      "ARTICLE_NOT_FOUND",
      "Không tìm thấy bài viết."
    );
  }

  if (result?.error === "INVALID_STATUS") {
    throw new ApiError(
      409,
      "ARTICLE_INVALID_STATUS",
      `Không thể từ chối bài viết có trạng thái ${result.currentStatus}. Chỉ bài viết PENDING mới được từ chối.`
    );
  }

  return result;
}
export async function unpublishAdminArticleService(id) {
  const result = await unpublishAdminArticle(id);

  if (result?.error === "NOT_FOUND") {
    throw new ApiError(
      404,
      "ARTICLE_NOT_FOUND",
      "Không tìm thấy bài viết."
    );
  }

  if (result?.error === "INVALID_STATUS") {
    throw new ApiError(
      409,
      "ARTICLE_INVALID_STATUS",
      `Không thể gỡ bài viết có trạng thái ${result.currentStatus}. Chỉ bài viết PUBLISHED mới được gỡ.`
    );
  }

  return result;
}
export async function toggleAdminArticleFeatureService(id) {
  const result = await toggleAdminArticleFeature(id);

  if (result?.error === "NOT_FOUND") {
    throw new ApiError(
      404,
      "ARTICLE_NOT_FOUND",
      "Không tìm thấy bài viết."
    );
  }

  if (result?.error === "INVALID_STATUS") {
    throw new ApiError(
      409,
      "ARTICLE_INVALID_STATUS",
      `Không thể thay đổi trạng thái nổi bật của bài viết có trạng thái ${result.currentStatus}. Chỉ bài viết PUBLISHED mới được thao tác.`
    );
  }

  return result;
}