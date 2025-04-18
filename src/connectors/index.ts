import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { PortisConnector } from "@web3-react/portis-connector";

import { FortmaticConnector } from "./Fortmatic";
import { NetworkConnector } from "./NetworkConnector";

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

// # ETHEREUM_LOCAL
// REACT_APP_ETHEREUM_URL="http://127.0.0.1:8545"
// REACT_APP_ETHEREUM_CHAIN_ID="31337"
//
// # BIZNET_LOCAL
// REACT_APP_BIZNET_URL="http://127.0.0.1:9933"
// REACT_APP_BIZNET_CHAIN_ID="1281"

const ETHEREUM_NETWORK_URL = process.env.REACT_APP_ETHEREUM_URL
  ? process.env.REACT_APP_ETHEREUM_URL
  : "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

console.log("ETHEREUM_NETWORK_URL :", ETHEREUM_NETWORK_URL);
const BIZNET_NETWORK_URL = process.env.REACT_APP_BIZNET_URL
  ? process.env.REACT_APP_BIZNET_URL
  : "https://testnet.bosagora.org/";
console.log("BIZNET_NETWORK_URL :", BIZNET_NETWORK_URL);
export const ETHEREUM_CHAIN_ID: number = parseInt(process.env.REACT_APP_ETHEREUM_CHAIN_ID ?? "12301");
export const BIZNET_CHAIN_ID: number = parseInt(process.env.REACT_APP_BIZNET_CHAIN_ID ?? "7212302");

if (typeof ETHEREUM_NETWORK_URL === "undefined") {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`);
}
export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? "7212302");
export const network = new NetworkConnector({
  urls: { [ETHEREUM_CHAIN_ID]: ETHEREUM_NETWORK_URL, [BIZNET_CHAIN_ID]: BIZNET_NETWORK_URL },
  defaultChainId: BIZNET_CHAIN_ID
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any));
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 2, 12301, 12309, 7212309, 2, 2151, 31337, 7212301, 7212302, 7212303]
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [BIZNET_CHAIN_ID]: BIZNET_NETWORK_URL },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true
  // pollingInterval: 15000,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? "",
  chainId: 1
});

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? "",
  networks: [1]
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: ETHEREUM_NETWORK_URL,
  appName: "Uniswap",
  appLogoUrl:
    "https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg"
});
