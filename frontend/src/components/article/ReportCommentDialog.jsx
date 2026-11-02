import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Flag, MessageSquare } from "lucide-react";

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

const REPORT_REASONS = [
  { value: "Spam / Quảng cáo rác", label: "Spam / Quảng cáo không liên quan" },
  { value: "Ngôn từ thù hận / Xúc phạm", label: "Ngôn từ thù hận / Xúc phạm người khác" },
  { value: "Thông tin sai sự thật", label: "Thông tin sai sự thật / Lừa đảo" },
  { value: "Lý do khác", label: "Nội dung phản cảm / Lý do khác" },
];

export default function ReportCommentDialog({
  comment,
  reason,
  success,
  onReasonChange,
  onSubmit,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!comment) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={!!comment}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold leading-none">
                Báo cáo bình luận
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Gửi phản ánh tới Ban quản trị để giữ gìn môi trường văn minh.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Đã gửi báo cáo thành công!
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Cảm ơn bạn đã đóng góp. Ban biên tập sẽ kiểm duyệt và xử lý nội dung vi phạm sớm nhất.
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={onClose} className="w-full">
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Trích đoạn bình luận */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nội dung bị báo cáo:</span>
              </div>
              <p className="text-sm text-foreground italic line-clamp-3 bg-background/50 p-2 rounded-md border border-border/40">
                "{comment.content}"
              </p>
            </div>

            {/* Chọn lý do */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-destructive" /> Chọn lý do vi phạm:
              </label>
              <Select value={reason} onValueChange={onReasonChange}>
                <SelectTrigger className="w-full h-10 border-border">
                  <SelectValue placeholder="-- Chọn nguyên nhân phù hợp --" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="cursor-pointer text-sm">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto border-border"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo vi phạm"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
