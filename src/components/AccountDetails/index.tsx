import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { AppDispatch } from "../../state";
import { clearAllTransactions } from "../../state/transactions/actions";
import { getEtherscanLink, shortenAddress } from "../../utils";
import { AutoRow } from "../Row";
import Copy from "./Copy";
import Transaction from "./Transaction";

import { SUPPORTED_WALLETS } from "../../constants";
import { ReactComponent as Close } from "../../assets/images/x.svg";
import { fortmatic, injected, walletconnect, walletlink } from "../../connectors";
import CoinbaseWalletIcon from "../../assets/images/coinbaseWalletIcon.svg";
import WalletConnectIcon from "../../assets/images/walletConnectIcon.svg";
import FortmaticIcon from "../../assets/images/fortmaticIcon.png";
import Identicon from "../Identicon";
import { ButtonSecondary } from "../Button";
import { ExternalLink as LinkIcon } from "react-feather";
import { ExternalLink, LinkStyledButton, TYPE } from "../../theme";
import Pagination from "./Pagination";

import icoViewon from "../../assets/images/icon/ico-viewon.svg";
import { ModalHd } from "../../pages/styleds";
import ImgNohistory from "../../assets/images/noHistory.svg";
import { useTranslation } from "react-i18next";

export const BoxHead = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
  padding: 0.2rem 0 0 0.4rem;
`;
export const ActiveText = styled.h2`
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

const InfoCard = styled.div`
  padding: 1rem;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
`;

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`;

const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.purpleBg};
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  border-radius: 5px;
  margin-bottom: 8px;
`;

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  overflow-y: auto;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;
  font-weight: 500;
  font-size: 1.25rem;
  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
    font-size: 32px;
    color: ${({ theme }) => theme.purple1};
    line-height: 1;
  }
`;

const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  margin-left: 1rem;
  display: flex;
  color: ${({ theme }) => theme.grayTxt};
  font-weight: 400;
  font-size: 12px;
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-top: 3px;
    background: url(${icoViewon}) no-repeat 0 0 / contain;
    vertical-align: middle;
  }
  svg {
    display: none;
  }
  :hover {
    color: ${({ theme }) => theme.text2};
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 0.938em;
  font-weight: 400;
  color: ${({ theme }) => theme.purple3};
`;

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + "px" : "32px")};
    width: ${({ size }) => (size ? size + "px" : "32px")};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`;

const WalletAction = styled(ButtonSecondary)`
  width: fit-content;
  height: 17px;
  margin-left: 8px;
  padding: 0 3px;
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  color: ${({ theme }) => theme.pinkPoint1};
  background-color: ${({ theme }) => theme.white};
  border-radius: 0;
  font-weight: 500 !important;
  font-size: 0.75em !important;
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.pinkPoint1};
    color: ${({ theme }) => theme.white};
  }
`;

// const MainWalletAction = styled(WalletAction)`
//   color: ${({ theme }) => theme.primary1};
// `;

const NoHistory = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  height: 347px;
  font-size: 25px;
  text-align: center;
  color: #b7b7b7;
  align-items: center;
  &::before {
    content: "";
    display: block;
    width: 108px;
    height: 108px;
    margin-bottom: 32px;
    background: url(${ImgNohistory}) no-repeat 0 0 / contain;
  }
`;

function renderTransactions(transactions: string[]) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />;
      })}
    </TransactionListWrapper>
  );
}

interface AccountDetailsProps {
  toggleModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

export default function AccountDetails({
  toggleModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}: AccountDetailsProps) {
  const { chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const limit = 4;
  const [page, setPage] = useState(1);
  const offset = (page - 1) * limit;
  const { t } = useTranslation();
  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <>
      <ModalHd>
        <h2>{t("titleRecentTransactions")}</h2>
        <CloseIcon onClick={toggleModal}>
          <CloseColor />
        </CloseIcon>
      </ModalHd>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions.slice(offset, offset + limit))}
          <AutoRow mb={"1rem"} style={{ justifyContent: "space-between" }}>
            <TYPE.body></TYPE.body>
            <LinkStyledButton onClick={clearAllTransactionsCallback}>Clear All</LinkStyledButton>
          </AutoRow>
          <footer>
            <Pagination total={confirmedTransactions.length} limit={limit} page={page} setPage={setPage} />
          </footer>
        </LowerSection>
      ) : (
        <LowerSection>
          <NoHistory>{t("noHistory")}</NoHistory>
        </LowerSection>
      )}
    </>
  );
}

export function AccountDetailsForAsset({ ENSName, openOptions }: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React();
  const { t } = useTranslation();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === "METAMASK"))
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>{t("connectedWith", { name })}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={"wallet connect logo"} />
        </IconWrapper>
      );
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt={"coinbase wallet logo"} />
        </IconWrapper>
      );
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={16}>
          <img src={FortmaticIcon} alt={"fortmatic logo"} />
        </IconWrapper>
      );
      // } else if (connector === portis) {
      //   return (
      //     <>
      //       <IconWrapper size={16}>
      //         <img src={PortisIcon} alt={"portis logo"} />
      //         <MainWalletAction
      //           onClick={() => {
      //             portis.portis.showPortis();
      //           }}
      //         >
      //           Show Portis
      //         </MainWalletAction>
      //       </IconWrapper>
      //     </>
      //   );
    }
    return null;
  }

  return (
    <>
      <UpperSection>
        <BoxHead>
          <ActiveText>{t("titleMyAssets")}</ActiveText>
        </BoxHead>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div>
                  {connector !== injected && connector !== walletlink && (
                    <WalletAction
                      style={{ fontSize: ".825rem", fontWeight: 400, marginRight: "8px" }}
                      onClick={() => {
                        (connector as any).close();
                      }}
                    >
                      {t("Disconnect")}
                    </WalletAction>
                  )}
                  <WalletAction
                    style={{ fontSize: ".825rem", fontWeight: 400 }}
                    onClick={() => {
                      openOptions();
                    }}
                  >
                    {t("Change")}
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {account && shortenAddress(account)}</p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: "4px" }}>{t("copyAddress")}</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            href={chainId && getEtherscanLink(chainId, ENSName, "address")}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: "4px" }}>{t("goBlockExplorer")}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: "4px" }}>{t("copyAddress")}</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            href={getEtherscanLink(chainId, account, "address")}
                          >
                            {/* <LinkIcon size={16} /> */}
                            <span style={{ marginLeft: "4px" }}>{t("goBlockExplorer")}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
    </>
  );
}
