const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "portal-access-token";
let accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || "";
  if (accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
export function getAccessToken() { return accessToken; }

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.data?.accessToken) throw new Error(body?.error?.message || "Phiên đăng nhập đã hết hạn.");
      setAccessToken(body.data.accessToken);
      return body.data.accessToken;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function request(path, options = {}) {
  const { retryAuth = true, ...init } = options;
  const headers = new Headers(init.headers || {});
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body != null && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
  let response;
  try {
    response = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init, headers, credentials: "include",
    });
  } catch {
    const error = new Error(`Không thể kết nối backend tại ${API_BASE}. Hãy kiểm tra backend và cấu hình VITE_API_URL.`);
    error.code = "NETWORK_ERROR";
    throw error;
  }
  if (response.status === 401 && retryAuth && !path.startsWith("/auth/login") && !path.startsWith("/auth/register") && !path.startsWith("/auth/refresh")) {
    try {
      const token = await refreshAccessToken();
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${token}`);
      response = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, { ...init, headers: retryHeaders, credentials: "include" });
    } catch { setAccessToken(""); }
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const error = new Error(body?.error?.message || body?.message || `Yêu cầu thất bại (${response.status}).`);
    error.status = response.status;
    error.code = body?.error?.code;
    error.details = body?.error?.details;
    throw error;
  }
  return body ?? { success: true, data: null };
}
const json = (method, data, options = {}) => ({ method, body: data === undefined ? undefined : (typeof FormData !== "undefined" && data instanceof FormData ? data : JSON.stringify(data)), ...options });
export const api = {
  request,
  get: (path, options) => request(path, options),
  post: (path, data, options) => request(path, json("POST", data, options)),
  patch: (path, data, options) => request(path, json("PATCH", data, options)),
  put: (path, data, options) => request(path, json("PUT", data, options)),
  delete: (path, options) => request(path, { method: "DELETE", ...options }),
  data: async (path, options) => (await request(path, options))?.data,
};
export function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") query.set(key, String(value)); });
  const result = query.toString();
  return result ? `?${result}` : "";
}
export function assetUrl(url) {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url || "";
  const origin = /^https?:\/\//i.test(API_BASE) ? API_BASE.replace(/\/api$/, "") : (import.meta.env.VITE_PROXY_TARGET || "http://localhost:4000").replace(/\/$/, "");
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}
