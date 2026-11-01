import { z } from "zod";

export const commentUpdateSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bình luận phải là số nguyên.")
      .positive("ID bình luận phải lớn hơn 0."),
  }),

  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Nội dung bình luận không được để trống.")
      .max(2000, "Nội dung bình luận không được vượt quá 2000 ký tự."),
  }),
};