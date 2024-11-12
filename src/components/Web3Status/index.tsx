import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { darken } from "polished";
import React, { useMemo } from "react";
// import { Activity } from "react-feather";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import CoinbaseWalletIcon from "../../assets/images/coinbaseWalletIcon.svg";
import FortmaticIcon from "../../assets/images/fortmaticIcon.png";
import PortisIcon from "../../assets/images/portisIcon.png";
import WalletConnectIcon from "../../assets/images/walletConnectIcon.svg";
import { fortmatic, injected, portis, walletconnect, walletlink } from "../../connectors";
import { NetworkContextName } from "../../constants";
import useENSName from "../../hooks/useENSName";
// import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
// import { TransactionDetails } from "../../state/transactions/reducer";
import { shortenAddress } from "../../utils";
import { ButtonSecondary } from "../Button";

import Identicon from "../Identicon";
import Loader from "../Loader";

import { RowBetween } from "../Row";
import WalletModal, { TransactionModal } from "../WalletModal";
import { TransactionDetails } from "../../state/transactions/reducer";

import IcoWorng from "../../assets/images/ico-wrong.svg";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Link } from "react-router-dom";

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + "px" : "32px")};
    width: ${({ size }) => (size ? size + "px" : "32px")};
  }
`;

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleLine};
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.pinkPoint2};
  border: 1px solid ${({ theme }) => theme.pinkPoint2};
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  p {
    color: #fff;
  }
  ::before {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 3px;
    background: url(${IcoWorng}) no-repeat 0 0 / contain;
  }
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.pinkPoint2)};
  }
`;

// connect to
const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background: ${({ theme }) => theme.purple2};
  border: none;
  p {
    color: #fff;
  }
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.05, theme.purple2)};
    color: ${({ theme }) => theme.primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      /* background-color: ${({ theme }) => theme.primary5}; */
      /* border: 1px solid ${({ theme }) => theme.primary5}; */
      color: ${({ theme }) => theme.primaryText1};

      :hover,
      :focus {
        /* border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)}; */
        color: ${({ theme }) => darken(0.05, theme.primaryText1)};
      }
    `}
`;

const Web3StatusConnected = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  p {
    color: ${({ theme }) => theme.purple1} !important;
  }
  font-weight: 500;
  :hover,
  :focus {
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.purpleBg};
  }
`;

const Web3StatusConnectedPending = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.pinkPoint2} !important;
  border: 1px solid ${({ theme }) => theme.pinkPoint2} !important;
  div > p {
    color: ${({ theme }) => theme.white} !important;
  }
  font-weight: 500;
  :hover,
  :focus {
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.primary1};
  }
`;

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  color: #fff;
`;

const StyledLink = styled(Link)`
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 38px;
  padding: 4px 0;
  text-align: center;
  color: ${({ theme }) => theme.purple1};
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
  box-sizing: border-box;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    color: ${({ theme }) => theme.pinkPoint1};
  }
  &.on {
    cursor: pointer;
    outline: none;
    color: ${({ theme }) => theme.pinkPoint1};
    ::before {
      content: "";
      position: absolute;
      bottom: 4px;
      left: 0;
      right: 0;
      height: 1px;
      background-color: ${({ theme }) => theme.pinkPoint1};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    &.on::before {
      display: none;
    }
    span {
      display: none;
    }
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 0 4%;
  `};
`;
// const NetworkIcon = styled(Activity)`
//   margin-left: 0.25rem;
//   margin-right: 0.5rem;
//   width: 16px;
//   height: 16px;
// `;

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />;
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={""} />
      </IconWrapper>
    );
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={""} />
      </IconWrapper>
    );
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={""} />
      </IconWrapper>
    );
  } else if (connector === portis) {
    return (
      <IconWrapper size={16}>
        <img src={PortisIcon} alt={""} />
      </IconWrapper>
    );
  }
  return null;
}

function Web3StatusInner() {
  const { t } = useTranslation();
  const { account, connector, error } = useWeb3React();

  const { ENSName } = useENSName(account ?? undefined);

  // const swapable = useSwapable();
  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash);

  const hasPendingTransactions = Boolean(pending.length);
  const toggleWalletModal = useWalletModalToggle();

  if (account) {
    return (
      <div>
        <StyledLink to="/myassets">
          {hasPendingTransactions ? (
            <Web3StatusConnectedPending id="web3-status-connected-pending" onClick={toggleWalletModal}>
              <RowBetween>
                <Text>
                  {pending?.length} {t("pending")}
                </Text>{" "}
                <Loader stroke="white" />
              </RowBetween>
            </Web3StatusConnectedPending>
          ) : (
            <Web3StatusConnected id="web3-status-connected">
              <Text>{ENSName || shortenAddress(account)}</Text>
              {connector && <StatusIcon connector={connector} />}
            </Web3StatusConnected>
          )}
        </StyledLink>
      </div>
    );
  } else if (error) {
    // 에러
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        {/* <NetworkIcon /> */}
        <Text>{error instanceof UnsupportedChainIdError ? t("wrongNetworkTxt") : t("error")}</Text>
      </Web3StatusError>
    );
  } else {
    // 보라
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <Text>{t("connectToWallet")}</Text>
      </Web3StatusConnect>
    );
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React();
  const contextNetwork = useWeb3React(NetworkContextName);

  const { ENSName } = useENSName(account ?? undefined);

  if (!contextNetwork.active && !active) {
    return null;
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} />
      <TransactionModal ENSName={ENSName ?? undefined} />
    </>
  );
}
