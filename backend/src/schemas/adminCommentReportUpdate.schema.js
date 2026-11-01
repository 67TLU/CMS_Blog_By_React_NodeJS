import { z } from "zod";

export const adminCommentReportUpdateSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID báo cáo phải là số nguyên.")
      .positive("ID báo cáo phải lớn hơn 0."),
  }),

  body: z
    .object({
      status: z.enum(["RESOLVED", "REJECTED"]),

      action: z.enum([
        "HIDE_COMMENT",
        "DELETE_COMMENT",
        "NONE",
      ]),
    })
    .superRefine((data, ctx) => {
      if (data.status === "REJECTED" && data.action !== "NONE") {
        ctx.addIssue({
          code: "custom",
          path: ["action"],
          message: "Báo cáo bị từ chối phải sử dụng action NONE.",
        });
      }
    }),
};