import { BigNumber } from "@ethersproject/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import { Currency, DEV, TokenAmount } from "tigger-swap-sdk";
import React, { useCallback, useState } from "react";
// import { Plus } from "react-feather";
import ReactGA from "react-ga4";
import { RouteComponentProps } from "react-router-dom";
import { Text } from "rebass";
// import { ThemeContext } from "styled-components";
import { ButtonError, ButtonPrimary } from "../../components/Button";
import { LightCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import TransactionConfirmationModal, { ConfirmationModalContent } from "../../components/TransactionConfirmationModal";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
// import DoubleCurrencyLogo from "../../components/DoubleLogo";
// import { AddRemoveTabs } from '../../components/NavigationTabs'
import { RowBetween } from "../../components/Row";

import { ROUTER_ADDRESS } from "../../constants";
import { PairState } from "../../data/Reserves";
import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallback } from "../../hooks/useApproveCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/mint/actions";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "../../state/mint/hooks";

import { useTransactionAdder } from "../../state/transactions/hooks";
import { useIsExpertMode, useUserDeadline, useUserSlippageTolerance } from "../../state/user/hooks";
// import { TYPE } from "../../theme";
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from "../../utils";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import AppBody from "../AppBody";
import { Dots, Wrapper } from "../Pool/styleds";
import { ConfirmAddModalBottom } from "./ConfirmAddModalBottom";
import { currencyId } from "../../utils/currencyId";
import { PoolPriceBar } from "./PoolPriceBar";

import styled from "styled-components";

import { AreaButton, ButtonSwap, DescriptionWallet, Num, SourcesLogo, TxtDesc13 } from "../styleds";
import BoxHd from "../../components/BoxHd";
import CurrencyLogo from "../../components/CurrencyLogo";
import { useTranslation } from "react-i18next";

const TxtPlus = styled.div`
  display: inline-block;
  margin: 0 0 0 66px;
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
// const AreaLogo = styled.div`
//   display: flex;
//   align-items: center;
// `;

