"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface CopyButtonProps {
  value: string
  className?: string
  iconClassName?: string
}

export function CopyButton({ value, className = "", iconClassName = "" }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((error) => {
        console.error("Clipboard copy failed:", error)
      })
  }

  return (
    <button
      className={`inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
      onClick={copyToClipboard}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <Check className={`h-4 w-4 text-primary ${iconClassName}`} />
      ) : (
        <Copy className={`h-4 w-4 ${iconClassName}`} />
      )}
    </button>
  )
} 