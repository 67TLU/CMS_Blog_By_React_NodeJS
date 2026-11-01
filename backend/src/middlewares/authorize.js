import { ApiError } from "../utils/ApiError.js";

/**
 * Yêu cầu người dùng có TẤT CẢ các quyền được truyền vào.
 *
 * Ví dụ:
 * requirePermissions("ARTICLE_CREATE")
 *
 * requirePermissions("ARTICLE_CREATE", "ARTICLE_APPROVE")
 */
export function requirePermissions(...requiredPermissions) {
  if (
    requiredPermissions.length === 0 ||
    requiredPermissions.some(
      (permission) =>
        typeof permission !== "string" || permission.trim() === "",
    )
  ) {
    throw new Error(
      "requirePermissions requires at least one valid permission key.",
    );
  }

  return function authorizePermissions(req, res, next) {
    // authenticate phải chạy trước authorize.
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "UNAUTHENTICATED",
          "Vui lòng đăng nhập để tiếp tục.",
        ),
      );
    }

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

    // Mặc định phải có đủ tất cả quyền được yêu cầu.
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền thực hiện hành động này.",
        ),
      );
    }

    return next();
  };
}

/**
 * Yêu cầu người dùng có ÍT NHẤT MỘT trong các quyền.
 *
 * Ví dụ:
 * requireAnyPermission("ARTICLE_EDIT_OWN", "ARTICLE_EDIT_ALL")
 */
export function requireAnyPermission(...requiredPermissions) {
  if (
    requiredPermissions.length === 0 ||
    requiredPermissions.some(
      (permission) =>
        typeof permission !== "string" || permission.trim() === "",
    )
  ) {
    throw new Error(
      "requireAnyPermission requires at least one valid permission key.",
    );
  }

  return function authorizeAnyPermission(req, res, next) {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "UNAUTHENTICATED",
          "Vui lòng đăng nhập để tiếp tục.",
        ),
      );
    }

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền thực hiện hành động này.",
        ),
      );
    }

    return next();
  };
}

/**
 * Yêu cầu người dùng thuộc một trong các vai trò.
 *
 * Ví dụ:
 * requireRole("ADMIN")
 * requireRole("ADMIN", "EDITOR")
 */
export function requireRole(...allowedRoles) {
  if (
    allowedRoles.length === 0 ||
    allowedRoles.some(
      (role) => typeof role !== "string" || role.trim() === "",
    )
  ) {
    throw new Error(
      "requireRole requires at least one valid role.",
    );
  }

  const normalizedRoles = allowedRoles.map((role) =>
    role.toUpperCase(),
  );

  return function authorizeRole(req, res, next) {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "UNAUTHENTICATED",
          "Vui lòng đăng nhập để tiếp tục.",
        ),
      );
    }

    const userRole =
      typeof req.user.role === "string"
        ? req.user.role.toUpperCase()
        : "";

    if (!normalizedRoles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Vai trò của bạn không được phép truy cập chức năng này.",
        ),
      );
    }

    return next();
  };
}