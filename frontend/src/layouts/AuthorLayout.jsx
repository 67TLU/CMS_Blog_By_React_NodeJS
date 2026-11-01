import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PenTool,
  Image,
  LogOut,
  BarChart3,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AuthorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Tổng quan", path: "/author", icon: LayoutDashboard },
    { label: "Bài viết của tôi", path: "/author/articles", icon: FileText },
    { label: "Tạo bài viết mới", path: "/author/create", icon: PenTool },
    { label: "Thống kê bài viết", path: "/author/analytics", icon: BarChart3 },
    { label: "Thư viện Media", path: "/author/media", icon: Image },
    { label: "Lịch xuất bản", path: "/author/schedule", icon: CalendarClock },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar bên trái */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div className="space-y-6">
          {/* Header Sidebar */}
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              AUTHOR STUDIO
            </span>
          </div>

          {/* User Profile info — semantic tokens */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
            <Avatar className="w-10 h-10 border border-border shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name || "Tác giả"}
              </p>
              <span className="text-xs text-primary font-medium">Tác giả bài viết</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/author"
                  ? location.pathname === "/author"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-border pt-4">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer border-border">
              <ExternalLink className="w-4 h-4" /> Xem trang chủ website
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header — semantic tokens */}
        <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between md:hidden">
          <span className="font-bold text-foreground text-sm">AUTHOR STUDIO</span>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-border">
                <ExternalLink className="w-3.5 h-3.5" /> Trang chủ
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-8xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}