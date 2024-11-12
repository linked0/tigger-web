import React, { useCallback, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
// import { CheckCircle, Triangle } from 'react-feather'
import { useActiveWeb3React } from "../../hooks";
import { getEtherscanLink } from "../../utils";
import { ExternalLink } from "../../theme";
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
import { RowFixed } from "../Row";
// import Loader from '../Loader'
// import { Text } from "rebass";
import { CurrencyLogoFor } from "../CurrencyLogo";
// import { RowTransactions } from "../PositionCard";
import { Currency, TradeType } from "bizboa-swap-sdk";
import { useSelectedListInfo } from "../../state/lists/hooks";
import { darken } from "polished";
import { IconArrow } from "../../pages/styleds";
import IcoLink from "../../assets/images/icon/ico-link.svg";
import IcoLoding from "../../assets/images/icon/ico-loading.svg";
import { BridgeServerCallState, useBridgeExpireCallback } from "../../hooks/useBridgeCallback";
import { changeBridgeTransaction } from "../../state/transactions/actions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import { TransactionDetails } from "../../state/transactions/reducer";
import { useTranslation } from "react-i18next";
import { NETWORK_LABELS } from "../Wallet";
import ImgBiznet from "../../assets/images/img-biznet.svg";
import EthereumLogo from "../../assets/images/ethereum-logo.png";
import ico_wrong from "../../assets/images/ico-wrong.svg";
import { ChainId } from "bizboa-swap-sdk";

const TransactionWrapper = styled.div`
  position: relative;
  margin-bottom: 0.6rem;
  padding: 1.1rem 1rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.gray1};
  border-radius: 5px;
`;

const RowCoin = styled.div`
  display: flex;
  justify-content: space-between;
`;
const FromTo = styled.div`
  display: block;
  width: 50%;
  &.to > div {
    justify-content: flex-end;
  }
`;
export const SourcesLogo = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.grayDark};
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 5px;
  .coinLogo {
    overflow: hidden;
    display: inline-block;
    width: 22px;
    height: 22px;
    margin-right: 5px;
    vertical-align: middle;
    border-radius: 50%;
  }
`;
const PriceCoin = styled.div`
  display: flex;
  /* margin-top: 10px; */
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.purple3};
`;
const UnitCoin = styled.div`
  display: block;
`;
// const StateWrap = styled.div`
//   display: block;
// `;
// const StateCoin = styled.div`
//   margin-top: 0.3rem;
//   padding-left: 2px;
//   font-weight: 500;
//   font-size: 15px;
//   color: #2ebd67;
// `;
// const StateCoinExpired = styled(StateCoin)`
//   color: ${({ theme }) => theme.pinkPoint1};
// `;
// const StateCoinPending = styled(StateCoin)`
//   color: #04c1db;
// `;
const DateCoin = styled.time`
  display: block;
  margin-top: 0.1rem;
  padding-left: 2px;
  font-weight: 300;
  font-size: 11px;
  color: ${({ theme }) => theme.purple3};
  text-indent: -2px;
`;
const AreaLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  /* margin-top: 0.5rem; */
`;
const RowEnd = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: auto;
`;

// const CoinLink = styled.a`
//   display: block;
//   width: 22px;
//   height: 22px;
//   margin-left: 5px;
//   background: url(${IcoLink}) no-repeat 0 0 / contain;
//   &:hover {
//     cursor: pointer;
//   }
// `;
const LodingAni = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
const IconLoading = styled.i`
  display: block;
  width: 22px;
  height: 22px;
  background: url(${IcoLoding}) no-repeat 50% 50% / contain;
  animation: 2s ${LodingAni} linear infinite;
`;
const IconLink = styled.i`
  display: block;
  width: 22px;
  height: 22px;
  margin-left: 5px;
  background: url(${IcoLink}) no-repeat 0 0 / contain;
`;
const StateButton = styled.button`
  display: block;
  height: 25px;
  /* margin-right: 10px; */
  padding: 0 0.8rem;
  line-height: 25px;
  border: none;
  border-radius: 25px;
  background: ${({ theme }) => theme.purple2};
  color: ${({ theme }) => theme.white};
  font-size: 14px;
  text-align: center;
  color: #ffffff;
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => darken(0.07, theme.purple2)};
  }
`;
// const AreaButtonVertical = styled.div`
//   position: relative;
//   width: 0;
//   height: 0;
// `;
const ButtonSwapVertical = styled(IconArrow)`
  top: 34px;
  left: 50%;
  transform: translateX(-50%);
`;
const State = styled.div`
  display: block;
  margin-top: 3px;
`;

