"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          theme !== "dark" ? "bg-muted text-primary-foreground" : "text-muted-foreground"
        }`}
        onClick={() => setTheme("light")}
        aria-label="라이트 모드로 전환"
      >
        <SunIcon className="h-5 w-5" />
      </button>
      <button
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          theme === "dark" ? "bg-muted text-primary-foreground" : "text-muted-foreground"
        }`}
        onClick={() => setTheme("dark")}
        aria-label="다크 모드로 전환"
      >
        <MoonIcon className="h-5 w-5" />
      </button>
    </div>
  )
} 