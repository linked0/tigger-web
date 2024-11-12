import { Currency, DEV, Token } from "bizboa-swap-sdk";
import React, { useMemo } from "react";
import styled from "styled-components";

import ImgBiznet from "../../assets/images/img-biznet.svg";
import ImgEther from "../../assets/images/logo-ethereum.png";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/lists/hooks";
import Logo from "../Logo";
import { useAllTokens } from "../../hooks/Tokens";

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

const StyledEthereumLogo = styled.img<{ size: string }>`
  display: block;
  /* overflow: hidden; */
  width: 22px;
  height: 22px;
  margin-right: 5px;
  border-radius: 50%;
`;

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

export default function CurrencyLogo({
  currency,
  size = "22px",
  style,
  isBOA = false,
  isETH = false
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
  isBOA?: boolean;
  isETH?: boolean;
}) {
  const allTokens = useAllTokens();
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const srcs: string[] = useMemo(() => {
    if (currency === DEV) return [];

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)];
      }
      if (allTokens && allTokens[currency.address] && allTokens[currency.address] instanceof WrappedTokenInfo) {
        return [(allTokens[currency.address] as WrappedTokenInfo).logoURI!];
      }
      return [getTokenLogoURL(currency.address)];
    }
    return [];
  }, [currency, uriLocations, allTokens]);

  if (isETH === true) {
    return <StyledEthereumLogo src={ImgEther} size={size} style={style} />;
  }

  if (currency === DEV || isBOA === true) {
    return <StyledEthereumLogo src={ImgBiznet} size={size} style={style} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} style={style} />;
}
interface SerializableTransactionCurrency {
  symbol?: string;
  name?: string;
  address?: string;
  logoURI?: string;
}

export function CurrencyLogoFor({
  currency,
  size = "22px",
  style
}: {
  currency?: SerializableTransactionCurrency | null;
  size?: string;
  style?: React.CSSProperties;
}) {
  const srcs: string[] = useMemo(() => {
    if (currency === DEV) return [];

    if (currency && currency.logoURI) {
      return [currency.logoURI];
    }
    return [];
  }, [currency]);

  if (!currency) {
    return <StyledEthereumLogo src={ImgBiznet} size={size} style={style} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} style={style} />;
}
