import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { formatViews } from "@/ulitis/formatTime";
import PublicLayout from "@/layouts/PublicLayout";
import ArticleCard from "@/components/cards/ArticleCard";
import { api } from "@/lib/api";
import { toDetailArticle } from "@/lib/articleAdapter";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useAccessLogin } from "@/context/DialogProvider";
// Icons
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  AArrowUp,
  AArrowDown,
  ChevronRight,
  Home,
  Edit,
  Check,
} from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentSection from "@/components/article/CommentSection";
import NotFoundPage from "@/pages/system/NotFoundPage";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [articleError, setArticleError] = useState("");
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { addToast } = useToast();
  useEffect(() => {
    let active = true;
    api.get(`/articles/${encodeURIComponent(id)}`).then((res) => {
      if (!active) return;
      const mapped = toDetailArticle(res?.data || {});
      setArticle(mapped); setArticleError(""); setLoadedId(id);
      setLikes(Number(mapped.likesCount || 0)); setIsLiked(!!mapped.isLiked); setIsSaved(!!mapped.isBookmarked);
      api.post(`/articles/${encodeURIComponent(id)}/view`, {}).catch(() => {});
    }).catch((error) => { if (active) { setArticleError(error.message || "Không tải được bài viết."); setLoadedId(id); } });
    return () => { active = false; };
  }, [id]);
  const [fontSize, setFontSize] = useState("text-base"); // text-sm, text-base, text-lg
  const [copied, setCopied] = useState(false);
  const showAccessLogin = useAccessLogin();
  // Thanh tiến độ đọc bài (Reading Progress Bar)
  const [readingProgress, setReadingProgress] = useState(0);

  // rAF throttle: chỉ setState tối đa ~1 lần/trang frame, listener passive
  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId !== null) return; // đã có frame chờ xử lý
      rafId = requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const currentProgress = (window.scrollY / totalHeight) * 100;
          setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
        }
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Early return PHẢI đặt sau toàn bộ hooks (rules of hooks)
  if (loadedId !== id) return <PublicLayout><div className="mx-auto max-w-4xl py-16 text-center text-muted-foreground">Đang tải bài viết…</div></PublicLayout>;
  if (!article) return articleError ? <PublicLayout><div className="mx-auto max-w-3xl rounded-xl border border-border p-10 text-center"><h1 className="text-xl font-bold">Không thể mở bài viết</h1><p className="mt-2 text-sm text-muted-foreground">{articleError}</p><Link className="mt-4 inline-block text-primary hover:underline" to="/">Quay về trang chủ</Link></div></PublicLayout> : <NotFoundPage />;

  const handleLike = async () => {
    if (!user) return showAccessLogin();
    try {
      if (isLiked) await api.delete(`/articles/${article.id}/like`);
      else await api.post(`/articles/${article.id}/like`, {});
      setIsLiked(!isLiked); setLikes((prev) => Math.max(0, prev + (isLiked ? -1 : 1)));
    } catch (error) { addToast(error.message || "Không thể cập nhật lượt thích", "error"); }
  };

  const handleShare = () => {
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedArticles = article.related || [];
  const popularArticles = article.popular || [];

  const canEdit = user && (user.role === "admin" || Number(user.id) === Number(article.authorId));

  return (
    <PublicLayout>
      {/* Reading Progress Bar ghim trên mép trên */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/category/${article.categorySlug || "tin-tuc"}`}
            className="hover:text-foreground transition-colors"
          >
            {article.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-[280px] md:max-w-md font-semibold">
            {article.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI & GIỮA: Nội dung chính bài viết (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Bài viết */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Link to={`/category/${article.categorySlug || "tin-tuc"}`}>
                  <Badge className="bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs">
                    {article.category}
                  </Badge>
                </Link>

                {/* Phím tắt chỉnh sửa bài cho Tác giả / Admin */}
                {canEdit && (
                  <Link to={`/author/edit/${article.id}`}>
                    <Button variant="outline" size="xs" className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10">
                      <Edit className="w-3 h-3" /> Chỉnh sửa bài
                    </Button>
                  </Link>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {article.title}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground font-medium italic border-l-4 border-primary pl-4 py-1 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Author Meta */}
              <div className="flex flex-wrap items-center justify-between border-y border-border py-3.5 gap-4 text-sm text-muted-foreground">
                <Link
                  to={`/author-profile/${article.authorId || 101}`}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <Avatar className="w-10 h-10 border border-border group-hover:border-primary transition-colors">
                    <AvatarImage src={article.authorAvatar || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{article.author?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {article.author}
                    </p>
                    <p className="text-xs text-muted-foreground">{article.publishedAt}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {article.readingTime || "3 phút đọc"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                    <Eye className="w-3.5 h-3.5 text-primary" /> {formatViews(article.views)} lượt xem
                  </span>
                </div>
              </div>
            </div>

            {/* Thanh tương tác (Action Bar) */}
            <div className="flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={`gap-1.5 cursor-pointer ${
                    isLiked
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-white text-white" : ""}`} />
                  <span>{likes}</span>
                </Button>

                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={async () => {
                    if (!user) return showAccessLogin();
                    try {
                      if (isSaved) await api.delete(`/articles/${article.id}/bookmark`);
                      else await api.post(`/articles/${article.id}/bookmark`, {});
                      setIsSaved(!isSaved);
                    } catch (error) { addToast(error.message || "Không thể cập nhật bài đã lưu", "error"); }
                  }}
                  className={`gap-1.5 cursor-pointer ${
                    isSaved
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  <span>{isSaved ? "Đã lưu" : "Lưu bài"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1.5 border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? "Đã copy" : "Chia sẻ"}</span>
                </Button>
              </div>

              {/* Điều chỉnh cỡ chữ */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 cursor-pointer ${fontSize === "text-sm" ? "bg-background text-foreground shadow-2xs font-bold" : "text-muted-foreground"}`}
                  onClick={() => setFontSize("text-sm")}
                  title="Thu nhỏ chữ"
                >
                  <AArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 text-xs font-bold cursor-pointer ${fontSize === "text-base" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground"}`}
                  onClick={() => setFontSize("text-base")}
                  title="Cỡ chữ mặc định"
                >
                  A
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 cursor-pointer ${fontSize === "text-lg" ? "bg-background text-foreground shadow-2xs font-bold" : "text-muted-foreground"}`}
                  onClick={() => setFontSize("text-lg")}
                  title="Phóng to chữ"
                >
                  <AArrowUp className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Ảnh bìa bài viết */}
            <div className="rounded-xl overflow-hidden border border-border shadow-xs bg-muted">
              <img
                src={article.image}
                alt={article.title}
                width={1200}
                height={460}
                decoding="async"
                className="w-full max-h-[460px] object-cover"
              />
            </div>

            {/* Nội dung bài viết — sanitize bằng DOMPurify để chống XSS */}
            <div
              className={`prose dark:prose-invert max-w-none space-y-4 text-foreground leading-relaxed ${fontSize}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  article.content || `<p>Nội dung bài viết đang được cập nhật...</p>`
                ),
              }}
            />

            {/* Tags của bài viết */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                <span className="text-xs text-muted-foreground font-semibold">Từ khóa:</span>
                {article.tags.map((tag) => (
                  <Link key={tag} to={`/tag/${String(tag).toLowerCase().replace(/\s+/g, "-")}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Khu vực Bình luận — key theo article để state reset khi đổi bài */}
            <div className="pt-8 border-t border-border">
              <CommentSection key={article.id} article={article} />
            </div>
          </div>

          {/* CỘT PHẢI: Sidebar (Related & Popular Articles) */}
          <div className="space-y-6">
            {/* Bài viết xem nhiều nhất */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-base text-foreground border-b border-border pb-3 flex items-center gap-2">
                <span className="w-2 h-4 bg-red-500 rounded-full" />
                Đọc nhiều nhất
              </h3>
              <div className="space-y-4">
                {popularArticles.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/article/${item.slug || item.id}`}
                    className="flex gap-3 group cursor-pointer"
                  >
                    <span className="text-2xl font-black text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0">
                      0{index + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{formatViews(item.views)} lượt xem</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bài viết liên quan */}
            <div className="space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <span className="w-2 h-4 bg-primary rounded-full" />
                Bài viết liên quan
              </h3>
              <div className="space-y-4">
                {relatedArticles.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
