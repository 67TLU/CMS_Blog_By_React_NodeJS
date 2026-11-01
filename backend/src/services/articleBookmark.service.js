import {
  bookmarkArticle,
  unbookmarkArticle,
} from "../repositories/articleBookmark.repository.js";

export async function bookmarkArticleService({
  articleId,
  userId,
}) {
  return bookmarkArticle({ articleId, userId });
}

export async function unbookmarkArticleService({
  articleId,
  userId,
}) {
  return unbookmarkArticle({ articleId, userId });
}