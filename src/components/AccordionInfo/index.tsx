import React from "react";
import styled, { keyframes } from "styled-components";

import IcoLoding from "../../assets/images/icon/ico-loading.svg";
// import IcoInfo from "../../assets/images/icon/ico-info.svg";

export const WrapInfo = styled.div`
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  /* &.arrow {
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
  } */
  dl {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0.3rem 0.4rem 0.2rem;
    border-bottom: 1px solid ${({ theme }) => theme.gray1};
    line-height: 40px;
  }
  dt {
    position: relative;
    display: flex;
    /* align-items: center; */
    padding-top: 0.3rem;
    font-size: 13px;
    color: ${({ theme }) => theme.grayTxt};
    line-height: 1.5;
  }
  dd {
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    text-align: right;
    color: ${({ theme }) => theme.black};
    span {
      display: inline-block;
      vertical-align: middle;
      font-size: 1.2rem;
    }
  }
`;
export const IconInfo = styled.i`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  margin: -1px 5px 0 0;
  vertical-align: middle;
  font-style: normal;
  &::before {
    content: "\f05a";
    display: inline-block;
    vertical-align: middle;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 20px;
    color: ${({ theme }) => theme.grayDark};
    opacity: 0.5;
  }
  :hover {
    cursor: pointer;
  }
`;
export const TxtDescRight = styled.p`
  margin-bottom: 2.6rem;
  padding: 0.4rem 0.3rem 0 0;
  text-align: right;
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.purpleLine};
`;
export const LodingAni = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
`;
export const IconLoading = styled.i`
  display: block;
  width: 22px;
  height: 22px;
  background: url(${IcoLoding}) no-repeat 50% 50% / contain;
  animation: 2s ${LodingAni} linear infinite;
`;
export const IconLoadingSmall = styled(IconLoading)`
  width: 18px;
  height: 18px;
  margin-right: 5px;
`;

export default function AccordionInfo() {
  return (
    <>
      <WrapInfo className="arrow">
        <ul>
          <li>
            <dl>
              <dt>
                <IconInfo>
                  <span className="blind">정보보기</span>
                </IconInfo>
                Rate
                {/* <InfoModal>
                      The estimated exchange rate for the requested transaction quantity may differ from the current
                      rate. The higher the transaction size, the greater the change of the pool, resulting in a bigger
                      difference. Please make sure to check the difference between the expected and current rates before
                      trading.
                    </InfoModal> */}
              </dt>
              <dd>
                1 GBOA <span>≈</span> 0.01 BOA
              </dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>
                <IconInfo>
                  <span className="blind">정보보기</span>
                </IconInfo>
                Fee
              </dt>
              <dd>0.01 BOA</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>
                <IconInfo>
                  <span className="blind">정보보기</span>
                </IconInfo>
                Gas Tokens for use
              </dt>
              <dd>9990.123 BOA </dd>
            </dl>
          </li>
        </ul>
        <TxtDescRight>Slippage Tolerance : 5%</TxtDescRight>
      </WrapInfo>
    </>
  );
}
