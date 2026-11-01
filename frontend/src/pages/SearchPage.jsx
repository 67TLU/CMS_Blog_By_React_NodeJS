/* eslint react-hooks/set-state-in-effect: off */
import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { Search, Filter, Calendar, Home, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, queryString } from "@/lib/api";
import { toCardArticle } from "@/lib/articleAdapter";
import { useEffect } from "react";

const CATEGORIES = ["ALL", "Công nghệ", "Thể thao", "Tài chính", "Thời tiết", "Tin tức"];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!queryParam.trim()) { setResults([]); return; }
    let active = true; setLoading(true); setError("");
    const categoryName = selectedCategory === "ALL" ? undefined : selectedCategory;
    api.get(`/articles/search${queryString({ q: queryParam.trim(), category: categoryName, page: 1, limit: 30 })}`)
      .then((res) => { if (active) setResults((res?.data?.items || []).map(toCardArticle)); })
      .catch((err) => { if (active) { setError(err.message); setResults([]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [queryParam, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: keyword });
  };

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">
            {queryParam ? `Kết quả: "${queryParam}"` : "Tìm kiếm"}
          </span>
        </nav>

        {/* Thanh tìm kiếm chính — semantic tokens */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xs">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Tìm kiếm bài viết
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm (ví dụ: AI, Thể thao, Kinh tế)..."
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12"
            />
            <Button
              type="submit"
              className="h-12 px-6 font-semibold gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="w-4 h-4" /> Tìm
            </Button>
          </form>
          {queryParam && (
            <p className="text-sm text-muted-foreground">
              Tìm thấy{" "}
              <strong className="text-foreground">{results.length}</strong> kết quả cho từ khóa{" "}
              <span className="text-primary font-semibold">"{queryParam}"</span>
            </p>
          )}
        </div>

        {/* Bộ lọc & Kết quả */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar lọc — semantic tokens */}
          <div className="bg-card border border-border rounded-xl p-4 h-fit space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Filter className="w-4 h-4 text-primary" /> Bộ lọc chuyên mục
            </h3>
            <div className="space-y-1 text-sm">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat === "ALL" ? "Tất cả chuyên mục" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách bài viết tìm được — semantic tokens */}
          <div className="lg:col-span-3 space-y-4">
            {error ? <div className="rounded-xl border border-amber-500/30 p-6 text-sm text-amber-700">{error}</div> : loading ? <div className="py-12 text-center text-muted-foreground">Đang tìm kiếm…</div> : results.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-xs">
                <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-semibold text-foreground mb-1">Không tìm thấy kết quả</p>
                <p className="text-sm">Thử từ khóa khác hoặc bỏ chọn bộ lọc chuyên mục.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug || article.id}`}
                    className="flex flex-col sm:flex-row gap-4 bg-card border border-border hover:border-primary/40 hover:shadow-md rounded-xl p-4 transition-all group"
                  >
                    <img
                      src={article.image}
                      alt=""
                      className="w-full sm:w-48 h-32 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="space-y-2 flex-1 min-w-0">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase">
                        {article.category}
                      </Badge>
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h2>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {article.publishedAt}
                        </span>
                        {article.author && (
                          <span className="text-foreground/70">Bởi {article.author}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}