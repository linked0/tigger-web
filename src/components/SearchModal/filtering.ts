import { isAddress } from "../../utils";
import { Currency, Token } from "tigger-swap-sdk";
import { WrappedTokenInfo } from "../../state/lists/hooks";

export function filterTokens(tokens: Token[], search: string): Token[] {
  if (search.length === 0) return tokens;

  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    return tokens.filter(token => token.address === searchingAddress);
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter(s => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return tokens;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0);

    return lowerSearchParts.every(p => p.length === 0 || sParts.some(sp => sp.startsWith(p) || sp.endsWith(p)));
  };

  return tokens.filter(token => {
    const { symbol, name } = token;

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}

export function allowFilterTokens(tokens: Token[], otherSelected: Currency | null | undefined) {
  if (!otherSelected) {
    return tokens;
  } else {
    if (otherSelected.symbol === "BOA") {
      return tokens.filter(token => {
        const t: WrappedTokenInfo = token as WrappedTokenInfo;
        if (t?.allow) {
          return t.allow.indexOf("BOA") > -1;
        } else {
          return true;
        }
      });
    } else {
      const o: WrappedTokenInfo = otherSelected as WrappedTokenInfo;
      return tokens.filter(token => {
        if (o?.allow) {
          let isAllow: boolean = false;
          o.allow.forEach((allow: string) => {
            isAllow = isAddress(allow) ? token.address === allow : token.symbol === allow;
          });
          return isAllow;
        } else {
          return true;
        }
      });
    }
  }
}
