import React from "react";
import styled from "styled-components";
import useCopyClipboard from "../../hooks/useCopyClipboard";

import { LinkStyledButton } from "../../theme";
// import { CheckCircle, Copy } from 'react-feather'

import icoCopy from "../../assets/images/icon/ico-copy.svg";

const CopyIcon = styled(LinkStyledButton)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-left: 21px;
  text-decoration: none;
  color: ${({ theme }) => theme.grayTxt};
  font-weight: 400;
  font-size: 12px;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`;
const TransactionStatusText = styled.span`
  margin-left: 0.75rem;
  color: ${({ theme }) => theme.grayTxt};
  font-weight: 400;
  font-size: 12px;
  align-items: center;
  /* svg {
    display: none;
  } */
  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: -2px 0 0 0;
    background: url(${icoCopy}) no-repeat 0 0 / contain;
    vertical-align: middle;
  }
`;

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          {/* <CheckCircle size={'16'} /> */}
          <span style={{ marginLeft: "4px" }}>Copied</span>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>{/* <Copy size={'16'} /> */}</TransactionStatusText>
      )}
      {isCopied ? "" : props.children}
    </CopyIcon>
  );
}
