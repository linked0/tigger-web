import styled, { ThemeContext } from "styled-components";
import { Currency, Token } from "bizboa-swap-sdk";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactGA from "react-ga4";
import { FixedSizeList } from "react-window";
import { useActiveWeb3React } from "../../hooks";
import { useAllTokens, useToken } from "../../hooks/Tokens";
import { useSelectedListInfo, WrappedTokenInfo } from "../../state/lists/hooks";
import { CloseIcon, LinkStyledButton, TYPE } from "../../theme";
import { isAddress } from "../../utils";
import Column from "../Column";
import ListLogo from "../ListLogo";
import QuestionHelper from "../QuestionHelper";
import Row from "../Row";
import CommonBases from "./CommonBases";
import CurrencyList, { CurrencyListForAssets } from "./CurrencyList";
import { filterTokens } from "./filtering";
import { useTokenComparator } from "./sorting";
import { ModalHd } from "../../pages/styleds";
import BtnAZ from "../../assets/images/btn/btn-az.svg";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { BOA_SYMBOL, DIRECTION_CHAIN, PAGES, TOKEN_TAGS } from "../../constants";
import { BridgeDirection } from "../../state/transactions/actions";

const ModalBd = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;
const TokenHd = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 0 10px 10px;
  border-bottom: 1px solid #f2e5ff;
`;
const TokenBd = styled.main`
  flex-grow: 1;
  width: 100%;
  padding: 0 6px 0 10px;
`;
const TokenFt = styled.footer`
  display: flex;
  width: 100%;
  margin-top: auto;
  padding: 13px 10px 0 10px;
  border-top: 1px solid #f2e5ff;
`;
const TokenListTit = styled.h3`
  font-weight: 400;
  font-size: 15px;
  color: ${({ theme }) => theme.grayDark};
`;
const BtnAlign = styled.button`
  position: relative;
  display: block;
  height: 24px;
  padding-left: 10px;
  border: none;
  background: transparent url(${BtnAZ}) no-repeat 0 50%;
  &::before {
    content: "";
    display: block;
    width: 22px;
    height: 22px;
    background: ${({ theme }) => theme.purpleBg};
    /* border: 0.5px solid #f0e1ff; */
    border: 0.5px solid ${({ theme }) => theme.purpleLine};
  }
  &::after {
    content: "\f063";
    position: absolute;
    top: 1px;
    right: 4px;
    font-family: "Line Awesome Free";
    font-weight: 900;
    font-size: 1rem;
    color: ${({ theme }) => theme.purple2};
  }
  &.oppo::after {
    top: 0;
    transform: rotate(180deg);
  }
