import React from "react";
import styled from "styled-components";
import ComingBg from "../../assets/images/coming-bg.png";
import ComingLogo from "../../assets/images/coming-logo.svg";

// header  없는 페이지 만들어주세요~

const ComingBd = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: url(${ComingBg}) no-repeat 0 0;
`;
const LogoBoa = styled.a`
  position: absolute;
  top: 20px;
  left: 20px;
  display: block;
  width: 152px;
  height: 56px;
  background: url(${ComingLogo}) no-repeat 0 0;
  text-indent: -9999px;
`;
const TxtComing = styled.div`
  font-weight: 800;
  font-size: 80px;
  text-align: center;
  color: ${({ theme }) => theme.white};
  line-height: 1;
  strong {
    display: block;
    background: linear-gradient(91.65deg, #db50d5 35.22%, #ad45ff 57.64%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  span {
    display: block;
    margin-top: 16px;
    font-size: 28px;
    font-weight: 400;
  }
`;

export default function ComingSoon() {
  return (
    <>
      <ComingBd>
        <LogoBoa>BOASWAP</LogoBoa>

        <TxtComing>
          <strong>NTF</strong>
          <p>COMING SOON</p>
          <span>on BOSAGORA</span>
        </TxtComing>
      </ComingBd>
    </>
  );
}
