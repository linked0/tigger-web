import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import GoogleAnalyticsReporter from "../components/analytics/GoogleAnalyticsReporter";
import Header from "../components/Header";
import Popups from "../components/Popups";
import Web3ReactManager from "../components/Web3ReactManager";
import DarkModeQueryParamReader from "../theme/DarkModeQueryParamReader";
import AddLiquidity from "./AddLiquidity";
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from "./AddLiquidity/redirects";
import Pool from "./Pool";
import PoolFinder from "./PoolFinder";
import Swap from "./Swap";
import MyAssets from "./MyAssets";
import Bridge from "./Bridge/index";
import RemoveLiquidity from "./RemoveLiquidity";
import { RedirectPathToSwapOnly, RedirectToSwap } from "./Swap/redirects";
import { RedirectOldRemoveLiquidityPathStructure } from "./RemoveLiquidity/redirects";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`;

const BodyWrapper = styled.main`
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px);
  margin: auto;
  padding: 130px 0 50px;
  align-items: center;
  flex: 1;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding-top: 100px;
  `};

  z-index: 1;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

export default function App() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <AppWrapper>
          <Header />
          <BodyWrapper>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/myassets" component={MyAssets} />
                <Route exact strict path="/bridge" component={Bridge} />
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                <Route exact strict path="/find" component={PoolFinder} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                <Route exact path="/add" component={AddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </BodyWrapper>
        </AppWrapper>
      </BrowserRouter>
    </Suspense>
  );
}
