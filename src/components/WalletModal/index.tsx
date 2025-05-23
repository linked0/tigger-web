import React, { useEffect, useMemo, useState } from "react";
import ReactGA from "react-ga4";
import styled from "styled-components";
import { isMobile } from "react-device-detect";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import usePrevious from "../../hooks/usePrevious";
import {
  useTransactionModalOpen,
  useTransactionModalToggle,
  useWalletModalOpen,
  useWalletModalToggle
} from "../../state/application/hooks";

import Modal from "../Modal";
import AccountDetails, { AccountDetailsForAsset } from "../AccountDetails";
import PendingView from "./PendingView";
import Option from "./Option";
import { SUPPORTED_WALLETS } from "../../constants";
import MetamaskIcon from "../../assets/images/metamask.png";
import { ReactComponent as Close } from "../../assets/images/x.svg";
import { fortmatic, injected, portis } from "../../connectors";
import { OVERLAY_READY } from "../../connectors/Fortmatic";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ActiveText, BoxHead } from "../../pages/styleds";
import { useLocation } from "react-router-dom";
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
import { TransactionDetails } from "../../state/transactions/reducer";
import { useTranslation } from "react-i18next";

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 4px;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  * {
    stroke: ${({ theme }) => theme.text4};
  }
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 0.2rem 0 0 0.4rem;
  font-weight: 500;
  margin-bottom: 0.7rem;
  color: ${props => (props.color === "blue" ? ({ theme }) => theme.primary1 : "inherit")};
`;

const ContentWrapper = styled.div`
  /* background-color: ${({ theme }) => theme.bg2}; */
  /* padding: 0.4rem 0; */
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const Blurb = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

const HoverText = styled.h2`
  display: flex;
  align-items: center;
  height: 30px;
  font-weight: 500;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.purple1};
  svg {
    display: inline-block;
    margin: -3px 8px 0 0;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.grayDark};
    vertical-align: middle;
  }
  :hover {
    cursor: pointer;
  }
  &::before {
    content: "\f060";
    margin-right: 5px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.purple1};
  }
`;

const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending"
};
// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

export function TransactionModal({ ENSName }: { ENSName?: string }) {
  const { error } = useWeb3React();

  const transactionModalOpen = useTransactionModalOpen();
  const toggleTransactionModal = useTransactionModalToggle();

  const empty = () => null;
  const location = useLocation();
  const page = location.pathname.split("/")[1];

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pendingTransactions = sortedRecentTransactions
    .filter(tx => !tx.receipt)
    .filter(tx => (page === "swap" ? tx.txCategory === "swap" : tx.txCategory === "bridge"))
    .map(tx => tx.hash);

  const confirmedTransactions = sortedRecentTransactions
    .filter(tx => tx.receipt)
    .filter(tx => (page === "swap" ? tx.txCategory === "swap" : tx.txCategory === "bridge"))
    .map(tx => tx.hash);

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleTransactionModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? "Wrong Network" : "Error connecting"}</HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>Please connect to supported network.</h5>
            ) : (
              "Error connecting. Try refreshing the page."
            )}
          </ContentWrapper>
        </UpperSection>
      );
    }

    return (
      <AccountDetails
        toggleModal={toggleTransactionModal}
        pendingTransactions={pendingTransactions}
        confirmedTransactions={confirmedTransactions}
        ENSName={ENSName}
        openOptions={empty}
      />
    );
  }

  return (
    <Modal isOpen={transactionModalOpen} onDismiss={toggleTransactionModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
}

export default function WalletModal({ ENSName }: { ENSName?: string }) {
  const { active, account, connector, activate, error } = useWeb3React();
  const { t } = useTranslation();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const walletModalOpen = useWalletModalOpen();
  const toggleWalletModal = useWalletModalToggle();

  const location = useLocation();
  const page = location.pathname.split("/")[1];

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pendingTransactions = sortedRecentTransactions
    .filter(tx => !tx.receipt)
    .filter(tx => (page === "swap" ? tx.txCategory === "swap" : tx.txCategory === "bridge"))
    .map(tx => tx.hash);
  const confirmedTransactions = sortedRecentTransactions
    .filter(tx => tx.receipt)
    .filter(tx => (page === "swap" ? tx.txCategory === "swap" : tx.txCategory === "bridge"))
    .map(tx => tx.hash);

  const previousAccount = usePrevious(account);

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = "";
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    ReactGA.event({
      category: "Wallet",
      action: "Change Wallet",
      label: name
    });
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      //&& connector.walletConnectProvider?.wc?.uri
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal();
    });
  }, [toggleWalletModal]);

  const STAGE = process.env.REACT_APP_STAGE;
  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              disabled={STAGE === "PROD" && option.name === "WalletConnect"}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require("../../assets/images/" + option.iconName)}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === "MetaMask") {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={"#E8831D"}
                header={"Install Metamask"}
                subheader={null}
                link={"https://metamask.io/"}
                icon={MetamaskIcon}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === "MetaMask" && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === "Injected" && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require("../../assets/images/" + option.iconName)}
          />
        )
      );
    });
  }

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleWalletModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? "Wrong Network" : "Error connecting"}</HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>{t("supportNetwork")}</h5>
            ) : (
              <>{t("supportNetworkError")}</>
            )}
          </ContentWrapper>
        </UpperSection>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}
            >
              {t("Back")}
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>{t("connectToWallet")}</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <>
              <OptionGrid>{getOptions()}</OptionGrid>
              <Blurb />
            </>
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
}

export function WalletForAssets({
  pendingTransactions,
  confirmedTransactions,
  ENSName
}: {
  pendingTransactions: string[]; // hashes of pending
  confirmedTransactions: string[]; // hashes of confirmed
  ENSName?: string;
}) {
  const { active, account, connector, activate, error } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const walletModalOpen = useWalletModalOpen();
  const toggleWalletModal = useWalletModalToggle();

  const previousAccount = usePrevious(account);
  const { t } = useTranslation();

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = "";
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    ReactGA.event({
      category: "Wallet",
      action: "Change Wallet",
      label: name
    });
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      //&& connector.walletConnectProvider?.wc?.uri
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true)
        .then(s => setWalletView(WALLET_VIEWS.ACCOUNT))
        .catch(error => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector); // a little janky...can't use setError because the connector isn't set
          } else {
            setPendingError(true);
          }
        });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal();
    });
  }, [toggleWalletModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              disabled={option.name === "WalletConnect"}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require("../../assets/images/" + option.iconName)}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === "MetaMask") {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={"#E8831D"}
                header={"Install Metamask"}
                subheader={null}
                link={"https://metamask.io/"}
                icon={MetamaskIcon}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === "MetaMask" && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === "Injected" && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            disabled={!isMobile && option.name === "WalletConnect"}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require("../../assets/images/" + option.iconName)}
          />
        )
      );
    });
  }

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? "Wrong Network" : "Error connecting"}</HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>{t("supportNetwork")}</h5>
            ) : (
              <>{t("supportNetworkError")}</>
            )}
          </ContentWrapper>
        </UpperSection>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetailsForAsset
          toggleModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <UpperSection>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}
            >
              {t("Back")}
            </HoverText>
          </HeaderRow>
        ) : (
          <BoxHead>
            <ActiveText>{t("myAssets")}</ActiveText>
          </BoxHead>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <>
              <OptionGrid>{getOptions()}</OptionGrid>
              <Blurb />
            </>
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }

  return <Wrapper>{getModalContent()}</Wrapper>;
}
