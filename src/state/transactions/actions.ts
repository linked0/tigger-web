import { createAction } from "@reduxjs/toolkit";
import { ChainId } from "bizboa-swap-sdk";

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}
export interface SerializableTransactionCurrency {
  symbol?: string;
  name?: string;
  amount?: string;
  address?: string;
  chainId?: number;
}
export interface BridgeLockBoxInfo {
  id: string;
  currency_type: CurrencyType;
  trader_address: string;
  withdraw_address: string;
  amount: string;
  swap_fee: string;
  tx_fee: string;
  secret_lock: string;
  direction?: string;
  deposit_state: number;
  deposit_tx_hash: string;
  deposit_time_lock: string;
  deposit_create_time: string;
  withdraw_state?: number;
  withdraw_hash?: string;
  withdraw_time_lock?: string;
  withdraw_create_time?: string;
  withdraw_time_diff?: number;
  process_status?: number;
}

export enum BridgeLockBoxStates {
  INVALID = 0,
  OPEN = 1,
  CLOSED = 2,
  EXPIRED = 3
}

export enum BridgeDirection {
  ETHNET_BIZNET = 0,
  BIZNET_ETHNET = 1
}

export enum CurrencyType {
  BOA = "0",
  TOKEN = "1"
}

export const addTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  from: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  txCategory?: string;
  txType?: string;
  bridgeBoxId?: string;
  bridgeCurrencyType?: string;
  bridgeSecretKey?: string;
  bridgeStatus?: number;
  bridgeLockBoxInfo?: BridgeLockBoxInfo;
  inputCurrency?: SerializableTransactionCurrency;
  outputCurrency?: SerializableTransactionCurrency;
}>("transactions/addTransaction");
export const clearAllTransactions = createAction<{ chainId: ChainId }>("transactions/clearAllTransactions");
export const finalizeTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  receipt: SerializableTransactionReceipt;
}>("transactions/finalizeTransaction");
export const changeBridgeTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  bridgeStatus: number;
  bridgeLockBoxInfo?: BridgeLockBoxInfo;
}>("transactions/changeBridgeTransaction");
export const checkedTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  blockNumber: number;
}>("transactions/checkedTransaction");