const IcoItem = styled.i`
  flex-shrink: 0;
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 5px;
  vertical-align: middle;
  border-radius: 50%;
  background-color: #03317c;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: contain;
  &.ico-boa {
    background-image: url(${ImgBiznet});
  }
  &.ico-eth {
    background-image: url(${EthereumLogo});
  }
  &.ico-wrong {
    background-image: url(${ico_wrong});
  }
`;

// const ClearAll = styled.button`
//   position: absolute;
//   bottom: 0;
//   right: 0;
//   display: flex;
//   justify-content: flex-end;
//   padding: 5px 3px;
//   border: none;
//   background-color: ${({ theme }) => theme.white};
//   font-size: 12px;
//   color: ${({ theme }) => theme.purple2};
//   text-decoration: underline;
// `;
// const TransactionStatusText = styled.div`
//   margin-right: 0.5rem;
//   display: flex;
//   align-items: center;
//   :hover {
//     text-decoration: underline;
//   }
// `

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  display: block;
  text-decoration: none;
  :hover, :focus, :active {
    text-decoration: none;
  }
  /* margin-left: 5px; */
  /* width: 22px; */
  /* height: 22px; */
  /* margin: 0 0 0 auto; */
  /* background: url(${IcoLink}) no-repeat 0 0 / contain; */
`;
const RowBetweenReverse = styled.div`
  display: flex;
  justify-content: space-between;
  /* flex-direction: row-reverse; */
  margin-top: 7px;
`;

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.pinkPoint1 : success ? theme.green1 : theme.red1)};
`;

function leftPad(value: number) {
  if (value >= 10) {
    return value;
  }
  return `0${value}`;
}

