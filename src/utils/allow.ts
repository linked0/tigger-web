import { Currency, currencyEquals } from "bizboa-swap-sdk";
import { WrappedTokenInfo } from "../state/lists/hooks";

export function isAllowCurrency(
  currency: Currency,
  otherCurrency: Currency | null | undefined,
  selectedCurrency: Currency | null | undefined
): boolean {
  if (!otherCurrency) return true;
  if (currencyEquals(otherCurrency, currency)) return true;
  if (selectedCurrency && currencyEquals(selectedCurrency, currency)) return false;

  const otherInfo: WrappedTokenInfo = otherCurrency as WrappedTokenInfo;
  if (otherInfo?.symbol === "BOA") {
    const currencyToken = currency as WrappedTokenInfo;
    if (currencyToken?.allow) {
      if (currencyToken.allow.indexOf("BOA") > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    if (otherInfo?.allow) {
      for (let i = 0; i < otherInfo.allow.length; i++) {
        const allow = otherInfo.allow[i];
        if (currency instanceof WrappedTokenInfo) {
          if (allow === currency.address) return true;
        } else {
          if (currency.symbol === allow) return true;
        }
      }
    } else {
      return false;
    }
  }
  return false;
}
