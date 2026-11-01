import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import ArticleCard from "@/components/cards/ArticleCard";
import { ArticleCardSkeleton } from "@/components/cards/Skeletons";
import { api } from "@/lib/api";
import { toCardArticle } from "@/lib/articleAdapter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function HomePage() {
  const [homeData, setHomeData] = useState({ breaking: null, featured: [], topStories: [], latest: [] });
  const [pageError, setPageError] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [extraArticles, setExtraArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);//Khoi tao so bai viet mac dinh hien thi la 8
  const [loadingMore, setLoadingMore] = useState(false);//khoi tao trang thai loading khi load them bai viet
  const loadMoreTimer = useRef(null);

  // Cleanup timer nếu user rời trang trước khi load more xong
  useEffect(() => () => clearTimeout(loadMoreTimer.current), []);

  useEffect(() => {
    let active = true;
    api.get("/articles/home").then((res) => {
      if (!active) return;
      const d = res?.data || {};
      const featuredList = Array.isArray(d.featured) ? d.featured : d.featured ? [d.featured] : [];
      setHomeData({ breaking: d.breaking ? toCardArticle(d.breaking) : null, featured: featuredList.map(toCardArticle), topStories: (d.topStories || []).map(toCardArticle), latest: (d.latest || []).map(toCardArticle) }); setHasMore((d.latest || []).length < Number(res?.meta?.latestTotal || (d.latest || []).length));
    }).catch((error) => { if (active) setPageError(error.message); });
    return () => { active = false; };
  }, []);
  const featuredArticle = homeData.featured[0] || homeData.breaking || homeData.latest[0];
  const topStories = homeData.topStories;
  const latestArticles = [...homeData.latest, ...extraArticles].filter((a, index, list) => a.id !== featuredArticle?.id && list.findIndex((x) => String(x.id) === String(a.id)) === index);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await api.get(`/articles?page=${nextPage}&limit=8`);
      const nextItems = (response?.data?.items || []).map(toCardArticle);
      setExtraArticles((prev) => [...prev, ...nextItems]); setCurrentPage(nextPage); setVisibleCount((prev) => prev + nextItems.length);
      setHasMore(nextItems.length === 8 && (response?.meta?.totalPages || nextPage) > nextPage);
    } catch (error) { setPageError(error.message || "Không tải thêm được bài viết."); }
    finally { setLoadingMore(false); }
  };

  if (!featuredArticle && pageError) return <PublicLayout><div className="rounded-xl border border-border p-10 text-center"><h1 className="text-xl font-bold">Chưa thể tải trang chủ</h1><p className="mt-2 text-sm text-muted-foreground">{pageError}</p><Button className="mt-4" onClick={() => window.location.reload()}>Thử lại</Button></div></PublicLayout>;
  if (!featuredArticle) return <PublicLayout><div className="mx-auto max-w-4xl space-y-4 py-12"><ArticleCardSkeleton /><ArticleCardSkeleton /></div></PublicLayout>;
  return (
    <PublicLayout>
      <div className="space-y-8">
        {pageError && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">Không tải được dữ liệu từ máy chủ: {pageError}</div>}
        {!featuredArticle && !pageError && <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">Đang tải tin tức mới nhất…</div>}
        {/* Section: Breaking News Ticker (Dải tin nóng) */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-2.5 shadow-2xs overflow-hidden">
          <Badge className="bg-red-600 hover:bg-red-700 text-white shrink-0 flex items-center gap-1 text-xs uppercase tracking-wider py-1">
            <Flame className="w-3.5 h-3.5 animate-bounce" /> Tin nóng
          </Badge>
          <div className="overflow-hidden whitespace-nowrap text-sm text-foreground flex-1">
            <Link
              to={`/article/${featuredArticle.slug || featuredArticle.id}`}
              className="hover:text-red-500 transition-colors font-medium inline-block truncate max-w-full"
            >
              {featuredArticle.title} — {featuredArticle.excerpt}
            </Link>
          </div>
          <Link
            to="/articles"
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 shrink-0 font-medium"
          >
            Tất cả tin <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Section: Tin nổi bật & Top Stories */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Bài Featured lớn */}
          <div className="lg:col-span-2 min-h-[380px]">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>

          {/* Cột phải: Câu chuyện hàng đầu (Top Stories) */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span>Câu chuyện hàng đầu</span>
                </h3>
                <span className="text-xs text-muted-foreground">Cập nhật liên tục</span>
              </div>

              <div className="space-y-4">
                {topStories.map((item, idx) => (
                  <Link
                    key={item.id}
                    to={`/article/${item.slug || item.id}`}
                    className="flex gap-3 group cursor-pointer pb-3 border-b border-border/50 last:border-none last:pb-0"
                  >
                    <span className="text-xl font-black text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 w-6">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{item.publishedAt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/category/tin-tuc"
              className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Xem thêm tiêu điểm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Section: Lưới bài viết mới nhất (Latest News Grid) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-5 bg-primary rounded-full inline-block" />
              <span>Tin tức mới nhất</span>
            </h2>
            <div className="flex items-center gap-2">
              <Link to="/category/cong-nghe">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                  Công nghệ
                </Badge>
              </Link>
              <Link to="/category/the-thao">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                  Thể thao
                </Badge>
              </Link>
              <Link to="/category/tai-chinh">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                  Tài chính
                </Badge>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {latestArticles.slice(0, visibleCount).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {/* Skeleton cho các bài sẽ được tải thêm */}
            {loadingMore &&
              Array.from({ length: 4 }).map((_, idx) => (
                <ArticleCardSkeleton key={`skeleton-more-${idx}`} />
              ))}
          </div>

          {/* Nút Tải thêm bài viết */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="gap-2 px-8 py-2 font-medium cursor-pointer border-border hover:bg-muted"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Đang tải thêm...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Xem thêm bài viết khác
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}