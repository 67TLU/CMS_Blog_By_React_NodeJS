import { z } from "zod";

export const adminArticlesSchema = {
  query: z.object({
    status: z
      .enum([
        "DRAFT",
        "PENDING",
        "PUBLISHED",
        "REJECTED",
        "SCHEDULED",
        "UNPUBLISHED",
      ])
      .default("PENDING"),

    q: z.string().trim().max(100).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
};