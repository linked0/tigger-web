import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { ChainId, CurrencyAmount, DEV, TradeType } from "tigger-swap-sdk";
import { useCallback, useMemo } from "react";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  calculateGasMargin,
  getBridgeBOACoinContract,
  getBridgeBOATokenContract,
  getBridgeTokenContract,
  isAddress,
  shortenAddress
} from "../utils";
import isZero from "../utils/isZero";
import { useActiveWeb3React } from "./index";
import useENS from "./useENS";
import { useSelectedListInfo } from "../state/lists/hooks";
import invariant from "tiny-invariant";
import warning from "tiny-warning";
import { Bridge } from "./Bridges";
import { getAddress } from "@ethersproject/address";
import { Amount, BOACoin, BOAToken, Client, ContractUtils } from "../pages/Bridge";
import { BridgeLockBoxInfo, changeBridgeTransaction, CurrencyType } from "../state/transactions/actions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../state";
import { OPPOSITE_CHAIN } from "../constants";
import { useTranslation } from "react-i18next";
import { TOKEN_BRIDGE_NETWORKS } from "../constants/multicall";

/**
 * The parameters to use in the call to the Uniswap V2 Router to execute a trade.
 */
export interface BridgeParameters {
  /**
   * The method to call on the Uniswap V2 Router.
   */
  methodName: string;
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: (string | string[])[];
  /**
   * The amount of wei to send in hex.
   */
  value: string;
}
const STAGE = process.env.REACT_APP_STAGE;
export const EXPIRABLE_SECONDS = STAGE === "PROD" ? 60 * 60 * 24 * 2 : 60 * 10;
const BRIDGE_SERVER_URL = process.env.REACT_APP_BRIDGE_SERVER_URL;

export enum BridgeServerCallState {
  DISMISSED,
  OPENDED,
  DEPOSITED,
  SENT_DEPOSIT,
  CHECKED_WITHDRAW,
  SENT_SECRET,
  EXPIRED,
  ERROR,
  COMPLETED,
  CANCELED
}

export enum BridgeCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface BridgeCall {
  contract: Contract;
  parameters: BridgeParameters;
}

interface SuccessfulBridgeCall {
  call: BridgeCall;
  gasEstimate: BigNumber;
}

interface FailedBridgeCall {
  call: BridgeCall;
  error: Error;
}

type EstimatedBridgeCall = SuccessfulBridgeCall | FailedBridgeCall;

const URI = require("urijs");
export function useBrigeGetBoxCallBack() {
  return useCallback(async (boxId: string) => {
    const client = new Client();
    const bridgeUrl = BRIDGE_SERVER_URL;
    const uri = URI(bridgeUrl)
      .directory("/bridge/swap")
      .filename(boxId);
    const res = await client.get(uri.toString());
    console.log("response getbox:", res);
    return res.status === 200 ? res.data : null;
  }, []);
}

export function useBrigeSendBoxCallBack() {
  return useCallback(async (boxInfo: BridgeLockBoxInfo) => {
    const bridgeUrl = BRIDGE_SERVER_URL || "";
    const client = new Client();
    const uri = URI(bridgeUrl)
      .directory("bridge/")
      .filename("deposit");
    console.log("sent boxInfo :", boxInfo);
    const res = await client.post(uri.toString(), {
      id: boxInfo.id,
      type: boxInfo.currency_type,
      trader_address: boxInfo.trader_address,
      withdraw_address: boxInfo.withdraw_address,
      amount: boxInfo.amount,
      swap_fee: boxInfo.swap_fee,
      tx_fee: boxInfo.tx_fee,
      direction: boxInfo.direction,
      secret_lock: boxInfo.secret_lock,
      state: boxInfo.deposit_state,
      tx_hash: boxInfo.deposit_tx_hash,
      time_lock: boxInfo.deposit_time_lock,
      create_time: boxInfo.deposit_create_time
    });
    console.log("response sendbox:", res);
    return res.status === 200 ? res.data : null;
  }, []);
}

