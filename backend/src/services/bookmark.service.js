import {
  countUserBookmarks,
  findUserBookmarks,
} from "../repositories/bookmark.repository.js";

export async function getUserBookmarks({
  userId,
  page,
  limit,
}) {
  const total = await countUserBookmarks(userId);

  const offset = (page - 1) * limit;

  const articles = await findUserBookmarks({
    userId,
    limit,
    offset,
  });

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}