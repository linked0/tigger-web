import React from "react";
import styled from "styled-components";
import { ExternalLink } from "../../theme";
import IcoLink from "../../assets/images/icon/ico-link.svg";
import IcoLinkWhite from "../../assets/images/icon/ico-link-w.svg";

const InfoCard = styled.button<{ active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row-reverse;
  height: 70px;
  outline: none;
  width: 100% !important;
  padding: 20px;
  background: ${({ theme }) => theme.purpleBg};
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  border-radius: 5px;
  &:disabled {
    pointer-events: none;
    border: 1.5px solid ${({ theme }) => theme.purpleDisabled};
    background: ${({ theme }) => theme.purpleDisabled};
    color: ${({ theme }) => theme.purpleTxt};
    &::after {
      background: url(${IcoLinkWhite}) no-repeat 0 0;
    }
    * {
      color: ${({ theme }) => theme.white};
    }
  }
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
  }
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 25px;
    height: 25px;
    background: url(${IcoLink}) no-repeat 0 0;
  }
`;

const OptionCard = styled(InfoCard as any)``;

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`;

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  &:hover {
    cursor: ${({ clickable }) => (clickable ? "pointer" : "")};
    border: 1px solid ${({ theme }) => theme.purple2};
    box-shadow: 2px 3px 4px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.purpleBg};
  }
  &:focus {
    box-shadow: none;
  }
  opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
`;

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
  }
`;

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${({ theme }) => theme.grayDark};
  font-size: 1rem;
  font-weight: 500;
  margin-left: 15px;
`;

const SubHeader = styled.div`
  color: ${({ theme }) => theme.black};
  margin-left: 15px;
  font-size: 12px;
`;

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + "px" : "24px")};
    width: ${({ size }) => (size ? size + "px" : "24px")};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id,
  disabled = false
}: {
  link?: string | null;
  clickable?: boolean;
  size?: number | null;
  onClick?: null | (() => void);
  color: string;
  header: React.ReactNode;
  subheader: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
  disabled?: boolean;
}) {
  const content = (
    <OptionCardClickable disabled={disabled} id={id} onClick={onClick} clickable={clickable && !active} active={active}>
      <OptionCardLeft>
        <HeaderText color={color}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ""
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img src={icon} alt={"Icon"} />
      </IconWrapper>
    </OptionCardClickable>
  );
  if (link) {
    return <ExternalLink href={link}>{content}</ExternalLink>;
  }

  return content;
}
