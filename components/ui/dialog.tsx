"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
}

const Dialog = React.forwardRef<
  HTMLDivElement,
  DialogProps
>(({ className, isOpen, onClose, ...props }, ref) => {
  if (!isOpen) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/50 p-4",
        className
      )}
      onClick={onClose}
      {...props}
    />
  )
})
Dialog.displayName = "Dialog"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card rounded-lg shadow-lg max-w-md w-full p-6",
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  />
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex gap-2 justify-end mt-6", className)}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }