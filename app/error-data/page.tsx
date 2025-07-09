"use client"

import { useState } from "react"
import { Loader2, AlertCircle, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import copy from "copy-to-clipboard"
import { decodeErrorData } from "@/lib/eth"
import { JsonViewer } from "@/components/ui/json-viewer"

// Function to convert BigInt to string for JSON
const jsonReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export default function ErrorDataPage() {
  const [errorData, setErrorData] = useState("")
  const [decodedData, setDecodedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!errorData.trim()) {
      setError("Please enter error data")
      return
    }

    // Validate hex format
    if (!errorData.startsWith("0x") || !/^0x[0-9a-fA-F]*$/.test(errorData)) {
      setError("Invalid hex format. Input must start with 0x and contain only hex characters")
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      // Call the decodeErrorData function from lib/eth.ts
      const result = await decodeErrorData(errorData)
      
      // Set empty object if result is null so UI can still render
      setDecodedData(result || { raw: errorData })
    } catch (err) {
      setError(`Decoding error: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    copy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check if decoded content exists
  const hasDecodedContent = () => {
    if (!decodedData) return false;
    
    // Return true if errorName exists or params exists and is not empty
    return !!(
      decodedData.errorName || 
      (decodedData.params && Object.keys(decodedData.params).length > 0)
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Ethereum Error Data Decoder</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Easily decode Ethereum error data with this tool.
          Enter hex data to see the decoded results.
        </p>
      </div>
      
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Enter Error Data</CardTitle>
          <CardDescription>
            Enter the error data you want to decode in hex format (starting with 0x)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDecode} className="space-y-4">
            <div>
              <label htmlFor="errorData" className="text-sm font-medium mb-1 block">
                Error Data (hex)
              </label>
              <Input
                id="errorData"
                placeholder="0x..."
                value={errorData}
                onChange={(e) => {
                  setErrorData(e.target.value)
                  setError(null)
                }}
                className="font-mono text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Decoding...
                </>
              ) : (
                "Decode"
              )}
            </Button>
            
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      
      {decodedData && (
        <Card className="mt-8 border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Decoded Result</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleCopy(JSON.stringify(decodedData, null, 2))}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasDecodedContent() ? (
              <div className="flex flex-col items-center text-center py-6">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                <h3 className="text-lg font-medium">Unable to decode error data</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  The ABI for this error signature could not be found. The error might be using a custom or unknown format.
                </p>
                
                <div className="bg-muted/50 p-3 rounded-md mt-4 w-full">
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-muted-foreground mr-2">Raw error data:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(decodedData.raw || errorData)}
                      className="h-6 px-2"
                    >
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs font-mono break-all">{decodedData.raw || errorData}</code>
                </div>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-border">
                {/* Error Information */}
                {decodedData.errorName && (
                  <div className="pb-4">
                    <h3 className="text-sm font-medium mb-2">Error Information</h3>
                    <div className="p-3">
                      <div className="mb-1">
                        <span className="text-sm text-muted-foreground mr-2">Name:</span>
                        <span className="font-medium">
                          {decodedData.errorName}
                        </span>
                      </div>
                      {/* Display error signature */}
                      <div>
                        <span className="text-sm text-muted-foreground mr-2">Signature:</span>
                        <code className="text-xs font-mono">
                          {decodedData.signature || ''}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Decoded Parameters (JSON) */}
                {decodedData.params && Object.keys(decodedData.params).length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Decoded Parameters</h3>
                    <JsonViewer 
                      data={JSON.parse(JSON.stringify(decodedData.params, jsonReplacer))} 
                      initialExpanded={true}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}