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

  const show = useCallback((opts) => {
    setOptions(opts)
    setIsOpen(true)
  }, [])

  const hide = useCallback(() => {
    setIsOpen(false)
    // Giữ nội dung trong lúc fade-out
    setTimeout(() => setOptions(null), 250)
  }, [])

  return (
    <DialogContext.Provider value={{ show, hide }}>
      {children}

      <Dialog open={isOpen} onOpenChange={(open) => !open && hide()}>
        {options && (
          <DialogContent
            className="sm:max-w-md rounded-2xl p-6 shadow-2xl border border-border bg-card text-card-foreground"
            aria-describedby={options.description ? "dialog-desc" : undefined}
          >
            <DialogHeader className="space-y-2 text-center sm:text-left">
              {options.title && (
                <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
                  {options.title}
                </DialogTitle>
              )}
              {options.description && (
                <DialogDescription id="dialog-desc" className="text-sm text-muted-foreground leading-relaxed">
                  {options.description}
                </DialogDescription>
              )}
            </DialogHeader>

            {options.content && (
              <div className="py-3">{options.content}</div>
            )}

            {options.footer && (
              <DialogFooter className="mt-2">{options.footer}</DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </DialogContext.Provider>
  )
}

export function useGlobalDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useGlobalDialog phải được đặt bên trong DialogProvider")
  }
  return context
}

/**
 * Hook mở dialog "đăng nhập để tiếp tục"
 * Gọi từ event handler — KHÔNG return JSX.
 */
export function useAccessLogin() {
  const dialog = useGlobalDialog()
  const navigate = useNavigate()

  return useCallback(() => {
    dialog.show({
      title: (
        <div className="flex flex-col items-center gap-1 text-center py-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Bạn chưa đăng nhập</span>
          <p className="text-sm text-muted-foreground font-normal mt-0.5">
            Vui lòng đăng nhập để thực hiện hành động này.
          </p>
        </div>
      ),
      footer: (
        <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="outline"
            onClick={dialog.hide}
            className="w-full sm:w-auto border-border"
          >
            Để sau
          </Button>
          <Button
            onClick={() => {
              dialog.hide()
              navigate("/login", { state: { from: window.location.pathname } })
            }}
            className="w-full sm:w-auto"
          >
            Đăng nhập ngay
          </Button>
        </div>
      ),
    })
  }, [dialog, navigate])
}