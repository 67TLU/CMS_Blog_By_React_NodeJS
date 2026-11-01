/* eslint react-hooks/set-state-in-effect: off */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Send, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import FormPost from "@/components/editor/Docx";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";
export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    categoryId: "",
    coverImage: "",
    content: "",
  });
  
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]); const [saving, setSaving] = useState(false); const { addToast } = useToast();
  useEffect(() => { api.get("/articles/home").then(r => { const list = r?.data?.categories || []; setCategories(list); if (list[0]) setFormData(f => ({ ...f, categoryId: String(list[0].id) })); }).catch(e => addToast(e.message, "error")); }, [addToast]);
  const handleSubmit = async (e, status = "DRAFT") => {
    e.preventDefault();
    if (!formData.title.trim() || !content.trim() || !formData.categoryId) { addToast("Vui lòng nhập tiêu đề, chọn chuyên mục và soạn nội dung.", "error"); return; }
    setSaving(true);
    try { await api.post("/articles", { title: formData.title.trim(), excerpt: formData.excerpt, content, coverImage: formData.coverImage || null, categoryId: Number(formData.categoryId), status }); addToast(status === "DRAFT" ? "Đã lưu bản nháp" : "Đã gửi bài chờ duyệt"); navigate("/author/articles"); }
    catch (error) { addToast(error.message || "Không lưu được bài viết", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Tạo bài viết mới</h1>
            <p className="text-xs text-muted-foreground">Soạn thảo nội dung và gửi duyệt</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, "DRAFT")} disabled={saving}
            className="border-border hover:bg-muted gap-2 text-foreground"
          >
            <Save className="w-4 h-4" /> {saving ? "Đang lưu…" : "Lưu bản nháp"}
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, "PENDING")} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 gap-2 font-semibold"
          >
            <Send className="w-4 h-4" /> {saving ? "Đang gửi…" : "Gửi duyệt"}
          </Button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Nội dung chính (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tiêu đề bài viết *</label>
            <Input
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-card border-border text-foreground text-lg font-semibold h-12 focus-visible:ring-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tóm tắt ngắn (Excerpt)</label>
            <Textarea
              placeholder="Mô tả ngắn gọn nội dung bài viết (1-2 câu)..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="bg-card border-border text-foreground"
              rows={3}
            />
          </div>

          <div className="space-y-2">
<FormPost setContent={setContent} content={content} />
          </div>
        </div>

        {/* Cột phải: Thiết lập bài viết (Sidebar) */}
        <div className="space-y-4">
          <Card className="bg-card border-border text-foreground">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-sm border-b border-border pb-2">Cấu hình bài viết</h3>

              {/* Chọn chuyên mục */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Chuyên mục</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-muted border border-border rounded-md p-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Chọn chuyên mục</option>
                  {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                </select>
              </div>

              {/* Link ảnh bìa */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">URL Ảnh bìa (Featured Image)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="bg-muted border-border text-foreground text-xs"
                  />
                </div>
              </div>

              {/* Preview ảnh bìa */}
              {formData.coverImage ? (
                <div className="rounded-lg overflow-hidden border border-border h-32">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                  <span className="text-xs">Dán URL ảnh để xem trước</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}