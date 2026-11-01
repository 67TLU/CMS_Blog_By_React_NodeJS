import React from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
  const team = [
    { name: "Trần Anh Tuấn", role: "Tổng Biên Tập", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80" },
    { name: "Minh Châu", role: "Trưởng ban Công nghệ", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" },
    { name: "Lê Nhật Nam", role: "Trưởng ban Tài chính", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
  ];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto space-y-12 py-4">
        {/* Banner */}
        <div className="text-center space-y-4 border-b border-zinc-800 pb-8">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Về chúng tôi</span>
          <h1 className="text-3xl md:text-4xl font-black">Nền tảng Tin tức & Tri thức Công nghệ Hàng đầu</h1>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            Cung cấp thông tin nhanh chóng, chính xác và phân tích chuyên sâu về Công nghệ, Khởi nghiệp, Kinh tế số toàn cầu.
          </p>
        </div>

        {/* Con số ấn tượng */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className=" border border-zinc-300 dark:border-zinc-600 p-6 rounded-2xl">
            <p className="text-3xl font-black text-blue-500">5M+</p>
            <p className="text-xs text-zinc-400 mt-1">Độc giả hàng tháng</p>
          </div>
          <div className=" border border-zinc-300 dark:border-zinc-600 p-6 rounded-2xl">
            <p className="text-3xl font-black text-green-500">200+</p>
            <p className="text-xs text-zinc-400 mt-1">Tác giả & Chuyên gia</p>
          </div>
          <div className="border border-zinc-300 dark:border-zinc-600 p-6 rounded-2xl">
            <p className="text-3xl font-black text-amber-500">10K+</p>
            <p className="text-xs text-zinc-400 mt-1">Bài viết xuất bản</p>
          </div>
          <div className=" border border-zinc-300 dark:border-zinc-600 p-6 rounded-2xl">
            <p className="text-3xl font-black text-purple-500">24/7</p>
            <p className="text-xs text-zinc-400 mt-1">Cập nhật liên tục</p>
          </div>
        </div>

        {/* Đội ngũ tòa soạn */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold  text-center flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-blue-500"/> Ban Biên Tập & Tòa Soạn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, idx) => (
              <div key={idx} className="border border-zinc-300 dark:border-zinc-600 rounded-xl p-6 text-center space-y-3">
                <Avatar className="w-20 h-20 mx-auto border-2 border-blue-500/30">
                  <AvatarImage src={member.avatar}/>
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold ">{member.name}</h3>
                  <p className="text-xs text-blue-400 font-semibold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}