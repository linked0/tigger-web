import useENS from "../../hooks/useENS";
import { parseUnits } from "@ethersproject/units";
import { Currency, CurrencyAmount, DEV, JSBI, Token, TokenAmount, Trade } from "tigger-swap-sdk";
import { ParsedQs } from "qs";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { useTradeExactIn, useTradeExactOut } from "../../hooks/Trades";
import useParsedQueryString from "../../hooks/useParsedQueryString";
import { isAddress } from "../../utils";
import { AppDispatch, AppState } from "../index";
import { useCurrencyBalances } from "../wallet/hooks";
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from "./actions";
import { SwapState } from "./reducer";
import { useUserSlippageTolerance } from "../user/hooks";
import { computeSlippageAdjustedAmounts } from "../../utils/prices";
import { useTranslation } from "react-i18next";
import { useSwapable } from "../../hooks/useENSName";
import { ROUTER_ADDRESS } from "../../constants";

export function useSwapState(): AppState["swap"] {
  return useSelector<AppState, AppState["swap"]>(state => state.swap);
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === DEV ? "ETH" : ""
          // currencyId: currency instanceof Token ? currency.address : 'WBOA'
        })
      );
    },
    [dispatch]
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch]
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch]
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  };
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== "0") {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  );
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  v2Trade: Trade | undefined;
  inputError?: string;
} {
  const { account, chainId } = useActiveWeb3React();

  const BAD_RECIPIENT_ADDRESSES: string[] = [
    ROUTER_ADDRESS[chainId ? chainId : ""] // v2 router 02
  ];

  const { t } = useTranslation();

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const recipientLookup = useENS(recipient ?? undefined);
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null;

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ]);

  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined);

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined);
  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined);

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  };

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  };

  const swapable = useSwapable();

  let inputError: string | undefined;
  if (!swapable) {
    inputError = "Unswapable Network";
  }

  if (!account) {
    inputError = inputError ?? t("connectWallet");
  }

  if (!parsedAmount) {
    inputError = inputError ?? t("enterAnAmount");
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? t("selectAToken");
  }

  const formattedTo = isAddress(to);
  if (!to || !formattedTo) {
    inputError = inputError ?? t("enterARecipient");
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? t("invalidRecipt");
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance();

  const slippageAdjustedAmounts =
    v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage);

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = t("InsufficientSymbolBalance", { symbol: amountIn.currency.symbol });
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError
  };
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === "string") {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    if (urlParam.toUpperCase() === "ETH") return "ETH";
    if (valid === false) return "ETH";
  }
  return "ETH" ?? "";
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === "string" && !isNaN(parseFloat(urlParam)) ? urlParam : "";
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === "string" && urlParam.toLowerCase() === "output" ? Field.OUTPUT : Field.INPUT;
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== "string") return null;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return null;
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency);
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency);
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === "string") {
      inputCurrency = "";
    } else {
      outputCurrency = "";
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient);

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(
  state?: any
): { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined {
  const { chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  let parsedQs = useParsedQueryString();
  parsedQs = state ? state : parsedQs;
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >();

  // const boa = useBOAToken(chainId)
  useEffect(() => {
    if (!chainId) return;
    const parsed = queryParametersToSwapState(parsedQs);
    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    );

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId]);

  return result;
}
