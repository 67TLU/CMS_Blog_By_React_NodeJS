import React, { useState, useEffect } from "react";
import { Search, Bell, Menu, Bookmark, LogOut, Sun, Moon, X, Newspaper, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import { Can } from "@casl/react";
import GTranslate from "@/ulitis/GTranslate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, assetUrl } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";

// Danh sách chuyên mục dùng chung
export const CATEGORIES = [
  { label: "Khám phá", slug: "all" },
  { label: "Tin tức", slug: "tin-tuc" },
  { label: "Thể thao", slug: "the-thao" },
  { label: "Tài chính", slug: "tai-chinh" },
  { label: "Công nghệ", slug: "cong-nghe" },
  { label: "Thời tiết", slug: "thoi-tiet" },
];

export default function PublicLayout({ children }) {
  const { user, logout } = useAuth();
  const { countNotificationsRef } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerMenu, setHeaderMenu] = useState([]);
  const [footerMenu, setFooterMenu] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/menu?location=HEADER", { retryAuth: false }), api.get("/menu?location=FOOTER", { retryAuth: false }), api.get("/settings/public", { retryAuth: false })])
      .then(([header, footer, settings]) => { if (!active) return; setHeaderMenu(header?.data?.items || []); setFooterMenu(footer?.data?.items || []); setSiteSettings(settings?.data || {}); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const navigationItems = headerMenu.length ? headerMenu.map((item) => ({ label: item.label, url: item.url, target: item.target })) : CATEGORIES.map((cat) => ({ label: cat.label, url: cat.slug === "all" ? "/articles" : `/category/${cat.slug}`, target: "_self" }));
  const siteName = siteSettings.siteName || import.meta.env.VITE_NAME_WEB || "Portal News";

  // Reset menu khi đổi trang — "adjust state during render" theo docs React
  // (thay vì setState trong effect → gây cascading render)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }

  // Side-effect thuần DOM: gỡ lock scroll khi trang bị đổi (menu mở có thể để lock)
  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
  };

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    document.body.style.pointerEvents = "";
    navigate(path);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    document.body.style.pointerEvents = "";
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent cursor-pointer"
            >
              <Newspaper className="w-7 h-7 text-red-500 shrink-0" />
              <span>{siteName}</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm tin tức, bài viết, tác giả..."
              className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1"
            />
          </form>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {/* Nút đổi giao diện Sáng / Tối */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Đổi giao diện"
              title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
            </Button>
            <GTranslate/>

            {user ? (
              <>
                {/* Chuông thông báo */}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Thông báo"
                  onClick={() => handleNavigate("/user/notifications")}
                  className="relative text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                 {countNotificationsRef.current ? <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {countNotificationsRef.current}
                  </span>:null}
                </Button>

                {/* Dropdown Profile */}
<DropdownMenu
  open={dropdownOpen}
  onOpenChange={(open) => {
    setDropdownOpen(open);
    if (!open) {
      document.body.style.pointerEvents = "";
    }
  }}
>
  <DropdownMenuTrigger
    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    aria-label="Tài khoản"
  >
    <Avatar className="w-9 h-9 border border-border">
      <AvatarImage src={assetUrl(user.avatar)} alt={user.name} />
      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border shadow-lg">
    {/*  ĐÃ SỬA: Bọc DropdownMenuLabel bên trong một DropdownMenuGroup */}
    <DropdownMenuGroup>
      <DropdownMenuLabel className="font-semibold text-foreground">
        <div className="truncate">{user.name}</div>
        <div className="text-xs font-normal text-muted-foreground capitalize">{user.role || "Thành viên"}</div>
      </DropdownMenuLabel>
    </DropdownMenuGroup>

    <DropdownMenuSeparator />
    
    <DropdownMenuGroup>
      <DropdownMenuItem
        onClick={() => handleNavigate("/user/profile")}
        className="cursor-pointer hover:bg-muted"
      >
        <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" /> Hồ sơ cá nhân
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleNavigate("/user/bookmarks")}
        className="cursor-pointer hover:bg-muted"
      >
        <Bookmark className="w-4 h-4 mr-2 text-muted-foreground" /> Bài viết đã lưu
      </DropdownMenuItem>
    </DropdownMenuGroup>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem
      onClick={() => handleNavigate("/author")}
      className="cursor-pointer hover:bg-muted"
    >
      Khu vực tác giả
    </DropdownMenuItem>
    <Can do="access" on="AdminDashBoard">
          <DropdownMenuItem
      onClick={() => handleNavigate("/admin")}
      className="cursor-pointer hover:bg-muted"
    >
      Khu vực quản trị
    </DropdownMenuItem>
    </Can>

    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem
      onClick={handleLogout}
      className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
    >
      <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate("/login")}
                  className="gap-2 cursor-pointer border-border"
                >
                  <UserIcon className="w-4 h-4" /> Đăng nhập
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavigate("/register")}
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Categories Desktop */}
        <nav className="max-w-7xl mx-auto hidden md:flex items-center gap-6 pt-3 text-sm font-medium overflow-x-auto text-muted-foreground border-t border-border/50 mt-3">
          {navigationItems.map((item, index) => {
            const to = item.url || "/";
            const isActive = location.pathname === to;
            return (
              <Link key={`${to}-${index}`} to={to} target={item.target === "_blank" ? "_blank" : undefined} rel={item.target === "_blank" ? "noreferrer" : undefined}
                className={`whitespace-nowrap pb-1.5 border-b-2 transition-colors ${isActive ? "text-primary font-bold border-primary" : "border-transparent hover:text-foreground hover:border-border"}`}>
                {item.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-6 ml-auto">
                      <Link
            to="/about"
            className={`whitespace-nowrap pb-1.5 border-b-2 transition-colors`}
          >
            Giới thiệu 
          </Link>
                    <Link
            to="/contact"
            className={`whitespace-nowrap pb-1.5 border-b-2 transition-colors`}
          >
            Liên hệ
          </Link>
                    <Link
            to="/search"
            className={`whitespace-nowrap pb-1.5 border-b-2 transition-colors`}
          >
            Tìm kiếm
          </Link>

          </div>

        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-3 pt-3 pb-2 space-y-2 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="pl-9 bg-muted/50 border-border text-foreground"
              />
            </form>
            <div className="grid grid-cols-2 gap-1 text-sm font-medium">
              {navigationItems.map((item, index) => (
                <Link key={`${item.url}-${index}`} to={item.url || "/"} onClick={() => setMobileMenuOpen(false)} target={item.target === "_blank" ? "_blank" : undefined} rel={item.target === "_blank" ? "noreferrer" : undefined}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-foreground transition-colors">
                  <span>{item.label}</span><ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {siteSettings.maintenanceMode && <div role="status" className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700">Website đang trong chế độ bảo trì. Một số chức năng có thể tạm thời không hoạt động.</div>}
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card text-card-foreground mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-black text-lg bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              <Newspaper className="w-5 h-5 text-red-500" />
              <span>{siteName}</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Trang tin tức & blog công nghệ hàng đầu, mang đến những cập nhật sắc bén và kiến thức chuyên sâu.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Chuyên mục</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {(footerMenu.length ? footerMenu : CATEGORIES.slice(1).map((c) => ({ label: c.label, url: `/category/${c.slug}` }))).map((item, index) => (
                <li key={`${item.url}-${index}`}><Link to={item.url || "/"} target={item.target === "_blank" ? "_blank" : undefined} rel={item.target === "_blank" ? "noreferrer" : undefined} className="hover:text-foreground transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Thông tin</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">Giới thiệu</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Liên hệ</Link></li>
              <li><Link to="/search" className="hover:text-foreground transition-colors">Tìm kiếm</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Tài khoản & Tiện ích</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {user ? (
                <>
                  <li><Link to="/user/profile" className="hover:text-foreground transition-colors">Hồ sơ cá nhân</Link></li>
                  <li><Link to="/user/bookmarks" className="hover:text-foreground transition-colors">Bài viết đã lưu</Link></li>
                  <li><Link to="/author" className="hover:text-foreground transition-colors">Khu vực tác giả</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-foreground transition-colors">Đăng nhập</Link></li>
                  <li><Link to="/register" className="hover:text-foreground transition-colors">Đăng ký tài khoản</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          © 2026 {siteName} Platform - Bản quyền thuộc về Tòa soạn
        </div>
      </footer>
    </div>
  );
}
