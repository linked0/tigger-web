import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../Modal";
import Disclaimer from "./Disclaimer";
import Terms from "./Terms";
import { useTranslation } from "react-i18next";

export const TxtDesc14 = styled.p`
  padding: 0.5rem;
  letter-spacing: 0;
  font-weight: 400;
  color: ${({ theme }) => theme.grayTxt};
  font-size: 13px;
  span {
    color: ${({ theme }) => theme.pinkPoint1};
    cursor: pointer;
  }
`;

export const Title = styled.div`
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
`;

export default function TxtDesc() {
  const [isOpenTerms, setOpenTerms] = useState(false);
  const [isOpenDisclaimer, setOpenDisclaimer] = useState(false);
  const { t } = useTranslation();

  const handleClickTerms = () => {
    setOpenTerms(true);
  };

  const handleDismissTerms = () => {
    setOpenTerms(false);
  };

  const handleOnClickDisclaimer = () => {
    setOpenDisclaimer(true);
  };

  const handleDismissDisclaimer = () => {
    setOpenDisclaimer(false);
  };

  return (
    <>
      <TxtDesc14>
        {t("terms1")}
        <span onClick={handleClickTerms}>{t("termsLink1")}</span>
        {t("terms2")}
        <span onClick={handleOnClickDisclaimer}>{t("termsLink2")}</span>
        {t("terms3")}
      </TxtDesc14>
      <Modal isOpen={isOpenTerms} onDismiss={handleDismissTerms}>
        <TxtDesc14></TxtDesc14>
      </Modal>
      <Terms isOpen={isOpenTerms} onDismiss={handleDismissTerms} />
      <Disclaimer isOpen={isOpenDisclaimer} onDismiss={handleDismissDisclaimer} />
    </>
  );
}
