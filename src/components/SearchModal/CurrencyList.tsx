import { Currency, CurrencyAmount, currencyEquals, DEV, Token } from "tigger-swap-sdk";
import React, { CSSProperties, MutableRefObject, useCallback, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { useSelectedTokenList, WrappedTokenInfo } from "../../state/lists/hooks";
import { useAddUserToken, useRemoveUserAddedToken } from "../../state/user/hooks";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { LinkStyledButton, TYPE } from "../../theme";
import { useIsUserAddedToken } from "../../hooks/Tokens";
import CurrencyLogo from "../CurrencyLogo";
import { MouseoverTooltip } from "../Tooltip";
import { FadedSpan, MenuItem } from "./styleds";
import Loader from "../Loader";
import { isTokenOnList } from "../../utils";
import { IconArrow, MyAssetsNum, Num, Unit, SubNum } from "../../pages/styleds";
import { isAllowCurrency } from "../../utils/allow";
import { DIRECTION_CHAIN } from "../../constants";
import { BridgeDirection } from "../../state/transactions/actions";
import { useTranslation } from "react-i18next";

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === DEV ? "DEV" : "";
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 19rem;
  text-overflow: ellipsis;
`;

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`;
const SourcesLogo = styled.div`
  display: flex;
  align-items: center;
`;
const CurrencyText = styled.span`
  display: flex;
  font-weight: 500;
  font-size: 15px;
  color: ${({ theme }) => theme.grayDark};
  white-space: nowrap;
`;
const Num2 = styled(Num)`
  font-size: 18px;
`;
const LoaderPos = styled(Loader)`
  position: absolute;
  top: 42%;
  right: 22px;
  transform: translateY(-50%);
`;

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(10)}</StyledBalanceText>;
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join("; \n")}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  );
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style?: CSSProperties;
}) {
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency);
  const customAdded = useIsUserAddedToken(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);

  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      className={`token-item-${key} token-item-modal`}
      onClick={() => (false ? null : onSelect())}
      disabled={false}
      selected={otherSelected}
    >
      <SourcesLogo>
        <CurrencyLogo currency={currency} style={{ marginRight: "5px" }} />
        <CurrencyText title={currency.name}>{currency.symbol}</CurrencyText>
        <FadedSpan>
          {!isOnSelectedList && customAdded ? (
            <TYPE.main fontWeight={500}>
              Added by user
              <LinkStyledButton
                onClick={event => {
                  event.stopPropagation();
                  if (chainId && currency instanceof Token) removeToken(chainId, currency.address);
                }}
              >
                (Remove)
              </LinkStyledButton>
            </TYPE.main>
          ) : null}
          {!isOnSelectedList && !customAdded ? (
            <TYPE.main fontWeight={500}>
              Found by address
              <LinkStyledButton
                onClick={event => {
                  event.stopPropagation();
                  if (currency instanceof Token) addToken(currency);
                }}
              >
                (Add)
              </LinkStyledButton>
            </TYPE.main>
          ) : null}
        </FadedSpan>
      </SourcesLogo>
      <MyAssetsNum className="token-item-modal">
        <TokenTags currency={currency} />
        <Num2 style={{ justifySelf: "flex-end" }}>
          {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
        </Num2>
      </MyAssetsNum>
    </MenuItem>
  );
}

/**
 * Swap : Select token PopupList
 */
export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH
}: {
  height: number;
  currencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherCurrency?: Currency | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showETH: boolean;
}) {
  const itemData = useMemo(() => (showETH ? [Currency.DEV, ...currencies] : currencies), [currencies, showETH]);

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index];
      const isSelected = !isAllowCurrency(currency, otherCurrency, selectedCurrency); // true is Disable
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  );

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), []);

  return (
    <FixedSizeListOverflow
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeListOverflow>
  );
}
/**
 *  AssetBOAItemRow
 */
