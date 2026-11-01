import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Share2, Bookmark, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {useAccessLogin} from "@/context/DialogProvider"
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
export default function ArticleCard({ article, variant = "default" }) {
  const navigate = useNavigate();
  const {user} = useAuth() 
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleUrl = `/article/${article.slug || article.id}`;
  const authorProfileUrl = `/author-profile/${article.authorId || 101}`;
  const categoryUrl = `/category/${article.categorySlug || "tin-tuc"}`;
const showAccessLogin = useAccessLogin()
  const handleBookmark = async (e) => {
    if (!user) return showAccessLogin();
    e.preventDefault(); e.stopPropagation();
    try {
      if (isSaved) await api.delete(`/articles/${article.id}/bookmark`);
      else await api.post(`/articles/${article.id}/bookmark`, {});
      setIsSaved((saved) => !saved);
    } catch (error) { console.error(error); }
  };
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${articleUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAuthorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(authorProfileUrl);
  };

  const handleCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(categoryUrl);
  };

  if (variant === "featured") {
    return (
      <Link to={articleUrl} className="block h-full group">
        <Card className="relative overflow-hidden rounded-xl h-full border border-border shadow-md bg-card">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[380px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                onClick={handleCategoryClick}
                className="w-fit bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs"
              >
                {article.category}
              </Badge>
              {article.readingTime && (
                <span className="text-xs text-zinc-300 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> {article.readingTime}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold line-clamp-2 mb-2 group-hover:text-red-300 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>

            <div className="flex items-center justify-between text-xs text-zinc-300 pt-3 border-t border-white/20">
              <span
                onClick={handleAuthorClick}
                className="hover:underline hover:text-white font-medium cursor-pointer"
              >
                Bởi {article.author}
              </span>
              <div className="flex items-center gap-3">
                <span>{article.publishedAt}</span>
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-label="Lưu bài viết"
                  className="p-1 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Chia sẻ bài viết"
                  className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={articleUrl} className="block h-full group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border-border bg-card text-card-foreground">
        <div className="relative h-44 overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            decoding="async"
            width={600}
            height={440}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            onClick={handleCategoryClick}
            className="absolute top-2.5 left-2.5 bg-background/80 hover:bg-background text-foreground backdrop-blur-md border border-border/50 text-[11px] cursor-pointer"
          >
            {article.category}
          </Badge>
        </div>
        <CardContent className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-snug">
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-auto">
            <span
              onClick={handleAuthorClick}
              className="hover:text-foreground font-medium truncate max-w-[120px] cursor-pointer"
            >
              {article.author}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">{article.publishedAt}</span>
              <button
                type="button"
                onClick={handleBookmark}
                title={isSaved ? "Bỏ lưu bài" : "Lưu bài viết"}
                className="p-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                title={copied ? "Đã sao chép liên kết" : "Chia sẻ bài viết"}
                className="p-1 hover:text-foreground transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}