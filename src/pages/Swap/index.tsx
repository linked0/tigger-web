import { CurrencyAmount, JSBI, Token, Trade } from "bizboa-swap-sdk";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ArrowDown } from "react-feather";
import ReactGA from "react-ga4";
import { Text } from "rebass";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "styled-components";
import AddressInputPanel from "../../components/AddressInputPanel";
import { ButtonConfirmed, ButtonError, ButtonPrimary } from "../../components/Button";
import { GreyCard } from "../../components/Card";
import ConfirmSwapModal from "../../components/swap/ConfirmSwapModal";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import { AutoRow, RowBetween } from "../../components/Row";
import confirmPriceImpactWithoutFee from "../../components/swap/confirmPriceImpactWithoutFee";
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from "../../components/swap/styleds";
import TradePrice from "../../components/swap/TradePrice";
import TokenWarningModal from "../../components/TokenWarningModal";
import ProgressSteps from "../../components/ProgressSteps";
import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallbackFromTrade } from "../../hooks/useApproveCallback";
import useENSAddress from "../../hooks/useENSAddress";
import { useSwapCallback } from "../../hooks/useSwapCallback";
import useToggledVersion, { Version } from "../../hooks/useToggledVersion";
import useWrapCallback, { WrapType } from "../../hooks/useWrapCallback";
import { useTransactionModalToggle, useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/swap/actions";
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from "../../state/swap/hooks";
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from "../../state/user/hooks";
import { LinkStyledButton, TYPE } from "../../theme";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import AppBody from "../AppBody";
import Loader from "../../components/Loader";

import { TxtDescRight, WrapInfo } from "../../components/AccordionInfo";
import { BoxBody } from "../../components/BoxBd";
import TxtDesc from "../../components/TxtDesc";
import BoxHd from "../../components/BoxHd";
import { AreaButton } from "../styleds";
import { useLocation } from "react-router-dom";
import { useSwapable } from "../../hooks/useENSName";
import { changeNetwork } from "../../components/Wallet";
import { OPPOSITE_CHAIN } from "../../constants";
import QuestionHelper from "../../components/QuestionHelper";

export default function Swap() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const loadedUrlParams = useDefaultsFromURLSearch(state);
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(true);
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  const { account, chainId } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();
  const toggleTransactionModal = useTransactionModalToggle();

  // for expert mode
  // const toggleSettings = useToggleSettingsMenu();
  const [isExpertMode] = useExpertModeManager();

  // get custom setting values for user
  const [deadline] = useUserDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo();
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  );
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);
  const toggledVersion = useToggledVersion();
  const trade = showWrap
    ? undefined
    : {
        [Version.v2]: v2Trade
      }[toggledVersion];
  const { realizedLPFee } = computeTradePriceBreakdown(trade);

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ""
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  const swapable = useSwapable();
  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
    if (!swapable && chainId && account) {
      const redirectChainId = chainId ? OPPOSITE_CHAIN[chainId] : "";
      const onChangeBridge = function() {};
      changeNetwork(redirectChainId.toString(), onChangeBridge).then(r => console.log("rr :", r));
    }
  }, [approval, approvalSubmitted, chainId, swapable, account]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  );

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash });

        ReactGA.event({
          category: "Swap",
          action:
            recipient === null
              ? "Swap w/o Send"
              : (recipientAddress ?? recipient) === account
              ? "Swap w/o Send + recipient"
              : "Swap w/ Send",
          label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol].join("/")
        });
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        });
      });
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection]
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ]);

  return (
    <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <AppBody>
        {/*<SwapPoolTabs active={"swap"} />*/}
        {/* Header 공통 컴포넌트 만들었습니다. */}
        <BoxHd title={t("titleSwap")} account={account} toggleWalletModal={toggleTransactionModal} />
        <BoxBody>
          <Wrapper id="swap-page">
            <ConfirmSwapModal
              isOpen={showConfirm}
              trade={trade}
              originalTrade={tradeToConfirm}
              onAcceptChanges={handleAcceptChanges}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={recipient}
              allowedSlippage={allowedSlippage}
              onConfirm={handleSwap}
              swapErrorMessage={swapErrorMessage}
              onDismiss={handleConfirmDismiss}
            />

            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && !showWrap && trade ? "From (estimated)" : "From"}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              disableCurrencySelect={!swapable}
              // style={{ marginBottom: '0' }} 간격이 너무 벌어져 있어서 이렇게 스타일값 넣고 싶은데 오류 납니다.
              id="swap-currency-input"
            />

            {/* /components/ButtonSwap/에 컴포넌트 만들어놨습니다. */}
            <AreaButton>
              {/* <ButtonSwap> */}
              <AutoRow justify={isExpertMode ? "space-between" : "center"}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false); // reset 2 step UI for approvals
                      onSwitchTokens();
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient("")}>
                    {t("addSend")}
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
              {/* </ButtonSwap> */}
            </AreaButton>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? "To (estimated)" : "To"}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              disableCurrencySelect={!swapable}
              id="swap-currency-output"
            />

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: "0 1rem" }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    {t("removeSend")}
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {/*{showWrap ? null : (*/}
            {/*  <Card padding={".25rem .75rem 0 .75rem"} borderRadius={"20px"}>*/}
            {/*    <AutoColumn gap="4px">*/}
            {/*      {Boolean(trade) && (*/}
            {/*        <RowBetween align="center">*/}
            {/*          <Text fontWeight={500} fontSize={14} color={theme.text2}>*/}
            {/*            {t("price")}*/}
            {/*          </Text>*/}
            {/*          <TradePrice*/}
            {/*            price={trade?.executionPrice}*/}
            {/*            showInverted={showInverted}*/}
            {/*            setShowInverted={setShowInverted}*/}
            {/*          />*/}
            {/*        </RowBetween>*/}
            {/*      )}*/}
            {/*      {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (*/}
            {/*        <RowBetween align="center">*/}
            {/*          <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>*/}
            {/*            Slippage Tolerance*/}
            {/*          </ClickableText>*/}
            {/*          <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>*/}
            {/*            {allowedSlippage / 100}%*/}
            {/*          </ClickableText>*/}
            {/*        </RowBetween>*/}
            {/*      )}*/}
            {/*    </AutoColumn>*/}
            {/*  </Card>*/}
            {/*)}*/}

            {/*<AccordionInfo />*/}
            <WrapInfo className="arrow">
              <ul>
                <li>
                  <dl>
                    <dt>
                      <QuestionHelper text={t("priceSwapHelper")} />
                      {t("price")}
                    </dt>
                    <dd>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </dd>
                  </dl>
                </li>
                <li>
                  <dl>
                    <dt>
                      <QuestionHelper text={t("feeHelper")} />
                      {t("fee")}
                    </dt>
                    <dd>
                      {" "}
                      {realizedLPFee
                        ? `${realizedLPFee.toSignificant(4)} ${trade ? trade.inputAmount.currency.symbol : "-"}`
                        : "-"}
                    </dd>
                  </dl>
                </li>
              </ul>
              {trade ? (
                <TxtDescRight>
                  {t("slippageTolerance") + " : "} {allowedSlippage / 100}%
                </TxtDescRight>
              ) : null}
            </WrapInfo>
            {/* marginTop: '2.6rem'  */}
            <TxtDesc />

            <BottomGrouping>
              {!account ? (
                <ButtonPrimary onClick={toggleWalletModal}>{t("connectWallet")}</ButtonPrimary>
              ) : showWrap ? (
                <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? "Wrap" : wrapType === WrapType.UNWRAP ? "Unwrap" : null)}
                </ButtonPrimary>
              ) : noRoute && userHasSpecifiedInputOutput ? (
                <GreyCard style={{ textAlign: "center" }}>
                  <TYPE.main mb="4px">{t("insufficientLiquidityForThisTrade")}</TYPE.main>
                </GreyCard>
              ) : showApproveFlow ? (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    width="48%"
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
                      t("approve") + " " + currencies[Field.INPUT]?.symbol
                    )}
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap();
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined
                        });
                      }
                    }}
                    width="48%"
                    id="swap-button"
                    disabled={
                      !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    error={isValid && priceImpactSeverity > 2}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? t("priceImpactHigh1")
                        : t("priceImpactHigh2", { anyway: priceImpactSeverity > 2 ? t("anyway") : "" })}
                    </Text>
                  </ButtonError>
                </RowBetween>
              ) : (
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap();
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      });
                    }
                  }}
                  id="swap-button"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {swapInputError
                      ? swapInputError
                      : priceImpactSeverity > 3 && !isExpertMode
                      ? t("priceImpactHigh1", { too: t("too") })
                      : t("priceImpactHigh2", { anyway: priceImpactSeverity > 2 ? t("anyway") : "" })}
                  </Text>
                </ButtonError>
              )}
              {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </BottomGrouping>
          </Wrapper>
        </BoxBody>
      </AppBody>
      {/*<AdvancedSwapDetailsDropdown trade={trade} />*/}
      {/* <SwapModal /> */}
      {/* 나머지 모달은 BridgeUI 모달과 중복됩니다. */}
    </>
  );
}

//465: {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
