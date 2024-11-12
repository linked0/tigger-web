import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Popover, { PopoverProps } from "../Popover";

const TooltipContainer = styled.div`
  display: block !important;
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
  color: ${({ theme }) => theme.black};
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBoxline2};
  box-shadow: 10px 10px 28px -10px rgba(39, 14, 63, 0.3);
  border-radius: 5px !important;
`;

interface TooltipProps extends Omit<PopoverProps, "content"> {
  text: string;
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />;
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, "show">) {
  const [show, setShow] = useState(false);
  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  );
}
