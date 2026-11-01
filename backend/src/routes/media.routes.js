import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { authenticate } from "../middlewares/authenticate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireRole } from "../middlewares/authorize.js";
import { ApiError } from "../utils/ApiError.js";
import * as c from "../controllers/extended.controller.js";
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
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.mimetype)
      ? cb(null, true)
      : cb(
          new ApiError(
            400,
            "INVALID_FILE_TYPE",
            "Chỉ nhận JPG, PNG, WEBP hoặc DOCX.",
          ),
        ),
});
router.use(authenticate);
router.get("/", asyncHandler(c.listMedia));
router.post(
  "/",
  (req, res, next) =>
    upload.single("file")(req, res, (e) => (e ? next(e) : next())),
  asyncHandler(c.uploadMedia),
);
router.delete("/:id", asyncHandler(c.deleteMedia));
export default router;
