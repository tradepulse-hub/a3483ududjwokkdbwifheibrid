import type { Chain } from "viem"

export const worldChain: Chain = {
  id: 480,
  name: "World Chain",
  network: "worldchain",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
    public: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
  },
  blockExplorers: {
    default: {
      name: "WorldScan",
      url: "https://worldscan.org",
    },
  },
}
