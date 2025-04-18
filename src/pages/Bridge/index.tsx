import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChainId, Currency, CurrencyAmount, DEV, JSBI, Token, TokenAmount, Trade } from "tigger-swap-sdk";
import { BigNumber, utils } from "ethers";
import crypto from "crypto";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BRIDGE_NETWORKS, TOKEN_BRIDGE_NETWORKS } from "../../constants/multicall";
import { ButtonConfirmed, ButtonError } from "../../components/Button";
import { AutoRow, RowBetween } from "../../components/Row";
import Loader from "../../components/Loader";
import { CurrencyInputPanelForBridge, CurrencyInputSelect } from "../../components/CurrencyInputPanel";
import { ApprovalState, useApproveCallback } from "../../hooks/useApproveCallback";
import { useActiveWeb3React } from "../../hooks";
import { useBridgeActionHandlers, useBridgeState, useDerivedBridgeInfo } from "../../state/bridge/hooks";
import { Field } from "../../state/swap/actions";
import { maxAmountSpend } from "../../utils/maxAmountSpend";

import AppBody from "../AppBody";
import { AreaButton, BottomGrouping } from "../styleds";
import { WrapInfo } from "../../components/AccordionInfo";
import TxtDesc from "../../components/TxtDesc";
import { BoxBody } from "../../components/BoxBd";
import { Text } from "rebass";
import { ConfirmBridgeModal } from "../../components/swap/ConfirmSwapModal";

import { ArrowWrapperBridge, SwapCallbackError, Wrapper } from "../../components/swap/styleds";
import { useBridgeCallback } from "../../hooks/useBridgeCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import BoxHd from "../../components/BoxHd";
import { DIRECTION_CHAIN, OPPOSITE_CHAIN } from "../../constants";
import { BridgeDirection, CurrencyType } from "../../state/transactions/actions";
import ProgressSteps from "../../components/ProgressSteps";
import QuestionHelper from "../../components/QuestionHelper";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { useSwapable } from "../../hooks/useENSName";
import { useAllTokens } from "../../hooks/Tokens";
import { filterTokens } from "../../components/SearchModal/filtering";

const URI = require("urijs");

// 1. balance
// 2. secret key
// 3. swap_fee
// 4. Apporve only from ethereum
// 5. Create deposit
// 6. check deposit
// 7. Send information of deposit lock box
// 8. check withdraw
// 9. balance

const BRIDGE_SERVER_URL = process.env.REACT_APP_BRIDGE_SERVER_URL;

