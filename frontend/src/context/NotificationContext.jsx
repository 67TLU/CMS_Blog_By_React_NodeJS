import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import { api, getAccessToken, setAccessToken } from "@/lib/api"; 

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const countNotificationsRef = useRef(0); // Số lượng thông báo chưa đọc
  
  // Dùng useRef để quản lý kết nối và số lần thử lại, tránh bị lặp vô hạn (infinite loop)
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  // Hàm load dữ liệu quá khứ từ API
const load = async () => {
  setLoading(true);
  await api
    .get("users/me/notifications?page=1&limit=10")
    .then((r) => {
      const fetchedItems = r?.data?.items || [];
      
      // 1. Cập nhật state items để render giao diện
      setItems(fetchedItems);
      
      // 2. Tính toán trực tiếp từ dữ liệu vừa lấy về (Không dùng biến 'items' ở đây)
      const unreadCount = fetchedItems.filter(n => !n.isRead).length;
      countNotificationsRef.current = unreadCount;
      
      console.log("Số lượng thông báo chưa đọc:", unreadCount, fetchedItems);
    })
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
};


  // Tách hàm connect ra ngoài để có thể gọi lại tuần hoàn khi làm mới Token thành công
  const connectSSE = () => {
    // Nếu đang có kết nối cũ thì dọn dẹp trước khi tạo mới
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = getAccessToken(); 
    const url = `${import.meta.env.VITE_API_URL}/users/me/notifications/sse?token=${token}`;
    
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    const handleNewNotification = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        countNotificationsRef.current += 1;
        setItems((prevList) => [newNotification, ...prevList]);
      } catch (e) {
        console.error("Lỗi parse dữ liệu SSE:", e);
      }
    };

    eventSource.addEventListener('new_notification', handleNewNotification);

    eventSource.onerror = async (e) => {
      console.error("SSE Error xảy ra. Tiến hành kiểm tra và làm mới token...");
      
      // Đóng kết nối hiện tại bị lỗi
      eventSource.close();

      // Tránh việc nhiều request refresh chạy đồng thời cùng lúc
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        // Gọi API Refresh Token (sử dụng đúng logic chặn lỗi tuần hoàn retryAuth như file Auth của bạn)
        const refreshed = await api.post("/auth/refresh", undefined, { retryAuth: false });
        
        if (refreshed?.data?.accessToken) {
          setAccessToken(refreshed.data.accessToken);
          console.log("Refresh token thành công! Đang kết nối lại SSE...");
          
          // Thử kết nối lại ngay lập tức với token mới
          connectSSE();
        }
      } catch (refreshError) {
        console.error("Refresh token thất bại (Có thể Refresh Token hết hạn hoặc chưa đăng nhập):", refreshError);
        // Nếu refresh cũng lỗi (hết hạn hoàn toàn), đợi 5 giây sau thử kết nối lại từ đầu
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      } finally {
        isRefreshingRef.current = false;
      }
    };
  };

  useEffect(() => {
    // 1. Load danh sách thông báo cũ
    load();

    // 2. Khởi tạo kết nối SSE lần đầu tiên
    connectSSE();

    // 3. Cleanup khi component unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [addToast]);

  // Hàm đánh dấu tất cả đã đọc
  const markAll = async () => {
    try {
      await api.patch("users/me/notifications/read-all", {});
      setItems((list) => list.map((n) => ({ ...n, isRead: true })));
      countNotificationsRef.current = 0;
    } catch (e) {
      addToast(e.message, "error");
    }
  };

  // Hàm đánh dấu 1 mục đã đọc
  const markRead = async (id) => {
    try {
      await api.patch(`users/me/notifications/${id}/read`, {});
      setItems((list) =>
        list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      countNotificationsRef.current = Math.max(0, countNotificationsRef.current - 1);
    } catch (e) {
      addToast(e.message, "error");
    }
  };

  return (
    <NotificationContext.Provider value={{ items, loading, error, load, markAll, markRead,countNotificationsRef }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
