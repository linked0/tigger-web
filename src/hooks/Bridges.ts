import {
  ChainId,
  Currency,
  CurrencyAmount,
  // currencyEquals,
  DEV,
  Token,
  TokenAmount,
  TradeType,
  // TradeType,
  WDEV
} from "bizboa-swap-sdk";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { Field } from "../state/bridge/actions";
import { useBridgeState } from "../state/bridge/hooks";
import { Amount, BOACoin, BOAToken } from "../pages/Bridge";
import JSBI from "jsbi";
import { CurrencyType } from "../state/transactions/actions";

export function useBridgeEthToBiznet(
  bridgeCurrencyType: CurrencyType,
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  estimation?: string,
  chainDirection?: string
): Bridge | null {
  const {
    [Field.INPUT]: { chainId: inputChainId },
    [Field.OUTPUT]: { chainId: outputChainId }
  } = useBridgeState();
  return useMemo(() => {
    if (currencyAmountIn && currencyOut && inputChainId && outputChainId && estimation && chainDirection) {
      const amountIn = wrappedAmount(currencyAmountIn, parseInt(inputChainId) as ChainId);
      const tokenOut = wrappedCurrency(currencyOut, parseInt(outputChainId) as ChainId);
      const outValue =
        bridgeCurrencyType === CurrencyType.BOA
          ? JSBI.BigInt(BOACoin.make(estimation).value)
          : JSBI.BigInt(Amount.make(estimation, currencyAmountIn.currency.decimals).value);
      const amountOut = new TokenAmount(tokenOut, outValue);
      return new Bridge(amountIn, amountOut, TradeType.EXACT_INPUT, bridgeCurrencyType);
    }
    return null;
  }, [currencyAmountIn, currencyOut, inputChainId, outputChainId, estimation, chainDirection, bridgeCurrencyType]);
}

export function useBridgeBiznetToEth(
  bridgeCurrencyType: CurrencyType,
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  estimation?: string,
  chainDirection?: string
): Bridge | null {
  const {
    [Field.INPUT]: { chainId: inputChainId },
    [Field.OUTPUT]: { chainId: outputChainId }
  } = useBridgeState();
  return useMemo(() => {
    if (currencyAmountIn && currencyOut && inputChainId && outputChainId && estimation && chainDirection) {
      const amountIn = wrappedAmount(currencyAmountIn, parseInt(inputChainId) as ChainId);
      const tokenOut = wrappedCurrency(currencyOut, parseInt(outputChainId) as ChainId);
      const outValue =
        bridgeCurrencyType === CurrencyType.BOA
          ? JSBI.BigInt(BOAToken.make(estimation).value)
          : JSBI.BigInt(Amount.make(estimation, currencyAmountIn.currency.decimals).value);
      const amountOut = new TokenAmount(tokenOut, outValue);
      return new Bridge(amountIn, amountOut, TradeType.EXACT_OUTPUT, bridgeCurrencyType);
    }
    return null;
  }, [currencyAmountIn, currencyOut, inputChainId, outputChainId, estimation, chainDirection, bridgeCurrencyType]);
}

export class Bridge {
  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly currencyType: CurrencyType;
  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly tradeType: TradeType;
  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: TokenAmount;
  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: TokenAmount;

  /**
   * Constructs an exact in trade with the given amount in and route
   * @param route route of the exact in trade
   * @param amountIn the amount being passed in
   */

  public constructor(amountIn: TokenAmount, amountOut: TokenAmount, tradeType: TradeType, currencyType: CurrencyType) {
    this.currencyType = currencyType;
    this.tradeType = tradeType;
    this.inputAmount = amountIn;
    this.outputAmount = amountOut;
  }

  //   /**
  //    * Get the minimum amount that must be received from this trade for the given slippage tolerance
  //    * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
  //    */
  //   public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
  //     invariant(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
  //     if (this.tradeType === TradeType.EXACT_OUTPUT) {
  //       return this.outputAmount;
  //     } else {
  //       const slippageAdjustedAmountOut = new Fraction(ONE)
  //         .add(slippageTolerance)
  //         .invert()
  //         .multiply(this.outputAmount.raw).quotient;
  //       return this.outputAmount instanceof TokenAmount
  //         ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
  //         : CurrencyAmount.ether(slippageAdjustedAmountOut);
  //     }
  //   }
  //
  //   /**
  //    * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
  //    * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
  //    */
  //   public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
  //     invariant(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
  //     if (this.tradeType === TradeType.EXACT_INPUT) {
  //       return this.inputAmount;
  //     } else {
  //       const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient;
  //       return this.inputAmount instanceof TokenAmount
  //         ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
  //         : CurrencyAmount.ether(slippageAdjustedAmountIn);
  //     }
  //   }
}

function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount;
  if (currencyAmount.currency === DEV) return new TokenAmount(WDEV[chainId], currencyAmount.raw);
  invariant(false, "CURRENCY");
}

function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency;
  if (currency === DEV) return WDEV[chainId];
  invariant(false, "CURRENCY");
}
