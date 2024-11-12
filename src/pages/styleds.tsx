import styled, { keyframes } from "styled-components";
import IcoBoa from "../assets/images/symbol-boa.png";
import IcoMetaMask from "../assets/images/icon/ico-metamask.png";
import IcoWallet from "../assets/images/icon/ico-wallet.png";
import IcoLink from "../assets/images/icon/ico-link.svg";
import IcoLinkWhite from "../assets/images/icon/ico-link-w.svg";
import IcoArrow from "../assets/images/icon/ico-arrow.svg";
import IcoLoding from "../assets/images/icon/ico-loading.svg";
import IcoInfo from "../assets/images/icon/ico-info.svg";

// BoxHead
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
// BoxHead

export const subHeader = styled.header`
  display: flex;
  align-items: center;
  height: 30px;
  font-weight: 500;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.purple1};
`;

export const PreviousLink = styled.a`
  display: flex;
  align-items: center;
  height: 100%;
  &::before {
    content: "\f060";
    margin-right: 5px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1.4rem;
  }
`;
export const BoxMain = styled.main`
  position: relative;
`;
export const WrapWallet = styled.div`
  position: relative;
`;
export const WalletHd = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid ${({ theme }) => theme.purpleTxt};
  color: ${({ theme }) => theme.grayDark};
`;
export const WalletBd = styled.div`
  width: 100%;
  padding: 0.8rem 0 0;
`;
export const TxtDesc = styled.div`
  letter-spacing: 0;
  font-weight: 400;
  color: ${({ theme }) => theme.grayTxt};
  font-size: 13px;
  span {
    color: ${({ theme }) => theme.pinkPoint1};
  }
`;
export const TxtDesc13 = styled(TxtDesc)`
  margin: 0 0.5rem;
  font-size: 14px;
`;
export const TxtDesc15 = styled(TxtDesc)`
  font-size: 15px;
`;
export const WrapInfo = styled.div`
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  &.arrow {
    dl {
      padding-right: 2rem;
      &::after {
        content: "\f107";
        position: absolute;
        top: 50%;
        right: 0.3rem;
        transform: translateY(-50%);
        font-family: "Line Awesome Free";
        font-weight: 900;
        font-size: 1rem;
      }
    }
  }
  dl {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0.3rem 0.4rem 0.2rem;
    border-bottom: 1px solid ${({ theme }) => theme.gray1};
    line-height: 1.5;
  }
  dt {
    position: relative;
    display: flex;
    align-items: center;
    /* padding-top: 0.3rem; */
    font-size: 13px;
    color: ${({ theme }) => theme.grayTxt};
    line-height: 1.5;
  }
  dd {
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    text-align: right;
    color: ${({ theme }) => theme.black};
    * {
      color: ${({ theme }) => theme.black};
    }
    span {
      display: inline-block;
      vertical-align: middle;
      font-size: 1.2rem;
    }
  }
`;
export const DescriptionWallet = styled.div`
  padding: 20px 0.7rem;
  font-size: 13px;
  color: ${({ theme }) => theme.grayTxt};
  letter-spacing: 0;
  span {
    color: ${({ theme }) => theme.pinkPoint1};
  }
`;

export const InfoModal = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  width: 100%;
  min-width: 226px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  box-sizing: border-box;
  box-shadow: 10px 10px 28px -10px rgba(39, 14, 63, 0.3);
  border-radius: 5px;
  background-color: ${({ theme }) => theme.white};
  font-size: 12px;
  line-height: 20px;
  color: ${({ theme }) => theme.grayTxt};
`;

export const TxtDescRight = styled.div`
  padding: 0.4rem 0.3rem 0 0;
  text-align: right;
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.purple2};
`;
export const CoinLogo = styled.i`
  overflow: hidden;
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: 50%;
  background-color: #4059c1;
  img {
    display: block;
    width: 90%;
    height: 90%;
  }
`;
export const WrapCurrencyInput = styled.div`
  //position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 90px;
  margin: 0 auto 6px;
  padding: 1rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  background-color: ${({ theme }) => theme.purpleBg};
  border-radius: 5px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.black};
  &.column {
    flex-direction: column;
    align-items: flex-start;
  }
  * {
  }
`;
export const WrapCurrencyInputBridge = styled.div`
  //position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 90px;
  margin: 0 auto 6px;
  padding: 1rem 1.2rem;
  border-radius: 5px;
  box-sizing: border-box;
`;
export const SourcesLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.grayDark};
  font-weight: 500;
  font-size: 25px;
  white-space: nowrap;
  .coinLogo {
    overflow: hidden;
    display: inline-block;
    width: 22px;
    height: 22px;
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 50%;
  }
