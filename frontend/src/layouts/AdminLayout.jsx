import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquareWarning,
  Users,
  FolderTree,
  LogOut,
  ShieldAlert,
  Megaphone,
  ScrollText,
  Menu as MenuIcon,
  ShieldCheck,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Duyệt bài viết", path: "/admin/articles", icon: CheckSquare },
    { label: "Báo cáo bình luận", path: "/admin/comment-reports", icon: MessageSquareWarning },
    { label: "Quản lý người dùng", path: "/admin/users", icon: Users },
    { label: "Chuyên mục & Tag", path: "/admin/categories", icon: FolderTree },
    { label: "Quản lý Menu", path: "/admin/menu", icon: MenuIcon },
    { label: "Phân quyền", path: "/admin/roles", icon: ShieldCheck },
    { label: "Quảng cáo", path: "/admin/ads", icon: Megaphone },
    { label: "Audit Log", path: "/admin/logs", icon: ScrollText },
    { label: "Cài đặt hệ thống", path: "/admin/system", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldAlert className="w-6 h-6 text-destructive" />
            <span className="text-xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              ADMIN PANEL
            </span>
          </div>

          {/* Admin Profile info — semantic tokens */}
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <Avatar className="w-10 h-10 border border-destructive/40 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
                {user?.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name || "Admin"}
              </p>
              <span className="text-xs text-destructive font-medium">Quản trị viên</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-destructive text-destructive-foreground"
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

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header — semantic tokens */}
        <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <span className="font-bold text-foreground text-sm">ADMIN PANEL</span>
          </div>
          <Link to="/">
            <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-border">
              <ExternalLink className="w-3.5 h-3.5" /> Trang chủ
            </Button>
          </Link>
        </header>
        <main className="flex-1 p-6 max-w-8xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}