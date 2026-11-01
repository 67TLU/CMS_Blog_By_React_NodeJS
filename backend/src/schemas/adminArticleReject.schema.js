import { z } from "zod";

export const adminArticleRejectSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bài viết phải là số nguyên.")
      .positive("ID bài viết phải lớn hơn 0."),
  }),

  body: z.object({
    reason: z
      .string()
      .trim()
      .min(5, "Lý do từ chối phải có ít nhất 5 ký tự.")
      .max(500, "Lý do từ chối không được vượt quá 500 ký tự."),
  }),
};