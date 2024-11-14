import { splitSignature } from "@ethersproject/bytes";
import { Contract } from "@ethersproject/contracts";
import { TransactionResponse } from "@ethersproject/providers";
import { Currency, currencyEquals, DEV, JSBI, Percent, WDEV } from "tigger-swap-sdk";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { ArrowDown, Plus } from "react-feather";
import ReactGA from "react-ga4";
import { RouteComponentProps } from "react-router";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components";
import { ButtonConfirmed, ButtonError, ButtonPrimary } from "../../components/Button";
import { LightCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import TransactionConfirmationModal, { ConfirmationModalContent } from "../../components/TransactionConfirmationModal";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
// import DoubleCurrencyLogo from "../../components/DoubleLogo";
// import { AddRemoveTabs } from '../../components/NavigationTabs'
import { RowBetween, RowFixed } from "../../components/Row";

import Slider from "../../components/Slider";
import CurrencyLogo from "../../components/CurrencyLogo";
import { ROUTER_ADDRESS } from "../../constants";
import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { usePairContract } from "../../hooks/useContract";

import { useTransactionAdder } from "../../state/transactions/hooks";
import { StyledInternalLink } from "../../theme";
import { calculateSlippageAmount, getRouterContract } from "../../utils";
//calculateGasMargin,
import { currencyId } from "../../utils/currencyId";
import useDebouncedChangeHandler from "../../utils/useDebouncedChangeHandler";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import AppBody from "../AppBody";
import { ClickableText, MaxButton, Wrapper } from "../Pool/styleds";
import { ApprovalState, useApproveCallback } from "../../hooks/useApproveCallback";
import { Dots } from "../../components/swap/styleds";
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from "../../state/burn/hooks";
import { Field } from "../../state/burn/actions";
import { useWalletModalToggle } from "../../state/application/hooks";
import { useUserDeadline, useUserSlippageTolerance } from "../../state/user/hooks";
import { BigNumber } from "@ethersproject/bignumber";
import { AreaButton, BottomGrouping, ButtonSwap, Num, SourcesLogo, TxtDesc13, WrapInfo } from "../styleds";
import BoxHd from "../../components/BoxHd";
import { useTranslation } from "react-i18next";

const TextAmount = styled.p`
  color: ${({ theme }) => theme.grayDark};
  font-size: 15px;
`;
const NumPercent = styled.div`
  display: block;
  font-size: 60px;
  color: ${({ theme }) => theme.purple1};
  line-height: 0.9;
`;
const SliderButton = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.4rem;
`;
const WrapUlCoin = styled.ul`
  display: block;
`;
const WrapLiCoin = styled.li`
  display: flex;
  justify-content: space-between;
`;
const CoinName = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.grayDark};
  white-space: nowrap;
`;
const CoinPrice = styled.div`
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.purple1};
`;
const RowFlat = styled.div`
  display: flex;
  flex-direction: column;
`;
const TxtPlus = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.grayDark};
`;

const WrapCurrencyInput = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.purpleTxt};
  background-color: ${({ theme }) => theme.purpleBg};
  border-radius: 5px;
  box-sizing: border-box;
`;

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined];
  const { account, chainId, library } = useActiveWeb3React();
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ]);

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // burn state
  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showDetailed, setShowDetailed] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>("");
  const [deadline] = useUserDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo("0")
      ? "0"
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent("1", "100"))
      ? "<1"
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? "",
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? "",
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ""
  };

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent("1"));

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address);

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null
  );
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library) throw new Error("missing dependencies");
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error("missing liquidity amount");
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);

    const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline;

    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];
    const domain = {
      name: "BOAswap V2", //correct domain name!
      version: "1",
      chainId: chainId,
      verifyingContract: pair.liquidityToken.address
    };
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ];
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineForSignature
    };
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: "Permit",
      message
    });

    library
      .send("eth_signTypedData_v4", [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineForSignature
        });
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback();
        }
      });
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null);
      return _onUserInput(field, typedValue);
    },
    [_onUserInput]
  );

  const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
    onUserInput
  ]);
  const onCurrencyAInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue), [
    onUserInput
  ]);
  const onCurrencyBInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue), [
    onUserInput
  ]);

  // tx sending
  const addTransaction = useTransactionAdder();
  async function onRemove() {
    if (!chainId || !library || !account) throw new Error("missing dependencies");
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts;
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error("missing currency amounts");
    }
    const router = getRouterContract(chainId, library, account);

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    };

    if (!currencyA || !currencyB) throw new Error("missing tokens");
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error("missing liquidity amount");

    const currencyBIsETH = currencyB === DEV;
    const oneCurrencyIsETH = currencyA === DEV || currencyBIsETH;
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    if (!tokenA || !tokenB) throw new Error("could not wrap");

    let methodNames: string[], args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ["removeLiquidityETH", "removeLiquidityETHSupportingFeeOnTransferTokens"];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow
        ];
      }
      // removeLiquidity
      else {
        methodNames = ["removeLiquidity"];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow
        ];
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ["removeLiquidityETHWithPermit", "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens"];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ];
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ["removeLiquidityWithPermit"];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ];
      }
    } else {
      throw new Error("Attempting to confirm without approval or a signature. Please contact support.");
    }
    /*
    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )
    */
    const safeGasEstimates: BigNumber[] = [BigNumber.from("5000000")];
    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error("This transaction would fail. Please contact support.");
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      setAttemptingTxn(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            txCategory: "liquidity",
            txType: "remove",
            summary:
              "Remove " +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              " " +
              currencyA?.symbol +
              " and " +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              " " +
              currencyB?.symbol
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: "Liquidity",
            action: "Remove",
            label: [currencyA?.symbol, currencyB?.symbol].join("/")
          });
        })
        .catch((error: Error) => {
          setAttemptingTxn(false);
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error);
        });
    }
  }

  function modalHeader() {
    return (
      <AutoColumn style={{ marginTop: "20px", width: "100%" }}>
        <WrapCurrencyInput>
          <RowFlat>
            <SourcesLogo>
              <CurrencyLogo currency={currencyA} size={"22px"} style={{ marginRight: "8px" }} />
              {currencyA?.symbol}
            </SourcesLogo>
            <Num>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Num>
          </RowFlat>
          <TxtPlus>
            <Plus size="16" color={theme.text2} />
          </TxtPlus>
          <RowFlat>
            <SourcesLogo>
              <CurrencyLogo currency={currencyB} size={"22px"} style={{ marginRight: "8px" }} />
              {currencyB?.symbol}
            </SourcesLogo>
            <Num>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Num>
          </RowFlat>
        </WrapCurrencyInput>

        <TxtDesc13 style={{ margin: "10px 0 20px" }}>
          {t("liquidityInfo", { percent: allowedSlippage / 100 })}
        </TxtDesc13>
      </AutoColumn>
    );
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          {/*<Text color={theme.text2} fontWeight={500} fontSize={16}>*/}
          {/*  {"UNI " + currencyA?.symbol + "/" + currencyB?.symbol} Burned*/}
          {/*</Text>*/}
          {/*<RowFixed>*/}
          {/*  /!*<DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />*!/*/}
          {/*  <Text fontWeight={500} fontSize={16}>*/}
          {/*    Burned {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}*/}
          {/*  </Text>*/}
          {/*</RowFixed>*/}
        </RowBetween>
        {pair && (
          <>
            <WrapInfo>
              <dl>
                <dt>
                  <Text color={theme.text2} fontWeight={500} fontSize={16}>
                    {t("price")}
                  </Text>
                </dt>
                <dd>
                  <Text fontWeight={500} fontSize={16} color={theme.text1}>
                    1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"} {currencyB?.symbol}
                  </Text>
                  {"  "}
                </dd>
                <dd>
                  <Text fontWeight={500} fontSize={16} color={theme.text1}>
                    1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"} {currencyA?.symbol}
                  </Text>
                </dd>
              </dl>
            </WrapInfo>
          </>
        )}
        <ButtonPrimary disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)} onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            {t("confirm")}
          </Text>
        </ButtonPrimary>
      </>
    );
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`;

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
    },
    [onUserInput]
  );

  const oneCurrencyIsETH = currencyA === DEV || currencyB === DEV;
  const oneCurrencyIsWDEV = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WDEV[chainId], currencyA)) ||
        (currencyB && currencyEquals(WDEV[chainId], currencyB)))
  );

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`);
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`);
      }
    },
    [currencyIdA, currencyIdB, history]
  );
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`);
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`);
      }
    },
    [currencyIdA, currencyIdB, history]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setSignatureData(null); // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, "0");
    }
    setTxHash("");
  }, [onUserInput, txHash]);

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  );

  const hasLiquidities =
    parsedAmounts[Field.CURRENCY_A]?.greaterThan(JSBI.BigInt(0)) &&
    parsedAmounts[Field.CURRENCY_B]?.greaterThan(JSBI.BigInt(0));

  return (
    <>
      <AppBody>
        <BoxHd title={t("titleRemoveLiquidity")} historyBackTo={"pool"} />
        {/* <AddRemoveTabs adding={false} /> */}
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ""}
            content={() => (
              <ConfirmationModalContent
                title={t("titleRemoveLiquidity")}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <LightCard>
            <AutoColumn gap="20px">
              <RowBetween>
                <TextAmount>{t("share")}</TextAmount>
                <ClickableText
                  fontWeight={500}
                  onClick={() => {
                    setShowDetailed(!showDetailed);
                  }}
                >
                  {/*{showDetailed ? "Simple" : "Detailed"}*/}
                </ClickableText>
              </RowBetween>
              <NumPercent>{formattedAmounts[Field.LIQUIDITY_PERCENT]}%</NumPercent>
              {!showDetailed && (
                <>
                  <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                  <SliderButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "25")} width="24%">
                      25%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "50")} width="24%">
                      50%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "75")} width="24%">
                      75%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")} width="24%">
                      Max
                    </MaxButton>
                  </SliderButton>
                </>
              )}
            </AutoColumn>
          </LightCard>
          {!showDetailed && (
            <>
              <AreaButton>
                <ButtonSwap className="arrow" />
                {/* <ArrowDown size="16" color={theme.text2} /> */}
              </AreaButton>
              <LightCard>
                <WrapUlCoin>
                  <WrapLiCoin>
                    <RowFixed>
                      <CurrencyLogo currency={currencyA} style={{ marginRight: "5px" }} />
                      <CoinName id="remove-liquidity-tokena-symbol">{currencyA?.symbol}</CoinName>
                    </RowFixed>
                    <CoinPrice>{formattedAmounts[Field.CURRENCY_A] || "0"}</CoinPrice>
                  </WrapLiCoin>
                  <WrapLiCoin>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo currency={currencyB} style={{ marginRight: "5px" }} />
                        <CoinName id="remove-liquidity-tokenb-symbol">{currencyB?.symbol}</CoinName>
                      </RowFixed>
                      <CoinPrice>{formattedAmounts[Field.CURRENCY_B] || "0"}</CoinPrice>
                    </RowBetween>
                  </WrapLiCoin>
                  <WrapLiCoin>
                    {chainId && (oneCurrencyIsWDEV || oneCurrencyIsETH) ? (
                      <RowBetween style={{ justifyContent: "flex-end" }}>
                        {oneCurrencyIsETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA === DEV ? WDEV[chainId].address : currencyIdA}/${
                              currencyB === DEV ? WDEV[chainId].address : currencyIdB
                            }`}
                          ></StyledInternalLink>
                        ) : oneCurrencyIsWDEV ? (
                          <StyledInternalLink
                            to={`/remove/${
                              currencyA && currencyEquals(currencyA, WDEV[chainId]) ? "ETH" : currencyIdA
                            }/${currencyB && currencyEquals(currencyB, WDEV[chainId]) ? "ETH" : currencyIdB}`}
                          ></StyledInternalLink>
                        ) : null}
                      </RowBetween>
                    ) : null}
                  </WrapLiCoin>
                </WrapUlCoin>
              </LightCard>
            </>
          )}

          {showDetailed && (
            <>
              <CurrencyInputPanel
                value={formattedAmounts[Field.LIQUIDITY]}
                onUserInput={onLiquidityInput}
                onMax={() => {
                  onUserInput(Field.LIQUIDITY_PERCENT, "100");
                }}
                showMaxButton={!atMaxAmount}
                disableCurrencySelect
                currency={pair?.liquidityToken}
                pair={pair}
                id="liquidity-amount"
              />
              <ColumnCenter>
                <ArrowDown size="16" color={theme.text2} />
              </ColumnCenter>
              <CurrencyInputPanel
                hideBalance={true}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onCurrencyAInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")}
                showMaxButton={!atMaxAmount}
                currency={currencyA}
                label={"Output"}
                onCurrencySelect={handleSelectCurrencyA}
                id="remove-liquidity-tokena"
              />
              <ColumnCenter>
                <Plus size="16" color={theme.text2} />
              </ColumnCenter>
              <CurrencyInputPanel
                hideBalance={true}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onCurrencyBInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")}
                showMaxButton={!atMaxAmount}
                currency={currencyB}
                label={"Output"}
                onCurrencySelect={handleSelectCurrencyB}
                id="remove-liquidity-tokenb"
              />
            </>
          )}
          {pair && (
            <WrapInfo>
              <dl>
                <dt>{t("rates")}</dt>
                <dd>
                  1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"} {currencyB?.symbol}{" "}
                  <br />1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"}{" "}
                  {currencyA?.symbol}
                </dd>
              </dl>
            </WrapInfo>
          )}
          <BottomGrouping>
            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>{t("connectWallet")}</ButtonPrimary>
            ) : (
              <BottomGrouping>
                <ButtonConfirmed
                  style={{ marginBottom: "8px" }}
                  onClick={onAttemptToApprove}
                  confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                  disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                  mr="0.5rem"
                  fontWeight={500}
                  fontSize={16}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>{t("approving")}</Dots>
                  ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                    t("approved")
                  ) : (
                    t("approve")
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true);
                  }}
                  disabled={
                    !isValid || !hasLiquidities || (signatureData === null && approval !== ApprovalState.APPROVED)
                  }
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  {error || t("remove")}
                </ButtonError>
              </BottomGrouping>
            )}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  );
}
