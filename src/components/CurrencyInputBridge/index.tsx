import React from "react";
// import styled from 'styled-components'
import {
  WrapCurrencyInput,
  WalletHd,
  SourcesLogo,
  FromTo,
  ButtonWhiteLine,
  TxtDesc13,
  TxtDesc15,
  WalletBd,
  MarkSquare,
  Num
} from "../../pages/styleds";

import { RowBetween } from "../Row";

export default function CurrencyInputBridge() {
  return (
    <>
      <WrapCurrencyInput className="column">
        <WalletHd>
          <SourcesLogo>
            <img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> BOA
          </SourcesLogo>
          <FromTo>
            From
            <ButtonWhiteLine>
              <img src="/src/assets/images/logo/coin-op.png" className="coinLogo" alt="" /> Ethereum Mainnet
            </ButtonWhiteLine>
          </FromTo>
        </WalletHd>
        <WalletBd>
          <RowBetween>
            <TxtDesc13>Send amount</TxtDesc13>
            <TxtDesc15>
              Balance : 0{" "}
              <MarkSquare disabled style={{ marginLeft: "2px" }}>
                Max
              </MarkSquare>
            </TxtDesc15>
          </RowBetween>
          <Num style={{ marginTop: "0.5rem" }}>100.1234567</Num>
        </WalletBd>
      </WrapCurrencyInput>
    </>
  );
}
