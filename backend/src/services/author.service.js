import {
  findPublicAuthorById,
  countAuthorPublishedArticles,
  findAuthorPublishedArticles,
} from "../repositories/author.repository.js";

import { ApiError } from "../utils/ApiError.js";

export async function getPublicAuthor(id) {
  const author = await findPublicAuthorById(id);

  if (!author) {
    throw new ApiError(
      404,
      "AUTHOR_NOT_FOUND",
      "Không tìm thấy tác giả."
    );
  }

  return author;
}

export async function getAuthorArticles({
  id,
  page,
  limit,
  sort,
}) {
  const author = await findPublicAuthorById(id);

  if (!author) {
    throw new ApiError(
      404,
      "AUTHOR_NOT_FOUND",
      "Không tìm thấy tác giả."
    );
  }

  const offset = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    findAuthorPublishedArticles({
      authorId: id,
      limit,
      offset,
      sort,
    }),

    countAuthorPublishedArticles(id),
  ]);

  return {
    author,
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}