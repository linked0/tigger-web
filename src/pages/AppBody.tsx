import React from "react";
import styled from "styled-components";

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 480px;
  min-width: 320px;
  width: 100%;
  background: ${({ theme }) => theme.bodyWrapper};
  border: 1px solid ${({ theme }) => theme.bodyWrapperLine};
  box-sizing: border-box;
  box-shadow: 15px 15px 40px -10px rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  padding: 0.6rem 1.2rem 1.2rem;
`;

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>;
}
