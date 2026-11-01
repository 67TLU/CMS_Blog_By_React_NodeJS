import { z } from "zod";

export const createCommentSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bài viết phải là số nguyên.")
      .positive("ID bài viết phải lớn hơn 0."),
  }),

  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(1, "Nội dung bình luận không được để trống.")
        .max(2000, "Nội dung bình luận không được vượt quá 2000 ký tự."),

      parentId: z.coerce
        .number()
        .int()
        .positive()
        .optional(),

      replyToId: z.coerce
        .number()
        .int()
        .positive()
        .optional(),
    })
    .refine(
      (data) => data.parentId !== undefined || data.replyToId === undefined,
      {
        message: "replyToId yêu cầu phải có parentId.",
        path: ["replyToId"],
      }
    ),
};