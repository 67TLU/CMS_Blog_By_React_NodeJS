import { Router } from "express";

import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authenticate } from "../middlewares/authenticate.js";

import {
  registerSchema,
  loginSchema,
} from "../schemas/auth.schema.js";

import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword, googleAuthStart, googleAuthCallback } from "../controllers/extended.controller.js";
import { registrationEnabled } from "../middlewares/systemGuards.js";

const router = Router();

router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

// Đăng ký
router.post(
  "/register",
  asyncHandler(registrationEnabled),
  validate(registerSchema),
  asyncHandler(register),
);

// Đăng nhập
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login),
);

// Làm mới access token
router.post(
  "/refresh",
  asyncHandler(refresh),
);

// Đăng xuất
router.post(
  "/logout",
  asyncHandler(logout),
);

// Lấy thông tin người dùng hiện tại
// Bắt buộc xác thực JWT trước khi gọi controller.
router.get(
  "/me",
  asyncHandler(authenticate),
  asyncHandler(getCurrentUser),
);

export default router;