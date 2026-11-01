/* eslint react-hooks/set-state-in-effect: off */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import ArticleCard from "@/components/cards/ArticleCard";
import { api, queryString } from "@/lib/api";
import { toCardArticle } from "@/lib/articleAdapter";

// Icons & UI
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const { slug } = useParams();
  const [activeFilter, setActiveFilter] = useState("latest");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bản đồ tên chuyên mục chuẩn
  const categoryNames = {
    "the-thao": "Thể thao",
    "tin-tuc": "Tin tức",
    "tai-chinh": "Tài chính",
    "cong-nghe": "Công nghệ",
    "thoi-tiet": "Thời tiết",
  };

  const currentCategoryName = categoryNames[slug] || "Tất cả chuyên mục";

  useEffect(() => {
    let active = true; setLoading(true); setError("");
    api.get(`/articles/category/${encodeURIComponent(slug)}${queryString({ page: 1, limit: 24, sort: activeFilter })}`)
      .then((res) => { if (active) setFilteredArticles((res?.data?.items || []).map(toCardArticle)); })
      .catch((err) => { if (active) { setError(err.message); setFilteredArticles([]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, activeFilter]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        
        {/* Header Chuyên mục — nền gradient xanh nhạt, tự đổi theo theme */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/70  p-6 md:p-8 shadow-xs dark:border-blue-900/60 dark:from-blue-600/20 dark:via-blue-500/10 dark:to-sky-400/10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Chuyên mục</span>
          <h1 className="text-3xl md:text-5xl font-black mt-1 mb-2 capitalize text-foreground">
            {currentCategoryName}
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
            Cập nhật những tin tức mới nhất, chính xác và chuyên sâu về chủ đề {currentCategoryName}.
          </p>
        </div>

        {/* Thanh Bộ lọc & Sắp xếp (Filter/Sort) — semantic tokens tự đúng light/dark */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            <span>Sắp xếp theo:</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === "latest" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("latest")}
              className={
                activeFilter === "latest"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            >
              Mới nhất
            </Button>
            <Button
              variant={activeFilter === "popular" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("popular")}
              className={
                activeFilter === "popular"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            >
              Nhiều lượt xem
            </Button>
          </div>
        </div>

        {/* Lưới bài viết (Article Grid) */}
        {error ? <div className="rounded-lg border border-amber-500/30 p-6 text-sm text-amber-700">{error}</div> : loading ? <div className="py-12 text-center text-muted-foreground">Đang tải bài viết…</div> : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        )}

        {/* Phân trang / Nút Load More */}
        <div className="flex justify-center pt-6">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted px-8">
            Xem thêm bài viết
          </Button>
        </div>

      </div>
    </PublicLayout>
  );
}