import React, { useState } from "react";
import styled from "styled-components";
// import { ButtonSmall03 } from '../Button'
import { BiChevronDown } from "react-icons/bi";

import { RowStart } from "../Row";
import { ButtonSmallRed, WalletHd, WrapCurrencyInput, ButtonSmallDisabled } from "../../pages/styleds";
import { JSBI, Pair, Percent, Token } from "bizboa-swap-sdk";
import { useActiveWeb3React } from "../../hooks";
import { useTokenBalance } from "../../state/wallet/hooks";
import { useTotalSupply } from "../../data/TotalSupply";
import { unwrappedToken } from "../../utils/wrappedCurrency";
import CurrencyLogo from "../CurrencyLogo";
import { Link } from "react-router-dom";
import { currencyId } from "../../utils/currencyId";
import { useTranslation } from "react-i18next";

const PoolWrapCurrencyInput = styled(WrapCurrencyInput)`
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  padding-bottom: 2.5rem;
  max-height: 170px;
  transition: max-height 0.5s;
  &.open {
    max-height: 300px;
    .openitem {
      display: flex;
    }
    .ico-arrow {
      transform: rotate(180deg);
    }
    .poolsize {
      margin-bottom: 10px;
    }
  }
`;
const PoolWalletHd = styled(WalletHd)`
  flex-direction: column;
  align-items: flex-start;
  border: none;
`;
const WalletBd = styled.div`
  z-index: 10;
  padding-top: 0.4rem;
  > div {
    align-items: center;
  }
`;
const WalletFt = styled.div`
  position: absolute;
  top: 56px;
  right: 20px;
`;
const SourcesLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  margin-right: 5px;
  height: 24px;
  border-radius: 50%;
  .coinLogo {
    display: inline-block;
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 auto;
  }
`;
const TxtPlus = styled.p`
  display: inline-block;
  margin: 0 0.6rem;
  vertical-align: middle;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.grayDark};
`;
const TxtCoin = styled.p`
  padding-left: 1.7rem;
  font-size: 14px;
  color: ${({ theme }) => theme.purple3};
`;

const PoolinfoWrap = styled.div`
  max-width: 300px;
  padding-left: 1.7rem;
`;
const PoolDl = styled.dl`
  display: flex;
  align-items: center;
  padding: 0.1rem 0;
  &.openitem {
    display: none;
  }
  &.poolsize {
    margin-bottom: 0;
    transition: margin 0.2s;
  }
`;
const PoolDt = styled.dt`
  /* overflow: hidden; */
  width: 100%;
  /* max-width: 86px; */
  margin-right: 0.2rem;
  font-size: 12px;
  color: ${({ theme }) => theme.grayTxt};
  white-space: nowrap;
  /* text-overflow: ellipsis; */
`;
const PoolDd = styled.dd`
  font-size: 14px;
  color: ${({ theme }) => theme.purple1};
`;

const BtnGrouping = styled.div`
  display: flex;
  flex-direction: column;
`;
const ButtonMore = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 24px;
  border: none;
  background: ${({ theme }) => theme.purpleTxt};
  font-size: 1.7rem;
  color: ${({ theme }) => theme.purple3};
  cursor: pointer;
`;

interface PositionCardProps {
  pair: Pair;
  showUnwrapped?: boolean;
  border?: string;
}

export default function CurrencyPool({ pair, border }: PositionCardProps) {
  const { account } = useActiveWeb3React();

  function isBOA(token: Token): boolean {
    return token.symbol === "BOA";
  }
  const token0IsBoa = isBOA(pair.token0);
  const token0 = token0IsBoa ? pair.token0 : pair.token1;
  const token1 = !token0IsBoa ? pair.token0 : pair.token1;
  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();
  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken);
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined];
  return (
    <>
      {/* open 추가시 열림 */}
      <PoolWrapCurrencyInput className={!showMore ? "close" : "open"}>
        <PoolWalletHd>
          <RowStart>
            <SourcesLogo>
              <CurrencyLogo currency={currency0} />
            </SourcesLogo>
            {currency0.name}
            {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency0.symbol}*/}
            <TxtPlus>+</TxtPlus>
            <SourcesLogo>
              <CurrencyLogo currency={currency1} />
              {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency1.symbol}*/}
            </SourcesLogo>
            {currency1.name}
          </RowStart>
          <RowStart style={{ marginTop: "5px" }}>
            <TxtCoin>
              {currency0.symbol} + {currency1.symbol}
            </TxtCoin>
          </RowStart>
        </PoolWalletHd>
        <WalletBd>
          <PoolinfoWrap>
            <PoolDl className="poolsize">
              {/*<PoolDt>Pool Size : {totalPoolTokens ? totalPoolTokens.token.address : ""}</PoolDt>*/}
              <PoolDt>{t("poolSize")}</PoolDt>
              <PoolDd>{totalPoolTokens ? totalPoolTokens.toSignificant(4) : "-"}</PoolDd>
            </PoolDl>
            <PoolDl className="openitem">
              <PoolDt>{t("yourPooled", { symbol: currency0.symbol })}</PoolDt>
              <PoolDd>{token0Deposited?.toSignificant(6)}</PoolDd>
            </PoolDl>
            <PoolDl className="openitem">
              <PoolDt>{t("yourPooled", { symbol: currency1.symbol })}</PoolDt>
              <PoolDd>{token1Deposited?.toSignificant(6)}</PoolDd>
            </PoolDl>
            <PoolDl className="openitem">
              <PoolDt>{t("yourPoolTokens")}</PoolDt>
              <PoolDd>{userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}</PoolDd>
            </PoolDl>
            <PoolDl>
              <PoolDt>{t("yourPoolShare")}</PoolDt>
              <PoolDd>{poolTokenPercentage ? poolTokenPercentage.toFixed(6) + "%" : "-"}</PoolDd>
            </PoolDl>
          </PoolinfoWrap>
          <ButtonMore className="btn-more" onClick={() => setShowMore(!showMore)}>
            <BiChevronDown className="ico-arrow" />
            <span className="blind">{t("more")}</span>{" "}
          </ButtonMore>
        </WalletBd>
        <WalletFt>
          <BtnGrouping>
            <ButtonSmallRed
              as={Link}
              to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
              style={{ marginBottom: "7px" }}
            >
              {t("add")}
            </ButtonSmallRed>
            <ButtonSmallDisabled as={Link} to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}>
              {t("remove")}
            </ButtonSmallDisabled>
          </BtnGrouping>
        </WalletFt>
      </PoolWrapCurrencyInput>
    </>
  );
}
