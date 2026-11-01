import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 space-y-5">
      <div className="w-20 h-20 bg-red-950/40 border border-red-900/50 rounded-3xl flex items-center justify-center text-red-500 shadow-xl">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black text-red-500 font-mono">403</h1>
        <h2 className="text-lg font-bold text-foreground">Truy cập bị từ chối</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tài khoản của bạn không có đủ quyền hạn để truy cập vào khu vực này. Vui lòng liên hệ Quản trị viên.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button className="bg-muted hover:bg-accent text-foreground font-semibold text-xs gap-1.5">
            <Home className="w-3.5 h-3.5" /> Về Trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}