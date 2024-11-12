import React from "react";
import styled from "styled-components";
import { BiX } from "react-icons/bi";
import { darken } from "polished";

import { RowBetween } from "../Row";

import ImgNohistory from "../../assets/images/img-nohistory.png";
import {
  ModalWrap,
  ModalBox,
  ModalHd,
  ModalBd,
  ModalFt,
  ModalCloseX,
  SourcesLogo,
  CoinLink,
  IconInfo,
  IconLoading,
  IconArrow
} from "../../pages/styleds";

const WrapTransactions = styled.div`
  position: relative;
  display: block;
  width: 100%;
  padding-bottom: 30px;
`;
const RowTransactions = styled.div`
  margin-bottom: 0.6rem;
  padding: 1.1rem 1rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.gray1};
  border-radius: 5px;
`;
const RowCoin = styled.div`
  display: flex;
  justify-content: space-between;
`;
const FromTo = styled.div`
  display: block;
  width: 50%;
  &.to > div {
    justify-content: flex-end;
  }
`;
const PriceCoin = styled.div`
  display: flex;
  margin-top: 0.5rem;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.purple3};
`;
const UnitCoin = styled.div`
  display: block;
`;
const StateWrap = styled.div`
  display: block;
`;
const StateCoin = styled.div`
  margin-top: 0.3rem;
  padding-left: 2px;
  font-weight: 500;
  font-size: 15px;
`;
const StateCoinComplete = styled(StateCoin)`
  color: #2ebd67;
`;
const StateCoinExpired = styled(StateCoin)`
  color: ${({ theme }) => theme.pinkPoint1};
`;
const StateCoinPending = styled(StateCoin)`
  color: #04c1db;
`;
const DateCoin = styled.time`
  margin-top: 0.1rem;
  padding-left: 2px;
  font-weight: 300;
  font-size: 11px;
  color: ${({ theme }) => theme.purple3};
`;
const StateButton = styled.button`
  display: block;
  height: 25px;
  margin-top: 0.5rem;
  padding: 0 0.8rem;
  line-height: 25px;
  border: none;
  border-radius: 25px;
  background: ${({ theme }) => theme.purple2};
  color: ${({ theme }) => theme.white};
  font-size: 14px;
  text-align: center;
  color: #ffffff;
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => darken(0.07, theme.purple2)};
  }
`;
const AreaButtonVertical = styled.div`
  position: relative;
  width: 0;
  height: 0;
`;
const ButtonSwapVertical = styled(IconArrow)`
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

// page

const PaginationNav = styled.nav`
  display: block;
  margin: 16px 0;
`;
const Pagination = styled.ul`
  display: flex;
`;
const PaginationItem = styled.li`
  display: flex;
`;
const PaginationLink = styled.a`
  display: flex;
  justify-content: center;
  text-align: center;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.grayTxt};
  text-decoration: none;
  font-size: 12px;
  &.current {
    color: ${({ theme }) => theme.pinkPoint1};
  }
  &.previous {
    font-size: 0;
    &::before {
      content: "\f104";
      font-family: "Line Awesome Free";
      font-weight: 900;
      font-size: 0.9rem;
    }
  }
  &.next {
    font-size: 0;
    &::before {
      content: "\f105";
      font-family: "Line Awesome Free";
      font-weight: 900;
      font-size: 0.9rem;
    }
  }
`;
const NoHistory = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  height: 347px;
  font-size: 25px;
  text-align: center;
  color: #b7b7b7;
  &::before {
    content: "";
    display: block;
    width: 108px;
    height: 108px;
    margin-bottom: 32px;
    background: url(${ImgNohistory}) no-repeat 0 0 / contain;
  }
`;
const SecRow = styled.section`
  display: block;
  width: 100%;
  margin-bottom: 1rem;
`;
const Title = styled.h2`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayDark};
`;
const Slippage = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0 0 1.6rem;
`;
const SlippageButton = styled.button`
  display: block;
  height: 32px;
  margin-right: 0.5rem;
  padding: 0 0.9rem;
  background: ${({ theme }) => theme.purpleBg};
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  box-sizing: border-box;
  border-radius: 32px;
  font-size: 15px;
  line-height: 20px;
  color: ${({ theme }) => theme.purple1};
  cursor: pointer;
  &.on {
    background: #8637d5;
    border: 1px solid ${({ theme }) => theme.purple2};
    color: ${({ theme }) => theme.white};
    font-weight: 700;
  }
`;
const SlippageInput = styled(SlippageButton)`
  display: block;
`;
const TxtExplanation = styled.p`
  display: block;
  margin: 0.5rem 0 0 1.6rem;
  padding-top: 0.7rem;
  border-top: 1px solid ${({ theme }) => theme.gray1};
  font-size: 12px;
  color: #777777;
  span {
    color: ${({ theme }) => theme.pinkPoint1};
  }
`;
const TxtUnit = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.purple2};
`;
const ClearAll = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  padding: 5px 3px;
  border: none;
  background-color: ${({ theme }) => theme.white};
  font-size: 12px;
  color: ${({ theme }) => theme.purple2};
  text-decoration: underline;
