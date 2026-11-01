import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
let initialArticles = []
const ArticleContext = createContext();
export function ArticleProvider({ children }) {
  const [articles, setArticles] = useState(initialArticles);
  const { addToast } = useToast();

  // Tác giả tạo bài viết mới
  const createArticle = useCallback(
    (articleData) => {
      const newArt = {
        ...articleData,
        id: `art-${Date.now()}`,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: articleData.isDraft ? "draft" : "pending",
      };
      setArticles((prev) => [newArt, ...prev]);
      addToast(articleData.isDraft ? "Đã lưu bản nháp thành công" : "Đã gửi bài viết chờ phê duyệt!");
    },
    [addToast]
  );

  // Admin/Editor Phê duyệt bài viết
  const approveArticle = useCallback(
    (id) => {
      setArticles((prev) =>
        prev.map((art) => (art.id === id ? { ...art, status: "published" } : art))
      );
      addToast("Đã duyệt và xuất bản bài viết thành công!");
    },
    [addToast]
  );

  // Admin/Editor Từ chối bài viết
  const rejectArticle = useCallback(
    (id, reason) => {
      setArticles((prev) =>
        prev.map((art) => (art.id === id ? { ...art, status: "rejected", rejectReason: reason } : art))
      );
      addToast("Đã từ chối bài viết và gửi phản hồi cho tác giả", "error");
    },
    [addToast]
  );

  // Xóa bài viết
  const deleteArticle = useCallback(
    (id) => {
      setArticles((prev) => prev.filter((art) => art.id !== id));
      addToast("Đã xóa bài viết thành công!");
    },
    [addToast]
  );

  // Memoize value → các consumer không re-render vô ích
  const value = useMemo(
    () => ({
      articles,
      publishedArticles: articles.filter((a) => a.status === "published"),
      pendingArticles: articles.filter((a) => a.status === "pending"),
      createArticle,
      approveArticle,
      rejectArticle,
      deleteArticle,
    }),
    [articles, createArticle, approveArticle, rejectArticle, deleteArticle]
  );

  return <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>;
}

export const useArticles = () => useContext(ArticleContext);