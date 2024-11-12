import React from "react";
import styled from "styled-components";
import {
  WrapCurrencyInput,
  WalletHd,
  FromTo,
  ButtonWhiteLine,
  TxtDesc,
  WalletBd,
  MarkSquare,
  Num
} from "../../pages/styleds";

const TxtDesc15 = styled(TxtDesc)`
  font-size: 15px;
`;

export default function CurrencySwap() {
  return (
    <>
      <WrapCurrencyInput>
        <WalletHd>
          <TxtDesc15>
            <MarkSquare style={{ marginRight: "5px" }}>Max</MarkSquare> Balance : 0
          </TxtDesc15>
          <FromTo>
            <ButtonWhiteLine>
              <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> BOA
            </ButtonWhiteLine>
          </FromTo>
        </WalletHd>
        <WalletBd>
          <Num>100.1234567</Num>
          {/*<SubNum>$29,000,000,000</SubNum>*/}
        </WalletBd>
      </WrapCurrencyInput>
    </>
  );
}
