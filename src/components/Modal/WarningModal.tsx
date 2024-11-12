import React from "react";
import styled, { keyframes } from "styled-components";
import { BiX } from "react-icons/bi";

import ImgIcoWaiting from "../../assets/images/icon/ico-waiting.svg";
import ImgIcoSubmit from "../../assets/images/icon/ico-submit.svg";
import ImgIcoError from "../../assets/images/icon/ico-error.svg";
import { ButtonPrimary } from "../Button";
import { ModalWrap, ModalBox, ModalHd, ModalBd, ModalFt, ModalCloseX } from "../../pages/styleds";

const Turn = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(365deg);
  }
`;
const IcoComm = styled.i`
  display: block;
  width: 100px;
  height: 100px;
  margin: 50px auto 70px;
  border: none;
  background: url(${ImgIcoSubmit}) no-repeat 0 0 / contain;
  outline: none;
`;
const IcoWaiting = styled(IcoComm)`
  background: url(${ImgIcoWaiting}) no-repeat 0 0 / contain;
  animation: ${Turn} 3s linear infinite both;
`;
const IcoSubmit = styled(IcoComm)`
  background: url(${ImgIcoSubmit}) no-repeat 0 0 / contain;
`;
const IcoError = styled(IcoComm)`
  margin-bottom: 30px;
  background: url(${ImgIcoError}) no-repeat 0 0 / contain;
`;
const TxtLDefault = styled.strong`
  display: block;
  font-weight: 400;
  font-size: 25px;
  text-align: center;
  color: ${({ theme }) => theme.purple1};
`;
const TxtMDefaultRed = styled(TxtLDefault)`
  margin-bottom: 50px;
  color: ${({ theme }) => theme.pinkPoint1};
`;
const TxtMDefault = styled.p`
  margin-top: 15px;
  font-weight: 500;
  font-size: 15px;
  text-align: center;
  color: ${({ theme }) => theme.grayTxt};
`;
const TxtSBot = styled.small`
  margin: 40px 0 10px;
  font-weight: 300;
  font-size: 11px;
  text-align: center;
  color: ${({ theme }) => theme.grayTxt};
`;
const TxtSLink = styled.a`
  display: inline-block;
  margin-top: 30px;
  font-weight: 400;
  font-size: 13px;
  text-align: center;
  letter-spacing: 0.03em;
  color: #8637d5;
  text-decoration: underline;
`;
const ModalCloseButton = styled(ButtonPrimary)`
  width: 100%;
  margin: 40px auto 0;
`;

export default function WarningModal() {
  return (
    <>
      <ModalWrap>
        {/* waiting */}
        <ModalBox>
          <ModalBd>
            <IcoWaiting />
            <TxtLDefault>Waiting For Confirmation</TxtLDefault>
            <TxtMDefault>
              Transfer ETH mainnet 100.12345678 BOA <br />
              to BOA BizNet 100.12345678 BOA
            </TxtMDefault>
            <TxtSBot>Confirm this transaction in your wallet</TxtSBot>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        {/* Submit */}
        <ModalBox style={{ marginTop: "10px" }}>
          <ModalBd>
            <IcoSubmit />
            <TxtLDefault>Transaction Submitted</TxtLDefault>
            {/*<TxtMDefault>Add BOA Token of BOA BizNet to Metamask</TxtMDefault>*/}
            <TxtSLink>View on BlockExplorer</TxtSLink>

            <ModalCloseButton>Close</ModalCloseButton>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        {/* 에러 */}
        <ModalBox style={{ marginTop: "10px" }}>
          <ModalHd>Error</ModalHd>

          <ModalBd>
            <IcoError />
            <TxtMDefaultRed>Transaction rejected.</TxtMDefaultRed>

            <ModalCloseButton>Close</ModalCloseButton>
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