`;
export const SourcesIco = styled.i`
  display: inline-block;
  width: 22px;
  height: 22px;
  margin: -1px 5px 0 0;
  border-radius: 50%;
  vertical-align: middle;
  &.boa {
    background: url(${IcoBoa}) no-repeat 50% 50% / contain;
  }
`;
export const FromTo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 15px;
  text-align: right;
  color: ${({ theme }) => theme.grayDark};
`;
export const ButtonWhiteLine = styled.button`
  display: block;
  height: 34px;
  margin-left: 10px;
  padding: 0 8px;
  border-radius: 34px;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBtline};
  font-weight: 500;
  font-size: 15px;
  color: ${({ theme }) => theme.purple1};
  &::after {
    content: "";
    display: inline-block;
    margin-left: 7px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    content: "\f107";
  }
`;
export const MarkSquare = styled.button`
  display: inline-block;
  height: 17px;
  margin: -3px 0 0 5px;
  padding: 0 4px;
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.pinkPoint2};
  vertical-align: middle;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.pinkPoint1};
  font-style: normal;
  line-height: 15px;
  &:hover,
  &:focus {
    cursor: pointer;
    background: ${({ theme }) => theme.pinkPoint2};
    color: ${({ theme }) => theme.white};
  }
  &:disabled {
    background: #c5bad0;
    border: 1px solid #c5bad0;
    color: ${({ theme }) => theme.white};
    cursor: default;
  }
`;
export const MarkSquareLeft = styled(MarkSquare)`
  margin: -3px 5px 0 0;
`;

export const MyAssetsNum = styled.div`
  display: block;
  width: 100%;
  padding: 0.2rem 0 0 1.6rem;
  &.token-item-modal {
    width: auto;
    padding: 0;
    strong {
      display: block;
      font-weight: 500;
      font-size: 16px;
      color: ${({ theme }) => theme.purple3};
    }
  }
`;
export const NumBig = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 32px;
  color: ${({ theme }) => theme.purple1};
  line-height: 1.2;
`;
export const Num = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 25px;
  color: ${({ theme }) => theme.purple1};
  line-height: 1.2;
`;
export const NumRight = styled(Num)`
  align-self: flex-end;
`;
export const SubNum2 = styled.span`
  display: flex;
  align-items: center;
  padding-left: 0.1rem;
  color: ${({ theme }) => theme.purple3};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.1;
`;
export const SubNum = styled.span`
  display: flex;
  align-items: center;
  padding-left: 0.1rem;
  color: ${({ theme }) => theme.purple3};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.1;
`;
export const Unit = styled.span`
  display: block;
  margin: 0 0 0 7px;
  font-weight: 400;
  font-size: 15px;
  color: ${({ theme }) => theme.purple1};
  line-height: 1.3;
`;
export const SubNum13 = styled(SubNum)`
  font-size: 13px;
`;

// modal
export const ModalWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.35);
`;
export const ModalBox = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 35px);
  max-width: 480px;
  height: auto;
  padding: 20px 20px 0;
  background-color: ${({ theme }) => theme.white};
  border-radius: 20px;
`;
export const ModalHd = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.gray1};
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.grayDark};
  h2 {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 18px;
    color: ${({ theme }) => theme.grayDark};
  }
`;
export const ModalBd = styled.main`
  display: flex;
  flex-direction: column;
  /* justify-content: flex-end; */
  align-items: center;
  flex-grow: 1;
  width: 100%;
  /* padding: 15px 0; */
`;
export const ModalFt = styled.footer`
  display: block;
`;
export const ModalCloseX = styled.button`
  position: absolute;
  top: 15px;
  right: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border: none;
  background-color: transparent;
  font-size: 1.6rem;
  cursor: pointer;
  * {
    stroke: ${({ theme }) => theme.text4};
  }
  /* &::before {
    content: '\f00d';
    font-family: 'Line Awesome Free';
    font-weight: 900;
  } */
`;

// assets
export const AssetsDl = styled.dl`
  display: block;
  margin: 8px 0 6px;
`;
export const AssetsDt = styled.dt`
  display: block;
  padding-left: 7px;
  font-size: 15px;
  color: #4d1e88;
`;
export const AssetsDd = styled.dd`
  display: flex;
  justify-content: space-between;
`;
// button
export const AreaButton = styled.div`
  position: relative;
  height: 0;
