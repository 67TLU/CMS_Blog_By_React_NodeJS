import { z } from "zod";

export const adminCategoryDeleteSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int()
      .positive("ID danh mục không hợp lệ."),
  }),
};