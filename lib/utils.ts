import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AbiEvent, decodeEventLog, Hex } from "viem";
import { DACERT_HEADER } from "./constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function multiRace<T>(promises: Promise<T | null>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let resolved = false;
    let pending = promises.length;

    for (const p of promises) {
      p.then((result) => {
        pending -= 1;
        if (!resolved && result !== null) {
          resolved = true;
          resolve(result);
        } else if (pending === 0 && !resolved) {
          resolve(null);
        }
      });
    }
  });
}

export function processObject(input: readonly any[], decodeCalldata: any) {
  let object: any = {};
  input.forEach((key, i) => {
    object[key.name] = decodeCalldata[i];
  });

  return object;
}

export const strip0x = (hex: string) => {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
};

export const decodeEventLogNoErr = (
  abi: AbiEvent[],
  data: `0x${string}`,
  topics: [`0x${string}`, ...`0x${string}`[]] | []
) => {
  let result = null;
  for (let i = 0; i < abi.length; i++) {
    try {
      result = decodeEventLog({
        abi: [abi[i]],
        data,
        topics,
      });
    } catch (error) {
      continue;
    }

    return result;
  }
};

export const isDaCert = (calldata: `0x${string}`) => {
  const header = calldata.slice(0, 4);
  if (header == DACERT_HEADER) {
    return true;
  }
  return false;
};

export const serializeDaCert = (data: Hex) => {
  const pure = strip0x(data);
  return {
    header: pure.slice(0, 2),
    keysetHash: pure.slice(2, 66),
    dataHash: pure.slice(66, 130),
    timeout: pure.slice(130, 146),
    version: pure.slice(146, 148),
    sigenrMask: pure.slice(148, 164),
    aggregateSig: pure.slice(164),
  };
};