import {
  getPublishedArticles,
  getArticleDetail,
  getHomePageData,
  searchArticles,
  getArticlesByTag,
  getArticlesByCategory
} from "../services/article.service.js";
import {
  sendSuccess,
  sendPaginated,
} from "../utils/response.js";
export async function getArticles(req, res) {
  const { page, limit } = req.validated.query;

  const result = await getPublishedArticles({
    page,
    limit,
  });

  return sendPaginated(res, {
    items: result.items,
  }, result.meta);
}
export async function getArticleDetailByIdOrSlug(req, res) {
  const { idOrSlug } = req.validated.params;

  const article = await getArticleDetail(idOrSlug);

  return sendSuccess(res, article);
}
export async function getHomePage(req, res) {
  const result = await getHomePageData();

  return sendSuccess(res, {
    breaking: result.breaking,
    featured: result.featured,
    topStories: result.topStories,
    latest: result.latest,
    categories: result.categories,
  }, {
    meta: result.meta,
  });
}
export async function searchArticlesController(req, res) {
  const { q, category, page, limit } = req.validated.query;

  const result = await searchArticles({
    q,
    category,
    page,
    limit,
  });

  return sendPaginated(
    res,
    {
      items: result.items,
    },
    result.meta,
  );
}
export async function getArticlesByCategoryController(req, res) {
  const { slug } = req.validated.params;
  const { page, limit, sort } = req.validated.query;

  const result = await getArticlesByCategory({
    slug,
    page,
    limit,
    sort,
  });

  return sendPaginated(
    res,
    {
      category: result.category,
      items: result.items,
    },
    result.meta,
  );
}
export async function getArticlesByTagController(req, res) {
  const { slug } = req.validated.params;
  const { page, limit, sort } = req.validated.query;

  const result = await getArticlesByTag({
    slug,
    page,
    limit,
    sort,
  });

  return sendPaginated(
    res,
    {
      tag: result.tag,
      items: result.items,
    },
    result.meta,
  );
}