import { z } from "zod";

export const commentDeleteSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bình luận phải là số nguyên.")
      .positive("ID bình luận phải lớn hơn 0."),
  }),
};