"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Loader2, AlertCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { JsonViewer } from "@/components/ui/json-viewer"
import { CopyButton } from "@/components/ui/copy-button"
import { toast } from "@/components/ui/use-toast"
import { 
  fetchTransactionData, 
  decodeCallData, 
  decodeEvents, 
  fetchBatchData,
  type TransactionData, 
  type DecodedCallData, 
  type DecodedEvent,
  type BatchData
} from "@/lib/eth"
import React, { use } from "react"
import { ARB_BATCH_POSTING_SIGNATURES } from "@/lib/constant"

// BigInt를 문자열로 변환하는 replacer 함수
const jsonReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

// ABI 조회를 위한 기본 URL (함수에서 URL을 반환하지 않을 경우 사용)
const getDefaultAbiUrl = (methodSignature: string | undefined): string => {
  if (!methodSignature) return 'https://www.4byte.directory/signatures/';
  
  // 메소드 시그니처에서 괄호와 매개변수 추출
  const methodName = methodSignature.split('(')[0];
  return `https://www.4byte.directory/signatures/?bytes4_signature=${methodName}`;
};

export default function TransactionPage({ params }: { params: Promise<{ hash: string }> }) {
  const router = useRouter()
  // Next.js 15에서는 params가 Promise이므로 React.use()로 unwrap
  const resolvedParams = use(params) as { hash: string }
  const [hash, setHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [decodedCallData, setDecodedCallData] = useState<DecodedCallData | null>(null)
  const [abiUrl, setAbiUrl] = useState<string>("")
  const [decodedEvents, setDecodedEvents] = useState<DecodedEvent[] | null>(null)
  const [batchData, setBatchData] = useState<BatchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)

  // 페이지 로드 시 URL에서 해시를 확인하고 데이터 로드
  useEffect(() => {
    async function initializeWithParams() {
      try {
        const hashValue = resolvedParams?.hash || ""
        setHash(hashValue)
        if (hashValue) {
          await fetchData(hashValue)
        }
      } catch (err) {
        console.error("Error initializing with params:", err)
      }
    }
    
    initializeWithParams()
  }, [resolvedParams])

  const validateHash = (hash: string): boolean => {
    // 기본 이더리움 트랜잭션 해시 검증 (0x로 시작하고 66자리)
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  }

  const fetchData = async (txHash: string) => {
    if (!txHash.trim()) {
      setError("Please enter a transaction hash")
      return
    }

    if (!validateHash(txHash)) {
      setError("Invalid transaction hash format. Must start with 0x followed by 64 hexadecimal characters.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setTransaction(null)
      setDecodedCallData(null)
      setDecodedEvents(null)
      setBatchData(null)
      setAbiUrl("")

      // Get transaction data
      const txData = await fetchTransactionData(txHash)
      
      if (!txData) {
        setError("Transaction not found")
        return
      }

      setTransaction(txData)

      // Decode call data
      const callData = await decodeCallData(txData.rawInput)
      setDecodedCallData(callData)
      
      // ABI URL이 반환되면 저장 (변환 없이 그대로 사용)
      if ('url' in callData && callData.url) {
        setAbiUrl(callData.url as string)
      }

      // Decode event data - 트랜잭션에서 반환된 로그 사용
      const events = await decodeEvents(txData.logs)
      setDecodedEvents(events)
      
      // Get batch data (if available)
      try {
        // rawInput의 앞 10글자가 ARB_BATCH_POSTING_SIGNATURES 배열에 있는지 확인
        const inputPrefix = txData.rawInput.substring(0, 10)
        
        // ARB_BATCH_POSTING_SIGNATURES에 포함된 경우에만 Batch Data 호출
        if (ARB_BATCH_POSTING_SIGNATURES.includes(inputPrefix) && callData.params) {
          try {
            // 네트워크 정보에서 chainId 추출
            const networkMatch = txData.network.match(/\((\d+)\)$/);
            const chainId = networkMatch ? parseInt(networkMatch[1], 10) : undefined;
            
            // ARB_BATCH_POSTING_SIGNATURES에 포함되어 있으면 params만 전달
            const batch = await fetchBatchData(callData.params);
            if (batch) {
              setBatchData(batch)
            }
          } catch (paramErr) {
            console.error("Error processing params for batch data:", paramErr)
            // 오류 발생 시에도 setBatchData는 호출하지 않음
          }
        }
      } catch (err) {
        console.error("Error fetching batch data:", err)
        // We don't set an error here because batch data is optional
      }
    } catch (err) {
      setError("Error while fetching transaction data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hash.trim()) {
      setError("Please enter a transaction hash")
      return
    }
    
    if (!validateHash(hash)) {
      setError("Invalid transaction hash format. Must start with 0x followed by 64 hexadecimal characters.")
      return
    }
    
    if (hash !== resolvedParams.hash) {
      router.push(`/transaction/${hash}`)
    } else {
      await fetchData(hash)
    }
  }

  // 이벤트 인덱스 변경 함수
  const goToNextEvent = () => {
    if (decodedEvents && currentEventIndex < decodedEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1)
    }
  }

  const goToPrevEvent = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Analysis</h1>

      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            placeholder="0x..."
            value={hash}
            onChange={(e) => {
              setHash(e.target.value)
              if (error) setError(null)
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
      </form>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            {error === "Transaction not found" && (
              <p className="text-sm mt-1">
                Make sure you entered a valid transaction hash that exists on the Ethereum network.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Fetching transaction data...</span>
        </div>
      )}

      {/* Transaction results */}
      {transaction && !isLoading && (
        <div className="space-y-6">
          {/* Transaction basic info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex justify-between items-center">
                <span>Transaction Information</span>
                <CopyButton 
                  value={JSON.stringify(transaction, jsonReplacer, 2)} 
                  className="h-8 w-8"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Hash" value={transaction.hash} copyable />
                <InfoRow label="Network" value={transaction.network} />
                <InfoRow label="Status" value={transaction.status} />
                <InfoRow label="Block" value={transaction.block.toString()} />
                <InfoRow label="Timestamp" value={transaction.timestamp} />
                <InfoRow label="From" value={transaction.from} copyable />
                {transaction.isContractCreation ? (
                  <InfoRow 
                    label="To" 
                    value={transaction.to || "Contract Creation"} 
                    copyable={!!transaction.to}
                    isContractCreation={transaction.isContractCreation}
                  />
                ) : (
                  <InfoRow label="To" value={transaction.to || ""} copyable />
                )}
                <InfoRow label="Value" value={transaction.value} />
                <InfoRow label="Gas Price" value={transaction.gasPrice} />
                <InfoRow label="Gas Used" value={transaction.gasUsed.toString()} />
                <InfoRow label="Nonce" value={transaction.nonce.toString()} />
              </div>
            </CardContent>
          </Card>

          {/* Raw Input Decoding */}
          {transaction.rawInput && transaction.rawInput !== "0x" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Raw Input Decoding</span>
                  <div className="flex items-center gap-2">
                    <CopyButton 
                      value={transaction.rawInput} 
                      className="h-8 w-8"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {decodedCallData ? (
                  <div className="space-y-4">
                    <div className="pb-4">
                      <h3 className="text-sm font-medium mb-2">Method Information</h3>
                      <div className="p-3">
                        <div className="mb-1">
                          <span className="text-sm text-muted-foreground mr-2">Name:</span>
                          <span className="font-medium">
                            {decodedCallData.method || ''}
                          </span>
                          {decodedCallData.method && abiUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 py-0 ml-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary-foreground transition-colors"
                              onClick={() => window.open(abiUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              ABI
                            </Button>
                          )}
                        </div>
                        {decodedCallData.funcSignature && (
                          <div>
                            <span className="text-sm text-muted-foreground mr-2">Signature:</span>
                            <code className="text-xs font-mono">{decodedCallData.funcSignature}</code>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <JsonViewer data={JSON.parse(JSON.stringify(decodedCallData.params || {}, jsonReplacer))} />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p>Raw input data: <code className="text-xs font-mono">{transaction.rawInput}</code></p>
                    <p className="mt-2">Unable to decode input data. This might be a custom or unknown method.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Logs Decoding */}
          {decodedEvents !== null && decodedEvents.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Event Logs</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {currentEventIndex + 1} / {decodedEvents.length} Events
                  </span>
                </CardTitle>
              </CardHeader>
              {decodedEvents.length > 1 && (
                <div className="px-6 pb-2 pt-0 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevEvent}
                    disabled={currentEventIndex === 0}
                    className="flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Event
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextEvent}
                    disabled={currentEventIndex === decodedEvents.length - 1}
                    className="flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    Next Event
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardContent>
                {decodedEvents.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{decodedEvents[currentEventIndex].name || 'Unknown Event'}</h4>
                        {decodedEvents[currentEventIndex].name && decodedEvents[currentEventIndex].name !== 'Unknown Event' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary-foreground transition-colors"
                            onClick={() => window.open(decodedEvents[currentEventIndex].url || getDefaultAbiUrl(decodedEvents[currentEventIndex].name), '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            ABI
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0 text-xs font-medium text-muted-foreground cursor-not-allowed opacity-50"
                            disabled
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            ABI
                          </Button>
                        )}
                      </div>
                      <CopyButton value={JSON.stringify(decodedEvents[currentEventIndex], jsonReplacer, 2)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <InfoRow label="Topics" value={decodedEvents[currentEventIndex].topics.length.toString()} copyable={false} />
                    </div>
                    
                    <div className="space-y-4">
                      {decodedEvents[currentEventIndex].name && decodedEvents[currentEventIndex].name !== 'Unknown Event' && (
                        <div>
                          <h5 className="font-medium mb-2">Parameters</h5>
                          <JsonViewer data={JSON.parse(JSON.stringify(decodedEvents[currentEventIndex].params, jsonReplacer))} />
                        </div>
                      )}
                      
                      <div>
                        <h5 className="font-medium mb-2">Topics</h5>
                        <JsonViewer data={JSON.parse(JSON.stringify(decodedEvents[currentEventIndex].topics, jsonReplacer))} initialExpanded={false} />
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Raw Data</h5>
                        <div className="rounded-md overflow-x-auto">
                          <JsonViewer data={{"data": decodedEvents[currentEventIndex].rawData}} initialExpanded={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Batch Data */}
          {batchData && (batchData.rollupData || batchData.daCert) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Batch Data</span>
                  <CopyButton 
                    value={JSON.stringify(batchData, jsonReplacer, 2)} 
                    className="h-8 w-8"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <div className="space-y-4">
                    {batchData.rollupData && (
                      <div>
                        <h5 className="font-medium mb-2">Rollup Data</h5>
                        <JsonViewer data={JSON.parse(JSON.stringify(batchData.rollupData, jsonReplacer))} initialExpanded={false} />
                      </div>
                    )}
                    
                    {batchData.daCert && (
                      <div>
                        <h5 className="font-medium mb-2">DA Cert</h5>
                        <JsonViewer data={JSON.parse(JSON.stringify(batchData.daCert, jsonReplacer))} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string
  copyable?: boolean
  isContractCreation?: boolean
}

function InfoRow({ label, value, copyable, isContractCreation }: InfoRowProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground mb-1">{label}</span>
      <div className="flex items-center gap-2 break-all">
        <span className="text-sm font-medium">{value}</span>
        {isContractCreation && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            Contract Creation
          </span>
        )}
        {copyable && value && (
          <CopyButton value={value} className="h-6 w-6 -mr-1.5" />
        )}
      </div>
    </div>
  )
} 