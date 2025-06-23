"use client"

import { useState } from "react"
import { Loader2, AlertCircle, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import copy from "copy-to-clipboard"
import { decodeCalldata } from "@/lib/eth"
import { JsonViewer } from "@/components/ui/json-viewer"

// BigInt를 문자열로 변환하는 replacer 함수
const jsonReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export default function CallDataPage() {
  const [calldata, setCalldata] = useState("")
  const [decodedData, setDecodedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!calldata.trim()) {
      setError("Please enter calldata")
      return
    }

    // Validate hex format
    if (!calldata.startsWith("0x") || !/^0x[0-9a-fA-F]*$/.test(calldata)) {
      setError("Invalid hex format. Input must start with 0x and contain only hex characters")
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      // Call the decodeCalldata function from lib/eth.ts
      const result = await decodeCalldata(calldata)
      
      // 결과가 null이어도 빈 객체를 설정하여 UI가 렌더링될 수 있게 함
      setDecodedData(result || { raw: calldata })
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

  // 디코딩 결과가 있는지 확인하는 함수
  const hasDecodedContent = () => {
    if (!decodedData) return false;
    
    // method가 있거나 params가 있고 비어있지 않은 경우 true 반환
    return !!(
      (decodedData.method && 
       (typeof decodedData.method === 'string' || Object.keys(decodedData.method).length > 0)) || 
      (decodedData.params && Object.keys(decodedData.params).length > 0)
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Ethereum Calldata Decoder</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Easily decode Ethereum calldata with this tool.
          Enter hex data to see the decoded results.
        </p>
      </div>
      
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Enter Calldata</CardTitle>
          <CardDescription>
            Enter the calldata you want to decode in hex format (starting with 0x)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDecode} className="space-y-4">
            <div>
              <label htmlFor="calldata" className="text-sm font-medium mb-1 block">
                Calldata (hex)
              </label>
              <Input
                id="calldata"
                placeholder="0x..."
                value={calldata}
                onChange={(e) => {
                  setCalldata(e.target.value)
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
                <h3 className="text-lg font-medium">Unable to decode calldata</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  The ABI for this function signature could not be found. The calldata might be using a custom or unknown method.
                </p>
                
                <div className="bg-muted/50 p-3 rounded-md mt-4 w-full">
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-muted-foreground mr-2">Raw calldata:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(decodedData.raw || calldata)}
                      className="h-6 px-2"
                    >
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs font-mono break-all">{decodedData.raw || calldata}</code>
                </div>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-border">
                {/* Method Information */}
                {decodedData.method && (
                  <div className="pb-4">
                    <h3 className="text-sm font-medium mb-2">Method Information</h3>
                    <div className="p-3">
                      <div className="mb-1">
                        <span className="text-sm text-muted-foreground mr-2">Name:</span>
                        <span className="font-medium">
                          {typeof decodedData.method === 'string' ? decodedData.method : decodedData.method.name}
                        </span>
                        {decodedData.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0 ml-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary-foreground transition-colors"
                            onClick={() => window.open(decodedData.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            ABI
                          </Button>
                        )}
                      </div>
                      {/* Display function signature */}
                      <div>
                        <span className="text-sm text-muted-foreground mr-2">Signature:</span>
                        <code className="text-xs font-mono">
                          {typeof decodedData.method === 'string' ? 
                            (decodedData.funcSignature || '') : 
                            decodedData.method.signature}
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

const formatHex = (hex: string): string => {
  // 16진수 문자열을 보기 좋게 공백으로 구분
  if (!hex.startsWith('0x')) return hex
  
  const data = hex.slice(2)
  let formatted = ''
  
  for (let i = 0; i < data.length; i += 2) {
    formatted += data.slice(i, i + 2) + ' '
  }
  
  return formatted.trim()
} 