`;

// const TokenUl = styled.ul`
//   display: block;
// `
// const TokenLi = styled.li`
//   display: block;
// `
// const TokenLink = styled.a`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;
//   padding: 11px 0;
// `
// const TokenName = styled.span`
//   display: block;
// `
// const TokenNum = styled.em`
//   display: block;
//   font-weight: 500;
//   font-size: 16px;
//   color: ${({ theme }) => theme.purple3};
//   font-style: normal;
// `
// const CoinLogo = styled.p`
//   display: flex;
// `
// const TextLogo = styled.span`
//   display: block;
//   font-weight: 500;
//   font-size: 15px;
//   color: ${({ theme }) => theme.grayDark};
//   font-style: normal;
// `

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  onChangeList: () => void;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList
}: CurrencySearchProps) {
  // const { t } = useTranslation()
  const { chainId } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const fixedList = useRef<FixedSizeList>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false);
  const allTokens = useAllTokens();
  const location = useLocation();
  const page = useMemo(() => {
    return location.pathname.split("/")[1];
  }, [location]);
  // const allowTokens = allowFilterTokens(Object.values(allTokens), otherSelectedCurrency);

  // console.log(allowTokens);
  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: "Currency Select",
        action: "Search by address",
        label: isAddressSearch
      });
    }
  }, [isAddressSearch]);

  const showETH: boolean = useMemo(() => {
    // const s = searchQuery.toLowerCase().trim();
    // return s === "" || s === "d" || s === "de" || s === "dev";
    return chainId
      ? page === "bridge" && DIRECTION_CHAIN[chainId] === BridgeDirection.ETHNET_BIZNET
        ? false
        : true
      : true;
  }, [chainId, page]);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(allTokens), searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    if (page === PAGES.bridge)
      return [
        ...(searchToken ? [searchToken] : []),
        // sort any exact symbol matches first
        ...sorted.filter(
          token =>
            (token.symbol === BOA_SYMBOL && token.symbol?.toLowerCase() === symbolMatch[0]) ||
            (token.symbol?.toLowerCase() === symbolMatch[0] &&
              (token as WrappedTokenInfo).tokenInfo.tags?.includes(TOKEN_TAGS.BRIDGE))
        ),
        ...sorted.filter(
          token =>
            (token.symbol === BOA_SYMBOL && token.symbol?.toLowerCase() !== symbolMatch[0]) ||
            (token.symbol?.toLowerCase() !== symbolMatch[0] &&
              (token as WrappedTokenInfo).tokenInfo.tags?.includes(TOKEN_TAGS.BRIDGE))
        )
      ];

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator, page]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // manage focus on modal show
  // const inputRef = useRef<HTMLInputElement>()
  // const handleInput = useCallback(event => {
  //   const input = event.target.value
  //   const checksummedInput = isAddress(input)
  //   setSearchQuery(checksummedInput || input)
  //   fixedList.current?.scrollTo(0)
  // }, [])
  //
  // const handleEnter = useCallback(
  //   (e: KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === 'Enter') {
  //       const s = searchQuery.toLowerCase().trim()
  //       if (s === 'dev') {
  //         handleCurrencySelect(DEV)
  //       } else if (filteredSortedTokens.length > 0) {
  //         if (
  //           filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
  //           filteredSortedTokens.length === 1
  //         ) {
  //           handleCurrencySelect(filteredSortedTokens[0])
  //         }
  //       }
  //     }
  //   },
  //   [filteredSortedTokens, handleCurrencySelect, searchQuery]
  // )

  const selectedListInfo = useSelectedListInfo();

  return (
    <Column style={{ width: "100%", flex: "1 1" }}>
      <ModalHd>
        <h2>
          {t("selectTokenPoint")}
          <QuestionHelper text={t("selectTokenPointHelper")} />
        </h2>
        <CloseIcon onClick={onDismiss} />
      </ModalHd>
      <ModalBd>
        {/*<SearchInput*/}
        {/*  type="text"*/}
        {/*  id="token-search-input"*/}
        {/*  placeholder={t('tokenSearchPlaceholder')}*/}
        {/*  value={searchQuery}*/}
        {/*  ref={inputRef as RefObject<HTMLInputElement>}*/}
        {/*  onChange={handleInput}*/}
        {/*  onKeyDown={handleEnter}*/}
        {/*/>*/}
        {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
        <TokenHd>
          <TokenListTit>{t("symbol")}</TokenListTit>
          <BtnAlign
            className={invertSearchOrder ? "oppo" : ""}
            onClick={() => setInvertSearchOrder(!invertSearchOrder)}
          />
        </TokenHd>
        <TokenBd>
          <CurrencyList
            height={500}
            showETH={showETH}
            currencies={filteredSortedTokens}
            onCurrencySelect={handleCurrencySelect}
            otherCurrency={otherSelectedCurrency}
            selectedCurrency={selectedCurrency}
            fixedListRef={fixedList}
          />
        </TokenBd>
        <TokenFt>
          {selectedListInfo.current ? (
            <Row>
              {selectedListInfo.current.logoURI ? (
                <ListLogo
                  style={{ marginRight: 12 }}
                  logoURI={selectedListInfo.current.logoURI}
                  alt={`${selectedListInfo.current.name} list logo`}
                />
              ) : null}
              <TYPE.main id="currency-search-selected-list-name">{selectedListInfo.current.name}</TYPE.main>
            </Row>
          ) : null}
          <LinkStyledButton
            style={{ fontWeight: 500, color: theme.text2, fontSize: 16 }}
            // onClick={onChangeList}
            id="currency-search-change-list-button"
          >
            {/*{selectedListInfo.current ? 'Change' : 'Select a list'}*/}
          </LinkStyledButton>
        </TokenFt>
      </ModalBd>
    </Column>
  );
}

export function CurrencySearchForAssets({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  onDismiss,
  isOpen
}: CurrencySearchProps) {
  const fixedList = useRef<FixedSizeList>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const allTokens = useAllTokens();

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: "Currency Select",
        action: "Search by address",
        label: isAddressSearch
      });
    }
  }, [isAddressSearch]);

  const showETH = false;

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(allTokens), searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens;
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    const to = [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ];
    return to;
  }, [filteredTokens, searchQuery, searchToken]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  return (
    <div style={{ flex: "1" }}>
      <CurrencyListForAssets
        height={200}
        showETH={showETH}
        currencies={filteredSortedTokens}
        onCurrencySelect={handleCurrencySelect}
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
        fixedListRef={fixedList}
      />
    </div>
  );
}
