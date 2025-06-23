import {
  decodeEventLog,
  decodeFunctionData,
  formatEther,
  formatUnits,
  getAbiItem,
  Log,
  toFunctionSignature,
} from "viem";
import { getChainClientFromChainId, MultiPublicClient } from "./client";
import { requestAbi } from "./http";
import {
  decodeEventLogNoErr,
  isDaCert,
  processObject,
  serializeDaCert,
  strip0x,
} from "./utils";

export interface TransactionData {
  hash: string;
  network: string;
  status: string;
  block: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  txFee: string;
  txType: string;
  gasPrice: string;
  gasUsed: string;
  index: number;
  nonce: number;
  rawInput: string;
  isContractCreation: boolean;
  contractAddress?: string;
  logs: any[];
}

export interface DecodedCallData {
  method?: string;
  params?: Record<string, any>;
  raw: string;
  url?: string;
  funcSignature?: string;
}

export interface DecodedEvent {
  name?: string;
  params?: Record<string, any>;
  topics: string[];
  rawData: string;
  url?: string;
}

export interface BatchData {
  transactions?: any[];
  rollupData?: any;
  daCert?: any;
}

// Temporary implementation: In reality, we would use Ethereum-related APIs or libraries to fetch data
export async function fetchTransactionData(
  hash: string
): Promise<TransactionData | null> {
  // In a real implementation, we would make API calls here

  if (!hash || hash.length !== 66 || !hash.startsWith("0x")) {
    return null;
  }

  const MultiClient = new MultiPublicClient();

  const tx = await MultiClient.getTransaction(hash as `0x${string}`);
  if (tx == null) {
    return null;
  }

  const MainClient = getChainClientFromChainId(tx.chainId!);
  const receipt = await MainClient!.getTransactionReceipt({
    hash: hash as `0x${string}`,
  });
  const block = await MainClient!.getBlock({ blockHash: tx.blockHash });

  // Check if this is a contract creation transaction
  const isContractCreation = tx.to == null ? true : false;

  // Example data (in a real implementation, we would transform API response data)
  return {
    hash,
    network: `${MainClient?.chain.name}(${MainClient?.chain.id})`,
    status: receipt.status,
    block: Number(block.number),
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    from: receipt.from,
    to: receipt.to || "",
    value: formatEther(tx.value),
    txFee:
      formatEther(receipt.gasUsed * receipt.effectiveGasPrice) +
      ` ${MainClient?.chain.nativeCurrency.symbol}`,
    txType: `${receipt.type}${tx.typeHex ? `(${tx.typeHex})` : ""}`,
    gasPrice: formatUnits(receipt.effectiveGasPrice, 9) + " gwei",
    gasUsed: receipt.gasUsed.toString(),
    index: receipt.transactionIndex,
    nonce: tx.nonce,
    rawInput: tx.input,
    isContractCreation,
    contractAddress: receipt.contractAddress || "",
    logs: receipt.logs || [],
  };
}

export async function decodeCallData(data: string): Promise<DecodedCallData> {
  // In a real implementation, we would use ABI for decoding

  if (!data || data === "0x") {
    return { raw: data || "0x" };
  }

  const hexSelector = strip0x(data);
  const index1 = hexSelector.slice(0, 2);
  const index2 = hexSelector.slice(2, 4);
  const abiResponse = await requestAbi("function", index1, index2);
  if (abiResponse == null) {
    return { raw: data };
  }
  const { abi, url } = abiResponse;
  const decodedInput = decodeFunctionData({
    abi,
    data: data as `0x${string}`,
  });

  const selectedAbi = abi.map((item) => {
    if (item.name == decodedInput.functionName) {
      return item;
    }
  });

  const params = processObject(selectedAbi[0]!.inputs, decodedInput.args);
  const funcSignature = toFunctionSignature(selectedAbi[0]!)
  
  return {
    method: decodedInput.functionName,
    params,
    raw: data,
    url,
    funcSignature,
  };
}

export async function decodeEvents(
  logs: Log<bigint, number, false>[]
): Promise<DecodedEvent[] | null> {
  // 로그가 없는 경우 null 반환
  if (!logs || logs.length === 0) {
    return null;
  }

  const result = [];
  for (let i = 0; i < logs.length; i++) {
    const eventSignature = logs[i].topics[0]!;

    const hexSignature = strip0x(eventSignature);
    const index1 = hexSignature.slice(0, 2);
    const index2 = hexSignature.slice(2, 4);

    const abiResponse = await requestAbi("event", index1, index2);

    if (abiResponse == null) {
      result.push({
        name: `Unknown Event`,
        params: {},
        topics: logs[i].topics,
        rawData: logs[i].data,
      });

      continue;
    }

    const deLog = decodeEventLogNoErr(
      abiResponse.abi,
      logs[i].data,
      logs[i].topics
    );

    if (deLog == null) {
      result.push({
        name: `Unknown Event`,
        params: {},
        topics: logs[i].topics,
        rawData: logs[i].data,
      });
      continue;
    }

    result.push({
      name: deLog.eventName,
      params: deLog.args || {},
      topics: logs[i].topics,
      rawData: logs[i].data,
      url: abiResponse.url,
    });
  }

  return result;
}

export async function fetchBatchData(
  batchData: Record<string, any>
): Promise<BatchData | null> {
  // In a real implementation, we would make API calls here
  if (!batchData) {
    return null;
  }

  if (isDaCert(batchData.data)) {
    const cert = serializeDaCert(batchData.data);
    return {
      rollupData: null,
      daCert: cert,
    };
  } else {
    return {
      rollupData: batchData.data,
      daCert: null,
    };
  }
}

/**
 * Decodes Ethereum calldata
 * @param calldata - The hex string to decode (starting with 0x)
 * @returns Decoded calldata information
 */
export async function decodeCalldata(calldata: string): Promise<any> {
  // Validate input
  if (!calldata || !calldata.startsWith('0x')) {
    throw new Error('Invalid calldata format. Must start with 0x.')
  }
  
  const result = await decodeCallData(calldata)
  console.log("decodeCalldata result:", result) // URL 정보 확인
  
  if(!result.params) {
    return null
  }
  
  // Extract function selector (first 4 bytes / 10 characters including 0x)
  const selector = calldata.slice(0, 10)
  
  // Default dummy data
  return {
    selector,
    method: {
      name: result.method, 
      signature: result.funcSignature
    },
    params: result.params,
    raw: calldata,
    url: result.url
  }
}
