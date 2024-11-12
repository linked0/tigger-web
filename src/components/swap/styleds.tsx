import { transparentize } from "polished";
import React from "react";
import { AlertTriangle } from "react-feather";
import styled, { css } from "styled-components";
import { Text } from "rebass";
import { AutoColumn } from "../Column";

export const Wrapper = styled.main`
  position: relative;
`;

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  /* padding: 0 2px; */
  transform: scale(1.3);
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -3px;
  /* outline: 5px solid ${({ theme }) => theme.white}; */
  ::before {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: ${({ theme }) => theme.white};
    border-radius: 50%;
  }
  ::after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.purpleBoxline2};
    background-color: ${({ theme }) => theme.purpleBg};
  }
  &:hover {
    ::after {
      ${({ clickable, theme }) => (clickable ? `background-color: ${theme.purple2};` : null)}
    }
    svg > * {
      ${({ clickable, theme }) => (clickable ? `stroke: ${theme.white};` : null)}
    }
  }
  svg {
    position : relative;
    z-index: 20;
    > * {
    stroke: ${({ theme }) => theme.purple3};
  }
  }
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`;

export const ArrowWrapperBridge = styled.div`
  /* padding: 0 2px; */
  transform: scale(1.3);
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -3px;
  /* outline: 5px solid ${({ theme }) => theme.white}; */

`;

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`;

export const BottomGrouping = styled.div`
  margin-top: 1rem;
`;

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text1
      : theme.green1};
`;

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.purpleBg};
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.purple1};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  /* :hover {
    background-color: ${({ theme }) => theme.purpleBoxline1};
  }
  :focus {
    background-color: ${({ theme }) => theme.purpleBoxline1};
    outline: none;
  } */
`;

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  width: 100%;
  min-width: 220px !important;
  overflow: hidden;
  text-align: right;
  white-space: nowrap;
`;

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: ".";
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: ".";
    }
    33% {
      content: "..";
    }
    66% {
      content: "...";
    }
  }
`;

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.red1};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`;

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`;

export function SwapCallbackError({ error }: { error: string }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  );
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary1)};
  color: ${({ theme }) => theme.primary1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`;
