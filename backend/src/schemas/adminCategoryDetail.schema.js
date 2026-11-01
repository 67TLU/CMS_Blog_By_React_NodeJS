import { z } from "zod";

export const adminCategoryDetailSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID danh mục phải là số nguyên.")
      .positive("ID danh mục phải lớn hơn 0."),
  }),
};