export function useBrigeSendSecretCallBack() {
  return useCallback(async (boxId: string, secretKey: string) => {
    const bridgeUrl = BRIDGE_SERVER_URL || "";
    const client = new Client();
    const uri = URI(bridgeUrl)
      .directory("bridge/")
      .filename("close");
    const res = await client.post(uri.toString(), {
      id: boxId,
      key: secretKey
    });
    console.log("response SendSecret:", res);
    return res.status === 200 ? res.data : null;
  }, []);
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param recipientAddressOrName
 */
function useBridgeCallArguments(
  trade: Bridge | undefined, // trade to execute, required
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  boxId: string,
  secretKey: string,
  secretLock: string,
  swapFee: string,
  txFee: string
): BridgeCall[] {
  const { account, chainId, library } = useActiveWeb3React();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;
  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId) return [];
    const contract: Contract | null =
      trade?.currencyType === CurrencyType.BOA
        ? trade?.tradeType === TradeType.EXACT_INPUT
          ? getBridgeBOATokenContract(chainId, library, account)
          : getBridgeBOACoinContract(chainId, library, account)
        : getBridgeTokenContract(chainId, library, account);
    if (!contract) {
      return [];
    }

    const bridgeMethods = [];

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      bridgeMethods.push(
        BridgeRouter.bridgeCallParameters(trade, {
          feeOnTransfer: true,
          recipient,
          boxId,
          secretLock,
          swapFee,
          txFee
        })
      );
    } else if (trade.tradeType === TradeType.EXACT_OUTPUT) {
      bridgeMethods.push(
        BridgeRouter.bridgeCallParameters(trade, {
          feeOnTransfer: false,
          recipient,
          boxId,
          secretLock,
          swapFee,
          txFee
        })
      );
    }

    return bridgeMethods.map(parameters => ({ parameters, contract }));
  }, [account, chainId, library, recipient, trade, boxId, secretLock, swapFee, txFee]);
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useBridgeCallback(
  trade: Bridge | undefined, // trade to execute, required
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  boxId: string,
  secretKey: string,
  secretLock: string,
  swapFee: string,
  txFee: string
): { state: BridgeCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React();
  const swapCalls = useBridgeCallArguments(trade, recipientAddressOrName, boxId, secretKey, secretLock, swapFee, txFee);
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();
  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;
  const allTokens = useSelectedListInfo();

  const getTokenBySymbol = useCallback(
    (symbol?: string | undefined): string => {
      if (!symbol) return "";
      const filteredToken = allTokens.current?.tokens.filter(
        token => token.chainId === chainId && token.symbol === symbol
      );
      return filteredToken ? (filteredToken[0] ? filteredToken[0].address : "") : "";
    },
    [chainId, allTokens]
  );

  const oppositeChainId = useMemo(() => {
    if (chainId) {
      return OPPOSITE_CHAIN[chainId];
    }
    return null;
  }, [chainId]);

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: BridgeCallbackState.INVALID, callback: null, error: "Missing dependencies" };
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: BridgeCallbackState.INVALID, callback: null, error: "Invalid recipient" };
      } else {
        return { state: BridgeCallbackState.LOADING, callback: null, error: null };
      }
    }

    return {
      state: BridgeCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedBridgeCall[] = await Promise.all(
          swapCalls.map(call => {
            console.log("bridge call:", call);
            const {
              parameters: { methodName, args, value },
              contract
            } = call;
            const options = !value || isZero(value) ? {} : { value };

            return contract.estimateGas[methodName](...args, options)
              .then(gasEstimate => {
                return {
                  call,
                  gasEstimate
                };
              })
              .catch(gasError => {
                console.log("Gas estimate failed, trying eth_call to extract error", call);

                return contract.callStatic[methodName](...args, options)
                  .then(result => {
                    console.debug("Unexpected successful call after failed estimate gas", call, gasError, result);
                    return { call, error: new Error("Unexpected issue with estimating the gas. Please try again.") };
                  })
                  .catch(callError => {
                    console.debug("Call threw error", call, callError);
                    let errorMessage: string;
                    switch (callError.reason) {
                      case "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT":
                      case "UniswapV2Router: EXCESSIVE_INPUT_AMOUNT":
                        errorMessage =
                          "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.";
                        break;
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${
                          String(callError.reason).split("|")[0]
                        }. This is probably an issue with one of the tokens you are swapping.`;
                    }
                    return { call, error: new Error(errorMessage) };
                  });
              });
          })
        );

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulBridgeCall =>
            "gasEstimate" in el && (ix === list.length - 1 || "gasEstimate" in list[ix + 1])
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedBridgeCall => "error" in call);
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
          throw new Error("Unexpected error. Please contact support: none of the calls threw an error");
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          },
          gasEstimate
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account })
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = trade.inputAmount.toSignificant(3);
            const outputAmount = trade.outputAmount.toSignificant(3);
            console.log("bridge response :", response);
            console.log("bridge trade :", trade);
            const base = `Bridge Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`;
            const withVersion = withRecipient;

            addTransaction(response, {
              summary: withVersion,
              txCategory: "bridge",
              txType: "trade",
              bridgeBoxId: boxId,
              bridgeCurrencyType: trade.currencyType,
              bridgeStatus: BridgeServerCallState.OPENDED,
              bridgeSecretKey: secretKey,
              inputCurrency: {
                symbol: trade.inputAmount.currency.symbol,
                name: trade.inputAmount.currency.name,
                amount: trade.inputAmount.toFixed(7),
                address: getTokenBySymbol(trade.inputAmount.currency.symbol as string),
                chainId: chainId
              },
              outputCurrency: {
                symbol: trade.outputAmount.currency.symbol,
                name: trade.outputAmount.currency.name,
                amount: trade.outputAmount.toFixed(7),
                address: getTokenBySymbol(trade.outputAmount.currency.symbol as string),
                chainId: oppositeChainId || undefined
              }
            });

            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error(t("transactionRejected"));
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value);
              throw new Error(`Swap failed: ${error.message}`);
            }
          });
      },
      error: null
    };
  }, [
    trade,
    library,
    account,
    chainId,
    oppositeChainId,
    recipient,
    recipientAddressOrName,
    swapCalls,
    addTransaction,
    getTokenBySymbol,
    boxId,
    secretKey,
    t
  ]);
}

function useBridgeExpireCallArguments(
  tradeType: TradeType,
  currencyType: CurrencyType | string,
  boxId: string
): BridgeCall[] {
  const { account, chainId, library } = useActiveWeb3React();

  return useMemo(() => {
    if (!library || !account || !chainId) return [];
    // const contract: Contract | null =
    //   tradeType === TradeType.EXACT_INPUT
    //     ? getBridgeBOATokenContract(chainId, library, account)
    //     : getBridgeBOACoinContract(chainId, library, account);
    const contract: Contract | null =
      currencyType === CurrencyType.BOA
        ? tradeType === TradeType.EXACT_INPUT
          ? getBridgeBOATokenContract(chainId, library, account)
          : getBridgeBOACoinContract(chainId, library, account)
        : getBridgeTokenContract(chainId, library, account);
    if (!contract) {
      return [];
    }

    const bridgeMethods = [];

    const methodName = "expireDeposit";
    const args = [boxId];
    const value = ZERO_HEX;
    bridgeMethods.push({ methodName, args, value });

    return bridgeMethods.map(parameters => ({ parameters, contract }));
  }, [account, chainId, library, boxId, tradeType, currencyType]);
}

export function useBridgeExpireCallback(
  tradeType: TradeType,
  currencyType: CurrencyType | string,
  txHash: string,
  boxId: string
): { state: BridgeCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const swapCalls = useBridgeExpireCallArguments(tradeType, currencyType, boxId);
  const { t } = useTranslation();
  // console.log("expire call :", tradeType, txHash, boxId);
  // console.log("expire swapCalls :", swapCalls);
  return useMemo(() => {
    if (!library || !account || !chainId) {
      return { state: BridgeCallbackState.INVALID, callback: null, error: "Missing dependencies" };
    }
    if (!boxId) {
      return { state: BridgeCallbackState.INVALID, callback: null, error: "Missing boxId" };
    }

    return {
      state: BridgeCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedBridgeCall[] = await Promise.all(
          swapCalls.map(call => {
            console.log("bridge Refund call:", call);
            const {
              parameters: { methodName, args, value },
              contract
            } = call;
            const options = !value || isZero(value) ? {} : { value };

            return contract.estimateGas[methodName](...args, options)
              .then(gasEstimate => {
                return {
                  call,
                  gasEstimate
                };
              })
              .catch(gasError => {
                console.log("Gas estimate failed, trying eth_call to extract error", call);

                return contract.callStatic[methodName](...args, options)
                  .then(result => {
                    console.debug("Unexpected successful call after failed estimate gas", call, gasError, result);
                    return { call, error: new Error("Unexpected issue with estimating the gas. Please try again.") };
                  })
                  .catch(callError => {
                    console.debug("Call threw error", call, callError);
                    let errorMessage: string;
                    switch (callError.reason) {
                      case "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT":
                      case "UniswapV2Router: EXCESSIVE_INPUT_AMOUNT":
                        errorMessage =
                          "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.";
                        break;
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${
                          String(callError.reason).split("|")[0]
                        }. This is probably an issue with one of the tokens you are swapping.`;
                    }
                    return { call, error: new Error(errorMessage) };
                  });
              });
          })
        );

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulBridgeCall =>
            "gasEstimate" in el && (ix === list.length - 1 || "gasEstimate" in list[ix + 1])
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedBridgeCall => "error" in call);
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
          throw new Error("Unexpected error. Please contact support: none of the calls threw an error");
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          },
          gasEstimate
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account })
        })
          .then((response: any) => {
            dispatch(
              changeBridgeTransaction({
                chainId,
                hash: txHash || "",
                bridgeStatus: BridgeServerCallState.CANCELED
              })
            );

            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error(t("refundTransactionRejected"));
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Refund failed`, error, methodName, args, value);
              throw new Error(`Refund failed: ${error.message}`);
            }
          });
      },
      error: null
    };
  }, [library, account, chainId, swapCalls, dispatch, boxId, txHash, t]);
}
function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`;
}

const ZERO_HEX = "0x0";

/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */
export abstract class BridgeRouter {
  /**
   * Cannot be constructed.
   */
  private constructor() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static bridgeCallParameters(trade: Bridge, options: TradeBridgeOptions): BridgeParameters {
    const devIn = trade.inputAmount.currency === DEV;
    const devOut = trade.outputAmount.currency === DEV;
    // the router does not support both ether in and out
    invariant(!(devIn && devOut), "DEV_IN_OUT");

    const _withdrawAddress: string = validateAndParseAddress(options.recipient);
    const _tokenId = ContractUtils.BufferToString(
      ContractUtils.getTokenId(
        TOKEN_BRIDGE_NETWORKS[trade.inputAmount.token.chainId as ChainId],
        trade.inputAmount.token.address
      )
    );
    const BOA_ETH_DECIMAL = 18;
    const _amount: string = toHex(trade.inputAmount);
    const _boxID: string = options.boxId;
    const _swapFee: string =
      trade.tradeType === TradeType.EXACT_INPUT
        ? BOAToken.make(options.swapFee).value.toHexString()
        : BOACoin.make(options.swapFee).value.toHexString();
    const _txFee: string =
      trade.currencyType === CurrencyType.TOKEN
        ? Amount.make(options.txFee, BOA_ETH_DECIMAL).value.toHexString()
        : trade.tradeType === TradeType.EXACT_INPUT
        ? BOAToken.make(options.txFee).value.toHexString()
        : BOACoin.make(options.txFee).value.toHexString();
    const _secretLock: string = options.secretLock;
    const useFeeOnTransfer = Boolean(options.feeOnTransfer);
    let methodName: string;
    let args: (string | string[])[];
    let value: string;
    if (trade.currencyType === CurrencyType.BOA) {
      switch (trade.tradeType) {
        case TradeType.EXACT_INPUT:
          /*
          BOA Token -> BOA Coin
          bytes32 _boxID,
          uint256 _amount,
          uint256 _swapFee,
          uint256 _txFee,
          address _withdrawAddress,
          bytes32 _secretLock
        */
          methodName = "openDeposit";
          args = [_boxID, _amount, _swapFee, _txFee, _withdrawAddress, _secretLock];
          value = ZERO_HEX;
          break;
        case TradeType.EXACT_OUTPUT:
          invariant(!useFeeOnTransfer, "EXACT_OUT_FOT");
          /*
          BOA Coin -> BOA Token
          bytes32 _boxID,
          uint256 _swapFee,
          uint256 _txFee,
          address payable _withdrawAddress,
          bytes32 _secretLock
         */
          methodName = "openDeposit";
          args = [_boxID, _swapFee, _txFee, _withdrawAddress, _secretLock];
          value = toHex(trade.inputAmount);
          break;
      }
    } else {
      //
      /*
      Token -> Token
      bytes32 _tokenId,
      bytes32 _boxID,
      uint256 _amount,
      address _withdrawAddress,
      bytes32 _secretLock
     */
      methodName = "openDeposit";
      args = [_tokenId, _boxID, _amount, _withdrawAddress, _secretLock];
      value = _txFee;
    }
    return {
      methodName,
      args,
      value
    };
  }
}

/**
 * Options for producing the arguments to send call to the router.
 */
export interface TradeBridgeOptions {
  boxId: string;
  secretLock: string;
  swapFee: string;
  txFee: string;
  recipient: string;
  feeOnTransfer?: boolean;
}

export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address);
    warning(address === checksummedAddress, `${address} is not checksummed.`);
    return checksummedAddress;
  } catch (error) {
    invariant(false, `${address} is not a valid address.`);
  }
}

export function BufferToString(data: Buffer): string {
  return "0x" + data.toString("hex");
}