export default function Networks() {
  const { chainId, account } = useActiveWeb3React();

  const oppositeChainId = useMemo(() => {
    if (chainId) {
      return OPPOSITE_CHAIN[chainId];
    }
    return null;
  }, [chainId]);

  const toggleWalletModal = useWalletModalToggle();
  const rendered = useRef(0);
  const [bridgeServerStatus, setBridgeServerStatus] = useState(true);
  const [lessSendAmount, setLessSendAmount] = useState(true);
  const [swapFee, setSwapFee] = useState("0");
  const [txFee, setTxFee] = useState("0");
  const [estimation, setEstimation] = useState("0");
  const [inputCurrency, setInputCurrency] = useState<Token | Currency>();
  const chainDirection = useMemo(() => {
    return chainId ? DIRECTION_CHAIN[chainId].toString() : "";
  }, [chainId]);

  const { independentField, typedValue, recipient, bridgeType } = useBridgeState();
  const { v2Trade, currencies, currencyBalances, parsedAmount, inputError: bridgeInputError } = useDerivedBridgeInfo(
    estimation,
    chainDirection,
    bridgeType as CurrencyType
  );

  console.log("currencies", currencies);

  const outputCurrency = currencies[Field.OUTPUT];
  const bridgeCurrencyType = useMemo(() => {
    return inputCurrency instanceof Token && outputCurrency instanceof Token ? "1" : "0";
  }, [inputCurrency, outputCurrency]);
  const showWrap = false;
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : v2Trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : v2Trade?.outputAmount
      };

  const { onChainSelection, onUserInput, onSelectCurrency, onSwitchChains } = useBridgeActionHandlers();

  const isValid = !bridgeInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );

  // modal and loading
  const [{ showConfirm, tradeToConfirm, bridgeErrorMessage, attemptingTxn, txHash }, setBridgeState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    bridgeErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    bridgeErrorMessage: undefined,
    txHash: undefined
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ""
  };

  const handleConfirmDismiss = useCallback(() => {
    setBridgeState({ showConfirm: false, tradeToConfirm, attemptingTxn, bridgeErrorMessage, txHash });
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
  }, [attemptingTxn, onUserInput, bridgeErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setBridgeState({ tradeToConfirm: v2Trade, bridgeErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, bridgeErrorMessage, v2Trade, txHash]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));
  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const [feeSymbol, setFeeSymbol] = useState("NONE");

  const estimateForBoaType = useCallback((res: AxiosResponse<any>, boa: Amount) => {
    const swap_fee = BigNumber.from(res?.data.data.swap_fee);
    const tx_fee = BigNumber.from(res?.data.data.tx_fee);
    const swap_feefy = utils.formatUnits(swap_fee, boa.decimal);
    const tx_feefy = utils.formatUnits(tx_fee, boa.decimal);
    const estimation_bn = boa.value.sub(swap_fee).sub(tx_fee);
    console.log("swap_fee", swap_fee);
    console.log("tx_fee", tx_fee);
    console.log("estimation_bn", estimation_bn);
    console.log("boa.decimal", boa.decimal);
    const estimation = utils.formatUnits(estimation_bn, boa.decimal);
    setSwapFee(swap_feefy);
    setTxFee(tx_feefy);
    setFeeSymbol("BOA");
    estimation_bn.lt(1) && boa.value.gt(0) ? setLessSendAmount(true) : setLessSendAmount(false);
    return estimation;
  }, []);
  const estimateForTokenType = useCallback(
    (res: AxiosResponse<any>, boa: Amount) => {
      const swap_fee = BigNumber.from(res?.data.data.swap_fee);
      const tx_fee = BigNumber.from(res?.data.data.tx_fee);
      const swap_feefy = utils.formatUnits(swap_fee, 18);
      const tx_feefy = utils.formatUnits(tx_fee, 18);
      const estimation_bn = boa.value;
      const estimation = utils.formatUnits(estimation_bn, boa.decimal);
      setSwapFee(swap_feefy);
      setTxFee(tx_feefy);
      setFeeSymbol(chainDirection === BridgeDirection.ETHNET_BIZNET.toString() ? "ETH" : "BOA");
      estimation_bn.lt(1) && boa.value.gt(0) ? setLessSendAmount(true) : setLessSendAmount(false);
      return estimation;
    },
    [chainDirection]
  );

  const getEstimation = useCallback(async () => {
    const boa =
      bridgeCurrencyType === CurrencyType.BOA
        ? chainDirection === BridgeDirection.ETHNET_BIZNET.toString()
          ? BOAToken.make(typedValue)
          : BOACoin.make(typedValue)
        : Amount.make(typedValue, inputCurrency ? (inputCurrency as Currency)?.decimals : 0);
    const bridgeUrl = BRIDGE_SERVER_URL;
    const client = new Client();
    console.log("decimals", inputCurrency?.decimals);
    console.log("typedValue", typedValue, "boa", boa.toString());
    const uri = URI(bridgeUrl)
      .directory("bridge/fees")
      .addQuery("amount", boa.toString())
      .addQuery("type", bridgeCurrencyType)
      .addQuery("direction", chainDirection);
    let response = null;
    try {
      response = await client.get(uri.toString());
    } catch (error) {
      setBridgeServerStatus(false);
    }

    if (response) {
      setBridgeServerStatus(true);
      const estimation =
        bridgeCurrencyType === CurrencyType.BOA
          ? estimateForBoaType(response, boa)
          : estimateForTokenType(response, boa);
      console.log("estimation", estimation);
      return estimation;
    }
    setBridgeServerStatus(false);
    return "0";
  }, [typedValue, chainDirection, bridgeCurrencyType, inputCurrency, estimateForBoaType, estimateForTokenType]);

  const [boxId, secretKey, secretLock] = useMemo(() => {
    const refresh = !estimation;
    const key_buffer = ContractUtils.createKey();
    const lock_buffer = ContractUtils.sha256(key_buffer);
    const secretKey = ContractUtils.BufferToString(key_buffer);
    const secretLock = ContractUtils.BufferToString(lock_buffer);
    const boxId = ContractUtils.BufferToString(ContractUtils.createLockBoxID());
    return [boxId, secretKey, secretLock, refresh];
  }, [estimation]);

  const { callback: bridgeCallback, error: swapCallbackError } = useBridgeCallback(
    v2Trade,
    recipient,
    boxId,
    secretKey,
    secretLock,
    swapFee,
    txFee
  );

  const handleSwap = useCallback(() => {
    if (!bridgeCallback) {
      return;
    }
    setBridgeState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      bridgeErrorMessage: undefined,
      txHash: undefined
    });
    bridgeCallback()
      .then(hash => {
        setBridgeState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          bridgeErrorMessage: undefined,
          txHash: hash
        });
        ReactGA.event({
          category: "Bridge",
          action: "Bridge Send",
          label: chainDirection
        });
      })
      .catch(error => {
        setBridgeState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          bridgeErrorMessage: error.message,
          txHash: undefined
        });
      });
  }, [tradeToConfirm, showConfirm, bridgeCallback, chainDirection]);

  const currencyAmount: TokenAmount | CurrencyAmount | undefined = inputCurrency
    ? bridgeCurrencyType === CurrencyType.BOA
      ? chainDirection === BridgeDirection.ETHNET_BIZNET.toString()
        ? tryParseAmountB(BOAToken.make(typedValue).toString(), inputCurrency)
        : tryParseAmountB(BOACoin.make(typedValue).toString(), DEV)
      : tryParseAmountB(Amount.make(typedValue, inputCurrency.decimals || 1).toString(), inputCurrency)
    : undefined;
  const changeBridgeState = useCallback(
    (field, bridgeDirection, bridgeCurrencyType, chainId, bridgeId, currencyId) => {
      onChainSelection(field, bridgeDirection, bridgeCurrencyType, {
        chainId: chainId,
        bridgeId: bridgeId,
        currencyId: currencyId
      });
    },
    [onChainSelection]
  );

  const handleNetworkSelect = useCallback(() => {
    if (chainId) {
      setApprovalSubmitted(false);

      const iChainId = chainId ? chainId.toString() : "";
      const iBridgeId = chainId
        ? bridgeCurrencyType === CurrencyType.TOKEN
          ? TOKEN_BRIDGE_NETWORKS[chainId]
          : BRIDGE_NETWORKS[chainId]
        : "";

      changeBridgeState(Field.INPUT, chainDirection, bridgeCurrencyType, iChainId, iBridgeId, inputCurrency?.symbol);

      const oBridgeId = oppositeChainId
        ? bridgeCurrencyType === CurrencyType.TOKEN
          ? TOKEN_BRIDGE_NETWORKS[oppositeChainId as ChainId]
          : BRIDGE_NETWORKS[oppositeChainId as ChainId]
        : "";
      const oChainId = oppositeChainId ? oppositeChainId.toString() : "";
      changeBridgeState(Field.OUTPUT, chainDirection, bridgeCurrencyType, oChainId, oBridgeId, "");

      getEstimation().then(r => {
        parseInt(r) > 0 ? setEstimation(r) : setEstimation("0");
      });
    }
  }, [chainId, bridgeCurrencyType, oppositeChainId, chainDirection, getEstimation, changeBridgeState, inputCurrency]);

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false);
      setInputCurrency(inputCurrency);
      onUserInput(Field.INPUT, "");
      const iCurrencyId =
        inputCurrency && inputCurrency instanceof Token
          ? ((inputCurrency as Token)?.address as string)
          : inputCurrency instanceof Currency
          ? "ETH"
          : "NONE";
      onSelectCurrency(Field.INPUT, iCurrencyId);
    },
    [onSelectCurrency, onUserInput]
  );

  const switchNetwork = useCallback(
    newChainId => {
      if (!chainId || newChainId.toString() === chainId.toString()) return;
      onSwitchChains();
      handleInputSelect(outputCurrency);
    },
    [onSwitchChains, chainId, handleInputSelect, outputCurrency]
  );

  const spender = useMemo(() => {
    return chainId
      ? bridgeCurrencyType === CurrencyType.TOKEN
        ? TOKEN_BRIDGE_NETWORKS[chainId]
        : BRIDGE_NETWORKS[chainId]
      : "";
  }, [bridgeCurrencyType, chainId]);
  const [approval, approveCallback] = useApproveCallback(currencyAmount, spender, true, "bridge");
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  const showApproveFlow =
    !bridgeInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED));

  const allTokensForOppsiteNetwork = useAllTokens(chainId);
  const filterToken = filterTokens(Object.values(allTokensForOppsiteNetwork), "BOA") || [];
  const boaToken: Token | Currency | undefined = filterToken.length > 0 ? filterToken[0] : undefined;
  useEffect(() => {
    if (rendered.current === 0) {
      onUserInput(independentField, "");
      if (inputCurrency === undefined)
        handleInputSelect(parseInt(chainDirection) === BridgeDirection.ETHNET_BIZNET ? boaToken : DEV);
      rendered.current = 1;
    }
    handleNetworkSelect();
  }, [
    chainId,
    handleNetworkSelect,
    independentField,
    onUserInput,
    inputCurrency,
    handleInputSelect,
    boaToken,
    chainDirection
  ]);

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted, chainId]);

  // const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const swapable = useSwapable();
  return (
    <>
      <AppBody>
        <BoxHd title={t("titleBridge")} account={account} toggleWalletModal={toggleWalletModal} showSetting={false} />
        <BoxBody>
          <Wrapper id="swap-page">
            <ConfirmBridgeModal
              isOpen={showConfirm}
              trade={v2Trade}
              originalTrade={tradeToConfirm}
              onAcceptChanges={handleAcceptChanges}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={"recipient"}
              estimation={estimation}
              txFee={txFee}
              swapFee={swapFee}
              onConfirm={handleSwap}
              swapErrorMessage={bridgeErrorMessage}
              onDismiss={handleConfirmDismiss}
            />

            <CurrencyInputPanelForBridge
              selectedChainId={chainId}
              hideBalance={false}
              value={formattedAmounts[Field.INPUT]}
              onUserInput={handleTypeInput}
              showMaxButton={!atMaxAmountInput}
              onMax={handleMaxInput}
              onCurrencySelect={switchNetwork}
              otherCurrency={currencies[Field.OUTPUT]}
              currency={currencies[Field.INPUT]}
              label={t("sendAmount")}
              id="bridge-amount-input"
            />
            <AreaButton>
              <AutoRow justify="center">
                <ArrowWrapperBridge>
                  <CurrencyInputSelect
                    label={"From"}
                    value={formattedAmounts[Field.INPUT]}
                    showMaxButton={!atMaxAmountInput}
                    currency={currencies[Field.INPUT]}
                    onUserInput={handleTypeInput}
                    onMax={handleMaxInput}
                    onCurrencySelect={handleInputSelect}
                    otherCurrency={currencies[Field.OUTPUT]}
                    disableCurrencySelect={!swapable}
                    hideInput={false}
                    id="bridge-currency-input"
                  />
                </ArrowWrapperBridge>
              </AutoRow>
            </AreaButton>

            <CurrencyInputPanelForBridge
              selectedChainId={oppositeChainId as ChainId}
              hideBalance={false}
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeInput}
              estimation={estimation}
              showMaxButton={!atMaxAmountInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleNetworkSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              currency={currencies[Field.OUTPUT]}
              label={t("receiveAmount")}
              id="bridge-amount-output"
            />
            <WrapInfo style={{ marginBottom: "10px" }}>
              <ul>
                <li>
                  <dl>
                    <dt>
                      <QuestionHelper text={t("rateHelper")} />
                      {t("rate")}
                    </dt>
                    <dd>{inputCurrency ? "1 " + inputCurrency.symbol + " = 1 " + inputCurrency.symbol : ""}</dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>
                      <QuestionHelper text={t("bridgeFeeHelper")} />
                      {t("fee")}
                    </dt>
                    <dd>
                      {parseInt(estimation) > 0 ? swapFee : ""} {feeSymbol}
                    </dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>
                      <QuestionHelper text={t("bridgeGasTokenUseHelper")} />
                      {t("gasTokenUse")}
                    </dt>
                    <dd>
                      {parseInt(estimation) > 0 ? txFee : ""} {feeSymbol}
                    </dd>
                  </dl>
                </li>
              </ul>
              {/*<TxtDescRight>Slippage Tolerance : 5%</TxtDescRight>*/}
            </WrapInfo>

            <TxtDesc />

            <BottomGrouping>
              {showApproveFlow ? (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    width="48%"
                    margin="0 5px"
                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                    confirmed={approval === ApprovalState.APPROVED}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        {t("approving")} <Loader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      t("approved")
                    ) : (
                      t("approveBOA")
                    )}
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      setBridgeState({
                        tradeToConfirm: v2Trade,
                        attemptingTxn: false,
                        bridgeErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      });
                    }}
                    id="swap-button"
                    margin="0 5px"
                    disabled={
                      !isValid ||
                      approval !== ApprovalState.APPROVED ||
                      lessSendAmount ||
                      !!swapCallbackError ||
                      !bridgeServerStatus
                    }
                    error={isValid && !!swapCallbackError}
                  >
                    <Text fontSize={20} fontWeight={500} lineHeight={1}>
                      {!bridgeServerStatus
                        ? t("bridgeRelayOut")
                        : lessSendAmount
                        ? t("insufficientSendAmount")
                        : bridgeInputError
                        ? bridgeInputError
                        : t("transferJay")}
                    </Text>
                  </ButtonError>
                </RowBetween>
              ) : (
                <ButtonError
                  onClick={() => {
                    setBridgeState({
                      tradeToConfirm: v2Trade,
                      attemptingTxn: false,
                      bridgeErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    });
                  }}
                  id="swap-button"
                  disabled={!isValid || lessSendAmount || !!swapCallbackError || !bridgeServerStatus}
                  error={isValid && !!swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500} lineHeight={1}>
                    {!bridgeServerStatus
                      ? t("bridgeRelayOut")
                      : lessSendAmount
                      ? t("insufficientSendAmount")
                      : bridgeInputError
                      ? bridgeInputError
                      : t("transferJay2")}
                  </Text>
                </ButtonError>
              )}
              {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
              {bridgeErrorMessage ? <SwapCallbackError error={bridgeErrorMessage} /> : null}
            </BottomGrouping>
          </Wrapper>
        </BoxBody>
      </AppBody>
    </>
  );
}

