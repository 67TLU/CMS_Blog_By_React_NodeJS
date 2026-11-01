import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { useRef } from "react";
import { assetUrl } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import PublicLayout from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  Clock,
  Bell,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Star,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = React.useState({ name: user?.name || "", bio: user?.bio || "", expertise: user?.expertise || "" });
  const [editing, setEditing] = React.useState(false);
  const [statsData, setStatsData] = React.useState({ bookmarks: 0, history: 0, notifications: 0, comments: 0 });
  const [saving, setSaving] = React.useState(false);
  const avatarInput = useRef(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => { let active = true; api.get("/users/me").then(r => { if (!active) return; const d = r?.data || {}; setProfile({ name: d.name || "", bio: d.bio || "", expertise: d.expertise || "" }); setStatsData(d.stats || {}); updateUser(d); }).catch(e => addToast(e.message, "error")); return () => { active = false; }; }, [addToast, updateUser]);
  const uploadAvatar = async (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { addToast("Vui lòng chọn file ảnh", "error"); return; } const body = new FormData(); body.append("avatar", file); setAvatarUploading(true); try { const r = await api.patch("/users/me/avatar", body); const avatar = r?.data?.avatarUrl; updateUser({ avatar }); addToast("Đã cập nhật ảnh đại diện"); } catch (error) { addToast(error.message, "error"); } finally { setAvatarUploading(false); event.target.value = ""; } };
  const saveProfile = async (e) => { e.preventDefault(); setSaving(true); try { const r = await api.patch("/users/me", profile); updateUser(r?.data || profile); setEditing(false); addToast("Đã cập nhật hồ sơ"); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };
  // Đảm bảo không bị bất kỳ scroll lock hay pointer-events lock nào
  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
  }, []);

  if (!user) return null;

  const stats = [
    { label: "Bài đã lưu", value: statsData.bookmarks || 0, icon: Bookmark, to: "/user/bookmarks", color: "text-blue-500 bg-blue-500/10" },
    { label: "Lịch sử đọc", value: statsData.history || 0, icon: Clock, to: "/user/history", color: "text-purple-500 bg-purple-500/10" },
    { label: "Thông báo", value: statsData.notifications || 0, icon: Bell, to: "/user/notifications", color: "text-amber-500 bg-amber-500/10" },
    { label: "Bình luận", value: statsData.comments || 0, icon: MessageSquare, to: "#", color: "text-emerald-500 bg-emerald-500/10" },
  ];

  const handleLogout = () => {
    document.body.style.pointerEvents = "";
    logout();
    navigate("/");
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header hồ sơ */}
        <Card className="border-border bg-card overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-rose-500/30" />
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-card shadow-lg bg-card">
                <AvatarImage src={assetUrl(user.avatar)} alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-muted text-foreground">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left pb-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize text-xs font-semibold">
                    <UserCheck className="w-3 h-3 mr-1 text-primary" />
                    Vai trò: {user.role || "Thành viên"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pb-1">
                <input ref={avatarInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={uploadAvatar} />
                <Button variant="outline" size="sm" disabled={avatarUploading} onClick={() => avatarInput.current?.click()} className="gap-2 border-border"> <Camera className="h-4 w-4" /> {avatarUploading ? "Đang tải…" : "Đổi ảnh"}</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing((v) => !v)}
                  className="gap-2 border-border cursor-pointer"
                >
                  <Settings className="w-4 h-4" /> Cài đặt
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {editing && <Card className="border-border bg-card"><CardHeader><CardTitle>Chỉnh sửa hồ sơ</CardTitle></CardHeader><CardContent><form onSubmit={saveProfile} className="space-y-4"><div><label className="mb-1 block text-sm">Tên hiển thị</label><Input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} maxLength={100} required /></div><div><label className="mb-1 block text-sm">Giới thiệu</label><Textarea value={profile.bio || ""} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} maxLength={5000} rows={3}/></div><div><label className="mb-1 block text-sm">Lĩnh vực chuyên môn</label><Input value={profile.expertise || ""} onChange={e=>setProfile(p=>({...p,expertise:e.target.value}))} maxLength={128}/></div><div className="flex gap-2"><Button type="submit" disabled={saving}>{saving?"Đang lưu…":"Lưu thay đổi"}</Button><Button type="button" variant="outline" onClick={()=>setEditing(false)}>Hủy</Button></div></form></CardContent></Card>}
        {/* Thống kê hoạt động */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} to={s.to}>
                <Card className="border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Các liên kết truy cập nhanh */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Truy cập nhanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/user/bookmarks"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">Bài viết đã lưu</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/user/history"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-foreground">Lịch sử đọc bài</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/user/notifications"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Trung tâm thông báo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/author"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">Author Studio (Khu vực viết bài)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}