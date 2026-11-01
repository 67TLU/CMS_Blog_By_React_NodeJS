import { assetUrl } from "@/lib/api";
const dateText = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
};
export function toCardArticle(item = {}) {
  const category = typeof item.category === "object" ? item.category : null;
  const author = typeof item.author === "object" ? item.author : null;
  const cover = item.coverImage || item.cover_image || item.image || item.imageUrl;
  return {
    ...item,
    id: item.id,
    slug: item.slug,
    title: item.title || "Chưa có tiêu đề",
    excerpt: item.excerpt || "",
    image: assetUrl(cover) ,
    coverImage: assetUrl(cover),
    category: category?.name || item.categoryName || item.category || "Tin tức",
    categorySlug: category?.slug || item.categorySlug || "tin-tuc",
    author: author?.name || item.authorName || item.author || "Ban biên tập",
    authorId: author?.id || item.authorId,
    authorAvatar: assetUrl(author?.avatar || item.authorAvatar),
    publishedAt: dateText(item.publishedAt || item.published_at || item.createdAt),
    readingTime: typeof item.readingTime === "number" ? `${item.readingTime} phút đọc` : item.readingTime,
    views: Number(item.views || 0),
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => typeof tag === "string" ? tag : tag.name) : [],
  };
}
export function toDetailArticle(item = {}) {
  const card = toCardArticle(item);
  const author = typeof item.author === "object" ? item.author : {};
  return { ...card, content: item.content || "", categoryId: item.category?.id || item.categoryId, authorBio: author.bio, likesCount: item.likesCount || 0, commentsCount: item.commentsCount || 0, isLiked: !!item.isLiked, isBookmarked: !!item.isBookmarked, related: (item.related || []).map(toCardArticle), popular: (item.popular || []).map(toCardArticle) };
}
