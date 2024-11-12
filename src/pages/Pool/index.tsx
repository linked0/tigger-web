import React, { useContext, useMemo } from "react";
import { ThemeContext } from "styled-components";
import { Pair } from "bizboa-swap-sdk";
// import { Link } from 'react-router-dom'
// import { SwapPoolTabs } from '../../components/NavigationTabs'
import { useTranslation } from "react-i18next";

import Question from "../../components/QuestionHelper";
// import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from "../../state/wallet/hooks";
import { TYPE } from "../../theme";
// import { Text } from 'rebass'

import { LightCard } from "../../components/Card";
// import { RowBetween } from '../../components/Row'

import { useActiveWeb3React } from "../../hooks";
import { usePairs } from "../../data/Reserves";
import { toV2LiquidityToken, useTrackedTokenPairs } from "../../state/user/hooks";
import AppBody from "../AppBody";
import { Dots } from "../../components/swap/styleds";

import CurrencyPool from "../../components/CurrencyPool";
import { ActiveText, BoxHead, BoxMain, WrapWallet } from "../styleds";
import { DIRECTION_CHAIN } from "../../constants";
import { BridgeDirection } from "../../state/transactions/actions";
import TxtDesc from "../../components/TxtDesc";
// import CurrencyPool from '../../components/CurrencyPool'
// import { WrapWallet } from '../styleds'
// import BoxHd from '../../components/BoxHd/index'
// import { BoxBody } from '../../components/BoxBd'
// import TxtDesc from '../../components/TxtDesc'

export default function Pool() {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  );
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ]);
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  );
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan("0") ? true : true
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  );

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair);

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  return (
    <>
      <AppBody>
        <BoxHead>
          <ActiveText>{t("titlePool")}</ActiveText>
          <Question text={t("poolHelper")} />
        </BoxHead>

        <BoxMain>
          <WrapWallet>
            {!account && !chainId ? (
              <LightCard padding="40px">
                <TYPE.body color={theme.grayDark} textAlign="center">
                  {t("connectToViewLiquidity")}
                </TYPE.body>
              </LightCard>
            ) : v2IsLoading ? (
              <LightCard padding="40px">
                <TYPE.body color={theme.grayDark} textAlign="center">
                  <Dots>{t("loading")}</Dots>
                </TYPE.body>
              </LightCard>
            ) : allV2PairsWithLiquidity?.length > 0 ? (
              chainId && DIRECTION_CHAIN[chainId] !== BridgeDirection.ETHNET_BIZNET ? (
                <>
                  {allV2PairsWithLiquidity.map(v2Pair => (
                    <CurrencyPool key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <LightCard padding="40px">
                  <TYPE.body color={theme.grayDark} textAlign="center">
                    {t("noLiquidityFound")}
                  </TYPE.body>
                </LightCard>
              )
            ) : null}
            <TxtDesc />
          </WrapWallet>
        </BoxMain>
      </AppBody>
    </>
  );
}
