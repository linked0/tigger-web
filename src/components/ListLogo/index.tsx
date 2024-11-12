import React from "react";
import styled from "styled-components";
import useHttpLocations from "../../hooks/useHttpLocations";

import Logo from "../Logo";

const StyledListLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: #4059c1;
  border-radius: 50%;
  img {
    display: block;
    width: 90%;
    height: 90%;
  }
`;

export default function ListLogo({
  logoURI,
  style,
  size = "22px",
  alt
}: {
  logoURI: string;
  size?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const srcs: string[] = useHttpLocations(logoURI);

  return <StyledListLogo alt={alt} size={size} srcs={srcs} style={style} />;
}
