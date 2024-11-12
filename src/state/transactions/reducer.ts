import { createReducer } from "@reduxjs/toolkit";
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  changeBridgeTransaction,
  SerializableTransactionReceipt,
  SerializableTransactionCurrency,
  BridgeLockBoxInfo
} from "./actions";

const now = () => new Date().getTime();

export interface TransactionDetails {
  hash: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  receipt?: SerializableTransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
  txCategory?: string;
  txType?: string;
  bridgeBoxId?: string;
  bridgeCurrencyType?: string;
  bridgeSecretKey?: string;
  bridgeStatus?: number;
  bridgeLockBoxInfo?: BridgeLockBoxInfo;
  inputCurrency?: SerializableTransactionCurrency;
  outputCurrency?: SerializableTransactionCurrency;
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails;
  };
}

export const initialState: TransactionState = {};

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        {
          payload: {
            chainId,
            from,
            hash,
            approval,
            summary,
            txCategory,
            txType,
            inputCurrency,
            outputCurrency,
            bridgeBoxId,
            bridgeCurrencyType,
            bridgeSecretKey,
            bridgeStatus,
            bridgeLockBoxInfo
          }
        }
      ) => {
        if (transactions[chainId]?.[hash]) {
          throw Error("Attempted to add existing transaction.");
        }
        console.log("addTransaction > inputCurrency:", inputCurrency);
        console.log("addTransaction > outputCurrency:", outputCurrency);
        console.log("addTransaction > txType:", txType);
        const txs = transactions[chainId] ?? {};
        txs[hash] = {
          hash,
          approval,
          summary,
          from,
          addedTime: now(),
          txCategory,
          txType,
          inputCurrency,
          outputCurrency,
          bridgeBoxId,
          bridgeCurrencyType,
          bridgeSecretKey,
          bridgeStatus,
          bridgeLockBoxInfo
        };
        transactions[chainId] = txs;
      }
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return;
      transactions[chainId] = {};
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash];
      if (!tx) {
        return;
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber;
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash];
      if (!tx) {
        return;
      }
      tx.receipt = receipt;
      tx.confirmedTime = now();
    })
    .addCase(
      changeBridgeTransaction,
      (transactions, { payload: { hash, chainId, bridgeLockBoxInfo, bridgeStatus } }) => {
        const tx = transactions[chainId]?.[hash];
        console.log("bridgeStatus:", bridgeStatus);
        if (!tx) {
          return;
        }
        if (bridgeLockBoxInfo) tx.bridgeLockBoxInfo = bridgeLockBoxInfo;
        tx.bridgeStatus = bridgeStatus;
      }
    )
);
