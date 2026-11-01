/* eslint react-hooks/set-state-in-effect: off */
import React from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { Bell, CheckCircle, MessageSquare, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext"; // <-- Import hook ở đây

const Icon = ({ type }) =>
  type === "COMMENT" ? (
    <MessageSquare className="h-4 w-4 text-blue-500" />
  ) : type === "LIKE" ? (
    <Heart className="h-4 w-4 text-red-500" />
  ) : (
    <CheckCircle className="h-4 w-4 text-green-500" />
  );

export default function NotificationsPage() {
  // Lấy toàn bộ dữ liệu và logic xử lý từ Context dùng chung
  const { items, loading, error, load, markAll, markRead } = useNotifications();

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Bell className="h-6 w-6 text-amber-500" />
              Thông báo
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Cập nhật từ hoạt động và hệ thống
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={markAll}>
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border p-6">
            {error}
            <Button className="ml-3" variant="outline" onClick={load}>
              Thử lại
            </Button>
          </div>
        ) : !items.length ? (
          <div className="rounded-xl border p-12 text-center text-muted-foreground">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                // Sửa lỗi logic hiển thị màu: biến kiểm tra của bạn ở dưới là n.is_read nhưng ở đây bạn đang ghi nhầm thành n.isRead
                className={`flex items-start gap-3 rounded-xl border p-4 ${n.isRead ? "border-border bg-card text-muted-foreground" : "border-blue-500/30 bg-blue-500/5 text-foreground"}`}
              >
                <div className="mt-0.5 rounded-lg bg-muted p-2">
                  <Icon type={n.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {n.body}
                    </p>
                  )}
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                      Mở nội dung
                    </Link>
                  )}
                </div>
                {/* Check điều kiện hiển thị nút Đã đọc (nếu chưa đọc thì hiển thị) */}
                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(n.id)}
                  >
                    Đã đọc
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
