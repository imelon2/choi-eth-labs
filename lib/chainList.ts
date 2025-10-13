import { defineChain } from "viem";
import { mainnet, kaia, polygon, sepolia, arbitrum, arbitrumSepolia, localhost, base, baseSepolia } from 'viem/chains';

const dkargoWarehouse = defineChain({
    id: 61022448,
    name: 'Dkargo',
    network: 'warehouse',
    nativeCurrency: {
      name: 'dkargo warehouse',
      symbol: 'DKA',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.warehouse.dkargo.io'],
      },
      public: {
        http: ['https://rpc.warehouse.dkargo.io'],
      },
    },
    dasUrls: ""
  });

const dkargo = defineChain({
    id: 61022894,
    name: 'Dkargo',
    network: 'dKargo',
    nativeCurrency: {
      name: 'dkargo',
      symbol: 'DKA',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet-rpc.dkargo.io'],
      },
      public: {
        http: ['https://mainnet-rpc.dkargo.io'],
      },
    },
    dasUrls: ""
  });

  export const supportedChains = [
    mainnet,
    sepolia,
    arbitrum,
    arbitrumSepolia,
    kaia,
    polygon,
    dkargoWarehouse,
    dkargo,
    localhost,
    base,
    baseSepolia
  ];