function CurrencyRowForAssetsBoa({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style?: CSSProperties;
}) {
  const { chainId, account } = useActiveWeb3React();
  const key = currencyKey(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);
  const [price] = useState();

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem className={`token-item-${key}`} onClick={onSelect} disabled={isSelected} selected={otherSelected}>
      <SourcesLogo>
        <CurrencyLogo
          currency={currency}
          size={"60px"}
          isETH={chainId ? (DIRECTION_CHAIN[chainId] === BridgeDirection.ETHNET_BIZNET ? true : false) : false}
        />
        <CurrencyText title={currency.name}>
          {chainId ? (DIRECTION_CHAIN[chainId] === BridgeDirection.ETHNET_BIZNET ? "ETH" : "BOSAGORA") : "-"}
        </CurrencyText>
      </SourcesLogo>
      <MyAssetsNum>
        <TokenTags currency={currency} />
        {balance ? (
          <>
            <Num style={{ justifySelf: "flex-end" }}>
              <Balance balance={balance} />
              <Unit style={{ marginBottom: "-6px" }}>
                {chainId ? (DIRECTION_CHAIN[chainId] === BridgeDirection.ETHNET_BIZNET ? "ETH" : "BOA") : "-"}
              </Unit>
            </Num>
            {price ? <SubNum>${price}</SubNum> : null}
          </>
        ) : null}
      </MyAssetsNum>
      {balance ? <IconArrow /> : <LoaderPos />}
    </MenuItem>
  );
}

/**
 *  AssetTokenItemRow
 */
function CurrencyRowForAssets({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style?: CSSProperties;
}) {
  const { account } = useActiveWeb3React();
  const key = currencyKey(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);
  const [price] = useState();
  // if (balance) console.log("balance:", balance.toExact(), balance.toSignificant(4));
  // only show add or remove buttons if not on selected list
  return (
    <MenuItem className={`token-item-${key}`} onClick={onSelect} disabled={isSelected} selected={otherSelected}>
      <SourcesLogo>
        <CurrencyLogo currency={currency} size={"24px"} style={{ marginRight: "5px" }} />
        <CurrencyText title={currency.name}>{currency.name}</CurrencyText>
      </SourcesLogo>
      <MyAssetsNum>
        <TokenTags currency={currency} />
        {balance ? (
          <Num2 style={{ justifySelf: "flex-end" }}>
            <Balance balance={balance} />
            <Unit>{currency.symbol}</Unit>
          </Num2>
        ) : null}
        {price ? <SubNum>${price}</SubNum> : null}
      </MyAssetsNum>
      {balance ? <IconArrow /> : <LoaderPos />}
    </MenuItem>
  );
}

export function CurrencyListForAssets({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH
}: {
  height: number;
  currencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherCurrency?: Currency | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showETH: boolean;
}) {
  currencies = currencies.filter(token => {
    if (token instanceof WrappedTokenInfo && otherCurrency instanceof WrappedTokenInfo) {
      if (!otherCurrency) {
        return true;
      } else if (otherCurrency?.symbol === "DEV") {
        return token.tokenInfo?.tags?.includes("TOKEN");
      } else if (otherCurrency.tokenInfo?.tags?.includes("TOKEN")) {
        return false;
      }
    }
    return true;
  });
  // showETH = false
  const itemData = useMemo(() => (showETH ? [Currency.DEV, ...currencies] : currencies), [currencies, showETH]);
  const itemDataETH = useMemo(() => [Currency.DEV], []);
  const { t } = useTranslation();

  const RowBoa = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRowForAssetsBoa
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRowForAssets
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  );

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), []);

  const tokenListHeight = useMemo(() => {
    return itemData?.length ? 100 * itemData.length : 100;
  }, [itemData]);

  return (
    <>
      <FixedSizeListOverflow
        height={190 * itemDataETH.length}
        ref={fixedListRef as any}
        width="100%"
        itemData={itemDataETH}
        itemCount={itemDataETH.length}
        itemSize={100}
        itemKey={itemKey}
      >
        {RowBoa}
      </FixedSizeListOverflow>
      <AssetsDl>
        <AssetsDt>{t("Tokens")}</AssetsDt>
        <AssetsDd>
          <FixedSizeListOverflow
            height={tokenListHeight}
            ref={fixedListRef as any}
            width="100%"
            itemData={itemData}
            itemCount={itemData.length}
            itemSize={100}
            itemKey={itemKey}
          >
            {Row}
          </FixedSizeListOverflow>
        </AssetsDd>
      </AssetsDl>
    </>
  );
}

const FixedSizeListOverflow = styled(FixedSizeList)`
  overflow: visible !important;
  height: auto !important;
  > div {
    height: auto !important;
  }
  /* import Loader from '../Loader/index'; */
`;

export const AssetsDl = styled.dl`
  display: block;
  margin: 8px 0 6px;
`;
export const AssetsDt = styled.dt`
  display: block;
  padding-left: 7px;
  font-size: 15px;
  color: ${({ theme }) => theme.purple1};
`;
export const AssetsDd = styled.dd``;
