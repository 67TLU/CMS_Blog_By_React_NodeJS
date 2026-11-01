import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signUpSchema } from "@/validate/validate";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import {useToast} from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"
export default function RegisterPage() {

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { register: registerAccount } = useAuth();
  const onSubmit = async ({ username, email, password }) => {
    try { await registerAccount({ username, email, password }); addToast("Đăng ký thành công!"); navigate("/", { replace: true }); }
    catch (error) { addToast(error.message || "Không thể đăng ký tài khoản", "error"); }
  };
 const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema), // Kết nối useForm với Zod bằng JS
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Nền trang trí — gradient xanh nhạt + blob mờ, tự đổi theo theme */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-background to-blue-100/60 dark:from-blue-950/60 dark:via-background dark:to-slate-900/70" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <Card className="relative w-full max-w-md border-zinc-800 shadow-2xl shadow-black/40 dynamic-fade-in">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500">
              <User className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Đăng ký để lưu bài, bình luận và theo dõi tác giả yêu thích
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Họ và tên</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    
                    className="h-11 border-zinc-800 pl-10 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                    {...register("username")}
                  />
                  {errors.username && <p >{errors.username.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Địa chỉ Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="name@example.com"
                    {...register("email")} 
                    className="h-11 border-zinc-800 pl-10 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                    
                  />
                  {errors.email && <p >{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    {...register("password")}
                    className="h-11 border-zinc-800 pl-10 pr-10 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                    
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                   {errors.password && <p >{errors.password.message}</p>}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-400">
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Đăng nhập ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}