function tryParseAmountB(value?: string, currency?: Token | Currency): TokenAmount | CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = value;
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

export class ContractUtils {
  public static createKey(): Buffer {
    return crypto.randomBytes(32);
  }

  public static sha256(data: Buffer): Buffer {
    return crypto
      .createHash("sha256")
      .update(data)
      .digest();
  }

  /**
   * It generates hash values.
   * @param address
   * @param name
   * @param symbol
   */
  public static getTokenId(address: string, tokenAddress: string): Buffer {
    return crypto
      .createHash("sha256")
      .update(ContractUtils.StringToBuffer(address))
      .update(ContractUtils.StringToBuffer(tokenAddress))
      .digest();
  }

  public static StringToBuffer(hex: string): Buffer {
    const start = hex.substring(0, 2) === "0x" ? 2 : 0;
    return Buffer.from(hex.substring(start), "hex");
  }

  public static BufferToString(data: Buffer): string {
    return "0x" + data.toString("hex");
  }

  public static createLockBoxID(): Buffer {
    const baseTimestamp = new Date(2020, 0, 1).getTime();
    const nowTimestamp = new Date().getTime();
    const value = Math.floor((nowTimestamp - baseTimestamp) / 1000);
    const timestamp_buffer = Buffer.alloc(4);
    timestamp_buffer.writeUInt32BE(value, 0);
    return Buffer.concat([timestamp_buffer, crypto.randomBytes(28)]);
  }

