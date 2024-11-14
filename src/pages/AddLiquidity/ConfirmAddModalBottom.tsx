import { Currency, CurrencyAmount, Fraction, Percent } from "tigger-swap-sdk";
import React from "react";
import { Text } from "rebass";
import { ButtonPrimary } from "../../components/Button";
// import { RowBetween /* RowFixed */ } from "../../components/Row";
import CurrencyLogo from "../../components/CurrencyLogo";
import { Field } from "../../state/mint/actions";
// import { TYPE } from "../../theme";
import { WrapInfo } from "../styleds";
import { useTranslation } from "react-i18next";

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}: {
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <WrapInfo>
        <dl>
          <dt>{t("depositedSymbol", { symbol: currencies[Field.CURRENCY_A]?.symbol })}</dt>
          <dd>
            <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: "8px" }} />{" "}
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </dd>
        </dl>
        <dl>
          <dt>{t("depositedSymbol", { symbol: currencies[Field.CURRENCY_B]?.symbol })}</dt>
          <dd>
            <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: "8px" }} />{" "}
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </dd>
        </dl>
        <dl>
          <dt>{t("rates")}</dt>
          <dd>
            {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
              currencies[Field.CURRENCY_B]?.symbol
            }`}{" "}
            <br />
            {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
              currencies[Field.CURRENCY_A]?.symbol
            }`}
          </dd>
        </dl>
        <dl>
          <dt>{t("poolShare")}:</dt>
          <dd>{noLiquidity ? "100" : poolTokenPercentage?.toSignificant(4)}%</dd>
        </dl>
      </WrapInfo>
      {/* <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_A]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: "8px" }} />
          <TYPE.body>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_B]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: "8px" }} />
          <TYPE.body>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween> 
      <RowBetween>
        <TYPE.body>Rates</TYPE.body>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween style={{ justifyContent: "flex-end" }}>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween>
        <TYPE.body>Share of Pool:</TYPE.body>
        <TYPE.body>{noLiquidity ? "100" : poolTokenPercentage?.toSignificant(4)}%</TYPE.body>
      </RowBetween>*/}
      <ButtonPrimary style={{ margin: "20px 0 0 0" }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          {noLiquidity ? t("createPoolSupply") : t("confirmSupply")}
        </Text>
      </ButtonPrimary>
    </>
  );
}
