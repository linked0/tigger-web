import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { abi as IUniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import { ROUTER_ADDRESS } from "../constants";
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, DEV } from "tigger-swap-sdk";
import { TokenAddressMap } from "../state/lists/hooks";
import {
  BOATokenBridge_ABI,
  BOACoinBridge_ABI,
  TokenBridge_ABI,
  BRIDGE_NETWORKS,
  PointCoinSwap_ABI,
  PointTokenSwap_ABI,
  TOKEN_BRIDGE_NETWORKS
} from "../constants/multicall";
// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

const DEVSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  12301: "https://sepolia.etherscan.io",
  31337: "xxxxxxxxxxx",
  1281: "xxxxxxxxxxx",
  7212303: "https://testnet-scan.bosagora.org",
  7212302: "https://testnet-scan.bosagora.org",
  7212301: "https://scan.bosagora.org"
};

export function getEtherscanLink(chainId: ChainId, data: string, type: "transaction" | "token" | "address"): string {
  const prefix = `${DEVSCAN_PREFIXES[chainId] || DEVSCAN_PREFIXES[1]}`;
  // const prefix = 'https://moonbase-blockscout.api.moonbase.moonbeam.network'
  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`;
    }
    case "token": {
      return `${prefix}/token/${data}`;
    }
    case "address":
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ];
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any);
}

// account is optional
export function getRouterContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS[chainId ? chainId.toString() : ""], IUniswapV2Router02ABI, library, account);
}

export function getBridgeBOATokenContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(BRIDGE_NETWORKS[chainId as ChainId], BOATokenBridge_ABI.abi, library, account);
}

export function getBridgeBOACoinContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(BRIDGE_NETWORKS[chainId as ChainId], BOACoinBridge_ABI.abi, library, account);
}

export function getBridgeTokenContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(TOKEN_BRIDGE_NETWORKS[chainId as ChainId], TokenBridge_ABI.abi, library, account);
}

export function getPointCoinSwapContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(BRIDGE_NETWORKS[chainId as ChainId], PointCoinSwap_ABI.abi, library, account);
}

export function getPointTokenSwapContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(BRIDGE_NETWORKS[chainId as ChainId], PointTokenSwap_ABI.abi, library, account);
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === DEV) return true;
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address]);
}