  public static getTimeStamp(): number {
    return Math.floor(new Date().getTime() / 1000);
  }
}

export class Amount {
  private readonly _value: BigNumber;
  private readonly _decimal: number;

  constructor(value: BigNumber, decimal = 18) {
    this._value = BigNumber.from(value);
    if (decimal < 0) throw new Error("Invalid decimal");
    this._decimal = decimal;
  }

  public get value(): BigNumber {
    return this._value;
  }

  public get decimal(): number {
    return this._decimal;
  }

  public static make(boa: string | number, decimal: number): Amount {
    if (decimal < 0) throw new Error("Invalid decimal");
    const amount = boa.toString();
    if (amount === "") return new Amount(BigNumber.from("0"), decimal);
    const ZeroString = iota(decimal).reduce<string>((p, v) => p + "0", "");
    const numbers = amount.replace(/[,_]/gi, "").split(".");
    if (numbers.length === 1) return new Amount(BigNumber.from(numbers[0] + ZeroString), decimal);
    let tx_decimal = numbers[1];
    if (tx_decimal.length > decimal) tx_decimal = tx_decimal.slice(0, decimal);
    else if (tx_decimal.length < decimal) tx_decimal = tx_decimal.padEnd(decimal, "0");
    const integral = BigNumber.from(numbers[0] + ZeroString);
    return new Amount(integral.add(BigNumber.from(tx_decimal)), decimal);
  }

