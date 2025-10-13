import { Chain, Hash, PublicClient, Transport, createPublicClient, http } from "viem";
import { supportedChains } from "./chainList";
import { multiRace } from "./utils";

export class MultiPublicClient {
  multiPublicClient: PublicClient<Transport, Chain>[];
  constructor() {
    this.multiPublicClient = supportedChains.map((chain) =>
      createPublicClient({ chain:chain as Chain, transport: http() })
    );
  }

  async getTransaction(hash: Hash) {
    const promises = this.multiPublicClient.map((client) => {
      return client
        .getTransaction({ hash })
        .then((result) => ({ result, client }))
        .catch(() => ({ result: null, client }));
    });
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
