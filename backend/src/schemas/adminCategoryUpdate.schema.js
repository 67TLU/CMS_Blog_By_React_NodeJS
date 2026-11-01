import { z } from "zod";

export const adminCategoryUpdateSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int()
      .positive("ID danh mục không hợp lệ."),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Tên danh mục không được để trống.")
        .max(100, "Tên danh mục không được vượt quá 100 ký tự.")
        .optional(),

      slug: z
        .string()
        .trim()
        .min(1, "Slug không được để trống.")
        .max(120, "Slug không được vượt quá 120 ký tự.")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug chỉ được chứa chữ thường không dấu, số và dấu gạch ngang."
        )
        .optional(),

      parentId: z
        .union([
          z.coerce.number().int().positive(),
          z.null(),
        ])
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Mô tả không được vượt quá 500 ký tự.")
        .nullable()
        .optional(),

      position: z.coerce
        .number()
        .int("Vị trí phải là số nguyên.")
        .optional(),

      status: z
        .enum(["ACTIVE", "HIDDEN"])
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "Bạn phải cung cấp ít nhất một trường cần cập nhật.",
      }
    ),
};