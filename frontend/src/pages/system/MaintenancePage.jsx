import React from "react";
import { Wrench, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4 space-y-5">
      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 shadow-xl">
        <Wrench className="w-10 h-10 animate-bounce" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-white">Hệ thống đang bảo trì</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Chúng tôi đang nâng cấp máy chủ để mang đến trải nghiệm tốt hơn. Rất mong bạn cảm thông và quay lại sau ít phút!
        </p>
      </div>
      <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" /> Tải lại trang
      </Button>
    </div>
  );
}