import { z } from "zod";

export const authorIdSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID tác giả phải là số nguyên.")
      .positive("ID tác giả phải lớn hơn 0."),
  }),
};

export const authorArticlesSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID tác giả phải là số nguyên.")
      .positive("ID tác giả phải lớn hơn 0."),
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

    sort: z.enum(["latest", "popular"]).default("latest"),
  }),
};