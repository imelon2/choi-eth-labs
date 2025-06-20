"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

export type ToastActionElement = React.ReactElement<{
  className?: string
  onPress: () => void
}>

const ToastProvider = React.memo(
  function ToastProvider({ children }: { children: React.ReactNode }) {
    return <div className="relative">{children}</div>
  }
)
ToastProvider.displayName = "ToastProvider"

const ToastViewport = React.memo(
  function ToastViewport() {
    return (
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    )
  }
)
ToastViewport.displayName = "ToastViewport"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border bg-background",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.memo(
  function Toast({
    className,
    variant,
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toastVariants>) {
    return (
      <div
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.memo(
  function ToastTitle({
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <h2
        className={cn("font-semibold", className)}
        {...props}
      />
    )
  }
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.memo(
  function ToastDescription({
    className,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
      <p
        className={cn("text-sm opacity-90", className)}
        {...props}
      />
    )
  }
)
ToastDescription.displayName = "ToastDescription"

const ToastClose = React.memo(
  function ToastClose({
    className,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
      <button
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100",
          className
        )}
        {...props}
      >
        <X className="h-4 w-4" />
      </button>
    )
  }
)
ToastClose.displayName = "ToastClose"

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} 