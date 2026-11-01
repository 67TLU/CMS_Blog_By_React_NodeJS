import "dotenv/config";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createHash,
  randomBytes,
} from "node:crypto";

import { ApiError } from "../utils/ApiError.js";
import {
  findUserByEmail,
  findUserById,
  findRoleIdByCode,
  findPermissionsByRoleId,
  createUser,
  isRegistrationEnabled,
  createRefreshToken,
  consumeRefreshTokenByHash,
  revokeRefreshTokenByHash,
} from "../repositories/user.repository.js";
function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRefreshExpirationDate() {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  const match = expiresIn.match(/^(\d+)(m|h|d)$/);

  if (!match) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN must use a format such as 15m, 12h, or 7d.",
    );
  }

  const amount = Number(match[1]);

  const unitToMilliseconds = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(
    Date.now() + amount * unitToMilliseconds[match[2]],
  );
}

function hashRefreshToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function createAccessToken(user) {
  const secret = getRequiredEnv("JWT_ACCESS_SECRET");

  return jwt.sign(
    {
      role: user.role,
    },
    secret,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      algorithm: "HS256",
    },
  );
}

async function issueTokens(user) {
  // Refresh token là chuỗi ngẫu nhiên, không phải JWT.
  const refreshToken = `rt_${randomBytes(48).toString("base64url")}`;

  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshExpirationDate();

  const accessToken = createAccessToken(user);

  await createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
  };
}

function toPublicUser(user, permissions = []) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar_url ?? null,
    bio: user.bio ?? null,
    expertise: user.expertise ?? null,
    permissions,
  };
}

export async function registerUser({
  name,
  email,
  password,
}) {
  const registrationEnabled = await isRegistrationEnabled();

  if (!registrationEnabled) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Hiện tại hệ thống không cho phép đăng ký.",
    );
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(
      409,
      "CONFLICT",
      "Email đã được sử dụng.",
    );
  }

  const roleId = await findRoleIdByCode("SUBSCRIBER");

  if (!roleId) {
    throw new Error(
      "Role SUBSCRIBER does not exist in the database.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let userId;

  try {
    userId = await createUser({
      name,
      email,
      passwordHash,
      roleId,
    });
  } catch (error) {
    // Xử lý trường hợp hai yêu cầu đăng ký cùng email đến gần như
    // đồng thời và cùng vượt qua bước kiểm tra email ở trên.
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(
        409,
        "CONFLICT",
        "Email đã được sử dụng.",
      );
    }

    throw error;
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new Error("Could not retrieve the newly created user.");
  }

  const permissions = await findPermissionsByRoleId(user.role_id);
  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user, permissions),
    ...tokens,
  };
}

export async function loginUser({
  email,
  password,
}) {
  const user = await findUserByEmail(email);

  // Dùng cùng một lỗi cho email không tồn tại và mật khẩu sai.
  if (!user || !user.password_hash) {
    throw new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "Email hoặc mật khẩu không chính xác.",
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!passwordMatches) {
    throw new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "Email hoặc mật khẩu không chính xác.",
    );
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(
      403,
      "ACCOUNT_BLOCKED",
      "Tài khoản đã bị khóa.",
    );
  }

  const permissions = await findPermissionsByRoleId(user.role_id);

  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user, permissions),
    ...tokens,
  };
}
export async function refreshUserSession(refreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.startsWith("rt_")
  ) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Refresh token không hợp lệ hoặc đã hết hạn.",
    );
  }

  const tokenHash = hashRefreshToken(refreshToken);

  // Thu hồi token cũ ngay trong transaction.
  // Token đã sử dụng hoặc đã hết hạn sẽ không được chấp nhận.
  const consumedToken = await consumeRefreshTokenByHash(tokenHash);

  if (!consumedToken) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Refresh token không hợp lệ hoặc đã hết hạn.",
    );
  }

  const user = await findUserById(consumedToken.userId);

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Phiên đăng nhập không còn hợp lệ.",
    );
  }

  const permissions = await findPermissionsByRoleId(user.role_id);
  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user, permissions),
    ...tokens,
  };
}

export async function logoutUser(refreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.startsWith("rt_")
  ) {
    // Logout vẫn thành công về mặt giao diện nếu cookie đã mất.
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await revokeRefreshTokenByHash(tokenHash);
}