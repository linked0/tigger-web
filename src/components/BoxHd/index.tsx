import React from "react";
import styled from "styled-components";
import Settings from "../Settings";
import { Link as HistoryLink } from "react-router-dom";
// import IcoRecentImg from "../../assets/images/icon/ico-recent.svg";
// import Question from "../../components/QuestionHelper";

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
const Util = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const ButtonRecent = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border: none;
  background-color: ${({ theme }) => theme.white};
  &::before {
    content: "\f1da";
    display: block;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 29px;
    color: ${({ theme }) => theme.purple3};
    line-height: 1;
  }
  &:hover::before {
    color: ${({ theme }) => theme.purple2};
  }
`;
// const IcoRecont = styled.i`
//   display: block;
//   width: 23px;
//   height: 23px;
//   background: url(${IcoRecentImg}) no-repeat 0 0 / contain;
// `;
const PreviousLink = styled(HistoryLink)`
  display: flex;
  align-items: center;
  height: 100%;
  text-decoration: none;
  &::before {
    content: "\f060";
    margin-right: 5px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.purple1};
  }
`;
interface BoxHdProps {
  toggleWalletModal?: () => void;
  account?: string | null;
  title?: string;
  showSetting?: boolean;
  historyBackTo?: string;
}
export default function BoxHd({ title, account, toggleWalletModal, showSetting = true, historyBackTo }: BoxHdProps) {
  return (
    <>
      <BoxHead>
        <ActiveText>
          {historyBackTo ? <PreviousLink to={"/" + historyBackTo}></PreviousLink> : null}
          {title}
        </ActiveText>
        {/* 이전 버튼 필요시  */}
        {/* <ActiveText>
          <PreviousLink>Remove Liquidity</PreviousLink>
        </ActiveText> */}
        {toggleWalletModal && (
          <Util>
            {account ? (
              <ButtonRecent onClick={toggleWalletModal}>
                <span className="blind">recent</span>
                {/* <IcoRecont /> */}
              </ButtonRecent>
            ) : null}
            {showSetting ? <Settings /> : null}
            {/*<Question text="When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below." />*/}
          </Util>
        )}
      </BoxHead>
    </>
  );
}
