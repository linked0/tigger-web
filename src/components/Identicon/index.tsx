import React, { useEffect, useRef } from "react";

import styled from "styled-components";

import { useActiveWeb3React } from "../../hooks";
import Jazzicon from "jazzicon";

const StyledIdenticonContainer = styled.div`
  height: 1.4rem;
  width: 1.4rem;
  border-radius: 50%;
  /* background-color: ${({ theme }) => theme.bg4}; */
  > div {
    width: 100% !important;
    height: 100% !important;
  }
`;

export default function Identicon() {
  const ref = useRef<HTMLDivElement>();

  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)));
    }
  }, [account]);

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref as any} />;
}
