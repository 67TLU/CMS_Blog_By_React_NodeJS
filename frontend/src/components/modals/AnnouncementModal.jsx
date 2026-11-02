import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";

export default function AnnouncementModal({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const hideUntil = localStorage.getItem("hide_announcement_until");
      return !hideUntil || Date.now() > parseInt(hideUntil, 10);
    } catch {
      return true;
    }
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("hide_announcement_until", expiresAt.toString());
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-1">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Chào mừng đến với Portal News
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            {children ? (
              children
            ) : (
              "Hệ thống tin tức và blog công nghệ liên tục cập nhật 24/7. Hãy đăng ký hoặc đăng nhập tài khoản để lưu bài viết, bình luận và theo dõi các tác giả yêu thích."
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Checkbox ẩn 24h */}
        <div className="flex items-center space-x-2.5 py-3 px-1 mt-2 bg-muted/40 rounded-lg border border-border/50">
          <Checkbox 
            id="dont-show" 
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(!!checked)}
          />
          <label
            htmlFor="dont-show"
            className="text-xs text-muted-foreground font-medium leading-none cursor-pointer select-none"
          >
            Không nhắc lại thông báo này trong 24 giờ tới
          </label>
        </div>

        <DialogFooter className="mt-2">
          <Button onClick={handleClose} className="w-full h-10 font-medium">
            Khám phá ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
