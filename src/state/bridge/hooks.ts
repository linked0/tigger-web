import { AppDispatch, AppState } from "../index";
import { useDispatch, useSelector } from "react-redux";
import { Field, selectChain, selectCurrency, setRecipient, switchChains, typeInput } from "../bridge/actions";
import { useCallback, useMemo } from "react";
import { BridgeInfoType } from "./reducer";
import { Currency, CurrencyAmount, DEV, Token } from "tigger-swap-sdk";
import { useActiveWeb3React } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useAllTokens, useCurrency } from "../../hooks/Tokens";
import useENS from "../../hooks/useENS";
import { useCurrencyBalances } from "../wallet/hooks";
import { useBridgeEthToBiznet, useBridgeBiznetToEth } from "../../hooks/Bridges";
import { isAddress } from "../../utils";
import { tryParseAmount } from "../swap/hooks";
import { filterTokens } from "../../components/SearchModal/filtering";
import { OPPOSITE_CHAIN } from "../../constants";
import { BridgeDirection, CurrencyType } from "../transactions/actions";

export function useBridgeState(): AppState["bridge"] {
  return useSelector<AppState, AppState["bridge"]>(state => state.bridge);
}

export function useBridgeActionHandlers(): {
  onChainSelection: (field: Field, bridgeDirection: string, bridgeType: string, bridge: BridgeInfoType) => void;
  onSwitchChains: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
  onSelectCurrency: (field: Field, currencyId: string) => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const onChainSelection = useCallback(
    (field: Field, bridgeDirection, bridgeType, bridge: BridgeInfoType) => {
      dispatch(
        selectChain({
          field,
          bridgeDirection,
          bridgeType,
          chainId: bridge.chainId || "",
          bridgeId: bridge.bridgeId || "",
          currencyId: bridge.currencyId || ""
        })
      );
    },
    [dispatch]
  );

  const onSwitchChains = useCallback(() => {
    dispatch(switchChains());
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

  const onSelectCurrency = useCallback(
    (field: Field, currencyId: string) => {
      dispatch(selectCurrency({ field, currencyId }));
    },
    [dispatch]
  );

  return {
    onSwitchChains,
    onChainSelection,
    onUserInput,
    onChangeRecipient,
    onSelectCurrency
  };
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedBridgeInfo(
  estimation: string,
  chainDirection: string,
  bridgeCurrencyType: CurrencyType
): {
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  v2Trade: any | undefined;
  inputError?: string;
} {
  const { account, chainId } = useActiveWeb3React();

  const { t } = useTranslation();

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    recipient
  } = useBridgeState();

  const tInputCurrency = useCurrency(inputCurrencyId);
  const inputCurrency = inputCurrencyId !== "" && inputCurrencyId !== undefined ? tInputCurrency : undefined;
  const oppositeChainId = useMemo(() => {
    if (chainId) {
      return OPPOSITE_CHAIN[chainId];
    }
    return null;
  }, [chainId]);
  const allTokensForOppsiteNetwork = useAllTokens(chainId && oppositeChainId ? oppositeChainId : undefined);
  const outputCurrency = useMemo(() => {
    if (!inputCurrency) return undefined;
    const inputCurrencySymbol = inputCurrency ? inputCurrency?.symbol : "NONE";
    const outputCurrencySymbol =
      inputCurrencySymbol === "BOA" && parseInt(chainDirection) === BridgeDirection.ETHNET_BIZNET
        ? "ETH"
        : inputCurrencySymbol;

    const filterToken = filterTokens(Object.values(allTokensForOppsiteNetwork), outputCurrencySymbol || "NONE") || [];
    const currency: Token | Currency | undefined = filterToken.length > 0 ? filterToken[0] : DEV;
    return currency;
  }, [allTokensForOppsiteNetwork, inputCurrency, chainDirection]);

  // const outputCurrency = useCurrency(outputCurrencyId);
  const recipientLookup = useENS(recipient ?? undefined);
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null;

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ]);

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined);

  const bestBridgeEthToBiznet = useBridgeEthToBiznet(
    bridgeCurrencyType,
    parsedAmount ?? undefined,
    outputCurrency ?? undefined,
    estimation,
    chainDirection
  );

  const bestBridgeBiznetToEth = useBridgeBiznetToEth(
    bridgeCurrencyType,
    parsedAmount ?? undefined,
    outputCurrency ?? undefined,
    estimation,
    chainDirection
  );

  const v2Trade = chainDirection === "0" ? bestBridgeEthToBiznet : bestBridgeBiznetToEth;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  };

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = t("connectWallet");
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
  }

  // compare input balance to max input based on version
  const [balanceIn] = [currencyBalances[Field.INPUT]];

  if (balanceIn && parsedAmount && balanceIn.lessThan(parsedAmount)) {
    inputError = t("InsufficientSymbolBalance", { symbol: balanceIn.currency.symbol });
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError
  };
}
