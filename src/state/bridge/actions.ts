import { createAction } from "@reduxjs/toolkit";

export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT"
}

export const selectChain = createAction<{
  field: Field;
  bridgeDirection: string;
  bridgeType: string;
  chainId: string;
  bridgeId: string;
  currencyId: string;
}>("bridge/selectChain");
export const switchChains = createAction<void>("bridge/switchChains");
export const typeInput = createAction<{ field: Field; typedValue: string }>("bridge/typeInput");
export const replaceBridgeState = createAction<{
  field: Field;
  typedValue: string;
  bridgeType: string;
  bridgeDirection: string;
  inputChainId?: string;
  inputBridgeId?: string;
  inputCurrencyId?: string;
  outputChainId?: string;
  outputBridgeId?: string;
  outputCurrencyId?: string;
  recipient: string | null;
}>("bridge/replaceBridgeState");
export const setRecipient = createAction<{ recipient: string | null }>("bridge/setRecipient");
export const selectCurrency = createAction<{ field: Field; currencyId: string }>("bridge/selectCurrency");
