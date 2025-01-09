import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useActiveWeb3React } from "../../hooks";
import useInterval from "../../hooks/useInterval";
import useIsWindowVisible from "../../hooks/useIsWindowVisible";
import { isTransactionRecent, useAllTransactions } from "../transactions/hooks";
import { TransactionDetails } from "../transactions/reducer";
import {
  BridgeServerCallState,
  EXPIRABLE_SECONDS,
  useBrigeGetBoxCallBack,
  useBrigeSendBoxCallBack,
  useBrigeSendSecretCallBack
} from "../../hooks/useBridgeCallback";
import { Contract } from "@ethersproject/contracts";
import { getBridgeBOATokenContract, getBridgeTokenContract } from "../../utils";
import { BridgeLockBoxInfo, BridgeLockBoxStates, changeBridgeTransaction, CurrencyType } from "../transactions/actions";
import { AppDispatch } from "..";
import { DIRECTION_CHAIN } from "../../constants";

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

export default function Updater() {
  const { chainId, account, library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  // const lists = useSelector<AppState, AppState["lists"]["byUrl"]>(state => state.lists.byUrl);

  console.log("Updater");
  const isWindowVisible = useIsWindowVisible();
  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const bridgeTradeTransactions = sortedRecentTransactions.filter(
    tx => tx.txCategory === "bridge" && tx.txType === "trade"
  );
  const openedTransactions = bridgeTradeTransactions.filter(
    tx => tx.bridgeStatus === BridgeServerCallState.OPENDED || tx.bridgeStatus === BridgeServerCallState.DEPOSITED
  );
  const sentDepositTransactions = bridgeTradeTransactions.filter(
    tx => tx.bridgeStatus === BridgeServerCallState.SENT_DEPOSIT
  );
  const sentSecretTransactions = bridgeTradeTransactions.filter(
    tx => tx.bridgeStatus === BridgeServerCallState.SENT_SECRET
  );
  const exceptCanceldTransactions = bridgeTradeTransactions.filter(
    tx =>
      tx.bridgeStatus !== BridgeServerCallState.CANCELED &&
      tx.bridgeStatus !== BridgeServerCallState.EXPIRED &&
      tx.bridgeStatus !== BridgeServerCallState.COMPLETED
  );
  const fetchBox = useBrigeGetBoxCallBack();
  const sendBox = useBrigeSendBoxCallBack();
  const sendSecret = useBrigeSendSecretCallBack();
  const openedTxCallback = useCallback(() => {
    if (!isWindowVisible) return;
    if (openedTransactions.length > 0) console.log("openedTransactions :", openedTransactions);
    if (sentDepositTransactions.length > 0) console.log("sentDepositTransactions :", sentDepositTransactions);
    if (sentSecretTransactions.length > 0) console.log("sentSecretTransactions :", sentSecretTransactions);
    if (chainId && library && account) {
      openedTransactions.forEach(tx => {
        console.log("tx hash:", tx?.hash);
        if (tx.bridgeBoxId) {
          fetchBox(tx.bridgeBoxId)
            .then(res => {
              if (res) {
                if (res.status === 200) {
                } else if (res.status === 204) {
                  const contract: Contract | null =
                    tx.bridgeCurrencyType === CurrencyType.TOKEN
                      ? getBridgeTokenContract(chainId, library, account)
                      : getBridgeBOATokenContract(chainId, library, account);
                  if (!contract) {
                    return null;
                  } else {
                    console.log("checkDeposit:", tx.bridgeBoxId);
                    console.log("contract:", contract);
                    const result = contract.checkDeposit(tx.bridgeBoxId);
                    result.then(
                      (r: {
                        states: any;
                        tokenId: any;
                        timeLock: any;
                        traderAddress: any;
                        withdrawAddress: any;
                        amount: any;
                        swapFee: any;
                        txFee: any;
                        secretLock: any;
                        createTimestamp: any;
                      }) => {
                        console.log(tx.bridgeBoxId + " checkDeposit result :", r);
                        //Dispatch transaction's bridge status following the result
                        if (r.states === BridgeLockBoxStates.OPEN) {
                          const boxInfo: BridgeLockBoxInfo = {
                            id: tx.bridgeBoxId || "",
                            currency_type: r.hasOwnProperty("tokenId") ? CurrencyType.TOKEN : CurrencyType.BOA,
                            trader_address: r.traderAddress,
                            withdraw_address: r.withdrawAddress,
                            amount: r.amount.toString(),
                            swap_fee: r.hasOwnProperty("tokenId") ? "0" : r.swapFee.toString(),
                            tx_fee: r.txFee.toString(),
                            direction: DIRECTION_CHAIN[chainId].toString(),
                            secret_lock: r.secretLock,
                            deposit_state: r.states,
                            deposit_tx_hash: tx.hash,
                            deposit_time_lock: r.timeLock.toString(),
                            deposit_create_time: r.createTimestamp.toString()
                          };
                          dispatch(
                            changeBridgeTransaction({
                              chainId,
                              hash: tx.hash || "",
                              bridgeStatus: BridgeServerCallState.DEPOSITED,
                              bridgeLockBoxInfo: boxInfo
                            })
                          );
                          // Send Deposit box info to the server and return the result
                          sendBox(boxInfo).then(r => {
                            console.log("sendBox result :", r);
                            if (r.status === 200 && r.data.id === tx.bridgeBoxId) {
                              dispatch(
                                changeBridgeTransaction({
                                  chainId,
                                  hash: tx.hash || "",
                                  bridgeStatus: BridgeServerCallState.SENT_DEPOSIT
                                })
                              );
                            }
                          });
                        }
                      }
                    );
                  }
                }
              }
              return null;
            })
            .catch(error => console.debug("openedTransactions fetching error", error));
        }
      });
      sentDepositTransactions.forEach(tx => {
        console.log("sentTransactions hash:", tx?.hash);
        if (tx.bridgeBoxId && tx.bridgeSecretKey) {
          fetchBox(tx.bridgeBoxId)
            .then(res => {
              if (res) {
                if (res.status === 200) {
                  // Send secret Key to the server and return the result
                  if (tx.bridgeBoxId != null) {
                    if (tx.bridgeSecretKey != null) {
                      sendSecret(tx.bridgeBoxId, tx.bridgeSecretKey).then(r => {
                        console.log("sendSecretKey result :", r);
                        if (r.status === 200 && r.data.id === tx.bridgeBoxId) {
                          dispatch(
                            changeBridgeTransaction({
                              chainId,
                              hash: tx.hash || "",
                              bridgeStatus: BridgeServerCallState.SENT_SECRET
                            })
                          );
                        }
                      });
                    }
                  }
                } else if (res.status === 204) {
                }
              }
              return null;
            })
            .catch(error => console.debug("sentTransactions fetching error", error));
        }
      });
      sentSecretTransactions.forEach(tx => {
        console.log("sentSecretTransactions hash:", tx?.hash);
        if (tx.bridgeBoxId && tx.bridgeSecretKey) {
          fetchBox(tx.bridgeBoxId)
            .then(res => {
              if (res) {
                if (res.status === 200) {
                  console.log("fetchBox > sentSecret > status:", res.data.process_status);
                  if (res.data.process_status === 42) {
                    console.log("brige completed");
                    dispatch(
                      changeBridgeTransaction({
                        chainId,
                        hash: tx.hash || "",
                        bridgeStatus: BridgeServerCallState.COMPLETED
                      })
                    );
                  }
                } else if (res.status === 204) {
                }
              }
              return null;
            })
            .catch(error => console.debug("sentSecretTransactions fetching error", error));
        }
      });

      exceptCanceldTransactions.forEach(tx => {
        if (tx.bridgeBoxId && tx.confirmedTime) {
          const confirmedTime = new Date(tx.confirmedTime);
          const now = new Date();
          const diff = now.valueOf() - confirmedTime.valueOf();
          const diffInSeconds = diff / 1000; // Convert milliseconds to seconds
          if (diffInSeconds > EXPIRABLE_SECONDS) {
            console.log("diffInSeconds :", diffInSeconds, ", EXPIRABLE_SECONDS :", EXPIRABLE_SECONDS);
            console.log("exceptCanceldTransactions hash:", tx);
            dispatch(
              changeBridgeTransaction({
                chainId,
                hash: tx.hash || "",
                bridgeStatus: BridgeServerCallState.EXPIRED
              })
            );
          }
        }
      });
    }
  }, [
    fetchBox,
    isWindowVisible,
    openedTransactions,
    sentDepositTransactions,
    sentSecretTransactions,
    exceptCanceldTransactions,
    chainId,
    account,
    library,
    dispatch,
    sendBox,
    sendSecret
  ]);

  useInterval(openedTxCallback, library ? 1000 * 60 * 0.5 : null);
  return null;
}
