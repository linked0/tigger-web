import React from "react";
import { Text } from "rebass";
import { ChainId, Currency, currencyEquals, DEV } from "bizboa-swap-sdk";
import styled from "styled-components";

import QuestionHelper from "../QuestionHelper";
import CurrencyLogo from "../CurrencyLogo";
import { SourcesLogo } from "../../pages/styleds";
import { useTranslation } from "react-i18next";

const BaseWrapper = styled.div<{ disable?: boolean }>`
  display: flex;
  padding: 10px 6px 10px 10px;
  align-items: center;
  /* background-color: ${({ theme, disable }) => disable && theme.bg3}; */
  opacity: ${({ disable }) => disable && "0.4"};
  :hover {
    cursor: ${({ disable }) => !disable && "pointer"};
  }
`;
const WrapCommBases = styled.div`
  display: block;
  width: 100%;
`;
const CommBasesHd = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 0 10px 10px;
  border-bottom: 1px solid #f2e5ff;
`;
const CommBasesTitle = styled(Text)`
  font-size: 15px;
  color: ${({ theme }) => theme.grayDark};
`;
const CommBasesCont = styled.div`
  display: block;
`;

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency
}: {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}) {
  const { t } = useTranslation();

  return (
    <WrapCommBases>
      <CommBasesHd>
        <CommBasesTitle>{t("commonBasesTitle")}</CommBasesTitle>
        <QuestionHelper text={t("tokenPairHelper")} />
      </CommBasesHd>
      <CommBasesCont>
        <BaseWrapper
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, DEV)) {
              onSelect(DEV);
            }
          }}
          disable={selectedCurrency === DEV}
        >
          <CurrencyLogo currency={DEV} style={{ marginRight: 8 }} />
          <SourcesLogo>{DEV.symbol}</SourcesLogo>
          <Text fontWeight={500} fontSize={15}></Text>
        </BaseWrapper>
        {/*{(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {*/}
        {/*  const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address;*/}
        {/*  return (*/}
        {/*    <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected} key={token.address}>*/}
        {/*      <CurrencyLogo currency={token} style={{ marginRight: 8 }} />*/}
        {/*      <SourcesLogo>{token.symbol}</SourcesLogo>*/}
        {/*      <Text fontWeight={500} fontSize={16}></Text>*/}
        {/*    </BaseWrapper>*/}
        {/*  );*/}
        {/*})}*/}
      </CommBasesCont>
    </WrapCommBases>
  );
}
