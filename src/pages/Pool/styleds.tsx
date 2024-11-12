import { Text } from "rebass";
import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
`;

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.primary1};
`;
export const MaxButton = styled.button<{ width: string }>`
  width: 24%;
  height: 32px;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  border-radius: 32px;
  font-size: 15px;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.grayDark};
  line-height: 15px;
  &.on,
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.purple2};
    outline: none;
    color: #fff;
    font-weight: 700;
  }
`;

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
