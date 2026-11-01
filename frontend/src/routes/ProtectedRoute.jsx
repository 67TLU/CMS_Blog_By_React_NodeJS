import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children ,allowedRoles = []}) {
  const { user, loading,role } = useAuth();

  // Bước 1: Nếu AuthContext vẫn đang bận kiểm tra token, chặn lại và hiển thị loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
      </div>
    );
  }

  // Bước 2: Sau khi hết loading, nếu không tìm thấy user thì mới đá về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }
  // Bước 3: Đã có user và hết loading -> Cho phép xem trang bảo mật
  return children;
}
