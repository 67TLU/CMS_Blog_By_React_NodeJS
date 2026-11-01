import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"; // Đường dẫn có thể đổi thành ../components/ui/dialog tùy cấu hình alias của bạn
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function AnnouncementModal({children}) {
  // Khởi tạo thẳng từ localStorage trong useState initializer — không cần effect setState
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const hideUntil = localStorage.getItem("hide_announcement_until");
      // Chưa từng ẩn hoặc đã quá 24h → hiện modal
      return !hideUntil || Date.now() > parseInt(hideUntil, 10);
    } catch {
      return true;
    }
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    // 2. Nếu người dùng tích chọn ẩn 24h, tính toán thời gian và lưu vào localStorage
    if (dontShowAgain) {
      const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // Hiện tại + 24 tiếng (tính bằng mili-giây)
      localStorage.setItem("hide_announcement_until", expiresAt.toString());
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">📢 Thông Báo Quan Trọng</DialogTitle>
          <DialogDescription className="text-center pt-2">
           {children? children : `Trang web sử dụng dữ liệu giả lập!
           Chi tiết về dữ liệu giả lập, vui lòng xem tại:
           - [Dữ liệu giả lập](/data-fake) `}
          </DialogDescription>
        </DialogHeader>

        {/* Khu vực Checkbox ẩn 24h (Dùng component của Shadcn) */}
        <div className="flex items-center space-x-2 py-4 ">
          <Checkbox 
            id="dont-show" 
            className="border-black/20 dark:border-white/20"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(!!checked)}
          />
          <label
            htmlFor="dont-show"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
          >
            Không hiển thị lại thông báo này trong 24 giờ tới
          </label>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Đồng ý & Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
