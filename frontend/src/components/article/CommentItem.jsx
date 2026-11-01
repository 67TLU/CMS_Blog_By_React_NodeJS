import {
  Heart,
  Reply,
  Flag,
  Pen,
  Check,
  Trash2,
} from "lucide-react";
import formatRelativeTime from "@/ulitis/formatTime";
import { Can } from "@casl/react";
import { subject } from "@casl/ability";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import ReplyItem from "./ReplyItem";
import ReplyForm from "./ReplyForm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CommentItem({
  comment,
  liked,
  expanded,
  replyingTo,
  replyContent,
  user,
  onLike,
  onReply,
  onReport,
  onDelete,
  onToggleReplies,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  editingId,
  editContent,
  onEdit,
  onEditChange,
  onSubmitEdit,
  onCancelEdit,
  isLiked,
}) {
  const replies = comment.replies ?? [];

  const visibleReplies = expanded
    ? replies
    : replies.slice(0, 1);

  const isEditing = editingId === comment.id;

  const isReplying =
    replyingTo?.parentId === comment.id;

  return (
    <article
      className="
        rounded-xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        transition-shadow
        hover:shadow-md
      "
    >
      {/* Comment header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 border border-border">
            <AvatarImage src={comment.avatar} />

            <AvatarFallback>
              {comment.author?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {comment.author}
              </span>

              {user?.role === "admin" && user?.id === comment.authorId && (
                <span
                  className="
                  
                    rounded-full
                    border
                    border-primary/20
                    bg-primary/10
                    px-2
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-primary
                  "
                >
                  admin
                </span>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground">
              {(formatRelativeTime(comment.createdAt))}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2 pl-12 pt-2">
          <Textarea
            autoFocus
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder="Sửa bình luận..."
            className="
              min-h-[75px]
              resize-none
              border-input
              bg-background
              text-foreground
              placeholder:text-muted-foreground
              focus-visible:ring-1
              focus-visible:ring-ring
            "
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={onCancelEdit}
            >
              Hủy
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onSubmitEdit}
              disabled={!editContent.trim()}
              className="gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <p
          className="
            pl-12
            pt-2
            text-sm
            leading-6
            text-foreground/90
            whitespace-pre-wrap
            break-words
          "
        >
          {comment.content}
        </p>
      )}

      {/* Actions */}
      <div
        className="
          flex
          items-center
          gap-4
          pl-12
          pt-3
          text-xs
          text-muted-foreground
        "
      >
        <button
          type="button"
          onClick={() => onLike(comment.id)}
          className={`
            flex
            items-center
            gap-1
            ${
              liked
                ? "text-destructive"
                : "hover:text-destructive"
            }
          `}
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              liked ? "fill-current" : ""
            }`}
          />

          {comment.likes}
        </button>

        <button
          type="button"
          onClick={() =>
            onReply({
              parentId: comment.id,
              replyToId: comment.id,
              replyToAuthor: comment.author,
            })
          }
          className="
            flex
            items-center
            gap-1
            hover:text-primary
          "
        >
          <Reply className="h-3.5 w-3.5" />
          Trả lời
        </button>

        {user && user.id !== comment.authorId && (
          <button
            type="button"
            onClick={() => onReport(comment)}
            className="
              flex
              items-center
              gap-1
              hover:text-destructive
            "
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
        )}

        {/* Sửa — chỉ khi có quyền update trên comment này */}
        <Can do="update" on={subject("Comment", comment)}>
          <button
            onClick={() => onEdit(comment)}
            type="button"
            className="
              flex
              items-center
              gap-1
              hover:text-primary
            "
          >
            <Pen className="h-3.5 w-3.5" />
            Sửa
          </button>
        </Can>

        {/* Xóa — chỉ khi có quyền delete trên comment này */}
        <Can do="delete" on={subject("Comment", comment)}>
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="
              flex
              items-center
              gap-1
              hover:text-destructive
            "
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa
          </button>
        </Can>
      </div>

      {/* Reply form */}
      {isReplying && (
        <ReplyForm
          replyToAuthor={replyingTo.replyToAuthor}
          value={replyContent}
          onChange={onReplyContentChange}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      )}

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div
          className="
            ml-4
            mt-4
            border-l-2
            border-border
            pl-4
            sm:ml-8
          "
        >
          <div className="space-y-3">
            {visibleReplies.map((reply) => (
              <ReplyItem
                key={reply.id}
                user={user}
                reply={reply}
                parentComment={comment}
                liked={!!isLiked?.[reply.id]}
                onLike={onLike}
                onReply={onReply}
                onReport={onReport}
                onDelete={onDelete}
              />
            ))}
          </div>

          {replies.length >= 2 && (
            <button
              type="button"
              onClick={() =>
                onToggleReplies(comment.id)
              }
              className="
                ml-9
                mt-3
                text-xs
                font-semibold
                text-primary
                hover:underline
              "
            >
              {expanded
                ? "Thu gọn"
                : `Xem thêm ${
                    replies.length - 1
                  } phản hồi`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
