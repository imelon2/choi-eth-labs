"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function TransactionIndexPage() {
  const router = useRouter()
  const [hash, setHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateHash = (hash: string): boolean => {
    // 기본 이더리움 트랜잭션 해시 검증 (0x로 시작하고 66자리)
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hash.trim()) {
      setError("Please enter a transaction hash")
      return
    }

    if (!validateHash(hash)) {
      setError("Invalid transaction hash format. Must start with 0x followed by 64 hexadecimal characters.")
      return
    }

    setError(null)
    setIsLoading(true)
    router.push(`/transaction/${hash}`)
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">EVM Transaction Analyzer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze and decode EVM blockchain transaction data with our powerful tools.
          Get detailed insights into transaction information, method calls, events, and batch data.
          Built by choi.eth for EVM blockchain developers.
        </p>
      </div>
      
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Enter Transaction Hash</CardTitle>
          <CardDescription>
            Enter an EVM blockchain transaction hash to decode and analyze transaction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={hash}
                onChange={(e) => {
                  setHash(e.target.value)
                  setError(null)
                }}
                className="font-mono text-sm"
              />
              <Button 
                type="submit" 
                className="h-10 px-4 shrink-0" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <SearchIcon className="h-4 w-4 mr-1" />
                )}
                Search
              </Button>
            </div>
            
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="bg-muted/50 rounded-lg p-4 mt-6">
              <h3 className="font-medium mb-2">Example Transaction Hashes</h3>
              <div className="space-y-2">
                {[
                  "0x2959cd3d09cca9b1e302e9feba8b3ba36b0dd75dff95bbfd3a146170d6f97aa2",
                  "0x1c4e12cd8576bc82eeb8e4c8a5841f5d1b42e9d8c7dfc43d7c6d2d96ee8a0ac7"
                ].map((exampleHash, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <code className="text-xs font-mono bg-muted p-1 rounded">
                      {exampleHash}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setHash(exampleHash)
                        setError(null)
                      }}
                    >
                      Use this example
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 mt-10">
        <Card className="hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn how to use our blockchain tools
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              View documentation and API references
            </p>
            <Link href="#">
              <Button variant="outline" size="sm">
                View Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 