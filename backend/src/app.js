import authorRouter from "./routes/author.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import bookmarkRouter from "./routes/bookmark.routes.js";
import authRouter from "./routes/auth.routes.js";
import articleRouter from "./routes/article.routes.js";
import commentRouter from "./routes/comment.routes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import adminRouter from "./routes/admin.routes.js";
import usersRouter from "./routes/users.routes.js";
import mediaRouter from "./routes/media.routes.js";
import systemRouter from "./routes/system.routes.js";
import adminResourcesRouter from "./routes/adminResources.routes.js";
import authorStudioRouter from "./routes/authorStudio.routes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { maintenanceMode } from "./middlewares/systemGuards.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ── Bảo mật tiêu chuẩn cao ───────────────────────────────────────────────────
app.disable("x-powered-by"); // Ẩn chữ ký Express chống scan fingerprint

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Cho phép frontend load ảnh uploads
    contentSecurityPolicy: false, // Để Vite dev server & inline styles/images không bị chặn
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:4000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use(cookieParser());

// ── Rate Limiting (Cấu hình cao, bảo vệ vững chắc cho Production) ──────────────
// Toàn bộ API chung: 15 phút tối đa 1500 request (thoải mái cho SPA, SSE và F5 liên tục)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 1500 : 5000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Bạn đang gửi quá nhiều yêu cầu cùng lúc. Vui lòng thử lại sau ít phút.",
    },
  },
});

// Riêng các thao tác nhạy cảm (Login, Register): 15 phút tối đa 60 lần (chống Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 60 : 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Quá nhiều lần thử đăng nhập/đăng ký. Vui lòng chờ 15 phút trước khi thử lại.",
    },
  },
});

// Áp dụng Rate Limiting
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Chế độ bảo trì hệ thống
app.use("/api", maintenanceMode);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.status(200).json({ success: true, data: { status: "ok", service: "portal-news-backend" } }),
);
app.get("/api", (_req, res) =>
  res.status(200).json({ success: true, data: { name: "Portal News API", version: "1.0.0" } }),
);

// ── Static uploads ────────────────────────────────────────────────────────────
const currentDir = path.dirname(fileURLToPath(import.meta.url));
app.use(
  "/Uploads",
  express.static(path.join(currentDir, "uploads"), { fallthrough: false, maxAge: "7d" }),
);

// ── Auth & Core routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/articles", articleRouter);
app.use("/api/authors", authorRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/users", usersRouter);
app.use("/api/media", mediaRouter);
app.use("/api/author", authorStudioRouter);
app.use("/api", systemRouter);
app.use("/api/comments", commentRouter);

// ── Admin routes ──────────────────────────────────────────────────────────────
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminResourcesRouter);

// ── Error handlers (phải để cuối cùng) ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;