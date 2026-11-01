import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from "../services/auth.service.js";

import {
  sendSuccess,
  sendCreated,
} from "../utils/response.js";

function getRefreshCookieOptions() {
  const sameSite = (
    process.env.COOKIE_SAME_SITE || "lax"
  ).toLowerCase();

  const secure = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
  };
}

function getRefreshCookieMaxAge() {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = expiresIn.match(/^(\d+)(m|h|d)$/);

  if (!match) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN must use a format such as 15m, 12h or 7d.",
    );
  }

  const unitToMilliseconds = {
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return Number(match[1]) * unitToMilliseconds[match[2]];
}

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: getRefreshCookieMaxAge(),
  });
}

// POST /api/auth/register
export async function register(req, res) {
  const result = await registerUser(req.validated.body);

  setRefreshCookie(res, result.refreshToken);

  const { refreshToken, ...data } = result;

  return sendCreated(res, data);
}

// POST /api/auth/login
export async function login(req, res) {
  const result = await loginUser(req.validated.body);

  setRefreshCookie(res, result.refreshToken);

  const { refreshToken, ...data } = result;

  return sendSuccess(res, data);
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  const result = await refreshUserSession(refreshToken);

  setRefreshCookie(res, result.refreshToken);

  const { refreshToken: newRefreshToken, ...data } = result;

  return sendSuccess(res, data);
}

// POST /api/auth/logout
export async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  await logoutUser(refreshToken);

  res.clearCookie("refreshToken", getRefreshCookieOptions());

  return sendSuccess(res, {
    message: "Đã đăng xuất.",
  });
}

// GET /api/auth/me
export async function getCurrentUser(req, res) {
  return sendSuccess(res, req.user);
}