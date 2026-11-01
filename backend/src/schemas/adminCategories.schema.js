import { z } from "zod";

const parentIdSchema = z
  .string()
  .transform((value, ctx) => {
    if (value === "null") {
      return null;
    }

    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "parentId phải là số nguyên dương hoặc null.",
      });

      return z.NEVER;
    }

    return id;
  })
  .optional();

export const adminCategoriesSchema = {
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    q: z
      .string()
      .trim()
      .max(100, "Từ khóa tìm kiếm tối đa 100 ký tự.")
      .optional(),

    status: z
      .enum(["ACTIVE", "HIDDEN"])
      .optional(),

    parentId: parentIdSchema,
  }),
};