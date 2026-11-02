import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { api, setAccessToken, getAccessToken, refreshAccessToken } from "@/lib/api";

const AuthContext = createContext(null);

const normalizeRole = (role) => String(role || "SUBSCRIBER").toLowerCase();
const normalizeUser = (user) =>
  user ? { ...user, role: normalizeRole(user.role), avatar: user.avatar || user.avatarUrl || null } : null;

export function AuthProvider({ children }) {
  // Không lưu user vào sessionStorage — bootstrap từ refresh-token cookie (HttpOnly).
  // Token truy cập (access token) chỉ tồn tại trong bộ nhớ JavaScript.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const acceptSession = useCallback((result) => {
    if (result?.accessToken) setAccessToken(result.accessToken);
    const nextUser = normalizeUser(result?.user);
    if (nextUser) setUser(nextUser);
    return nextUser;
  }, []);

  // Bootstrap: kiểm tra access token hiện có hoặc làm mới từ refresh-token cookie
  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        // OAuth callback truyền token qua URL fragment ngắn hạn
        if (window.location.hash.includes("oauth=success")) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const token = params.get("accessToken");
          if (token) setAccessToken(token);
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }

        // 1. Nếu đã có accessToken trong memory (chưa tắt tab), lấy user
        if (getAccessToken()) {
          try {
            const result = await api.get("/auth/me");
            if (active) setUser(normalizeUser(result?.data));
            return;
          } catch {
            /* Access token có thể hết hạn 15m, tiếp tục refresh bên dưới */
          }
        }

        // 2. Dùng singleton refreshAccessToken() — tránh race condition F5 / gọi song song
        const token = await refreshAccessToken();
        if (token) {
          const me = await api.get("/auth/me");
          if (active) setUser(normalizeUser(me?.data));
        }
      } catch {
        if (active) {
          setAccessToken("");
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await api.post("/auth/login", credentials, { retryAuth: false });
    return acceptSession(result?.data);
  }, [acceptSession]);

  const register = useCallback(async ({ username, name, email, password }) => {
    const result = await api.post(
      "/auth/register",
      { name: name || username, email, password },
      { retryAuth: false },
    );
    return acceptSession(result?.data);
  }, [acceptSession]);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout", {}); } catch { /* đăng xuất local vẫn thành công */ }
    setAccessToken("");
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) =>
    setUser((previous) => {
      if (!previous) return previous;
      return normalizeUser({ ...previous, ...patch });
    }),
  []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, role: user?.role || "guest", loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
