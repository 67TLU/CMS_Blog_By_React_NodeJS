import { z } from "zod";

export const adminArticleApproveSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bài viết phải là số nguyên.")
      .positive("ID bài viết phải lớn hơn 0."),
  }),
};