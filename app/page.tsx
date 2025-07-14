"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, Terminal, Code } from "lucide-react"

export default function Home() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-12 w-12 text-primary" />
          <h1 className="text-8xl font-bold tracking-tight">choi.eth Labs</h1>
        </div>
        
        <div className="relative w-40 h-40 mb-4 mt-4">
          <Image 
            src="https://avatars.githubusercontent.com/u/80299090?v=4"
            alt="choi.eth profile"
            width={160}
            height={160}
            className="object-cover"
            style={{ borderRadius: '50%', border: '2px solid rgba(147, 51, 234, 0.3)' }}
          />
        </div>
        
        <div className="flex items-center gap-4 mt-2 mb-4">
          <Link 
            href="https://github.com/imelon2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-6 w-6" />
          </Link>
          <Link 
            href="https://x.com/Choi__eth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
            </svg>
          </Link>
          <Link 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </Link>
        </div>
        
        <p className="text-lg text-muted-foreground mb-4">
          Advanced blockchain data analysis tools for EVM developers
        </p>
      </div>

      <div className="mt-8">
        <Link href="/transaction" className="flex items-center justify-center hover:text-primary transition-colors">
          <Code className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-mono">EVM Transaction Analyzer</h2>
        </Link>
      </div>
      <div className="mt-8">
        <Link href="/calldata" className="flex items-center justify-center hover:text-primary transition-colors">
          <Code className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-mono">EVM Calldata Decoder</h2>
        </Link>
      </div>
      <div className="mt-8">
        <Link href="/error-data" className="flex items-center justify-center hover:text-primary transition-colors">
          <Code className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-mono">EVM Error Decoder</h2>
        </Link>
      </div>
    </div>
  )
}
