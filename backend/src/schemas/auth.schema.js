import { z } from "zod";

export const registerSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Tên phải có ít nhất 2 ký tự.")
      .max(100, "Tên không được vượt quá 100 ký tự."),

    email: z
      .string()
      .trim()
      .email("Email không hợp lệ.")
      .max(190, "Email quá dài.")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
      .max(72, "Mật khẩu không được vượt quá 72 ký tự."),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Email không hợp lệ.")
      .max(190, "Email quá dài.")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu.")
      .max(72, "Mật khẩu không được vượt quá 72 ký tự."),
  }),
};