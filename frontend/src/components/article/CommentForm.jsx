import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CommentForm({
  value,
  onChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="
        space-y-3
        rounded-xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
      "
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
        className="
          min-h-[100px]
          resize-none
          border-input
          bg-background
          text-foreground
          placeholder:text-muted-foreground
          focus-visible:ring-1
          focus-visible:ring-ring
        "
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!value.trim()}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Gửi bình luận
        </Button>
      </div>
    </form>
  );
}
