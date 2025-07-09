"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Terminal, HexagonIcon, AlertTriangle } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  const goToHome = () => {
    router.push("/")
    closeSidebar()
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="fixed left-4 top-4 z-50 block md:hidden"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-2 overflow-y-auto border-r p-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={goToHome}>
              <Terminal className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">choi.eth Labs</h1>
            </div>
            <button 
              className="md:hidden" 
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 py-4">
            <div className="mb-6">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Data Parsing
              </p>
              <ul className="space-y-1">
                <li
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted cursor-pointer ${
                    pathname === "/transaction" || pathname?.startsWith("/transaction/")
                      ? "bg-muted text-primary" 
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    router.push("/transaction")
                    closeSidebar()
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span>Transaction Data</span>
                </li>
                <li
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted cursor-pointer ${
                    pathname === "/calldata" || pathname?.startsWith("/calldata/")
                      ? "bg-muted text-primary" 
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    router.push("/calldata")
                    closeSidebar()
                  }}
                >
                  <HexagonIcon width="24" height="24" />
                  <span>Calldata Decoder</span>
                </li>
                <li
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted cursor-pointer ${
                    pathname === "/error-data" || pathname === "/error-decode" || pathname?.startsWith("/error-data/")
                      ? "bg-muted text-primary" 
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    router.push("/error-data")
                    closeSidebar()
                  }}
                >
                  <AlertTriangle width="24" height="24" />
                  <span>Error Decoder</span>
                </li>
              </ul>
            </div>
          </nav>

          <div className="mt-auto">
            <div className="mt-4 text-xs text-muted-foreground">
              <p>© 2024 choi.eth Labs</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 