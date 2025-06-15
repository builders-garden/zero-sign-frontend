import { http, createConfig } from "wagmi";
import { mainnet, baseSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/yBVw1QbEohZcckqMESwiugb7jZyiP7ah"),
  },
});


