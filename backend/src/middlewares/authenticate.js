import "dotenv/config";

import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";

import {
  findUserById,
  findPermissionsByRoleId,
} from "../repositories/user.repository.js";

export async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || (`Bearer ${req.query.token}`);
  // 1. Kiểm tra Authorization header
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Vui lòng đăng nhập để tiếp tục.",
    );
  }

  // 2. Lấy access token
  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Access token không được cung cấp.",
    );
  }

  // 3. Xác minh JWT
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing environment variable: JWT_ACCESS_SECRET");
  }

  let payload;

  try {
    payload = jwt.verify(accessToken, secret, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      throw new ApiError(
        401,
        "UNAUTHENTICATED",
        "Access token không hợp lệ hoặc đã hết hạn.",
      );
    }

    throw error;
  }

  // 4. Kiểm tra payload và user ID
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub)
  ) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Thông tin access token không hợp lệ.",
    );
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId)) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Thông tin người dùng trong token không hợp lệ.",
    );
  }

  // 5. Lấy thông tin người dùng mới nhất từ database
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Tài khoản không còn tồn tại.",
    );
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(
      403,
      "ACCOUNT_BLOCKED",
      "Tài khoản đã bị khóa.",
    );
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Tài khoản không ở trạng thái hoạt động.",
    );
  }

  // 6. Lấy quyền hiện tại từ database
  const permissions = await findPermissionsByRoleId(user.role_id);

  // 7. Gắn thông tin người dùng vào request
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar_url ?? null,
    bio: user.bio ?? null,
    expertise: user.expertise ?? null,
    permissions,
  };

  // 8. Chuyển sang middleware/controller tiếp theo
  next();
}