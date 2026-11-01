/* eslint react-hooks/set-state-in-effect: off */
import React, { useEffect, useState } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { Bookmark, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api, assetUrl } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const { addToast } = useToast();
  const load = () => { setLoading(true); api.get("/users/me/bookmarks?page=1&limit=50").then(r => setBookmarks(r?.data?.items || [])).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const handleRemove = async (id) => { try { await api.delete(`/articles/${id}/bookmark`); setBookmarks(list => list.filter(x => x.id !== id)); addToast("Đã bỏ lưu bài viết"); } catch(e) { addToast(e.message, "error"); } };
  return <PublicLayout><div className="mx-auto max-w-4xl space-y-6"><div className="flex items-center justify-between border-b border-border pb-4"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><Bookmark className="h-6 w-6 text-amber-500"/>Bài viết đã lưu</h1><p className="mt-1 text-xs text-muted-foreground">Danh sách bài viết đã lưu từ tài khoản của bạn</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{bookmarks.length} bài</span></div>
  {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin"/></div> : error ? <div className="rounded-xl border border-amber-500/30 p-6 text-sm">{error}<Button variant="outline" className="ml-3" onClick={load}>Thử lại</Button></div> : !bookmarks.length ? <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Bạn chưa lưu bài viết nào.</div> : <div className="space-y-4">{bookmarks.map(a => <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"><div className="flex min-w-0 items-center gap-4"><img src={assetUrl(a.coverImage)} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover"/><div className="min-w-0"><span className="text-xs font-bold text-primary">{a.category}</span><h3 className="truncate font-semibold">{a.title}</h3><p className="mt-1 text-xs text-muted-foreground">{a.author} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("vi-VN") : ""}</p></div></div><div className="flex shrink-0 gap-2"><Link to={`/article/${a.slug || a.id}`}><Button size="icon" variant="outline"><ExternalLink className="h-4 w-4"/></Button></Link><Button size="icon" variant="ghost" onClick={() => handleRemove(a.id)} aria-label="Bỏ lưu"><Trash2 className="h-4 w-4 text-red-500"/></Button></div></div>)}</div>}</div></PublicLayout>;
}
