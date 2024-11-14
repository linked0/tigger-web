import { Currency, Percent, Price } from "tigger-swap-sdk";
import React, { useContext } from "react";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components";
import { ONE_BIPS } from "../../constants";
import { Field } from "../../state/mint/actions";
import { WrapInfo } from "../styleds";
import { useTranslation } from "react-i18next";

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  currencies: { [field in Field]?: Currency };
  noLiquidity?: boolean;
  poolTokenPercentage?: Percent;
  price?: Price;
}) {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <WrapInfo className="">
      <dl>
        <InfoDt color={theme.text2}>
          {t("per", { left: currencies[Field.CURRENCY_B]?.symbol, right: currencies[Field.CURRENCY_A]?.symbol })}
        </InfoDt>
        <dd>{price?.toSignificant(6) ?? "-"}</dd>
      </dl>
      <dl>
        <InfoDt color={theme.text2}>
          {t("per", { left: currencies[Field.CURRENCY_A]?.symbol, right: currencies[Field.CURRENCY_B]?.symbol })}
        </InfoDt>
        <dd>{price?.invert()?.toSignificant(6) ?? "-"}</dd>
      </dl>
      <dl>
        <InfoDt color={theme.text2}>{t("poolShare")}</InfoDt>
        <dd>
          {noLiquidity && price
            ? "100"
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? "<0.01" : poolTokenPercentage?.toFixed(2)) ?? "0"}
          %
        </dd>
      </dl>
    </WrapInfo>
  );
}

const InfoDt = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.grayTxt};
  line-height: 1.5;
`;
