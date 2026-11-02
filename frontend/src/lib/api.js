const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// ── Access Token ──────────────────────────────────────────────────────────────
// Lưu trong bộ nhớ (closure) thay vì sessionStorage/localStorage để phòng chống XSS triệt để.
// Token sẽ tự động mất khi tab/cửa sổ đóng; bootstrap lại từ refresh-token cookie (HttpOnly).
let accessToken = "";
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || "";
}
export function getAccessToken() {
  return accessToken;
}

// ── Refresh Token ─────────────────────────────────────────────────────────────
export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body?.data?.accessToken) {
          throw new Error(body?.error?.message || "Phiên đăng nhập đã hết hạn.");
        }
        setAccessToken(body.data.accessToken);
        return body.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Helper kết hợp signals cho AbortController tương thích rộng
function combineSignals(customSignal, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("Yêu cầu đã quá thời gian phản hồi (Timeout).", "TimeoutError"));
  }, timeoutMs);

  if (customSignal) {
    if (customSignal.aborted) {
      clearTimeout(timer);
      controller.abort(customSignal.reason);
    } else {
      customSignal.addEventListener("abort", () => {
        clearTimeout(timer);
        controller.abort(customSignal.reason);
      }, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

// ── Core Request ──────────────────────────────────────────────────────────────
export async function request(path, options = {}) {
  const { retryAuth = true, signal, timeout = 15_000, ...init } = options;

  // Kiểm tra trạng thái mạng trước khi gọi API
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const offlineError = new Error("Bạn đang ngoại tuyến. Vui lòng kiểm tra lại kết nối mạng.");
    offlineError.code = "OFFLINE";
    throw offlineError;
  }

  const headers = new Headers(init.headers || {});
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const { signal: requestSignal, cleanup } = combineSignals(signal, timeout);

  let response;
  try {
    response = await fetch(url, { ...init, headers, credentials: "include", signal: requestSignal });
  } catch (err) {
    cleanup();
    if (err?.name === "AbortError") {
      // Caller chủ động hủy request
      throw err;
    }
    if (err?.name === "TimeoutError" || requestSignal.aborted) {
      const timeoutError = new Error(`Máy chủ không phản hồi sau ${Math.round(timeout / 1000)} giây. Đã tự động hủy yêu cầu.`);
      timeoutError.code = "TIMEOUT";
      throw timeoutError;
    }
    const networkError = new Error(`Không thể kết nối máy chủ tại ${API_BASE}. Hãy kiểm tra kết nối mạng hoặc thử lại sau.`);
    networkError.code = "NETWORK_ERROR";
    throw networkError;
  }
  cleanup();

  // Xử lý 401 Unauthorized -> Refresh token
  if (
    response.status === 401 &&
    retryAuth &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh")
  ) {
    try {
      const token = await refreshAccessToken();
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${token}`);
      const retryAbort = combineSignals(signal, timeout);
      try {
        response = await fetch(url, { ...init, headers: retryHeaders, credentials: "include", signal: retryAbort.signal });
      } finally {
        retryAbort.cleanup();
      }
    } catch {
      setAccessToken("");
    }
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const error = new Error(
      body?.error?.message || body?.message || `Yêu cầu thất bại (${response.status}).`,
    );
    error.status = response.status;
    error.code = body?.error?.code;
    error.details = body?.error?.details;
    throw error;
  }
  return body ?? { success: true, data: null };
}

const json = (method, data, options = {}) => ({
  method,
  body:
    data === undefined
      ? undefined
      : typeof FormData !== "undefined" && data instanceof FormData
      ? data
      : JSON.stringify(data),
  ...options,
});

export const api = {
  request,
  get: (path, options) => request(path, options),
  post: (path, data, options) => request(path, json("POST", data, options)),
  patch: (path, data, options) => request(path, json("PATCH", data, options)),
  put: (path, data, options) => request(path, json("PUT", data, options)),
  delete: (path, options) => request(path, { method: "DELETE", ...options }),
  data: async (path, options) => (await request(path, options))?.data,
};

// ── Query helpers ─────────────────────────────────────────────────────────────
export function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const result = query.toString();
  return result ? `?${result}` : "";
}

export function assetUrl(url) {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url || "";
  const origin = /^https?:\/\//i.test(API_BASE)
    ? API_BASE.replace(/\/api$/, "")
    : (import.meta.env.VITE_PROXY_TARGET || "http://localhost:4000").replace(/\/$/, "");
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}
