import React, { useCallback, useState } from "react";
// import { HelpCircle as Question } from "react-feather";
import styled from "styled-components";
import Tooltip from "../Tooltip";
// import { darken } from "polished";
import IcoInfo from "../../assets/images/icon/ico-info.svg";

// const QuestionWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   width: 30px;
//   height: 30px;
//   margin-left: 0.2rem;
//   border: none;
//   background: none;
//   outline: none;
//   vertical-align: middle;
//   cursor: default;
//   border-radius: 50%;
//   * {
//     stroke: ${({ theme }) => theme.purple3};
//     &:hover {
//       ${({ theme }) => darken(0.05, theme.purple3)};
//     }
//   }
//   svg {
//     transform: scale(1.5);
//   }
// `;
export const IconInfo = styled.i`
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: -2px 5px 0 5px;
  vertical-align: middle;
  background: url(${IcoInfo}) no-repeat 0 0 / contain;
  :hover {
    cursor: pointer;
  }
`;

export default function QuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false);

  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);

  return (
    <Tooltip text={text} show={show}>
      <IconInfo onClick={open} onMouseEnter={open} onMouseLeave={close}>
        {/* <IconInfo /> */}
      </IconInfo>
    </Tooltip>
  );
}
