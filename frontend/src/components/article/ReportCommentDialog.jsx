import { AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

export default function ReportCommentDialog({
  comment,
  reason,
  success,
  onReasonChange,
  onSubmit,
  onClose,
}) {
  if (!comment) return null;

  return (
    <Dialog
      open={!!comment}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-9">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2 p-1.5">
            <AlertCircle className="w-5 h-5 text-red-500" />

            Báo cáo bình luận vi phạm
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground">
            Vui lòng chọn lý do báo cáo để Ban quản trị xử lý.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Cảm ơn bạn!
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Báo cáo của bạn đã được gửi tới Ban quản trị để xử lý.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Nội dung bị báo cáo
              </p>

              <p className="text-sm text-foreground">
                "{comment.content}"
              </p>
            </div>

            {comment.replyToAuthor && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Bình luận này đang trả lời
                </p>

                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  @{comment.replyToAuthor}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Lý do báo cáo
              </label>

              <Select
                value={reason}
                onValueChange={onReasonChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lý do báo cáo..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Spam / Quảng cáo rác">
                    Spam / Quảng cáo rác
                  </SelectItem>

                  <SelectItem value="Ngôn từ thù hận / Xúc phạm">
                    Ngôn từ thù hận / Xúc phạm
                  </SelectItem>

                  <SelectItem value="Thông tin sai sự thật">
                    Thông tin sai sự thật
                  </SelectItem>

                  <SelectItem value="Lý do khác">
                    Lý do khác
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Hủy
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={onSubmit}
                disabled={!reason}
              >
                Gửi báo cáo
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
