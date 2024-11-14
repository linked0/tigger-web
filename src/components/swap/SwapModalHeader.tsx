import { ChainId, TokenAmount, Trade, TradeType } from "tigger-swap-sdk";
import React, { useContext, useMemo } from "react";

import { AlertTriangle } from "react-feather";
import { ThemeContext } from "styled-components";
import { Field } from "../../state/swap/actions";
import { TYPE } from "../../theme";
import { ButtonPrimary } from "../Button";
import { isAddress, shortenAddress } from "../../utils";
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import { AutoColumn } from "../Column";
import CurrencyLogo from "../CurrencyLogo";
import { ColumnBetween, RowBetween, RowFixed } from "../Row";
import { SwapShowAcceptChanges, TruncatedText } from "./styleds";

import { AreaButton, ButtonSwap, Num, NumRight, SourcesLogo, TxtDesc13, WrapCurrencyInput } from "../../pages/styleds";
import { NETWORK_LABELS } from "../Wallet";
import { useTranslation } from "react-i18next";

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade;
  allowedSlippage: number;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ]);
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <div>
      <WrapCurrencyInput>
        <RowBetween style={{ height: "100%" }}>
          <SourcesLogo>
            <CurrencyLogo currency={trade.inputAmount.currency} size={"22px"} style={{ marginRight: "5px" }} />
            {trade.inputAmount.currency.symbol}
          </SourcesLogo>
          <Num>
            <TruncatedText
              color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ""}
            >
              {trade.inputAmount.toSignificant(6)}
            </TruncatedText>
          </Num>
        </RowBetween>
      </WrapCurrencyInput>
      <AreaButton>
        <ButtonSwap className="arrow" />
      </AreaButton>
      {/* <RowFixed>
        <ArrowDown size="16" color={theme.text2} style={{ marginLeft: "4px", minWidth: "16px" }} />
      </RowFixed> */}

      <WrapCurrencyInput>
        <RowBetween style={{ height: "100%" }}>
          <SourcesLogo>
            <CurrencyLogo currency={trade.outputAmount.currency} size={"22px"} style={{ marginRight: "5px" }} />
            {trade.outputAmount.currency.symbol}
          </SourcesLogo>
          <Num>
            <TruncatedText
              color={
                priceImpactSeverity > 2
                  ? theme.red1
                  : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                  ? theme.primary1
                  : ""
              }
            >
              {trade.outputAmount.toSignificant(6)}
            </TruncatedText>
            <RowFixed gap={"0px"}></RowFixed>
          </Num>
        </RowBetween>
      </WrapCurrencyInput>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={"0px"}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: "8px", minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: ".5rem", width: "fit-content", fontSize: "0.825rem", borderRadius: "12px" }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <TxtDesc13 style={{ margin: "15px 5px" }}>
        {/* <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}> */}
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.subHeader textAlign="left" style={{ width: "100%" }}>
            {t("swapConfirmInfo1")}
            <span>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </span>
            {t("swapConfirmInfo2")}
          </TYPE.subHeader>
        ) : (
          <TYPE.subHeader textAlign="left" style={{ width: "100%" }}>
            {t("swapConfirmInfo3")}
            <span>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </span>
            {t("swapConfirmInfo4")}
          </TYPE.subHeader>
        )}
        {/* </AutoColumn> */}
      </TxtDesc13>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: "12px 0 0 0px" }}>
          <TYPE.subHeader>
            Output will be sent to{" "}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.subHeader>
        </AutoColumn>
      ) : null}
    </div>
  );
}

export function BridgeModalHeader({
  trade,
  estimation,
  txFee,
  swapFee,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade;
  estimation: string;
  txFee: string;
  swapFee: string;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const slippageAdjustedAmounts = estimation;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  return (
    <div style={{ width: "100%" }}>
      <WrapCurrencyInput>
        <ColumnBetween style={{ height: "100%" }}>
          <SourcesLogo>
            <CurrencyLogo
              currency={trade.inputAmount.currency}
              size={"22px"}
              style={{ marginRight: "5px" }}
              isBOA={trade.outputAmount.currency.symbol === "BOA"}
            />
            {trade.inputAmount.currency.symbol}
            {" ("}
            {NETWORK_LABELS[(trade.inputAmount as TokenAmount).token.chainId as ChainId][0]}
            {")"}
          </SourcesLogo>
          <NumRight color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ""}>
            {trade.inputAmount.toSignificant(6)}
          </NumRight>
        </ColumnBetween>
      </WrapCurrencyInput>
      <AreaButton>
        <ButtonSwap className="arrow" />
      </AreaButton>
      <WrapCurrencyInput>
        <ColumnBetween style={{ height: "100%" }}>
          <SourcesLogo>
            <CurrencyLogo
              currency={trade.outputAmount.currency}
              size={"22px"}
              style={{ marginRight: "5px" }}
              isBOA={trade.outputAmount.currency.symbol === "BOA"}
            />
            {trade.outputAmount.currency.symbol}
            {" ("}
            {NETWORK_LABELS[(trade.outputAmount as TokenAmount).token.chainId as ChainId][0]}
            {")"}
          </SourcesLogo>
          <NumRight>
            {slippageAdjustedAmounts}
            <RowFixed gap={"0px"}></RowFixed>
          </NumRight>
        </ColumnBetween>
      </WrapCurrencyInput>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={"0px"}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: "8px", minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: ".5rem", width: "fit-content", fontSize: "0.825rem", borderRadius: "12px" }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <TxtDesc13 style={{ padding: "12px 0 0 0px" }}>
        {t("bridgeConfirmInfo1")}
        <b>
          {slippageAdjustedAmounts} {trade.outputAmount.currency.symbol}
        </b>
        {t("bridgeConfirmInfo2")}
      </TxtDesc13>
      {recipient !== null ? <TxtDesc13>{t("bridgeConfirmInfo3")}</TxtDesc13> : null}
    </div>
  );
}
