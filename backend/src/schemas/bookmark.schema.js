import { z } from "zod";

export const userBookmarksSchema = {
  query: z.object({
    page: z.coerce
      .number()
      .int("page phải là số nguyên.")
      .min(1, "page phải lớn hơn hoặc bằng 1.")
      .default(1),

    limit: z.coerce
      .number()
      .int("limit phải là số nguyên.")
      .min(1, "limit phải lớn hơn hoặc bằng 1.")
      .max(50, "limit không được vượt quá 50.")
      .default(10),
  }),
};