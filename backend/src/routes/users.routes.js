import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { authenticate } from "../middlewares/authenticate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as c from "../controllers/extended.controller.js";
import { ApiError } from "../utils/ApiError.js";
import { connectSSE } from "../controllers/notification.controller.js";

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(process.cwd(), "src", "uploads")),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`,
    ),
});
const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ["image/jpeg", "image/png"].includes(file.mimetype)
      ? cb(null, true)
      : cb(
          new ApiError(
            400,
            "INVALID_FILE_TYPE",
            "Avatar chỉ nhận JPG hoặc PNG.",
          ),
        ),
});
router.use(authenticate);
router.get("/me", asyncHandler(c.getMyProfile));
router.patch("/me", asyncHandler(c.updateMyProfile));
router.patch(
  "/me/avatar",
  (req, res, next) =>
    avatarUpload.single("avatar")(req, res, (e) => (e ? next(e) : next())),
  asyncHandler(c.updateMyAvatar),
);
router.get("/me/bookmarks", asyncHandler(c.getMyBookmarks));
router.get("/me/history", asyncHandler(c.getMyHistory));
router.delete("/me/history", asyncHandler(c.clearMyHistory));
router.delete("/me/history/:articleId", asyncHandler(c.deleteHistoryItem));
router.get("/me/notifications", asyncHandler(c.getMyNotifications));
router.patch(
  "/me/notifications/read-all",
  asyncHandler(c.markAllNotificationsRead),
);
router.patch(
  "/me/notifications/:id/read",
  asyncHandler(c.markNotificationRead),
);
router.get("/me/notifications/sse",connectSSE);
router.post("/me/follows/:authorId", asyncHandler(c.followAuthor));
router.delete("/me/follows/:authorId", asyncHandler(c.unfollowAuthor));
export default router;