  public convert(decimal: number): Amount {
    if (decimal < 0) throw new Error("Invalid decimal");
    if (decimal > this._decimal) {
      const factor = decimal - this._decimal;
      return new Amount(this._value.mul(BigNumber.from(10).pow(factor)), decimal);
    } else if (decimal < this._decimal) {
      const factor = this._decimal - decimal;
      return new Amount(this._value.div(BigNumber.from(10).pow(factor)), decimal);
    } else {
      return new Amount(this._value, decimal);
    }
  }

  public toString(): string {
    return this._value.toString();
  }
}

export class BOACoin extends Amount {
  public static DECIMAL = 18;
  constructor(value: BigNumber) {
    super(value, BOACoin.DECIMAL);
  }
  public static make(value: string | number): BOACoin {
    return Amount.make(value, BOACoin.DECIMAL);
  }
}

export class BOAToken extends Amount {
  public static DECIMAL = 7;
  constructor(value: BigNumber) {
    super(value, BOAToken.DECIMAL);
  }
  public static make(value: string | number): BOAToken {
    return Amount.make(value, BOAToken.DECIMAL);
  }
}

export function iota(begin: number, end?: number, step?: number): ArrayRange {
  return new ArrayRange(begin, end, step);
}

/**
 * A ArrayRange that goes through the numbers first, first + step, first + 2 * step, ..., up to and excluding end.
 */
