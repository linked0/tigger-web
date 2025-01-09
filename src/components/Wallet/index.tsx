import React, { useCallback, useRef } from "react";
import { isMobile } from "react-device-detect";
import { useActiveWeb3React } from "../../hooks";
import { ChainId } from "tigger-swap-sdk";
import styled from "styled-components";

import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import useToggle from "../../hooks/useToggle";
import { useTranslation } from "react-i18next";

import EthereumLogo from "../../assets/images/ethereum-logo.png";
import ImgBiznet from "../../assets/images/img-biznet.svg";
import ico_wrong from "../../assets/images/ico-wrong.svg";

import { ButtonWhite } from "../Button";
import { YellowCard } from "../Card";

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

const MenuFlyout = styled.div`
  min-width: 14.4rem;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  box-shadow: 12px 12px 28px -10px rgba(62, 31, 92, 0.1);
  border-radius: 20px;
  padding: 7px 17px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.7rem;
  left: -0.5rem;
  z-index: 100;
`;

const MenuTitle = styled.h3`
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.purpleBg};
  font-weight: 400;
  font-size: 0.938em;
  color: ${({ theme }) => theme.grayDark};
`;

const MenuItem2 = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.938em;
  color: ${({ theme }) => theme.grayDark};
  font-weight: 500;
  :hover {
    color: ${({ theme }) => theme.purple2};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
  &.active {
    ::after {
      content: "";
      position: absolute;
      top: 50%;
      right: -3px;
      width: 10px;
      height: 10px;
      background-color: ${({ theme }) => theme.pinkPoint1};
      border-radius: 50%;
      transform: translateY(-50%);
    }
  }
  &.invisible {
    display: none;
  }
`;

const IcoItem = styled.i`
  flex-shrink: 0;
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 5px;
  vertical-align: middle;
  border-radius: 50%;
  background-color: #03317c;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: contain;
  &.ico-boa {
    background-image: url(${ImgBiznet});
  }
  &.ico-eth {
    background-image: url(${EthereumLogo});
  }
  &.ico-wrong {
    background-image: url(${ico_wrong});
  }
`;

const ButtonWhiteIco = styled(ButtonWhite)`
  margin-right: 6px;
  border-radius: 38px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 4px;
  `};
  :hover {
    border: 1px solid ${({ theme }) => theme.purple2};
  }
`;

const NetworkCard = styled(YellowCard)`
  display: flex;
  align-items: center;
  width: fit-content;
  padding: 0;
  background-color: transparent !important;
  font-size: 15px;
  color: ${({ theme }) => theme.purple1};
  border: none;
  line-height: 1.1;
  ${({ theme }) => theme.mediaWidth.upToMoreExtraSmall`
      font-size: 0;
    `};
`;

const STAGE = process.env.REACT_APP_STAGE;

export const NETWORK_LABELS: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]: [
    "Ethereum MainNet",
    "ico-eth",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "visible" : "invisible",
    "0x1",
    "Ethereum ETH",
    "ETH",
    "18",
    "https://rpc.ankr.com/eth",
    "https://etherscan.io"
  ],
  [ChainId.HARDHAT]: [
    "Hardhat(Ethererum)",
    "ico-boa",
    STAGE === "LOCAL" ? "invisible" : STAGE === "PROD" ? "invisible" : "invisible",
    "0x7A69",
    "Ethereum ETH",
    "ETH",
    "18",
    "http://127.0.0.1:8545",
    "http://127.0.0.1:8545"
  ],
  [ChainId.STANDALONE]: [
    "Standalone",
    "ico-eth",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "invisible" : "visible",
    "7212309",
    "Ethereum ETH",
    "ETH",
    "18",
    "http://localhost:8585",
    "https://sepolia.etherscan.io"
  ],
  [ChainId.SEPOLIA]: [
    "Sepolia",
    "ico-eth",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "invisible" : "visible",
    "12301",
    "Ethereum ETH",
    "ETH",
    "18",
    "http://localhost:8545",
    "https://sepolia.etherscan.io"
  ],
  [ChainId.MARIGOLD]: [
    "Marigold",
    "ico-eth",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "invisible" : "visible",
    "12301",
    "Ethereum ETH",
    "ETH",
    "18",
    "http://localhost:8545",
    "https://sepolia.etherscan.io"
  ],
  [ChainId.BIZTESTNET]: [
    "PoohTestNet",
    "ico-boa",
    STAGE === "LOCAL" ? "invisible" : STAGE === "PROD" ? "invisible" : "visible",
    "7212303",
    "Poohnet POO",
    "POO",
    "18",
    "http://3.37.37.195:8545",
    "https://testnet-scan.bosagora.org"
  ],
  [ChainId.BIZDEVNET]: [
    "PoohDevNet",
    "ico-boa",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "invisible" : "visible",
    "7212302",
    "Poohnet POO",
    "POO",
    "18",
    "http://3.37.37.195:8545",
    "https://sepolia.etherscan.io"
  ],
  [ChainId.BIZNET]: [
    "BizNet    ",
    "ico-boa",
    STAGE === "LOCAL" ? "invisible" : STAGE === "PROD" ? "visible" : "invisible",
    "7212301",
    "Bosagora BOA",
    "BOA",
    "18",
    "https://mainnet.bosagora.org",
    "https://scan.bosagora.org"
  ]
};
interface CurProps {
  selectedChainId?: ChainId;
  onChangeBridge?: (chainId: string) => void;
}

