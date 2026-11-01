import { ApiError } from "../utils/ApiError.js";

import {
  countPublishedArticles,
  findPublishedArticles,
  findBreakingArticle,
  findFeaturedArticles,
  findTopStories,
  findLatestHomeArticles,
  findActiveCategories,
  countSearchArticles,
  findPopularArticles,
  findSearchArticles,
  findTagsByArticleId,
  findPublishedArticleByIdOrSlug,
  findRelatedArticles,
    findActiveCategoryBySlug,
  countCategoryArticles,
  findCategoryArticles,
  findTagBySlug,
countTagArticles,
findTagArticles,
} from "../repositories/article.repository.js";
export async function getPublishedArticles({ page, limit }) {
  const offset = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    findPublishedArticles({ limit, offset }),
    countPublishedArticles(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}
export async function getArticleDetail(idOrSlug) {
  const article = await findPublishedArticleByIdOrSlug(idOrSlug);
  if (!article) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Không tìm thấy bài viết.",
    );
  }

  const [tags, related, popular] = await Promise.all([
    findTagsByArticleId(article.id),

    findRelatedArticles({
      articleId: article.id,
      categoryId: article.categoryId,
      limit: 3,
    }),

    findPopularArticles({
      excludeArticleId: article.id,
      limit: 4,
    }),
  ]);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,

    category: {
      id: article.categoryId,
      name: article.categoryName,
      slug: article.categorySlug,
    },

    author: {
      id: article.authorId,
      name: article.authorName,
      avatar: article.authorAvatar,
      bio: article.authorBio,
      expertise: article.authorExpertise,
    },

    tags: tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
    })),

    views: article.views,
    likesCount: article.likesCount,
    commentsCount: article.commentsCount,
    readingTime: article.readingTime,
    publishedAt: article.publishedAt,
    isFeatured: Boolean(article.isFeatured),

    // Sẽ tích hợp trạng thái tương tác và quyền chỉnh sửa sau.
    isLiked: false,
    isBookmarked: false,
    isFollowingAuthor: false,
    canEdit: false,

    related,
    popular,
  };
}
export async function getHomePageData() {
  const [
    breaking,
    featured,
    topStories,
    latest,
    categories,
    latestTotal,
  ] = await Promise.all([
    findBreakingArticle(),
    findFeaturedArticles(),
    findTopStories(4),
    findLatestHomeArticles(8),
    findActiveCategories(),
    countPublishedArticles(),
  ]);

  return {
    breaking,
    featured,
    topStories,
    latest,
    categories,
    meta: {
      latestTotal,
    },
  };
}
export async function searchArticles({
  q,
  category,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    findSearchArticles({
      q,
      category,
      limit,
      offset,
    }),

    countSearchArticles({
      q,
      category,
    }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
export async function getArticlesByCategory({
  slug,
  page,
  limit,
  sort,
}) {
  // 1. Kiểm tra chuyên mục
  const category = await findActiveCategoryBySlug(slug);

  if (!category) {
    throw new ApiError(
      404,
      "CATEGORY_NOT_FOUND",
      "Không tìm thấy chuyên mục.",
    );
  }

  // 2. Tính vị trí bắt đầu lấy dữ liệu
  const offset = (page - 1) * limit;

  // 3. Lấy danh sách và tổng số bài viết
  const [items, totalItems] = await Promise.all([
    findCategoryArticles({
      categoryId: category.id,
      limit,
      offset,
      sort,
    }),

    countCategoryArticles(category.id),
  ]);

  // 4. Trả kết quả
  return {
    category,
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
export async function getArticlesByTag({
  slug,
  page,
  limit,
  sort,
}) {
  // 1. Tìm tag
  const tag = await findTagBySlug(slug);

  if (!tag) {
    throw new ApiError(
      404,
      "TAG_NOT_FOUND",
      "Không tìm thấy tag.",
    );
  }

  // 2. Tính vị trí bắt đầu
  const offset = (page - 1) * limit;

  // 3. Lấy bài viết và tổng số bài viết
  const [items, totalItems] = await Promise.all([
    findTagArticles({
      tagId: tag.id,
      limit,
      offset,
      sort,
    }),

    countTagArticles(tag.id),
  ]);

  // 4. Trả kết quả
  return {
    tag,
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}