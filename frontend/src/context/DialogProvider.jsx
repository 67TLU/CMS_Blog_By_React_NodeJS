"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const DialogContext = createContext(undefined)

export function DialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState(null)

  // Hàm mở dialog nhận vào một object chứa: title, description, content, footer
  const show = useCallback((opts) => {
    setOptions(opts)
    setIsOpen(true)
  }, [])

  // Hàm đóng dialog
  const hide = useCallback(() => {
    setIsOpen(false)
    // Delay xóa options 200ms để giữ chữ/nội dung không bị biến mất 
    // đột ngột trong khi Dialog đang chạy hiệu ứng đóng (fade-out)
    setTimeout(() => setOptions(null), 200)
  }, [])

  return (
    <DialogContext.Provider value={{ show, hide }}>
      {children}

      {/* Render cấu trúc Dialog thực tế tại đây */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && hide()}>
        {options && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="mb-2 text-lg font-semibold text-center sm:text-left">
                {options.title}
              </DialogTitle>
              {options.description && (
                <DialogDescription>{options.description}</DialogDescription>
              )}
            </DialogHeader>

            {/* Nội dung động ở giữa */}
            {options.content && <div className="py-4">{options.content}</div>}

            {/* Các nút bấm hành động ở dưới */}
            {options.footer && <DialogFooter>{options.footer}</DialogFooter>}
          </DialogContent>
        )}
      </Dialog>
    </DialogContext.Provider>
  )
}

// Custom hook viết ngắn gọn để các component con gọi dùng luôn
export function useGlobalDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useGlobalDialog phải được đặt bên trong DialogProvider")
  }
  return context
}
// Hook mở dialog "đăng nhập để tiếp tục" — gọi HÀM này từ event handler,
// KHÔNG return JSX (event handler không render được JSX).
export function useAccessLogin() {
  const dialog = useGlobalDialog()
  const navigate = useNavigate()

  return useCallback(() => {
dialog.show({
  title: (
      <div className="text-center flex flex-col space-y-1 gap-3">
        <h2 className=" text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Bạn chưa đăng nhập?
        </h2>
        <p className="text-sm text-muted-foreground font-normal">
          Vui lòng đăng nhập để thực hiện hành động này.
        </p>
        </div>
  ),
  // Bỏ description gốc vì đã gộp chung vào phần title để căn chỉnh layout đẹp hơn
  description: "", 
  footer: (
    <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:justify-end sm:gap-3 mt-2">
      <Button 
        variant="outline" 
        onClick={dialog.hide}
        className="w-full sm:w-auto border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
      >
        Hủy
      </Button>
      <Button
        onClick={() => {
          dialog.hide()
          navigate("/login",
            {state: { from: window.location.pathname }}
          )
        }}
        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-indigo-500/10 transition-all active:scale-[0.98]"
      >
        Đăng nhập ngay
      </Button>
    </div>
  ),
})
  }, [dialog, navigate])
}