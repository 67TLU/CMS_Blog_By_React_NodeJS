import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { addToast } = useToast();
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { await api.post("/auth/forgot-password", { email }, { retryAuth: false }); setSent(true); } catch (error) { addToast(error.message || "Không thể gửi email khôi phục", "error"); } finally { setBusy(false); } };

  return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Nền trang trí — gradient xanh nhạt + blob mờ, tự đổi theo theme */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-background to-blue-100/60 dark:from-blue-950/60 dark:via-background dark:to-slate-900/70" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <Card className="relative w-full max-w-md border-zinc-800 shadow-2xl shadow-black/40 dynamic-fade-in">
          <CardHeader className="space-y-2 text-center">
            {/* Icon thương hiệu — đồng bộ LoginPage/RegisterPage */}
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Khôi phục mật khẩu</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Nhập email liên kết với tài khoản để nhận hướng dẫn đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-center text-sm">
                Chúng tôi đã gửi link khôi phục mật khẩu tới email của bạn. Vui lòng kiểm tra hộp thư!
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider">Email tài khoản</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                    className="h-11 border-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  />
                </div>
                <Button type="submit" disabled={busy} className="h-11 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] gap-2">
                  <Mail className="w-4 h-4" /> {busy ? "Đang gửi…" : "Gửi link xác nhận"}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Quay lại Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}