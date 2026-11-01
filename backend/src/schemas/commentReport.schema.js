import { z } from "zod";

export const commentReportSchema = {
  params: z.object({
    id: z.coerce
      .number()
      .int("ID bình luận phải là số nguyên.")
      .positive("ID bình luận phải lớn hơn 0."),
  }),

  body: z
    .object({
      reason: z.enum([
        "SPAM",
        "HATE_SPEECH",
        "FAKE_NEWS",
        "OTHER",
      ]),
      note: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.reason === "OTHER" && !data.note) {
        ctx.addIssue({
          code: "custom",
          path: ["note"],
          message: "Vui lòng nhập ghi chú khi chọn lý do OTHER.",
        });
      }
    }),
};