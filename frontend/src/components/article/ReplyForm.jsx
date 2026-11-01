import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReplyForm({
  replyToAuthor,
  value,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div
      className="
        ml-8
        mt-4
        space-y-3
        rounded-lg
        border
        border-border
        bg-muted/30
        p-3
        sm:ml-12
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Đang trả lời{" "}
          <span className="font-semibold text-primary">
            @{replyToAuthor}
          </span>
        </div>
      </div>

      <Textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Trả lời @${replyToAuthor}...`}
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
          onClick={onCancel}
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
        >
          Hủy
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          size="sm"
          className="gap-1.5"
        >
          <Reply className="h-3.5 w-3.5" />
          Trả lời
        </Button>
        
      </div>
    </div>
  );
}
