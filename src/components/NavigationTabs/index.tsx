import React from "react";
import styled from "styled-components";
import { darken } from "polished";
import { useTranslation } from "react-i18next";
import { NavLink, Link as HistoryLink } from "react-router-dom";

import { ArrowLeft } from "react-feather";
import { RowBetween } from "../Row";
import QuestionHelper from "../QuestionHelper";

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  margin-bottom: 0.7rem;
  padding: 0.2rem 0 0 0.4rem;
  /* justify-content: space-evenly; */
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.purple1};
  font-size: 18px;
  font-weight: 500;
  height: 30px;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.purple1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.purple1)};
  }
`;

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`;

export function SwapPoolTabs({ active }: { active: "swap" | "pool" }) {
  const { t } = useTranslation();
  return (
    <Tabs>
      <StyledNavLink id={`swap-nav-link`} to={"/swap"} isActive={() => active === "swap"}>
        {t("swap")}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={"/pool"} isActive={() => active === "pool"}>
        {t("pool")}
      </StyledNavLink>
    </Tabs>
  );
}

export function FindPoolTabs() {
  const { t } = useTranslation();
  return (
    <Tabs>
      <RowBetween style={{ padding: "1rem" }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>{t("importPool")}</ActiveText>
        <QuestionHelper text={t("importPoolHelper")} />
      </RowBetween>
    </Tabs>
  );
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  const { t } = useTranslation();
  return (
    <Tabs>
      <RowBetween style={{ padding: "1rem" }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>
          {adding ? t("add") : t("remove")} {t("liquidity")}
        </ActiveText>
        <QuestionHelper text={adding ? t("addHelper") : t("removeHelper")} />
      </RowBetween>
    </Tabs>
  );
}