const RowFlat = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB }
  },
  history
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useActiveWeb3React();
  // const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected

  const expertMode = useIsExpertMode();

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>("");

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ""
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field])
      };
    },
    {}
  );

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? "0")
      };
    },
    {}
  );

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    ROUTER_ADDRESS[chainId ? chainId : ""]
  );

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    if (!chainId || !library || !account) return;
    const router = getRouterContract(chainId, library, account);
    console.log("chainId :", chainId);
    console.log("account :", account);

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
    };

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA === DEV || currencyB === DEV) {
      const tokenBIsETH = currencyB === DEV;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? "", // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // DEV min
        account,
        deadlineFromNow
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? "",
        wrappedCurrency(currencyB, chainId)?.address ?? "",
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow
      ];
      value = null;
    }
    console.log("method :", method);
    console.log("args :", args);
    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(response => {
          setAttemptingTxn(false);

          addTransaction(response, {
            txCategory: "liquidity",
            txType: "add",
            summary:
              "Add " +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              " " +
              currencies[Field.CURRENCY_A]?.symbol +
              " and " +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              " " +
              currencies[Field.CURRENCY_B]?.symbol
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: "Liquidity",
            action: "Add",
            label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join("/")
          });
        })
      )
      .catch(error => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" borderRadius="20px">
          <RowFlat>
            <SourcesLogo>
              <CurrencyLogo currency={currencies[Field.CURRENCY_A]} />
              {currencies[Field.CURRENCY_A]?.name}
            </SourcesLogo>
            {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency0.symbol}*/}
            <TxtPlus>+</TxtPlus>
            <SourcesLogo>
              <CurrencyLogo currency={currencies[Field.CURRENCY_B]} />
              {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency1.symbol}*/}
              {currencies[Field.CURRENCY_B]?.name}
            </SourcesLogo>
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn style={{ width: "100%" }}>
        <WrapCurrencyInput>
          <RowFlat>
            <SourcesLogo>
              <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: "8px" }} />
              {currencies[Field.CURRENCY_A]?.name}
            </SourcesLogo>
            {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency0.symbol}*/}
            <TxtPlus>+</TxtPlus>
            <SourcesLogo>
              <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: "8px" }} />
              {/*<img src="../../assets/images/logo/coin-op.png" className="coinLogo" alt="" /> {currency1.symbol}*/}
              {currencies[Field.CURRENCY_B]?.name}
            </SourcesLogo>
          </RowFlat>
          <Num>{liquidityMinted?.toSignificant(6)}</Num>
        </WrapCurrencyInput>
        <TxtDesc13 style={{ margin: "10px 0 20px" }}>
          {t("liquidityInfo", { percent: allowedSlippage / 100 })}
        </TxtDesc13>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    );
  };

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA);
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/${currencyIdB}/${currencyIdA}`);
      } else {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, history, currencyIdA]
  );
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/add/${newCurrencyIdB}`);
        }
      } else {
        history.push(`/add/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, history, currencyIdB]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput("");
    }
    setTxHash("");
  }, [onFieldAInput, txHash]);

  return (
    <>
      <AppBody>
        <BoxHd title={t("titleAddLiquidity")} historyBackTo={"pool"} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={noLiquidity ? t("creatingPool") : t("titleAddLiquidity")}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <CurrencyInputPanel
            value={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={onFieldAInput}
            onMax={() => {
              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? "");
            }}
            onCurrencySelect={handleCurrencyASelect}
            showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
            currency={currencies[Field.CURRENCY_A]}
            id="add-liquidity-input-tokena"
            showCommonBases
          />
          <AreaButton>
            <ButtonSwap className="plus">
              {/* <Plus size="16" color={theme.text2} /> */}
              <span className="blind">Transactions</span>
            </ButtonSwap>
          </AreaButton>
          <CurrencyInputPanel
            value={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={onFieldBInput}
            onCurrencySelect={handleCurrencyBSelect}
            onMax={() => {
              onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? "");
            }}
            showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
            currency={currencies[Field.CURRENCY_B]}
            id="add-liquidity-input-tokenb"
            showCommonBases
          />
          {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
            <>
              <div style={{ marginBottom: "20px" }}>
                {/* <RowBetween padding="1rem">
                  <TYPE.subHeader fontWeight={500} fontSize={14}>
                    {noLiquidity ? 'Initial prices' : 'Prices'} and pool share
                  </TYPE.subHeader>
                </RowBetween> */}

                {/* // arrow 추가시 화살표 추가 */}
                <PoolPriceBar
                  currencies={currencies}
                  poolTokenPercentage={poolTokenPercentage}
                  noLiquidity={noLiquidity}
                  price={price}
                />
              </div>
            </>
          )}
          {noLiquidity && (
            <DescriptionWallet>
              {/* <TYPE.link>You are the first liquidity provider.</TYPE.link>
              <TYPE.link>The ratio of tokens you add will set the price of this pool.</TYPE.link>
              <TYPE.link>Once you are happy with the rate click supply to review.</TYPE.link> */}
              You are the first liquidity provider. The ratio of tokens you add will set the price of this pool. Once
              you are happy with the rate click supply to review.
            </DescriptionWallet>
          )}
          {!account ? (
            <ButtonPrimary onClick={toggleWalletModal}>{t("connectWallet")}</ButtonPrimary>
          ) : (
            <AutoColumn gap={"md"}>
              {(approvalA === ApprovalState.NOT_APPROVED ||
                approvalA === ApprovalState.PENDING ||
                approvalB === ApprovalState.NOT_APPROVED ||
                approvalB === ApprovalState.PENDING) &&
                isValid && (
                  <RowBetween>
                    {approvalA !== ApprovalState.APPROVED && (
                      <ButtonPrimary
                        onClick={approveACallback}
                        disabled={approvalA === ApprovalState.PENDING}
                        width={approvalB !== ApprovalState.APPROVED ? "48%" : "100%"}
                      >
                        {approvalA === ApprovalState.PENDING ? (
                          <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                        ) : (
                          t("approve") + " " + currencies[Field.CURRENCY_A]?.symbol
                        )}
                      </ButtonPrimary>
                    )}
                    {approvalB !== ApprovalState.APPROVED && (
                      <ButtonPrimary
                        onClick={approveBCallback}
                        disabled={approvalB === ApprovalState.PENDING}
                        width={approvalA !== ApprovalState.APPROVED ? "48%" : "100%"}
                      >
                        {approvalB === ApprovalState.PENDING ? (
                          <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                        ) : (
                          t("approve") + " " + currencies[Field.CURRENCY_B]?.symbol
                        )}
                      </ButtonPrimary>
                    )}
                  </RowBetween>
                )}
              <ButtonError
                onClick={() => {
                  expertMode ? onAdd() : setShowConfirm(true);
                }}
                disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
              >
                <Text fontSize={20} fontWeight={500}>
                  {error ?? t("supply")}
                </Text>
              </ButtonError>
            </AutoColumn>
          )}
        </Wrapper>
      </AppBody>
    </>
  );
}
