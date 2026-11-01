import {
  likeArticle,
  unlikeArticle,
} from "../repositories/articleLike.repository.js";

export async function likeArticleService({ articleId, userId }) {
  return likeArticle({ articleId, userId });
}

export async function unlikeArticleService({ articleId, userId }) {
  return unlikeArticle({ articleId, userId });
}