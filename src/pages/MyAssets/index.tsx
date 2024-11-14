import React, { useMemo } from "react";
import AppBody from "../AppBody";
import { WalletForAssets } from "../../components/WalletModal";
import useENSName from "../../hooks/useENSName";
import { useWeb3React } from "@web3-react/core";
import { NetworkContextName } from "../../constants";
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
import { TransactionDetails } from "../../state/transactions/reducer";

// import styled from 'styled-components'
import { CurrencySearchForAssets } from "../../components/SearchModal/CurrencySearch";
import TxtDesc from "../../components/TxtDesc";
import { Currency } from "tigger-swap-sdk";
import { useHistory } from "react-router-dom";
import { WrappedTokenInfo } from "../../state/lists/hooks";

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

export default function MyAssets() {
  const { active, account } = useWeb3React();
  const contextNetwork = useWeb3React(NetworkContextName);
  const { ENSName } = useENSName(account ?? undefined);
  const history = useHistory();
  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash);
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash);
  if (!contextNetwork.active && !active) {
    return null;
  }
  const empty = () => {};
  const onCurrencySelect = (currency: Currency) => {
    if (currency instanceof WrappedTokenInfo) {
      const info = currency as WrappedTokenInfo;
      history.push({
        pathname: "/swap",
        state: { inputCurrency: info.address }
      });
    } else {
      history.push({
        pathname: "/swap",
        state: { inputCurrency: "ETH" }
      });
    }
  };

  return (
    <>
      <AppBody>
        {/* 내부 소스를 찾을 수 없어 퍼블리싱을 했습니다. */}

        <WalletForAssets
          pendingTransactions={pending}
          confirmedTransactions={confirmed}
          ENSName={ENSName ?? undefined}
        />

        <CurrencySearchForAssets
          isOpen={true}
          onDismiss={empty}
          onCurrencySelect={onCurrencySelect}
          onChangeList={empty}
          selectedCurrency={null}
          otherSelectedCurrency={null}
          showCommonBases={false}
        />

        <TxtDesc></TxtDesc>
      </AppBody>
    </>
  );
}
