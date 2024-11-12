import { AbstractConnector } from "@web3-react/abstract-connector";
import React from "react";
import styled from "styled-components";
import Option from "./Option";
import { SUPPORTED_WALLETS } from "../../constants";
import { injected } from "../../connectors";
import { darken } from "polished";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
  margin: 0 0 20px 0;
`;

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
`;

const LoadingMessage = styled.div<{ error?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  height: 58px;
  padding: 0 20px 0 30px;
  border-radius: 5px;
  margin-bottom: 20px;
  color: ${({ theme, error }) => (error ? theme.pinkPoint1 : "inherit")};
  border: 1px solid ${({ theme, error }) => (error ? theme.pinkPoint1 : theme.purpleBoxline1)};
`;

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  width: 100%;
  align-items: center;
  justify-content: space-between;
  > div {
    font-weight: 500;
  }
`;

const ErrorButton = styled.div`
  display: flex;
  align-items: center;
  border-radius: 25px;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.pinkPoint2};
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  height: 25px;
  margin-left: 1rem;
  padding: 0 0.5rem;
  user-select: none;
  color: ${({ theme }) => theme.white};
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => darken(0.1, theme.pinkPoint2)};
  }
`;

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation
}: {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
}) {
  const isMetamask = window?.ethereum?.isMetaMask;
  const { t } = useTranslation();
  return (
    <PendingSection>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== "MetaMask") {
              return null;
            }
            if (!isMetamask && option.name === "MetaMask") {
              return null;
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={require("../../assets/images/" + option.iconName)}
            />
          );
        }
        return null;
      })}
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <div>{t("connectingError")}</div>
              <ErrorButton
                onClick={() => {
                  setPendingError(false);
                  connector && tryActivation(connector);
                }}
              >
                {t("tryAgain")}
              </ErrorButton>
            </ErrorGroup>
          ) : (
            <>
              <StyledLoader />
              {t("initializing")}
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  );
}
