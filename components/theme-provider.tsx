"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  attribute?: string
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = "data-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    function removeThemeClasses() {
      root.classList.remove("light", "dark")
    }

    function applyTheme(newTheme: string) {
      if (disableTransitionOnChange) {
        document.documentElement.classList.add("disable-transitions")
        requestAnimationFrame(() => {
          document.documentElement.classList.remove("disable-transitions")
        })
      }

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        
        root.classList.add(systemTheme)
        root.setAttribute(attribute, systemTheme)
      } else {
        root.classList.add(newTheme)
        root.setAttribute(attribute, newTheme)
      }
    }

    removeThemeClasses()
    applyTheme(theme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        removeThemeClasses()
        const newTheme = mediaQuery.matches ? "dark" : "light"
        root.classList.add(newTheme)
        root.setAttribute(attribute, newTheme)
      }
    }

    if (enableSystem) {
      mediaQuery.addEventListener("change", handleChange)
    }

    return () => {
      if (enableSystem) {
        mediaQuery.removeEventListener("change", handleChange)
      }
    }
  }, [theme, attribute, disableTransitionOnChange, enableSystem])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}

export { ThemeProvider, useTheme } 