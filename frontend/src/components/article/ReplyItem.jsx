import {
  Heart,
  Reply,
  Flag,
  Pen,
  Trash2,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import formatRelativeTime from "@/ulitis/formatTime";
import { Can } from "@casl/react";
import { subject } from "@casl/ability";

export default function ReplyItem({
  reply,
  parentComment,
  liked,
  onLike,
  onReply,
  onReport,
  onDelete,
  user
}) {
  return (
    <div
      className="
        group
        space-y-2
        rounded-lg
        p-2
        -mx-2
        transition-colors
        hover:bg-muted/40
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={reply.avatar} />

          <AvatarFallback className="text-[10px]">
            {reply.author?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            {reply.author}
          </span>
          {reply.authorId === user?.id && user?.role=='admin' && (
            <span
              className="
                rounded-full
                border
                border-primary/20
                bg-primary/10
                px-1.5
                py-0.5
                text-[9px]
                font-semibold
                text-primary
              "
            >
              admin
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {(formatRelativeTime(reply.createdAt))}
          </span>
        </div>
      </div>

      {/* Reply to */}
      {reply.replyToAuthor && (
        <div className="pl-9">
          <button
            type="button"
            className="
              text-[11px]
              text-primary
              hover:underline
            "
          >
            ↳ Trả lời{" "}
            <span className="font-semibold">
              @{reply.replyToAuthor}
            </span>
          </button>
        </div>
      )}

      {/* Content */}
      <p
        className="
          pl-9
          text-sm
          leading-5
          text-foreground/85
          whitespace-pre-wrap
          break-words
        "
      >
        {reply.content}
      </p>

      {/* Actions */}
      <div
        className="
          flex
          items-center
          gap-4
          pl-9
          text-[11px]
          text-muted-foreground
        "
      >
        <button
          type="button"
          onClick={() =>
            onLike(reply.id, true, parentComment.id)
          }
          className={`
            flex
            items-center
            gap-1
            transition-colors
            ${
              liked
                ? "text-destructive"
                : "hover:text-destructive"
            }
          `}
        >
          <Heart
            className={`h-3 w-3 ${
              liked ? "fill-current" : ""
            }`}
          />

          {reply.likes}
        </button>

        <button
          type="button"
          onClick={() =>
            onReply({
              parentId: parentComment.id,
              replyToId: reply.id,
              replyToAuthor: reply.author,
            })
          }
          className="
            flex
            items-center
            gap-1
            hover:text-primary
          "
        >
          <Reply className="h-3 w-3" />
          Trả lời
        </button>

        {user?.id !== reply.authorId && (
          <button
            type="button"
            onClick={() => onReport(reply)}
            className="
              flex
              items-center
              gap-1
              hover:text-destructive
            "
          >
            <Flag className="h-3 w-3" />
            Report
          </button>
        )}
        <Can do="update" on={subject("Comment", reply)}>
          <button
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
        <Can do="delete" on={subject("Comment", reply)}>
          <button
            type="button"
            onClick={() => onDelete(reply.id)}
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
    </div>
  );
}