export async function changeNetwork(id: string, onChangeBridge: ((chainId: string) => void) | undefined) {
  const { ethereum } = window;
  const chainId = NETWORK_LABELS[parseInt(id) as ChainId][3]; //'0x' + parseInt(id).toString(16)
  const hexId = "0x" + parseInt(chainId).toString(16);
  if (ethereum) {
    try {
      // @ts-ignore
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }] // chainId must be in hexadecimal numbers
      });
      if (!!onChangeBridge) onChangeBridge(id);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      const chainName = NETWORK_LABELS[parseInt(id) as ChainId][0];
      const currencyName = NETWORK_LABELS[parseInt(id) as ChainId][4];
      const currencySymbol = NETWORK_LABELS[parseInt(id) as ChainId][5];
      const currencyDecimal = parseInt(NETWORK_LABELS[parseInt(id) as ChainId][6]);
      const rpcUrls = NETWORK_LABELS[parseInt(id) as ChainId][7];
      const blockExplorerUrls = NETWORK_LABELS[parseInt(id) as ChainId][8];
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          // @ts-ignore
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexId,
                chainName: chainName,
                rpcUrls: [rpcUrls],
                blockExplorerUrls: [blockExplorerUrls],
                nativeCurrency: {
                  name: currencyName,
                  symbol: currencySymbol,
                  decimals: currencyDecimal
                }
              }
            ]
          });
        } catch (addError) {
          // handle "add" error
          console.error("changeNetwork :", addError);
        }
      }
      // handle other "switch" errors
    }
  }
}
export default function Wallet({ selectedChainId, onChangeBridge }: CurProps) {
  const { chainId } = useActiveWeb3React();
  let currentChainId = chainId as ChainId;
  if (currentChainId === undefined) {
    selectedChainId = ChainId.STANDALONE;
    currentChainId = ChainId.STANDALONE;
  }

  const node = useRef<HTMLDivElement>();
  const [open, toggle] = useToggle(false);
  const { t } = useTranslation();
  const isInput = selectedChainId === currentChainId;

  useOnClickOutside(node, open ? toggle : undefined);
  const changeNet = useCallback(
    id => async (_: any) => {
      if (!!selectedChainId && isInput === false) return;
      console.log("changeNetwork in Wallet");
      changeNetwork(id, onChangeBridge);
      toggle();
    },
    [isInput, toggle, onChangeBridge, selectedChainId]
  );
  const labels = Object.values(NETWORK_LABELS);
  const ids = Object.keys(NETWORK_LABELS);
  return (
    <StyledMenu ref={node as any}>
      {selectedChainId ? (
        <ButtonWhiteIco onClick={toggle}>
          <NetworkCard>
            <IcoItem className={currentChainId ? NETWORK_LABELS[selectedChainId][1] : "ico-wrong"} />{" "}
            {!isMobile && currentChainId && t(NETWORK_LABELS[selectedChainId][0])}
          </NetworkCard>
        </ButtonWhiteIco>
      ) : (
        <ButtonWhiteIco onClick={toggle}>
          <NetworkCard>
            <IcoItem className={currentChainId ? NETWORK_LABELS[currentChainId][1] : "ico-wrong"} />{" "}
            {!isMobile && currentChainId && t(NETWORK_LABELS[currentChainId][0])}
          </NetworkCard>
        </ButtonWhiteIco>
      )}
      {open ? (
        selectedChainId ? (
          isInput ? (
            <MenuFlyout>
              {labels.map((l, i) => (
                <MenuItem2
                  id="link"
                  key={i}
                  className={currentChainId === parseInt(ids[i]) ? (isInput ? "active " : "invisible " + l[2]) : l[2]}
                  onClick={changeNet(ids[i])}
                >
                  <IcoItem className={l[1]} />
                  {t(l[0])}
                </MenuItem2>
              ))}
            </MenuFlyout>
          ) : null
        ) : (
          <MenuFlyout>
            <MenuTitle>{t("selectNetwork")}</MenuTitle>
            {labels.map((l, i) => (
              <MenuItem2
                id="link"
                key={i}
                className={currentChainId === parseInt(ids[i]) ? "active " + l[2] : l[2]}
                onClick={changeNet(ids[i])}
              >
                <IcoItem className={l[1]} />
                {t(l[0])}
              </MenuItem2>
            ))}
          </MenuFlyout>
        )
      ) : null}
    </StyledMenu>
  );
}
