import { z } from "zod";

export const commentListSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bài viết phải là số nguyên.")
      .positive("ID bài viết phải lớn hơn 0."),
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),

    sort: z.enum(["newest", "most_liked"]).default("newest"),
  }),
};