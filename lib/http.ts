import axios from "axios"
import type {
  AbiEvent,
  AbiFunction,
  AbiParameter,
} from 'viem'

type ArchiveType = "error"|"function"|"event"

 type AbiError = {
  type: 'error'
  inputs: readonly AbiParameter[]
  name: string
}


type ArchiveTypeToAbi<T extends ArchiveType> =
  T extends 'function' ? AbiFunction[] :
  T extends 'error' ? AbiError[] :
  T extends 'event' ? AbiEvent[] :
  never;

export async function requestAbi<T extends ArchiveType>(type:T,index1:string,index2:string): Promise<{ abi: ArchiveTypeToAbi<T>, url: string }|null> {
    try {
        const url = getArchiveUrl(type,index1,index2)
        const request = await httpGet(url)
        return {abi:request.data,url}
    } catch (error) {
        return null
    }
}

const httpGet = async (url:string) => {
    return await axios.get(url)
}

const getArchiveUrl = (type:ArchiveType,index1:string,index2:string) => {
    return `https://raw.githubusercontent.com/imelon2/abi-archive/refs/heads/main/archive/${type}/${index1}/${index2}/abi.json`
}