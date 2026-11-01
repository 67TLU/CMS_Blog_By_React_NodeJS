import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { api, setAccessToken, getAccessToken } from "@/lib/api";
const AuthContext = createContext(null);
const normalizeRole = (role) => String(role || "SUBSCRIBER").toLowerCase();
const normalizeUser = (user) => user ? { ...user, role: normalizeRole(user.role), avatar: user.avatar || user.avatarUrl || null } : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const saved = sessionStorage.getItem("auth-user"); return saved ? normalizeUser(JSON.parse(saved)) : null; }
    catch { sessionStorage.removeItem("auth-user"); return null; }
  });
  const [loading, setLoading] = useState(true);

  const acceptSession = useCallback((result) => {
    if (result?.accessToken) setAccessToken(result.accessToken);
    const nextUser = normalizeUser(result?.user);
    if (nextUser) { setUser(nextUser); sessionStorage.setItem("auth-user", JSON.stringify(nextUser)); }
    return nextUser;
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        // OAuth callback transfers the short-lived access token in the URL fragment.
        if (window.location.hash.includes("oauth=success")) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const token = params.get("accessToken");
          if (token) setAccessToken(token);
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
        if (getAccessToken()) {
          try {
            const result = await api.get("/auth/me");
            if (active) { const next = normalizeUser(result?.data); setUser(next); if (next) sessionStorage.setItem("auth-user", JSON.stringify(next)); }
            return;
          } catch { /* attempt cookie refresh below */ }
        }
        const refreshed = await api.post("/auth/refresh", undefined, { retryAuth: false });
        if (refreshed?.data?.accessToken) {
          setAccessToken(refreshed.data.accessToken);
          const me = await api.get("/auth/me");
          if (active) { const next = normalizeUser(me?.data); setUser(next); if (next) sessionStorage.setItem("auth-user", JSON.stringify(next)); }
        }
      } catch {
        if (active) { setAccessToken(""); setUser(null); sessionStorage.removeItem("auth-user"); }
      } finally { if (active) setLoading(false); }
    };
    bootstrap();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await api.post("/auth/login", credentials, { retryAuth: false });
    return acceptSession(result?.data);
  }, [acceptSession]);
  const register = useCallback(async ({ username, name, email, password }) => {
    const result = await api.post("/auth/register", { name: name || username, email, password }, { retryAuth: false });
    return acceptSession(result?.data);
  }, [acceptSession]);
  const logout = useCallback(async () => {
    try { await api.post("/auth/logout", {}); } catch { /* local logout still succeeds */ }
    setAccessToken(""); setUser(null); sessionStorage.removeItem("auth-user");
  }, []);
  const updateUser = useCallback((patch) => setUser((previous) => {
    if (!previous) return previous;
    const next = normalizeUser({ ...previous, ...patch });
    sessionStorage.setItem("auth-user", JSON.stringify(next));
    return next;
  }), []);
  const value = useMemo(() => ({ user, isAuthenticated: !!user, role: user?.role || "guest", loading, login, register, logout, updateUser }), [user, loading, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
