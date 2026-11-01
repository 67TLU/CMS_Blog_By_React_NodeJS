import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import PublicLayout from "@/layouts/PublicLayout";
import ArticleCard from "@/components/cards/ArticleCard";
import { Button } from "@/components/ui/button";
import { api, queryString } from "@/lib/api";
import { toCardArticle } from "@/lib/articleAdapter";

export default function AllArticlesPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.get(`/articles${queryString({ page, limit: 12 })}`)
      .then((response) => { if (!active) return; setItems((response?.data?.items || []).map(toCardArticle)); setMeta(response?.meta || { totalPages: 1, totalItems: 0 }); setError(""); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);
  return <PublicLayout><div className="space-y-6"><div className="rounded-2xl border border-border bg-gradient-to-r from-blue-500/10 via-card to-amber-500/10 p-6 md:p-8"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Newspaper className="h-4 w-4"/>Tin tức mới nhất</div><h1 className="mt-2 text-3xl font-black">Tất cả bài viết</h1><p className="mt-2 text-sm text-muted-foreground">Tổng hợp tin tức và bài phân tích được cập nhật từ tòa soạn.</p><p className="mt-3 text-xs text-muted-foreground">{Number(meta.totalItems || 0).toLocaleString("vi-VN")} bài viết</p></div>{error&&<div className="rounded-xl border border-amber-500/30 p-5 text-sm">{error}<Button variant="outline" className="ml-3" onClick={()=>window.location.reload()}>Thử lại</Button></div>}{loading?<div className="flex justify-center py-16"><Loader2 className="animate-spin"/></div>:!items.length?<div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Chưa có bài viết công khai.</div>:<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><ArticleCard key={item.id} article={item}/>)}</div>}<div className="flex items-center justify-between border-t border-border pt-4"><Button variant="outline" disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="mr-1 h-4 w-4"/>Trang trước</Button><span className="text-xs text-muted-foreground">Trang {page} / {Math.max(1,meta.totalPages||1)}</span><Button variant="outline" disabled={loading||page>=(meta.totalPages||1)} onClick={()=>setPage(p=>p+1)}>Trang sau<ChevronRight className="ml-1 h-4 w-4"/></Button></div><div className="text-center"><Link to="/" className="text-xs text-primary hover:underline">Quay về trang chủ</Link></div></div></PublicLayout>;
}