`;
export const ButtonSwap = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  margin-top: -3px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.purpleBoxline2};
  background-color: ${({ theme }) => theme.purpleBg};
  outline: 5px solid ${({ theme }) => theme.white};
  &::before {
    content: "\f063";
    display: block;
    margin-bottom: -2px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1.3rem;
    color: ${({ theme }) => theme.purple3};
  }
  &.plus::before {
    content: "\f067";
    margin: -1px 0 0 0;
    font-size: 1.2rem;
  }
  &.arrow::before {
    content: "\f063";
  }
`;
export const BottomGrouping = styled.div`
  margin-top: 1rem;
`;
export const ButtonGradient = styled.button`
  display: block;
  width: 100%;
  height: 60px;
  border-radius: 60px;
  background: ${({ theme }) => theme.gradientPurple};
  border: 1px solid ${({ theme }) => theme.purpleBtline};
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.white};
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.purple2};
    box-shadow: 2px 3px 4px rgba(98, 57, 150, 0.3);
  }
`;
export const ButtonMetaMask = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 8px;
  padding: 22px 20px 20px 73px;
  background: ${({ theme }) => theme.purpleBg};
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  border-radius: 5px;
  font-weight: 500;
  font-size: 16px;
  color: #4f4c69;
  &::before {
    content: "";
    position: absolute;
    top: 15px;
    left: 20px;
    display: inline-block;
    width: 38px;
    height: 38px;
    margin-right: 15px;
    background: url(${IcoMetaMask}) no-repeat 0 0;
  }
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 25px;
    height: 25px;
    background: url(${IcoLink}) no-repeat 0 0;
  }
  &:hover {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.purple2};
    box-shadow: 2px 3px 4px rgba(98, 57, 150, 0.3);
  }
  &:disabled {
    pointer-events: none;
    border: 1.5px solid ${({ theme }) => theme.purpleDisabled};
    background: ${({ theme }) => theme.purpleDisabled};
    color: ${({ theme }) => theme.purpleTxt};
    &::before {
      opacity: 0.4;
    }
    &::after {
      background: url(${IcoLinkWhite}) no-repeat 0 0;
    }
  }
  &.linknone {
    &::after {
      display: none;
    }
  }
  p {
    font-weight: 300;
    font-size: 13px;
    color: #4f4c69;
  }
`;
export const ButtonWallect = styled(ButtonMetaMask)`
  &::before {
    background: url(${IcoWallet}) no-repeat 50% 50%;
  }
`;
export const ButtonlineWhite = styled.button`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  margin-top: 5px;
  padding: 14px 13px 13px;
  background: ${({ theme }) => theme.grayLight};
  border: 1px solid ${({ theme }) => theme.gray1};
  border-radius: 5px;
  font-weight: 500;
  font-size: 15px;
  color: #4f4c69;
`;
export const ButtonSmallRed = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background: ${({ theme }) => theme.pinkPoint2};
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  border-radius: 28px;
  text-decoration: none;
  font-size: 14px;
  color: #fff;
  &:hover {
    background: ${({ theme }) => theme.pinkPoint1};
    border: 1px solid ${({ theme }) => theme.pinkPoint1};
    color: #fff;
  }
  &:disabled {
    background: ${({ theme }) => theme.purpleDisabled};
    border: 1px solid ${({ theme }) => theme.purpleDisabled};
    color: ${({ theme }) => theme.grayTxt};
  }
`;
export const ButtonSmallDisabled = styled(ButtonSmallRed)`
  background: ${({ theme }) => theme.purpleDisabled};
  border: 1px solid ${({ theme }) => theme.purpleDisabled};
  color: ${({ theme }) => theme.text1};
  :hover {
    background: ${({ theme }) => theme.purpleBoxline2};
    border: 1px solid ${({ theme }) => theme.purpleBoxline2};
    color: ${({ theme }) => theme.grayDark};
  }
`;

// icon
export const IconInfo = styled.i`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  margin: -1px 5px 0 0;
  vertical-align: middle;
  background: url(${IcoInfo}) no-repeat 0 0 / contain;
  :hover {
    cursor: pointer;
  }
`;
export const IconArrow = styled.i`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: block;
  width: 22px;
  height: 22px;
  font-style: normal;
  /* background: url(${IcoArrow}) no-repeat 50% 50%;tg */
  &::after {
    content: "\f061";
    display: inline-block;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 20px;
    color: ${({ theme }) => theme.grayDark};
    line-height: 1.1;
  }
`;
export const LodingAni = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
export const IconLoading = styled.i`
  display: block;
  width: 22px;
  height: 22px;
  background: url(${IcoLoding}) no-repeat 50% 50% / contain;
  animation: 2s ${LodingAni} linear infinite;
`;
export const IconLodingPos = styled(IconLoading)`
  position: absolute;
  top: 17px;
  right: 20px;
`;
export const IconLoadingSmall = styled(IconLoading)`
  width: 18px;
  height: 18px;
  margin-right: 5px;
`;
export const CoinLink = styled.a`
  display: block;
  width: 22px;
  height: 22px;
  margin-left: 5px;
  background: url(${IcoLink}) no-repeat 0 0 / contain;
  &:hover {
    cursor: pointer;
  }
`;