export class ArrayRange {
  /**
   * The first value
   */
  private readonly first: number;

  /**
   * The last value
   */
  private readonly last: number;

  /**
   * The value to add to the current value at each iteration.
   */
  private readonly step: number;

  /**
   * Constructor
   * @param n The starting value.
   * @param p The value that serves as the stopping criterion.
   * This value is not included in the range.
   * @param q The value to add to the current value at each iteration.
   */
  constructor(n: number, p?: number, q?: number) {
    let begin = 0;
    let end = 0;
    let step = 1;
    if (p === undefined && q === undefined) {
      begin = 0;
      end = n;
      step = 1;
    } else if (p !== undefined && q === undefined) {
      begin = n;
      end = p;
      step = 1;
    } else if (p !== undefined && q !== undefined) {
      begin = n;
      end = p;
      step = q;
    }

    if (begin === end || step === 0) {
      this.first = begin;
      this.last = begin;
      this.step = 0;
      return;
    }

    if (begin < end && step > 0) {
      this.first = begin;
      this.last = end - 1;
      this.last -= (this.last - this.first) % step;
      this.step = step;
    } else if (begin > end && step < 0) {
      this.first = begin;
      this.last = end + 1;
      this.last += (this.first - this.last) % (0 - step);
      this.step = step;
    } else {
      this.first = begin;
      this.last = begin;
      this.step = 0;
    }
  }

  /**
   * Returns length
   */
  public get length(): number {
    if (this.step > 0) return 1 + (this.last - this.first) / this.step;
    if (this.step < 0) return 1 + (this.first - this.last) / (0 - this.step);
    return 0;
  }

  /**
   * Performs the specified action for each element in an array.
   * @param callback A function that accepts up to three arguments.
   * forEach calls the callback function one time for each element in the array.
   */
  public forEach(callback: (value: number, index: number) => void) {
    const length = this.length;
    for (let idx = 0, value = this.first; idx < length; idx++, value += this.step) callback(value, idx);
  }

