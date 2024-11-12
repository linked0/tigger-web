import styled from "styled-components";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`;

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`;

export const PaddedColumn = styled(AutoColumn)`
  padding-left: 7px;
  /* padding-bottom: 12px; */
  border-bottom: 1px solid #fff;
  > div {
    > div {
      font-size: 15px;
      font-weight: 400;
      color: ${({ theme }) => theme.primary1};
    }
  }
`;

export const MenuItem = styled(RowBetween)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  /* height: 55px; */
  margin-bottom: 8px;
  padding: 15px 50px 15px 14px;
  pointer-events: ${({ disabled }) => disabled && "none"};
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
  background: ${({ theme }) => theme.grayLight};
  border: 1px solid ${({ theme }) => theme.gray1};
  box-sizing: border-box;
  border-radius: 5px;
  /* &::after {
    content: "\f061";
    position: absolute;
    top: 50%;
    right: 20px;
    z-index: 100;
    transform: translateY(-50%);
    display: inline-block;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 20px;
    color: ${({ theme }) => theme.grayDark};
  } */
  .css-8mokm4 {
    font-weight: 500;
    font-size: 15px;
  }
  .loading::after {
    content: "\f021";
  }
  :hover {
    cursor: ${({ disabled }) => !disabled && "pointer"};
    background-color: ${({ theme, disabled }) => !disabled && theme.purpleBg};
    border: 1px solid ${({ theme, disabled }) => !disabled && theme.purple2};
    box-sizing: border-box;
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
  }
  /* modal-item-list */
  &.token-item-modal {
    flex-direction: row;
    justify-content: space-between;
    margin: 0;
    padding: 10px 0;
    border: none;
    :hover {
      background-color: transparent;
      border: none;
      box-sizing: border-box;
      box-shadow: none;
    }
  }
`;

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 20px;
  color: ${({ theme }) => theme.text1};
  border-style: solid;
  border: 1px solid ${({ theme }) => theme.bg3};
  -webkit-appearance: none;

  font-size: 18px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }
`;
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg2};
`;

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`;
// const MenuItemModal = styled(MenuItem)`
//   background-color: red;
// `
