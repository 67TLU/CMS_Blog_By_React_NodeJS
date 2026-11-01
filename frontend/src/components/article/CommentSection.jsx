/* eslint react-hooks/set-state-in-effect: off */
import { useState, useEffect, useCallback } from "react";
import { api, assetUrl } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { MessageSquare } from "lucide-react";

import { useAccessLogin } from "@/context/DialogProvider";
import { useAuth } from "@/context/AuthContext";
import CommentForm from "./CommentForm";
import CommentFilter from "./CommentFilter";
import CommentItem from "./CommentItem";
import ReportCommentDialog from "./ReportCommentDialog";

function mapComment(item) {
  const author = item.author || {};
  return { id: item.id, authorId: author.id || item.authorId, author: author.name || item.authorName || item.author || "Người dùng", avatar: assetUrl(author.avatar || item.authorAvatar || item.avatar), content: item.content || "", likes: Number(item.likesCount ?? item.likes ?? 0), createdAt: item.createdAt, replies: (item.replies || []).map((reply) => ({ ...mapComment(reply), replyToId: reply.replyToId, replyToAuthor: reply.replyToAuthorName || reply.replyToAuthor, parentId: reply.parentId })), replyToId: item.replyToId, replyToAuthor: item.replyToAuthorName || item.replyToAuthor };
}

