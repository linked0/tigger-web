import React, { useEffect, useState } from "react";

import styled, { keyframes } from "styled-components";

import { useActiveWeb3React } from "../../hooks";

// import { YellowCard } from '../Card'
// import Settings from '../Settings'
import Menu from "../Menu";
import Wallet from "../Wallet";

import { RowBetween } from "../Row";
import Web3Status from "../Web3Status";
import { Link, withRouter } from "react-router-dom";

import LogoImage from "../../assets/images/logo.png";
import LogoImageMobile from "../../assets/images/logo-m.svg";
import IcoArr from "../../assets/images/ico-arrow-s.svg";
import IcoRing from "../../assets/images/ico-ring.svg";
import IcoLinkWhite from "../../assets/images/icon/ico-link-w.svg";
import LogoBeta from "../../assets/images/logo-beta.svg";
import Terms from "../TxtDesc/Terms";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";

const HeaderFrame = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  /* top: 1rem;
  left: 2.7rem;
  right: 2.7rem; */
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  margin: 1rem 2.7rem;
  /* max-width: 480px;
  width: 100%; */
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 1rem 1.2rem;
  `};
  ::before {
    content: "";
    position: absolute;
    top: -1rem;
    left: -2.7rem;
    right: -2.7rem;
    height: 70px;
    background-image: linear-gradient(${({ theme }) => theme.bgColor1} 80%, rgba(247, 246, 249, 0) 100%);
    /* background-color: ${({ theme }) => theme.bgColor1}; */
    transition: height 0.3s;
  }
  /* &.on,
  &:hover {
    ::before {
      height: 100%;
    }
  } */
`;

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  position: relative;
  margin: 0;
`;
const TitleLink = styled.a`
  display: block;
  width: 148px;
  height: 28px;
  pointer-events: auto;
  text-decoration: none;
  text-decoration-style: unset;
  background: url(${LogoImage}) no-repeat 50% 50% / contain;
  text-indent: -9999px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 25px;
    height: 27px;
    background: url(${LogoImageMobile}) no-repeat 50% 50% / contain;
  `};
  .beta {
    position: absolute;
    top: 0;
    right: -25px;
    display: block;
    width: 20px;
    height: 20px;
    background: url(${LogoBeta}) no-repeat 0 0 / contain;
  }
`;
const Navi = styled.nav`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
  text-decoration: none;
  text-decoration-style: unset;
  max-width: 480px;
  min-width: 320px;
  width: 100%;
  height: 38px;
  padding: 0 19px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToLarge`
    left : 190px;
    transform: translateX(0);
    max-width: 480px;
    width: 40%;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: fixed;    
    top: auto;
    bottom: 2px;
    left : 50%;
    transform: translate(-50%, 0);
    max-width: 480px;
    width: calc(100% - 32px);    
    height: 60px;
    padding: 0 40px;
    border-radius: 60px;
    background-color: ${({ theme }) => theme.white};
    border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
    padding: 0;
  `};
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
  span {
    padding-left: 5px;
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
const StyledLinkArrow = styled.a`
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
  ::after {
    content: "";
    position: absolute;
    top: 8px;
    right: 50%;
    transform: translateX(25px);
    display: block;
    width: 7px;
    height: 7px;
    background: url(${IcoArr}) no-repeat 0 0 / contain;
  }
`;
const LodingAni = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
const AccountElement = styled.div<{ active: boolean }>`
  border: none;
  margin-right: 6px;

  button {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 38px;
    padding: 0 8px 0 12px;
    border-radius: 38px;
    /* background: ${({ theme, active }) => (!active ? theme.purple2 : theme.white)};
    border: 1px solid ${({ theme }) => theme.purpleBtline}; */
    font-size: 16px;
    font-weight: 500;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      width: 150px;
    `};
    /* p {
      color : ${({ theme, active }) => (!active ? theme.white : theme.purple1)};
    } */
    /* :hover, :focus, :active {
      background-color: ${({ theme }) => theme.purpleBg};
      box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
      border: 1px solid ${({ theme }) => theme.purpleBtline} !important;
    } */
    /* &::before {
      content: '';
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 3px;
      background: url(${IcoLinkWhite}) no-repeat 0 0 / contain;
    } */
  }
  &.connect {
    button {
      padding: 0 18px;
      border: 1px solid ${({ theme }) => theme.purpleBtline};
      background: ${({ theme }) => theme.white};
      p {
        color: ${({ theme }) => theme.purple1};
      }
      ::before {
        display: none;
      }
    }
  }
  &.loading {
    button {
      padding-right: 12px;
      background: ${({ theme }) => theme.gradientPurple};
      strong {
        display: inline-block;
        font-size: 15px;
        font-weight: 500;
        color: ${({ theme }) => theme.white};
      }
      ::before {
        display: none;
      }
      ::after {
        content: '';
        display: block;
        width: 17px;
        height: 17px;
        background: url(${IcoRing}) no-repeat 0 0 / contain;
        animation: 2s ${LodingAni} linear infinite;
      }
    }
  }

  .sc-jvLaUc {
    display: none;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 4px;
  `};
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
// `;

function Header(props: any) {
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();
  // const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? ""];
  const [isOpenTerms, setOpenTerms] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const handleClickTerms = () => {
    setOpenTerms(true);
  };

  const handleDismissTerms = () => {
    setOpenTerms(false);
  };

  useEffect(() => {
    setActiveTab(props.location.pathname.slice(1));
  }, [props.location.pathname]);

  const handleNFTLink = () => {
    ReactGA.event({
      category: "Outside link",
      action: "NFT link click"
    });
  };

  return (
    <HeaderFrame className="">
      <RowBetween>
        <Title>
          <TitleLink href="/">
            BOSAGORA <span className="beta">Beta</span>
          </TitleLink>
        </Title>
        <Navi>
          <StyledLink className={activeTab.includes("myassets") ? "on" : ""} to="/myassets">
            {t("menu_my")} <span> {t("menu_assets")}</span>
          </StyledLink>
          <StyledLink className={activeTab.includes("swap") ? "on" : ""} to="/swap">
            {t("menu_swap")}
          </StyledLink>
          <StyledLink className={activeTab.includes("pool") ? "on" : ""} to="/pool">
            {t("menu_pool")}
          </StyledLink>
          <StyledLink className={activeTab.includes("bridge") ? "on" : ""} to="/bridge">
            {t("menu_bridge")}
          </StyledLink>
          <StyledLinkArrow onClick={handleNFTLink} target="_blank" href="/nft.html">
            {t("menu_nft")}
          </StyledLinkArrow>
        </Navi>
        <HeaderControls>
          <HeaderElement>
            <Wallet />
            {/* wrong class 추가 */}
            <AccountElement active={!!account} style={{ pointerEvents: "auto" }}>
              {/* <strong>1</strong> */}
              {/*{account && userEthBalance ? (*/}
              {/*  <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem">*/}
              {/*    {userEthBalance?.toSignificant(4)} {DEV.symbol}*/}
              {/*  </BalanceText>*/}
              {/*) : null}*/}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            {/* <VersionSwitch /> */}
            {/* <Settings /> */}
            <Menu handlerTerms={handleClickTerms} />
          </HeaderElementWrap>
        </HeaderControls>
      </RowBetween>
      <Terms isOpen={isOpenTerms} onDismiss={handleDismissTerms} />
    </HeaderFrame>
  );
}
export default withRouter(Header);
