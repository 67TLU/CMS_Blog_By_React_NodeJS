import { z } from "zod";

export const adminCategoryCreateSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Tên danh mục không được để trống.")
      .max(100, "Tên danh mục không được vượt quá 100 ký tự."),

    slug: z
      .string()
      .trim()
      .min(1, "Slug không được để trống.")
      .max(120, "Slug không được vượt quá 120 ký tự.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug chỉ được chứa chữ thường không dấu, số và dấu gạch ngang."
      ),

    parentId: z
      .union([
        z.coerce.number().int().positive(),
        z.null(),
      ])
      .optional()
      .default(null),

    description: z
      .string()
      .trim()
      .max(500, "Mô tả không được vượt quá 500 ký tự.")
      .nullable()
      .optional()
      .transform((value) => value || null),

    position: z.coerce
      .number()
      .int("Vị trí phải là số nguyên.")
      .default(0),

    status: z
      .enum(["ACTIVE", "HIDDEN"])
      .default("ACTIVE"),
  }),
};