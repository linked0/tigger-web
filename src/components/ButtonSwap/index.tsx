import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export const AreaButton = styled.div`
  position: relative;
  height: 0;
`;
export const BtnSwap = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.purpleBoxline2};
  background-color: ${({ theme }) => theme.purpleBg};
  /* outline: 5px solid ${({ theme }) => theme.white}; */
  &::before {
    content: "";
    display: block;
    margin-bottom: -2px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1.3rem;
    color: ${({ theme }) => theme.purple3};
  }
  &.plus::before {
    content: "\f067";
  }
  &.arrow::before {
    content: "\f063";
  }
`;

export default function ButtonSwap() {
  const { t } = useTranslation();
  return (
    <>
      <AreaButton>
        <BtnSwap>
          <span className="blind">{t("swap")}</span>
        </BtnSwap>
      </AreaButton>
    </>
  );
}