export default function CommentSection({ article }) {
  const { user } = useAuth();
  const showAccessLogin = useAccessLogin();

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [filter, setFilter] = useState("NEWEST");
  const { addToast } = useToast();
  const loadComments = useCallback(async () => {
    try { const response = await api.get(`/articles/${article.id}/comments?page=1&limit=50&sort=${filter === "MOST_LIKED" ? "most_liked" : "newest"}`); setComments((response?.data?.items || []).map(mapComment)); }
    catch (error) { addToast(error.message || "Không tải được bình luận", "error"); }
    finally { setLoadingComments(false); }
  }, [article.id, filter, addToast]);
  useEffect(() => { loadComments(); }, [loadComments]);

  const [newComment, setNewComment] = useState("");

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [isLiked, setIsLiked] = useState({});

  const [expandedReplies, setExpandedReplies] = useState({});

  const [reportingComment, setReportingComment] =
    useState(null);

  const [reportReason, setReportReason] = useState("");

  const [reportSuccess, setReportSuccess] =
    useState(false);

  // =========================================================
  // COMMENT
  // =========================================================

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return showAccessLogin();
    const content = newComment.trim(); if (!content) return;
    try { await api.post(`/articles/${article.id}/comments`, { content }); setNewComment(""); await loadComments(); addToast("Đã gửi bình luận"); }
    catch (error) { addToast(error.message || "Không gửi được bình luận", "error"); }
  };

  // =========================================================
  // REPLY
  // =========================================================

  const startReply = ({
    parentId,
    replyToId,
    replyToAuthor,
  }) => {
    if (!user) {
      showAccessLogin();
      return;
    }

    setReplyingTo({
      parentId,
      replyToId,
      replyToAuthor,
    });

    setReplyContent("");
    setEditingId(null);

    setExpandedReplies((prev) => ({
      ...prev,
      [parentId]: true,
    }));
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleAddReply = async () => {
    if (!user || !replyingTo) return;
    const content = replyContent.trim(); if (!content) return;
    try { await api.post(`/articles/${article.id}/comments`, { content, parentId: Number(replyingTo.parentId), replyToId: Number(replyingTo.replyToId || replyingTo.parentId) }); setExpandedReplies((prev) => ({ ...prev, [replyingTo.parentId]: true })); cancelReply(); await loadComments(); addToast("Đã gửi phản hồi"); }
    catch (error) { addToast(error.message || "Không gửi được phản hồi", "error"); }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdateComment = async () => {
    const content = editContent.trim(); if (!content || !editingId) return;
    try { await api.patch(`/comments/${editingId}`, { content }); cancelEdit(); await loadComments(); addToast("Đã cập nhật bình luận"); }
    catch (error) { addToast(error.message || "Không cập nhật được bình luận", "error"); }
  };

  // =========================================================
  // LIKE
  // =========================================================

  const handleLike = async (commentId, isReply = false, parentId = null) => {
    if (!user) return showAccessLogin();
    const currentlyLiked = !!isLiked[commentId];
    try {
      if (currentlyLiked) await api.delete(`/comments/${commentId}/like`);
      else await api.post(`/comments/${commentId}/like`, {});
      setIsLiked((prev) => ({ ...prev, [commentId]: !currentlyLiked }));
      setComments((prev) => prev.map((comment) => {
        if (!isReply && comment.id === commentId) return { ...comment, likes: Math.max(0, comment.likes + (currentlyLiked ? -1 : 1)) };
        if (isReply && comment.id === parentId) return { ...comment, replies: comment.replies.map((reply) => reply.id === commentId ? { ...reply, likes: Math.max(0, reply.likes + (currentlyLiked ? -1 : 1)) } : reply) };
        return comment;
      }));
    } catch (error) { addToast(error.message || "Không thể cập nhật lượt thích", "error"); }
  };

  // =========================================================
  // REPLIES
  // =========================================================

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // =========================================================
  // REPORT
  // =========================================================

  const openReport = (comment) => {
    setReportingComment(comment);
    setReportReason("");
    setReportSuccess(false);
  };

  const closeReport = () => {
    setReportingComment(null);
    setReportReason("");
    setReportSuccess(false);
  };

  const submitReport = async () => {
    if (!user) return showAccessLogin();
    if (!reportReason || !reportingComment) return;
    const reasonMap = { "Spam / Quảng cáo rác": "SPAM", "Ngôn từ thù hận / Xúc phạm": "HATE_SPEECH", "Thông tin sai sự thật": "FAKE_NEWS", "Lý do khác": "OTHER" };
    try { await api.post(`/comments/${reportingComment.id}/reports`, { reason: reasonMap[reportReason] || "OTHER", ...(reportReason === "Lý do khác" ? { note: "Người dùng báo cáo nội dung khác" } : {}) }); setReportSuccess(true); }
    catch (error) { addToast(error.message || "Không gửi được báo cáo", "error"); }
  };

  // =========================================================
  // DELETE
  // =========================================================
  const handleDeleteComment = async (commentId) => {
    try { await api.delete(`/comments/${commentId}`); if (editingId === commentId) cancelEdit(); await loadComments(); addToast("Đã xóa bình luận"); }
    catch (error) { addToast(error.message || "Không xóa được bình luận", "error"); }
  };

  // =========================================================
  // SORT
  // =========================================================

  const sortedComments = [...comments].sort(
    (a, b) => {
      if (filter === "MOST_LIKED") {
        return b.likes - a.likes;
      }

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="space-y-6 border-t border-border pt-6">
      {/* Header */}
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <h3
          className="
            flex
            items-center
            gap-2
            text-xl
            font-bold
            tracking-tight
            text-foreground
          "
        >
          <MessageSquare className="h-5 w-5 text-primary" />

        Bình luận ({comments.length})
        </h3>

        <CommentFilter
          filter={filter}
          onChange={setFilter}
        />
      </div>

        {/* Add comment — chỉ user đã đăng nhập mới thấy form */}
          <CommentForm
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
          />

      {/* Comments */}
      <div className="space-y-4">
        {loadingComments && <p className="py-4 text-center text-sm text-muted-foreground">Đang tải bình luận…</p>}
        {!loadingComments && sortedComments.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Chưa có bình luận. Hãy là người đầu tiên chia sẻ ý kiến.</p>}
        {sortedComments.map((comment) => (
          <CommentItem
            user={user}
            key={comment.id}
            comment={comment}
            liked={!!isLiked[comment.id]}
            expanded={
              !!expandedReplies[comment.id]
            }
            replyingTo={replyingTo}
            replyContent={replyContent}
            onLike={handleLike}
            onReply={startReply}
            onReport={openReport}
            onDelete={handleDeleteComment}
            onToggleReplies={toggleReplies}
            onReplyContentChange={setReplyContent}
            onSubmitReply={handleAddReply}
            onCancelReply={cancelReply}
            editingId={editingId}
            editContent={editContent}
            onEdit={startEdit}
            onEditChange={setEditContent}
            onSubmitEdit={handleUpdateComment}
            onCancelEdit={cancelEdit}
            isLiked={isLiked}
          />
        ))}

        {sortedComments.length === 0 && (
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-border
              bg-muted/30
              p-10
              text-center
            "
          >
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="text-sm font-medium text-foreground">
              Chưa có bình luận nào
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Hãy là người đầu tiên chia sẻ ý kiến.
            </p>
          </div>
        )}
      </div>

      {/* Report */}
      <ReportCommentDialog
        comment={reportingComment}
        reason={reportReason}
        success={reportSuccess}
        onReasonChange={setReportReason}
        onSubmit={submitReport}
        onClose={closeReport}
      />
    </section>
  );
}
