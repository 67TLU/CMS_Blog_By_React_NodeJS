import {
  likeArticleService,
  unlikeArticleService,
} from "../services/articleLike.service.js";

import { sendSuccess } from "../utils/response.js";

export async function likeArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await likeArticleService({
    articleId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}

export async function unlikeArticleController(req, res) {
  const { id } = req.validated.params;

  const result = await unlikeArticleService({
    articleId: id,
    userId: req.user.id,
  });

  return sendSuccess(res, result);
}