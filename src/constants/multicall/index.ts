import { ChainId } from "bizboa-swap-sdk";
import MULTICALL_ABI from "./abi.json";
import BOATokenBridge_ABI from "../abis/BOATokenBridge.json";
import BOACoinBridge_ABI from "../abis/BOACoinBridge.json";
import TokenBridge_ABI from "../abis/TokenBridge.json";
import PointTokenSwap_ABI from "../abis/PointTokenSwap.json";
import PointCoinSwap_ABI from "../abis/PointCoinSwap.json";
import { CONTRACT_ADDRESS_NETWORKS } from "../../boaswap_address";

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  [ChainId.HARDHAT]: CONTRACT_ADDRESS_NETWORKS[ChainId.HARDHAT].multicall,
  [ChainId.STANDALONE]: CONTRACT_ADDRESS_NETWORKS[ChainId.STANDALONE].multicall,
  [ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].multicall,
  [ChainId.BIZTESTNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZTESTNET].multicall,
  [ChainId.BIZNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZNET].multicall
};

const BRIDGE_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MAINNET].bridge,
  [ChainId.HARDHAT]: CONTRACT_ADDRESS_NETWORKS[ChainId.HARDHAT].bridge,
  [ChainId.STANDALONE]: CONTRACT_ADDRESS_NETWORKS[ChainId.STANDALONE].bridge,
  [ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].bridge,
  [ChainId.BIZTESTNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZTESTNET].bridge,
  [ChainId.BIZNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZNET].bridge
};

const TOKEN_BRIDGE_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MAINNET].tokenBridge,
  [ChainId.HARDHAT]: CONTRACT_ADDRESS_NETWORKS[ChainId.HARDHAT].tokenBridge,
  [ChainId.STANDALONE]: CONTRACT_ADDRESS_NETWORKS[ChainId.STANDALONE].tokenBridge,
  [ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].tokenBridge,
  [ChainId.BIZTESTNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZTESTNET].tokenBridge,
  [ChainId.BIZNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.BIZNET].tokenBridge
};

export {
  MULTICALL_ABI,
  MULTICALL_NETWORKS,
  BRIDGE_NETWORKS,
  TOKEN_BRIDGE_NETWORKS,
  BOATokenBridge_ABI,
  BOACoinBridge_ABI,
  TokenBridge_ABI,
  PointTokenSwap_ABI,
  PointCoinSwap_ABI
};
