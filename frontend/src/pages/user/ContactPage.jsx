import React, { useState } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false); const [busy, setBusy] = useState(false); const { addToast } = useToast();
  const handleSubmit = async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); try { await api.post("/contact", { name: form.get("name"), email: form.get("email"), subject: form.get("subject"), content: form.get("content") }, { retryAuth: false }); setSubmitted(true); } catch (error) { addToast(error.message || "Không gửi được tin nhắn", "error"); } finally { setBusy(false); } };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Liên hệ với Ban Biên Tập</h1>
          <p className="text-xs text-zinc-400">Gửi thông cáo báo chí, góp ý nội dung hoặc hợp tác quảng cáo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <div className=" border border-zinc-300 dark:border-zinc-600  rounded-xl p-5 space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-blue-500/10 text-blue-400">
                <MapPin className="w-5 h-5"/>
              </div>
              <h3 className="font-bold text-sm">Địa chỉ Tòa soạn</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tầng 8, Tòa nhà Press Tower, 123 Đường Cầu Giấy, Hà Nội
              </p>
            </div>

            <div className=" border border-zinc-300 dark:border-zinc-600 rounded-xl p-5 space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-green-500/10 text-green-400">
                <Mail className="w-5 h-5"/>
              </div>
              <h3 className="font-bold  text-sm">Email liên hệ</h3>
              <p className="text-xs text-zinc-400">toasoan@newsblog.vn</p>
              <p className="text-xs text-zinc-400">quangcao@newsblog.vn</p>
            </div>

            <div className=" border border-zinc-300 dark:border-zinc-600 rounded-xl p-5 space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-400">
                <Phone className="w-5 h-5"/>
              </div>
              <h3 className="font-bold text-sm">Hotline / Zalo</h3>
              <p className="text-xs text-zinc-400">+84 (0) 24 3888 9999</p>
            </div>
          </div>

          {/* Form liên hệ */}
          <div className="md:col-span-2 border border-zinc-300 dark:border-zinc-600 rounded-xl p-6">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <CheckCircle2 className="w-12 h-12 text-green-400"/>
                <h3 className="text-xl font-bold ">Đã gửi tin nhắn thành công!</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Ban Biên Tập đã nhận được thông tin và sẽ phản hồi qua email của bạn trong thời gian sớm nhất.
                </p>
                <Button onClick={()=> setSubmitted(false)} variant="outline" className="border-zinc-700 text-xs mt-2">
                  Gửi tin nhắn khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold  text-base">Gửi tin nhắn</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs ">Họ và tên</label>
                    <Input name="name" className=" border-zinc-300  text-xs h-10" placeholder="Nguyễn Văn A" required/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs ">Email</label>
                    <Input name="email" className="border-zinc-300 dark:border-zinc-600 text-xs h-10" placeholder="name@example.com" required type="email"/>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs ">Chủ đề</label>
                  <Input name="subject" className=" border-zinc-700 dark:border-zinc-600 text-xs h-10" placeholder="Góp ý bài viết / Hợp tác..." required/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs ">Nội dung</label>
                  <Textarea name="content" className=" border-zinc-300  text-xs min-h-[120px]" placeholder="Nhập nội dung tin nhắn..." required/>
                </div>

                <Button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold gap-2" type="submit">
                  <Send className="w-4 h-4"/> {busy ? "Đang gửi…" : "Gửi tin nhắn"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}