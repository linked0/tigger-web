import { createReducer } from "@reduxjs/toolkit";
import {
  Field,
  replaceBridgeState,
  selectChain,
  setRecipient,
  switchChains,
  typeInput,
  selectCurrency
} from "./actions";

export interface BridgeInfoType {
  chainId: string | undefined;
  bridgeId: string | undefined;
  currencyId: string | undefined;
}

export interface BridgeState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly bridgeType: string;
  readonly bridgeDirection: string;
  readonly [Field.INPUT]: {
    readonly chainId: string | undefined;
    readonly bridgeId: string | undefined;
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly chainId: string | undefined;
    readonly bridgeId: string | undefined;
    readonly currencyId: string | undefined;
  };
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
}

const initialState: BridgeState = {
  independentField: Field.INPUT,
  typedValue: "",
  bridgeType: "",
  bridgeDirection: "",
  [Field.INPUT]: {
    chainId: "",
    bridgeId: "",
    currencyId: ""
  },
  [Field.OUTPUT]: {
    chainId: "",
    bridgeId: "",
    currencyId: ""
  },
  recipient: null
};

export default createReducer<BridgeState>(initialState, builder =>
  builder
    .addCase(
      replaceBridgeState,
      (
        state,
        {
          payload: {
            typedValue,
            bridgeType,
            bridgeDirection,
            recipient,
            field,
            inputChainId,
            inputBridgeId,
            inputCurrencyId,
            outputChainId,
            outputBridgeId,
            outputCurrencyId
          }
        }
      ) => {
        return {
          [Field.INPUT]: {
            chainId: inputChainId,
            bridgeId: inputBridgeId,
            currencyId: inputCurrencyId
          },
          [Field.OUTPUT]: {
            chainId: outputChainId,
            bridgeId: outputBridgeId,
            currencyId: outputCurrencyId
          },
          independentField: field,
          typedValue: typedValue,
          bridgeType,
          bridgeDirection,
          recipient
        };
      }
    )
    .addCase(
      selectChain,
      (state, { payload: { bridgeDirection, bridgeType, chainId, bridgeId, currencyId, field } }) => {
        const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
        if (chainId === state[otherField].chainId) {
          // the case where we have to swap the order
          return {
            ...state
          };
        } else {
          // the normal case
          return {
            ...state,
            bridgeDirection,
            bridgeType,
            [field]: { chainId: chainId, bridgeId: bridgeId, currencyId: state[field].currencyId }
          };
        }
      }
    )
    .addCase(switchChains, state => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: {
          chainId: state[Field.OUTPUT].chainId,
          bridgeId: state[Field.OUTPUT].bridgeId,
          currencyId: state[Field.OUTPUT].currencyId
        },
        [Field.OUTPUT]: {
          chainId: state[Field.INPUT].chainId,
          bridgeId: state[Field.INPUT].bridgeId,
          currencyId: state[Field.INPUT].currencyId
        }
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue
      };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    })
    .addCase(selectCurrency, (state, { payload: { field, currencyId } }) => {
      return {
        ...state,
        [field]: { chainId: state[Field.INPUT].chainId, bridgeId: state[Field.INPUT].bridgeId, currencyId: currencyId }
      };
    })
);
