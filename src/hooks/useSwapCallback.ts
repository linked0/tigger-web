import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from "tigger-swap-sdk";
import { useCallback, useMemo } from "react";
import { BIPS_BASE, DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from "../constants";
import { useTransactionAdder } from "../state/transactions/hooks";
import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from "../utils";
import isZero from "../utils/isZero";
import { useActiveWeb3React } from "./index";
import useENS from "./useENS";
import { useSelectedListInfo } from "../state/lists/hooks";
import { useTranslation } from "react-i18next";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulCall {
  call: SwapCall;
  gasEstimate: BigNumber;
}

interface FailedCall {
  call: SwapCall;
  error: Error;
}

type EstimatedSwapCall = SuccessfulCall | FailedCall;

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient = recipientAddressOrName === null ? account : recipientAddress;

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId) return [];
    const contract: Contract | null = getRouterContract(chainId, library, account);
    if (!contract) {
      return [];
    }

    const swapMethods = [];

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        ttl: deadline
      })
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          ttl: deadline
        })
      );
    }

    return swapMethods.map(parameters => ({ parameters, contract }));
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade]);
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React();

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, deadline, recipientAddressOrName);
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

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: "Missing dependencies" };
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: "Invalid recipient" };
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null };
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
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
                console.debug("Gas estimate failed, trying eth_call to extract error", call);

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
          (el, ix, list): el is SuccessfulCall =>
            "gasEstimate" in el && (ix === list.length - 1 || "gasEstimate" in list[ix + 1])
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => "error" in call);
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

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
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
              txCategory: "swap",
              txType: "trade",
              inputCurrency: {
                symbol: trade.inputAmount.currency.symbol,
                name: trade.inputAmount.currency.name,
                amount: trade.inputAmount.toFixed(7),
                address: getTokenBySymbol(trade.inputAmount.currency.symbol as string)
              },
              outputCurrency: {
                symbol: trade.outputAmount.currency.symbol,
                name: trade.outputAmount.currency.name,
                amount: trade.outputAmount.toFixed(7),
                address: getTokenBySymbol(trade.outputAmount.currency.symbol as string)
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
    recipient,
    recipientAddressOrName,
    swapCalls,
    addTransaction,
    getTokenBySymbol,
    t
  ]);
}
