import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { api, getAccessToken, setAccessToken } from "@/lib/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const countNotificationsRef = useRef(0);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("users/me/notifications?page=1&limit=20");
      if (!mountedRef.current) return;
      const fetchedItems = r?.data?.items || [];
      setItems(fetchedItems);
      countNotificationsRef.current = fetchedItems.filter((n) => !n.isRead).length;
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (!getAccessToken()) return; // Không kết nối nếu chưa đăng nhập

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const token = getAccessToken();
    const baseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
    const url = `${baseUrl}/users/me/notifications/sse?token=${token}`;

    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("new_notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        if (!mountedRef.current) return;
        countNotificationsRef.current += 1;
        setItems((prev) => [newNotification, ...prev]);
      } catch (e) {
        // ignore malformed SSE
      }
    });

    eventSource.onerror = async () => {
      eventSource.close();
      if (!mountedRef.current) return;
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const refreshed = await api.post("/auth/refresh", undefined, { retryAuth: false });
        if (refreshed?.data?.accessToken && mountedRef.current) {
          setAccessToken(refreshed.data.accessToken);
          connectSSE();
        }
      } catch {
        // Refresh thất bại → đợi 10 giây rồi thử lại
        if (mountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) connectSSE();
          }, 10_000);
        }
      } finally {
        isRefreshingRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    connectSSE();

    return () => {
      mountedRef.current = false;
      eventSourceRef.current?.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markAll = useCallback(async () => {
    try {
      await api.patch("users/me/notifications/read-all", {});
      setItems((list) => list.map((n) => ({ ...n, isRead: true })));
      countNotificationsRef.current = 0;
    } catch (e) {
      addToast(e.message, "error");
    }
  }, [addToast]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`users/me/notifications/${id}/read`, {});
      setItems((list) =>
        list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      countNotificationsRef.current = Math.max(0, countNotificationsRef.current - 1);
    } catch (e) {
      addToast(e.message, "error");
    }
  }, [addToast]);

  return (
    <NotificationContext.Provider
      value={{ items, loading, error, load, markAll, markRead, countNotificationsRef }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
