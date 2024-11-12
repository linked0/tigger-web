import React from "react";
import AppBody from "../AppBody";

import { ButtonPrimary, ButtonPrimaryNone } from "../../components/Button";
import CurrencyInputBridge from "../../components/CurrencyInputBridge/index";
import { WrapWallet, ButtonSwap, BottomGrouping, AreaButton } from "../styleds";
import AccordionInfo from "../../components/AccordionInfo";
import BoxHd from "../../components/BoxHd";
import { BoxBody } from "../../components/BoxBd";
import TxtDesc from "../../components/TxtDesc";
import { useTranslation } from "react-i18next";
// import WarningModal from '../../components/Modal/WarningModal'
// import TransactionModal from '../../components/Modal/TransactionModal'

export default function BridgeUI() {
  const { t } = useTranslation();

  return (
    <>
      <AppBody>
        <BoxHd title="Bridge" />
        <BoxBody>
          <WrapWallet>
            <CurrencyInputBridge />
            <AreaButton>
              <ButtonSwap className="arrow">
                <span className="blind">Transactions</span>
              </ButtonSwap>
            </AreaButton>
            <CurrencyInputBridge />
          </WrapWallet>

          <AccordionInfo></AccordionInfo>

          <TxtDesc />

          <BottomGrouping>
            <ButtonPrimary style={{ marginBottom: " 0.5rem" }}>{t("approve")}</ButtonPrimary>
            <ButtonPrimary disabled style={{ marginBottom: " 0.5rem" }}>
              {t("approve")}
            </ButtonPrimary>
            <ButtonPrimaryNone>{t("priceImpactTooHigh")}</ButtonPrimaryNone>
          </BottomGrouping>
        </BoxBody>
      </AppBody>

      {/* modal */}
      {/* <WarningModal /> */}
      {/* <TransactionModal /> */}
    </>
  );
}
