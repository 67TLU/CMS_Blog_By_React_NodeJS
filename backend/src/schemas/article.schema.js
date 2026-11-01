import { z } from "zod";

export const articleListSchema = {
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Trang phải lớn hơn hoặc bằng 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Số bài viết mỗi trang phải lớn hơn 0.")
      .max(50, "Mỗi trang không được vượt quá 50 bài viết.")
      .default(8),
  }),
};
export const articleDetailSchema = {
  params: z.object({
    idOrSlug: z
      .string()
      .trim()
      .min(1, "ID hoặc slug bài viết không được để trống.")
      .max(191, "ID hoặc slug bài viết quá dài."),
  }),
};
export const articleSearchSchema = {
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập từ khóa tìm kiếm.")
      .max(100, "Từ khóa không được vượt quá 100 ký tự."),

    category: z
      .string()
      .trim()
      .min(1, "Tên chuyên mục không được để trống.")
      .max(100, "Tên chuyên mục quá dài.")
      .optional(),

    page: z.coerce
      .number()
      .int()
      .min(1, "Trang phải lớn hơn hoặc bằng 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Số bài viết mỗi trang phải lớn hơn 0.")
      .max(50, "Mỗi trang không được vượt quá 50 bài viết.")
      .default(10),
  }),
};
export const articleCategorySchema = {
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, "Slug chuyên mục không được để trống.")
      .max(120, "Slug chuyên mục quá dài."),
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Trang phải lớn hơn hoặc bằng 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Số bài viết mỗi trang phải lớn hơn 0.")
      .max(50, "Mỗi trang không được vượt quá 50 bài viết.")
      .default(10),

    sort: z
      .enum(["latest", "popular", "featured"])
      .default("latest"),
  }),
};
export const articleTagSchema = {
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, "Slug tag không được để trống.")
      .max(120, "Slug tag quá dài."),
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Trang phải lớn hơn hoặc bằng 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Số bài viết mỗi trang phải lớn hơn 0.")
      .max(50, "Mỗi trang không được vượt quá 50 bài viết.")
      .default(10),

    sort: z
      .enum(["latest", "popular", "featured"])
      .default("latest"),
  }),
};