function toStringByFormatting(source: Date, delimiter = ".") {
  const year = source.getFullYear();
  const month = leftPad(source.getMonth() + 1);
  const day = leftPad(source.getDate());
  const hours = leftPad(source.getHours());
  const minutes = leftPad(source.getMinutes());
  const seconds = leftPad(source.getSeconds());
  return [year, month, day].join(delimiter) + " " + [hours, minutes, seconds].join(":");
}

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React();
  const allTransactions = useAllTransactions();
  const allTokens = useSelectedListInfo();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const tx = allTransactions?.[hash];
  const bridgeTradeTransactions = sortedRecentTransactions.filter(
    tx => tx.txCategory === "bridge" && tx.txType === "trade"
  );
  const expireTransactions = bridgeTradeTransactions.filter(tx => tx.bridgeStatus === BridgeServerCallState.EXPIRED);
  const boxId = tx?.bridgeBoxId || "";
  const currencyType = tx?.bridgeCurrencyType || "";
  const tradeType = tx?.bridgeLockBoxInfo?.direction === "0" ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT;
  const { callback: bridgeExpireCallback, error: bridgeExpireCallbackError } = useBridgeExpireCallback(
    tradeType,
    currencyType,
    hash,
    boxId
  );
  const [{ bridgeCancelErrorMessage, attemptingTxn }, setBridgeCancelState] = useState<{
    attemptingTxn: boolean;
    bridgeCancelErrorMessage: string | undefined;
  }>({
    attemptingTxn: false,
    bridgeCancelErrorMessage: undefined
  });

  const handleCancel = useCallback(() => {
    if (!bridgeExpireCallback) {
      return;
    }
    setBridgeCancelState({
      attemptingTxn: true,
      bridgeCancelErrorMessage: undefined
    });
    bridgeExpireCallback()
      .then(cancelhash => {
        console.log(">>>>>>>>>>>>> bridge cancel hash:", cancelhash);
        expireTransactions.forEach(tx => {
          console.log("expireTransactions hash:", tx?.hash);
          if (chainId && tx.hash === hash) {
            dispatch(
              changeBridgeTransaction({
                chainId,
                hash: tx.hash || "",
                bridgeStatus: BridgeServerCallState.CANCELED
              })
            );
            setBridgeCancelState({
              attemptingTxn: true,
              bridgeCancelErrorMessage: undefined
            });
          }
        });
      })
      .catch(error => {
        console.log(">>>>>>>>>>>>> bridge error:", error);
        setBridgeCancelState({
          attemptingTxn: true,
          bridgeCancelErrorMessage: error.message
        });
      });
  }, [bridgeExpireCallback, chainId, dispatch, hash, expireTransactions]);

  const pending = !tx?.receipt;
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === "undefined");
  const bridgePending =
    (tx.txCategory === "bridge" && tx?.txType === "trade" && tx?.bridgeStatus !== 8 && tx?.bridgeStatus !== 7) ||
    (tx.txCategory === "bridge" && tx?.txType === "approve" && !tx?.receipt);
  const bridgeSuccess =
    (tx.txCategory === "bridge" && tx?.txType === "trade" && tx?.bridgeStatus === 8) ||
    (tx?.txType === "approve" && !bridgePending);
  const bridgeExpired = tx.txCategory === "bridge" && tx?.txType === "trade" && tx?.bridgeStatus === 6;
  const bridgeCanceled = tx.txCategory === "bridge" && tx?.txType === "trade" && tx?.bridgeStatus === 9;

  const inputCurrency = tx?.inputCurrency;
  const outputCurrency = tx?.outputCurrency;
  const addedTime = tx?.addedTime;
  const txCategory = tx?.txCategory;
  if (!chainId) return null;

  function currencyBySymbol(symbol: string | undefined): Currency | null {
    const filteredToken = allTokens.current?.tokens.filter(
      token => token.chainId === chainId && token.symbol === symbol
    );
    return filteredToken ? filteredToken![0] : null;
  }

  function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime;
  }

  return txCategory === "swap" ? (
    <TransactionWrapper>
      <RowCoin>
        <FromTo>
          <SourcesLogo>
            <CurrencyLogoFor
              size="20px"
              style={{ marginRight: "5px" }}
              currency={currencyBySymbol(inputCurrency?.symbol)}
            />
            {inputCurrency?.name}
          </SourcesLogo>
          {inputCurrency ? (
            <PriceCoin>
              {inputCurrency?.amount}
              <UnitCoin>{" " + inputCurrency?.symbol}</UnitCoin>
            </PriceCoin>
          ) : (
            "-"
          )}
        </FromTo>
        <ButtonSwapVertical>
          <span className="blind">Transactions</span>
        </ButtonSwapVertical>
        {/* <AreaButtonVertical></AreaButtonVertical> */}

        {!!outputCurrency ? (
          <FromTo className="to" style={{ width: "50%" }}>
            <SourcesLogo>
              <CurrencyLogoFor
                size="20px"
                currency={currencyBySymbol(outputCurrency?.symbol)}
                style={{ marginRight: "5px" }}
              />
              {outputCurrency?.name}
            </SourcesLogo>

            <PriceCoin>
              {outputCurrency?.amount}
              <UnitCoin>{" " + outputCurrency?.symbol}</UnitCoin>
            </PriceCoin>
          </FromTo>
        ) : (
          <SourcesLogo>{tx.summary}</SourcesLogo>
        )}
      </RowCoin>
      <RowBetweenReverse>
        <State style={{ marginTop: "3px" }}>
          <IconWrapper pending={pending} success={success}>
            {pending ? t("pending") : success ? t("complete") : t("fail")}
          </IconWrapper>
          <DateCoin>{toStringByFormatting(new Date(addedTime))}</DateCoin>
        </State>
        {/* <AreaLink></AreaLink> */}
        <RowEnd>
          {pending ? (
            <IconLoading>
              <span className="blind">{t("pending")}</span>
            </IconLoading>
          ) : null}
          <TransactionState href={getEtherscanLink(chainId, hash, "transaction")} pending={pending} success={success}>
            <IconLink>
              <span className="blind">{t("link")}</span>
            </IconLink>
          </TransactionState>
        </RowEnd>
      </RowBetweenReverse>
    </TransactionWrapper>
  ) : txCategory === "bridge" ? (
    <TransactionWrapper>
      <RowCoin>
        <FromTo>
          {inputCurrency && inputCurrency.chainId ? (
            <SourcesLogo>
              <IcoItem className={NETWORK_LABELS[inputCurrency.chainId as ChainId][1]} />
              {NETWORK_LABELS[inputCurrency.chainId as ChainId][0]}
            </SourcesLogo>
          ) : (
            <SourcesLogo>
              <CurrencyLogoFor
                style={{ marginRight: "5px" }}
                size="20px"
                currency={currencyBySymbol(inputCurrency?.symbol)}
              />
              {inputCurrency?.name}
            </SourcesLogo>
          )}
          {inputCurrency ? (
            <PriceCoin>
              {inputCurrency?.amount}
              <UnitCoin>{" " + inputCurrency?.symbol}</UnitCoin>
            </PriceCoin>
          ) : (
            "-"
          )}
        </FromTo>

        <ButtonSwapVertical>
          <span className="blind">{t("transactions")}</span>
        </ButtonSwapVertical>
        {/* <AreaButtonVertical></AreaButtonVertical> */}

        {!!outputCurrency ? (
          <FromTo className="to">
            {outputCurrency && outputCurrency.chainId ? (
              <SourcesLogo>
                <IcoItem className={NETWORK_LABELS[outputCurrency.chainId as ChainId][1]} />
                {NETWORK_LABELS[outputCurrency.chainId as ChainId][0]}
              </SourcesLogo>
            ) : (
              <SourcesLogo>
                <CurrencyLogoFor
                  size="20px"
                  style={{ marginRight: "5px" }}
                  currency={currencyBySymbol(outputCurrency?.symbol)}
                />
                {outputCurrency?.name}
              </SourcesLogo>
            )}

            <PriceCoin>
              {outputCurrency?.amount}
              <UnitCoin>{" " + outputCurrency?.symbol}</UnitCoin>
            </PriceCoin>
          </FromTo>
        ) : (
          <SourcesLogo>{tx.summary}</SourcesLogo>
        )}
      </RowCoin>
      <RowBetweenReverse>
        {bridgeCancelErrorMessage ? <div>{bridgeCancelErrorMessage}</div> : null}
        <State>
          <IconWrapper pending={bridgePending} success={bridgeSuccess}>
            {bridgeCanceled
              ? t("canceled")
              : bridgeExpired
              ? t("expired")
              : bridgePending
              ? t("pending")
              : bridgeSuccess
              ? t("complete")
              : t("Error")}
          </IconWrapper>
          <DateCoin>{toStringByFormatting(new Date(addedTime))}</DateCoin>
        </State>
        {bridgeCanceled ? null : bridgePending ? (
          <AreaLink>
            {!bridgeExpireCallbackError && bridgeExpired ? (
              attemptingTxn === true ? (
                <StateButton>Pending</StateButton>
              ) : (
                <StateButton onClick={handleCancel}>{t("cancel")}</StateButton>
              )
            ) : (
              <IconLoading>
                <span className="blind">{t("link")}</span>
              </IconLoading>
            )}
          </AreaLink>
        ) : (
          <RowEnd>
            <TransactionState href={getEtherscanLink(chainId, hash, "transaction")} pending={pending} success={success}>
              <IconLink>
                <span className="blind">{t("link")}</span>
              </IconLink>
            </TransactionState>
          </RowEnd>
        )}
      </RowBetweenReverse>
    </TransactionWrapper>
  ) : (
    <TransactionWrapper>
      <RowCoin>
        {inputCurrency && inputCurrency.chainId ? (
          <SourcesLogo>
            <IcoItem className={NETWORK_LABELS[inputCurrency.chainId as ChainId][1]} />
            {NETWORK_LABELS[inputCurrency.chainId as ChainId][0]}
          </SourcesLogo>
        ) : (
          <SourcesLogo>
            <CurrencyLogoFor
              style={{ marginRight: "5px" }}
              size="20px"
              currency={currencyBySymbol(inputCurrency?.symbol)}
            />
            {inputCurrency?.name}
          </SourcesLogo>
        )}
        {inputCurrency ? (
          <PriceCoin>
            {inputCurrency?.amount}
            {t("approved")}
          </PriceCoin>
        ) : (
          "-"
        )}
      </RowCoin>

      <TransactionState href={getEtherscanLink(chainId, hash, "transaction")} pending={pending} success={success}>
        {/*<RowFixed>*/}
        {/*  <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>*/}
        {/*</RowFixed>*/}
        <IconWrapper pending={pending} success={success}>
          {pending ? t("pending") : success ? t("complete") : t("fail")}
        </IconWrapper>
        <RowFixed>{toStringByFormatting(new Date(addedTime))}</RowFixed>
      </TransactionState>
    </TransactionWrapper>
  );
}