`;

// props를 사용하고 싶었지만.. ㅜㅜ 아~ 무능하네요.

export default function TransactionModal() {
  return (
    <>
      <ModalWrap>
        <ModalBox>
          <ModalHd>Recent Transactions</ModalHd>
          <ModalBd>
            <WrapTransactions>
              <RowTransactions>
                <RowCoin>
                  <FromTo>
                    <SourcesLogo>
                      <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <CoinLink>
                        <span className="blind">link</span>
                      </CoinLink>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                  <AreaButtonVertical>
                    <ButtonSwapVertical>
                      <span className="blind">Transactions</span>
                    </ButtonSwapVertical>
                  </AreaButtonVertical>
                  <FromTo className="to">
                    <SourcesLogo>
                      <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <CoinLink>
                        <span className="blind">link</span>
                      </CoinLink>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                </RowCoin>
                <RowBetween>
                  <StateWrap>
                    <StateCoinComplete>Complete</StateCoinComplete>
                    <DateCoin>2022.03.10 14:01:50</DateCoin>
                  </StateWrap>
                </RowBetween>
              </RowTransactions>
              {/*  */}
              <RowTransactions>
                <RowCoin>
                  <FromTo>
                    <SourcesLogo>
                      <img src="/src/assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <CoinLink>
                        <span className="blind">link</span>
                      </CoinLink>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                  <AreaButtonVertical>
                    <ButtonSwapVertical>
                      <span className="blind">Transactions</span>
                    </ButtonSwapVertical>
                  </AreaButtonVertical>
                  <FromTo className="to">
                    <SourcesLogo>
                      <img src="/src/assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <IconLoading style={{ marginLeft: "5px" }}>
                        <span className="blind">link</span>
                      </IconLoading>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                </RowCoin>
                <RowBetween>
                  <StateWrap>
                    <StateCoinPending>Pending</StateCoinPending>
                    <DateCoin>2022.03.10 14:01:50</DateCoin>
                  </StateWrap>
                  <StateButton>Cancel</StateButton>
                </RowBetween>
              </RowTransactions>
              {/*  */}
              <RowTransactions>
                <RowCoin>
                  <FromTo>
                    <SourcesLogo>
                      <img src="/src/assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <CoinLink>
                        <span className="blind">link</span>
                      </CoinLink>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                  <AreaButtonVertical>
                    <ButtonSwapVertical>
                      <span className="blind">Transactions</span>
                    </ButtonSwapVertical>
                  </AreaButtonVertical>
                  <FromTo className="to">
                    <SourcesLogo>
                      <img src="/src/assets/images/logo/coin-op.png" className="coinLogo" alt="" /> ETH mainnet
                      <CoinLink>
                        <span className="blind">link</span>
                      </CoinLink>
                    </SourcesLogo>
                    <PriceCoin>
                      10,000.1234567 <UnitCoin>ETH</UnitCoin>
                    </PriceCoin>
                  </FromTo>
                </RowCoin>
                <RowBetween>
                  <StateWrap>
                    <StateCoinExpired>Expired</StateCoinExpired>
                    <DateCoin>2022.03.10 14:01:50</DateCoin>
                  </StateWrap>
                </RowBetween>
              </RowTransactions>
              <ClearAll>Clear All</ClearAll>
            </WrapTransactions>
            <PaginationNav>
              <Pagination>
                <PaginationItem>
                  <PaginationLink className="previous" href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink className="current" href="#">
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink className="next" href="#" />
                </PaginationItem>
              </Pagination>
            </PaginationNav>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        <ModalBox>
          <ModalHd>Recent Transactions</ModalHd>
          <ModalBd>
            <NoHistory>No History</NoHistory>
          </ModalBd>
          <ModalFt>
            <ModalCloseX>
              <BiX />
              <span className="blind">Close</span>
            </ModalCloseX>
          </ModalFt>
        </ModalBox>

        <ModalBox>
          <ModalHd>Transaction Settings</ModalHd>
          <ModalBd>
            {/*  */}
            <SecRow>
              <Title>
                <IconInfo>
                  <span className="blind">정보보기</span>
                </IconInfo>
                Slippage Tolerance
              </Title>
              <Slippage>
                <SlippageButton>0.5%</SlippageButton>
                <SlippageButton className="on">1%</SlippageButton>
                <SlippageButton>5%</SlippageButton>
                <SlippageInput>0.50%</SlippageInput>
              </Slippage>
              <TxtExplanation>
                By connecting a wallet, you agree to BOASwap’ <span>Terms of service</span> and acknowledge that you
                have read and understood the BOASwap.
              </TxtExplanation>
            </SecRow>
            {/*  */}
            <SecRow>
              <Title>
                <IconInfo>
                  <span className="blind">정보보기</span>
                </IconInfo>
                Transaction deadline
              </Title>
              <Slippage>
                <SlippageButton>20%</SlippageButton> <TxtUnit>minutes</TxtUnit>
              </Slippage>
            </SecRow>
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
