import React from "react";
import styled from "styled-components";
import { BiX } from "react-icons/bi";

import {
  ModalWrap,
  ModalBox,
  ModalHd,
  ModalBd,
  ModalFt,
  ModalCloseX,
  TxtDesc13,
  ButtonMetaMask,
  ButtonWallect,
  PreviousLink,
  WrapCurrencyInput,
  SourcesLogo,
  Num,
  AreaButton,
  ButtonSwap
} from "../../pages/styleds";
import { RowBetween } from "../Row";
import AccordionInfo from "../AccordionInfo";
import { ButtonPrimary } from "../Button";
import { useTranslation } from "react-i18next";

export const ButtonError = styled.button`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 58px;
  margin-bottom: 8px;
  padding: 0 20px 0 30px;
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  border-radius: 5px;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.pinkPoint1};
  &:hover {
    cursor: pointer;
  }
  &::after {
    content: "Try Again";
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 10px;
    border-radius: 25px;
    border: 1px solid ${({ theme }) => theme.pinkPoint1};
    background-color: ${({ theme }) => theme.pinkPoint2};
    font-weight: 500;
    font-size: 12px;
    color: ${({ theme }) => theme.white};
  }
`;

export default function SwapModal() {
  const { t } = useTranslation();

  return (
    <>
      <ModalWrap>
        <ModalBox>
          <ModalHd>Connect a wallet</ModalHd>
          <ModalBd>
            <TxtDesc13 style={{ margin: "0 0 15px" }}>
              By connecting a wallet, you agree to BOASwap’ <span>Terms of service</span> and acknowledge that you have
              read and understood the BOASwap <span>protocol disclaimer.</span>
            </TxtDesc13>
            <ButtonMetaMask>MetaMask</ButtonMetaMask>
            <ButtonWallect disabled>WallectConnect</ButtonWallect>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        <ModalBox>
          <ModalHd>
            <PreviousLink>
              <span className="blind">Previous Page</span>
            </PreviousLink>
          </ModalHd>
          <ModalBd>
            <TxtDesc13 style={{ margin: "0 0 15px" }}>
              By connecting a wallet, you agree to BOASwap’ <span>Terms of service</span> and acknowledge that you have
              read and understood the BOASwap <span>protocol disclaimer.</span>
            </TxtDesc13>
            <ButtonError>Error Connecting</ButtonError>
            <ButtonMetaMask className="linknone">
              MetaMask
              <p>Easy-to-use browser extension.</p>
            </ButtonMetaMask>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        <ModalBox>
          <ModalHd>Confirm Swap</ModalHd>
          <ModalBd>
            <WrapCurrencyInput>
              <RowBetween>
                <SourcesLogo>
                  <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> BOA
                </SourcesLogo>
                <Num style={{ marginTop: "0.5rem" }}>100.1234567</Num>
              </RowBetween>
            </WrapCurrencyInput>
            <AreaButton>
              <ButtonSwap className="arrow" />
            </AreaButton>
            <WrapCurrencyInput>
              <RowBetween>
                <SourcesLogo>
                  <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> BOA
                </SourcesLogo>
                <Num style={{ marginTop: "0.5rem" }}>100.1234567</Num>
              </RowBetween>
            </WrapCurrencyInput>
            <TxtDesc13 style={{ margin: "0 0 15px" }}>
              Output is estimated. You will receive at least <span>10,000.12345678 AGT</span> or the transaction will
              revert.
            </TxtDesc13>

            <AccordionInfo />

            <ButtonPrimary style={{ marginTop: "30px" }}>{t("confirmSwap")}</ButtonPrimary>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>
      </ModalWrap>
    </>
  );
}
