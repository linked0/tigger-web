import React from "react";
import styled from "styled-components";
import Modal from "../Modal";

export const Description = styled.pre`
  padding: 0.5rem;
  letter-spacing: 0;
  font-weight: 400;
  color: ${({ theme }) => theme.grayTxt};
  font-size: 13px;
  font-family: "Roboto", sans-serif;
  overflow: auto;
  white-space: pre-wrap;
`;

export const Contents = styled.div`
  height: 400px;
  overflow-y: auto;
`;
export const Title = styled.h2`
  color: ${({ theme }) => theme.purple1};
  font-size: 18px;
  font-weight: 500;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
`;
interface InfoModal {
  isOpen: boolean;
  onDismiss: () => void;
}
export default function Disclaimer({ isOpen, onDismiss }: InfoModal) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} minHeight={40} maxHeight={80}>
      <div>
        <Title>BOASwap protocol disclaimer</Title>
        <Contents>
          <Description>
            {`Updated date: July 28, 2022
            
BOASwap is a decentralized peer-to-peer protocol that people can use to create liquidity and trade ERC-20 tokens and swap between networks.
The BOASwap protocol is the swap protocol v2 and the bridge protocol, each of which is made up of public, open-source or source-available software including a set of smart contracts that are deployed on the BizNet Blockchain.
Your use of the BOASwap protocol involves various risks, including, but not limited to, losses while digital assets are being supplied to the BOASwap protocol and losses due to the fluctuation of prices of tokens in a trading pair or liquidity pool.
Before using the BOASwap protocol, you should review the relevant documentation to make sure you understand how the BOASwap protocol works.
Additionally, just as you can access email protocols such as SMTP through multiple email clients, you can access the BOASwap protocol through dozens of web interfaces.
You are responsible for doing your own diligence on those interfaces to understand the fees and risks they present.


THE BOASwap PROTOCOL IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.
Although Universal Navigation Inc. d/b/a/ "Uniswap Labs" ( "Uniswap Labs" ) developed much of the initial code for the BOASwap swap protocol, it does not provide, own, or control the BOASwap protocol, which is run by smart contracts deployed on the BizNet blockchain.
No developer or entity involved in creating the BOASwap protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of, the BOASwap protocol, including any direct, indirect, incidental, special, exemplary,
punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
`}
          </Description>
        </Contents>
      </div>
    </Modal>
  );
}
