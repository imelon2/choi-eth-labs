import { Hash, PublicClient, createPublicClient, http } from "viem";
import { supportedChains } from "./chainList";
import { multiRace } from "./utils";

export class MultiPublicClient {
  multiPublicClient: PublicClient[];
  constructor() {
    this.multiPublicClient = supportedChains.map((chain) =>
      createPublicClient({ chain, transport: http() })
    );
  }

  async getTransaction(hash: Hash) {
    const promises = this.multiPublicClient.map((client) =>
      client.getTransaction({ hash }).catch(() => null)
    );
    return await multiRace(promises);
  }
}

export const getChainClientFromChainId = (chainId: number) => {
  for (const chain of supportedChains) {
    if ("id" in chain) {
      if (chain.id === chainId) {
        return createPublicClient({ chain, transport: http() });
      }
    }
  }

  return undefined;
};
