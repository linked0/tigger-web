import { Token, Trade, TradeType } from "bizboa-swap-sdk";

import React, { useMemo, useState } from "react";
import { Repeat } from "react-feather";
import { Text } from "rebass";
import { WrapInfo } from "../../pages/styleds";
import { Field } from "../../state/swap/actions";
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from "../../utils/prices";
import { ButtonError } from "../Button";
import QuestionHelper from "../QuestionHelper";
import { AutoRow } from "../Row";
import FormattedPriceImpact from "./FormattedPriceImpact";
import { StyledBalanceMaxMini, SwapCallbackError } from "./styleds";
import { useTranslation } from "react-i18next";

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade;
  allowedSlippage: number;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const { t } = useTranslation();
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ]);
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  const severity = warningSeverity(priceImpactWithoutFee);

  return (
    <>
      <WrapInfo>
        <dl>
          <dt>{t("price")}</dt>
          <dd>
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </dd>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("tradeHelper")} />
            {trade.tradeType === TradeType.EXACT_INPUT ? t("tradeMin") : t("tradeMax")}
          </dt>
          <dd>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
              : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}{" "}
            {trade.tradeType === TradeType.EXACT_INPUT
              ? trade.outputAmount.currency.symbol
              : trade.inputAmount.currency.symbol}
          </dd>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("priceImpactHelper")} />
            {t("priceImpact")}
          </dt>
          <dd>
            <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
          </dd>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("feeHelper")} />
            {t("fee")}
          </dt>
          <dd>{realizedLPFee ? realizedLPFee?.toSignificant(6) + " " + trade.inputAmount.currency.symbol : "-"}</dd>
        </dl>
      </WrapInfo>

      {/* <AutoColumn gap="0px">*/}
      {/*  <RowBetween align="center">*/}
      {/*    <Text fontWeight={400} fontSize={14} color={theme.text2}>*/}
      {/*      Price*/}
      {/*    </Text>*/}
      {/*    <Text*/}
      {/*      fontWeight={500}*/}
      {/*      fontSize={14}*/}
      {/*      color={theme.text1}*/}
      {/*      style={{*/}
      {/*        justifyContent: "center",*/}
      {/*        alignItems: "center",*/}
      {/*        display: "flex",*/}
      {/*        textAlign: "right",*/}
      {/*        paddingLeft: "10px"*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      {formatExecutionPrice(trade, showInverted)}*/}
      {/*      <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>*/}
      {/*        <Repeat size={14} />*/}
      {/*      </StyledBalanceMaxMini>*/}
      {/*    </Text>*/}
      {/*  </RowBetween>*/}

      {/*  <RowBetween>*/}
      {/*    <RowFixed>*/}
      {/*      <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>*/}
      {/*        {trade.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sold"}*/}
      {/*      </TYPE.black>*/}
      {/*      <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />*/}
      {/*    </RowFixed>*/}
      {/*    <RowFixed>*/}
      {/*      <TYPE.black fontSize={14}>*/}
      {/*        {trade.tradeType === TradeType.EXACT_INPUT*/}
      {/*          ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"*/}
      {/*          : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}*/}
      {/*      </TYPE.black>*/}
      {/*      <TYPE.black fontSize={14} marginLeft={"4px"}>*/}
      {/*        {trade.tradeType === TradeType.EXACT_INPUT*/}
      {/*          ? trade.outputAmount.currency.symbol*/}
      {/*          : trade.inputAmount.currency.symbol}*/}
      {/*      </TYPE.black>*/}
      {/*    </RowFixed>*/}
      {/*  </RowBetween>*/}
      {/*  <RowBetween>*/}
      {/*    <RowFixed>*/}
      {/*      <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>*/}
      {/*        Price Impact*/}
      {/*      </TYPE.black>*/}
      {/*      <QuestionHelper text="The difference between the market price and your price due to trade size." />*/}
      {/*    </RowFixed>*/}
      {/*    <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />*/}
      {/*  </RowBetween>*/}
      {/*  <RowBetween>*/}
      {/*    <RowFixed>*/}
      {/*      <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>*/}
      {/*        Liquidity Provider Fee*/}
      {/*      </TYPE.black>*/}
      {/*      <QuestionHelper text="A portion of each trade (1.5%) goes to liquidity providers as a protocol incentive." />*/}
      {/*    </RowFixed>*/}
      {/*    <TYPE.black fontSize={14}>*/}
      {/*      {realizedLPFee ? realizedLPFee?.toSignificant(6) + " " + trade.inputAmount.currency.symbol : "-"}*/}
      {/*    </TYPE.black>*/}
      {/*  </RowBetween>*/}
      {/*</AutoColumn> */}

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{ margin: "40px 0 0 0" }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {severity > 2 ? t("swapAnyway") : t("confirmSwap")}
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  );
}

export function BridgeModalFooter({
  trade,
  onConfirm,
  estimation,
  txFee,
  swapFee,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade;
  estimation: string;
  txFee: string;
  swapFee: string;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  // const [showInverted, setShowInverted] = useState<boolean>(false);
  // const theme = useContext(ThemeContext);
  const slippageAdjustedAmounts = estimation;
  const { t } = useTranslation();
  const feeSymbol = useMemo(() => {
    return trade.inputAmount instanceof Token ? "ETH" : t("BOA");
  }, [trade, t]);
  return (
    <>
      <WrapInfo>
        <dl>
          <dt>{t("price")}</dt>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("minimumReceivedHelper")} />
            {t("minimumReceived")}
          </dt>
          <dd>
            {slippageAdjustedAmounts ?? "-"} {trade.inputAmount.currency.symbol}
          </dd>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("feeHelper")} />
            {t("fee")}
          </dt>
          <dd>
            {swapFee} {feeSymbol}
          </dd>
        </dl>
        <dl>
          <dt>
            <QuestionHelper text={t("gasTokenUseHelper")} />
            {t("gasTokenUse")}
          </dt>
          <dd>
            {txFee} {t("BOA")}
          </dd>
        </dl>
      </WrapInfo>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          // error={severity > 2}
          style={{ margin: "40px 0 0 0" }}
          id="confirm-brige-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {/*{severity > 2 ? "Swap Anyway" : "Confirm Swap"}*/}
            {t("confirmBridge")}
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  );
}
