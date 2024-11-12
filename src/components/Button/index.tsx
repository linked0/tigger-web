import React from "react";
import styled from "styled-components";
import { darken } from "polished";

import { RowBetween } from "../Row";
import { ChevronDown } from "react-feather";
import { Button as RebassButton, ButtonProps } from "rebass/styled-components";

const Base = styled(RebassButton)<{
  padding?: string;
  width?: string;
  borderRadius?: string;
  altDisabledStyle?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`;

export const ButtonPrimary = styled(Base)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  background: ${({ theme }) => theme.gradientPurple};
  color: #fff;
  border-radius: 60px;
  border: none;
  font-weight: 500;
  font-size: 18px;
  &:focus,
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.purple2};
  }
  &:disabled {
    pointer-events: none;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.purpleDisabled};
    outline: none;
    background: ${({ theme }) => theme.purpleDisabled};
    color: ${({ theme }) => theme.purpleDisabledColor};
  }
`;

export const ButtonPrimaryNone = styled(ButtonPrimary)`
  background: ${({ theme }) => theme.pinkPoint2};
  &:focus {
    cursor: pointer;
    background: ${({ theme }) => theme.pinkPoint2};
  }
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.pinkPoint2};
  }
`;
export const ButtonSmall03 = styled(Base)`
  display: inline-flex;
  height: 28px;
  padding: 0 12px;
  background: ${({ theme }) => theme.pinkPoint2};
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  box-sizing: border-box;
  border-radius: 30px;
  color: ${({ theme }) => theme.white};
  text-decoration: none;
  font-size: 14px;
  &:focus,
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.pinkPoint1};
  }
  &:disabled {
    pointer-events: none;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.purpleDisabled};
    outline: none;
    background: ${({ theme }) => theme.purpleDisabled};
  }
`;

export const ButtonLight = styled(Base)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primaryText1};
  font-size: 16px;
  font-weight: 500;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
    background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`;

export const ButtonGray = styled(Base)`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 16px;
  font-weight: 500;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.bg2)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.1, theme.bg2)};
    background-color: ${({ theme, disabled }) => !disabled && darken(0.1, theme.bg2)};
  }
`;

export const ButtonSecondary = styled(Base)`
  display: inline-flex;
  height: 28px;
  padding: 0 12px;
  background: ${({ theme }) => theme.pinkPoint2};
  border: 1px solid ${({ theme }) => theme.pinkPoint1};
  box-sizing: border-box;
  border-radius: 30px;
  color: ${({ theme }) => theme.white};
  text-decoration: none;
  &:focus,
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.pinkPoint1};
  }
  &:disabled {
    pointer-events: none;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.purpleDisabled};
    outline: none;
    background: ${({ theme }) => theme.purpleDisabled};
  }
`;

export const ButtonPink = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  color: white;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.primary1};
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonOutlined = styled(Base)`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: transparent;
  color: ${({ theme }) => theme.text1};

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:hover {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:active {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonWhiteCircle = styled(Base)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.purpleBoxline2};
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.purple1};
  font-weight: 400;
  font-size: 15px;
  :hover,
  :focus {
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.purpleBg};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, "#edeef2")};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  svg > * {
    stroke: ${({ theme }) => theme.purple1};
  }
`;

export const ButtonWhite = styled(Base)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: 38px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.purple1};
  font-weight: 400;
  font-size: 15px;
  ::after {
    content: "\f107";
    display: inline-block;
    margin: -3px 0 0 10px;
    vertical-align: middle;
    font-family: "Line Awesome Free";
    font-weight: 900;
  }
  :hover,
  :focus {
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.purpleBg};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, "#edeef2")};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonConfirmedStyle = styled(Base)`
  display: block;
  width: 100%;
  height: 60px;
  border-radius: 60px;
  background-image: ${({ theme }) => theme.gradientPurple};
  border: 1px solid ${({ theme }) => theme.purpleBtline};
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.purple1};

  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonErrorStyle = styled(Base)`
  width: 100%;
  height: 60px;
  background-color: ${({ theme }) => theme.pinkPoint2};
  /* border: 1px solid ${({ theme }) => theme.pinkPoint2}; */
  border-radius: 60px;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.pinkPoint1)};
    background-color: ${({ theme }) => darken(0.05, theme.pinkPoint1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.pinkPoint1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.pinkPoint1)};
    background-color: ${({ theme }) => darken(0.1, theme.pinkPoint1)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
  }
  div {
    font-weight: 500;
    font-size: 18px;
  }
`;

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />;
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  );
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  );
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}
