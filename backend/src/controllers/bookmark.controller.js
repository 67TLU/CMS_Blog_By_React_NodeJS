import { getUserBookmarks } from "../services/bookmark.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getUserBookmarksController(req, res) {
  const { page, limit } = req.validated.query;

  const result = await getUserBookmarks({
    userId: req.user.id,
    page,
    limit,
  });

  return sendSuccess(res, result.articles, {
    meta: result.pagination,
  });
}