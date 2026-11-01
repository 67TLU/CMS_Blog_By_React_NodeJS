import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 space-y-5">
      <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-amber-500 shadow-xl">
        <FileQuestion className="w-10 h-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black ">404</h1>
        <h2 className="text-lg font-bold ">Không tìm thấy trang yêu cầu</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Đường dẫn bạn truy cập không tồn tại, đã bị xóa hoặc dời sang địa chỉ khác.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={() => window.history.back()} className="border-zinc-800 text-xs gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
        </Button>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs gap-1.5">
            <Home className="w-3.5 h-3.5" /> Trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}