import React from "react";
import styled from "styled-components";
import { CardProps, Text } from "rebass";
import { Box } from "rebass/styled-components";

const Card = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
  width: 100%;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  background-color: ${({ theme }) => theme.purpleBg} !important;
  padding: 1rem 1.2rem;
`;
export default Card;

export const LightCard = styled(Card)`
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  background-color: ${({ theme }) => theme.purpleBg};
`;

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg3};
`;

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg3};
`;

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow2};
  font-weight: 500;
`;

export const PinkCard = styled(Card)`
  background-color: rgba(255, 0, 122, 0.03);
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
`;

const BlueCardStyled = styled(Card)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primary1};
  border-radius: 12px;
  width: fit-content;
`;

export const BlueCard = ({ children, ...rest }: CardProps) => {
  return (
    <BlueCardStyled {...rest}>
      <Text fontWeight={500} color="#2172E5">
        {children}
      </Text>
    </BlueCardStyled>
  );
};
