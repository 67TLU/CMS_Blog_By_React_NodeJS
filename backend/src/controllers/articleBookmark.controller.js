import {
  bookmarkArticleService,
  unbookmarkArticleService,
} from "../services/articleBookmark.service.js";

import { sendSuccess } from "../utils/response.js";

export async function bookmarkArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await bookmarkArticleService({
    articleId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}

export async function unbookmarkArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await unbookmarkArticleService({
    articleId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}