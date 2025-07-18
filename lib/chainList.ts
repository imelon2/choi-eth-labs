import { defineChain } from "viem";
import { mainnet, kaia, polygon, sepolia, arbitrum, arbitrumSepolia, localhost } from 'viem/chains';

const dkargoWarehouse = defineChain({
    id: 61022448,
    name: 'Dkargo',
    network: 'warehouse',
    nativeCurrency: {
      name: 'dkargo',
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

  export const supportedChains = [
    mainnet,
    sepolia,
    arbitrum,
    arbitrumSepolia,
    kaia,
    polygon,
    dkargoWarehouse,
    localhost
  ];