  /**
   * Calls a defined callback function on each element of an array,
   * and returns an array that contains the results.
   * @param callback A function that accepts up to three arguments.
   * The map method calls the callback function one time for each element in the array.
   */
  public map<U>(callback: (value: number, index: number) => U): U[] {
    const array: U[] = [];
    const length = this.length;
    for (let idx = 0, value = this.first; idx < length; idx++, value += this.step) array.push(callback(value, idx));
    return array;
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   * @param callback A function that accepts up to three arguments.
   * The filter method calls the callback function one time for each element in the array.
   */
  public filter(callback: (value: number, index: number) => unknown): number[] {
    const array: number[] = [];
    const length = this.length;
    for (let idx = 0, value = this.first; idx < length; idx++, value += this.step)
      if (callback(value, idx)) array.push(value);
    return array;
  }

  /**
   * Calls the specified callback function for all the elements in an array.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   * @param callback A function that accepts up to four arguments.
   * The reduce method calls the callback function one time for each element in the array.
   * @param initialValue If initialValue is specified,
   * it is used as the initial value to start the accumulation.
   * The first call to the callback function provides this value as an argument instead of an array value.
   * @returns The accumulated value
   */
  public reduce<T>(callback: (previousValue: T, currentValue: number, currentIndex: number) => T, initialValue: T): T {
    let accumulator = initialValue;
    const length = this.length;
    for (let idx = 0, value = this.first; idx < length; idx++, value += this.step)
      accumulator = callback(accumulator, value, idx);
    return accumulator;
  }
}

export class Client {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create();
  }

  public get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise<AxiosResponse>((resolve, reject) => {
      this.client
        .get(url, config)
        .then((response: AxiosResponse) => {
          resolve(response);
        })
        .catch((reason: any) => {
          reject(handleNetworkError(reason));
        });
    });
  }

  public delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise<AxiosResponse>((resolve, reject) => {
      this.client
        .delete(url, config)
        .then((response: AxiosResponse) => {
          resolve(response);
        })
        .catch((reason: any) => {
          reject(handleNetworkError(reason));
        });
    });
  }

  public post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise<AxiosResponse>((resolve, reject) => {
      this.client
        .post(url, data, config)
        .then((response: AxiosResponse) => {
          resolve(response);
        })
        .catch((reason: any) => {
          reject(handleNetworkError(reason));
        });
    });
  }

  public put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise<AxiosResponse>((resolve, reject) => {
      this.client
        .put(url, data, config)
        .then((response: AxiosResponse) => {
          resolve(response);
        })
        .catch((reason: any) => {
          reject(handleNetworkError(reason));
        });
    });
  }
}

export class NetworkError extends Error {
  /**
   * The status code
   */
  public status: number;

  /**
   * The status text
   */
  public statusText: string;

  /**
   * The message of response
   */
  public statusMessage: string;

  /**
   * Constructor
   * @param status        The status code
   * @param statusText    The status text
   * @param statusMessage The message of response
   */
  constructor(status: number, statusText: string, statusMessage: string) {
    super(statusText);
    this.name = "NetworkError";
    this.status = status;
    this.statusText = statusText;
    this.statusMessage = statusMessage;
  }
}

/**
 *  When status code is 404
 */
export class NotFoundError extends NetworkError {
  /**
   * Constructor
   * @param status        The status code
   * @param statusText    The status text
   * @param statusMessage The message of response
   */
  constructor(status: number, statusText: string, statusMessage: string) {
    super(status, statusText, statusMessage);
    this.name = "NotFoundError";
  }
}

/**
 *  When status code is 400
 */
export class BadRequestError extends NetworkError {
  /**
   * Constructor
   * @param status        The status code
   * @param statusText    The status text
   * @param statusMessage The message of response
   */
  constructor(status: number, statusText: string, statusMessage: string) {
    super(status, statusText, statusMessage);
    this.name = "BadRequestError";
  }
}

/**
 * It is a function that handles errors that occur during communication
 * with a server for easy use.
 * @param error This is why the error occurred
 * @returns The instance of Error
 */
export function handleNetworkError(error: any): Error {
  if (error.response !== undefined && error.response.status !== undefined && error.response.statusText !== undefined) {
    let statusMessage: string;
    if (error.response.data !== undefined) {
      if (typeof error.response.data === "string") statusMessage = error.response.data;
      else if (typeof error.response.data === "object" && error.response.data.statusMessage !== undefined)
        statusMessage = error.response.data.statusMessage;
      else if (typeof error.response.data === "object" && error.response.data.errorMessage !== undefined)
        statusMessage = error.response.data.errorMessage;
      else statusMessage = error.response.data.toString();
    } else statusMessage = "";

    switch (error.response.status) {
      case 400:
        return new BadRequestError(error.response.status, error.response.statusText, statusMessage);
      case 404:
        return new NotFoundError(error.response.status, error.response.statusText, statusMessage);
      default:
        return new NetworkError(error.response.status, error.response.statusText, statusMessage);
    }
  } else {
    if (error.message !== undefined) return new Error(error.message);
    else return new Error("An unknown error has occurred.");
  }
}
