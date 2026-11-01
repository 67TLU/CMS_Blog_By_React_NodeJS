import {
  getPublicAuthor,
  getAuthorArticles,
} from "../services/author.service.js";

import { sendSuccess, sendPaginated } from "../utils/response.js";

export async function getPublicAuthorController(req, res) {
  const { id } = req.validated.params;

  const author = await getPublicAuthor(id);

  return sendSuccess(res, author);
}

export async function getAuthorArticlesController(req, res) {
  const { id } = req.validated.params;
  const { page, limit, sort } = req.validated.query;

  const result = await getAuthorArticles({
    id,
    page,
    limit,
    sort,
  });

  return sendPaginated(
    res,
    {
      author: result.author,
      items: result.items,
    },
    result.meta
  );
}