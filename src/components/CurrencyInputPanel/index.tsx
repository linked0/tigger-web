import { ChainId, Currency, Pair } from "bizboa-swap-sdk";
import React, { useCallback, useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { darken } from "polished";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import CurrencySearchModal from "../SearchModal/CurrencySearchModal";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { RowBetween } from "../Row";
import { TYPE } from "../../theme";
import Wallet from "../../components/Wallet";
import { Input as NumericalInput } from "../NumericalInput";
import { ReactComponent as DropDown } from "../../assets/images/dropdown.svg";
import { useActiveWeb3React } from "../../hooks";
import { useTranslation } from "react-i18next";
import {
  FromTo,
  MarkSquare,
  MarkSquareLeft,
  NumBig,
  SourcesLogo,
  TxtDesc15,
  WalletBd,
  WalletHd,
  WrapCurrencyInput,
  WrapCurrencyInputBridge
} from "../../pages/styleds";

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
`;

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 34px;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBtline};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.purple1)};
  border-radius: 34px;
  outline: none;
  cursor: pointer;
  user-select: none;
  padding: 0 0.5rem 0 0.3rem;
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.purpleBg : darken(0.05, theme.purpleBg))};
    border: 1px solid ${({ theme }) => theme.purple2};
    box-shadow: ${({ selected }) => (selected ? "none" : "1px 2px 2px rgba(98, 57, 150, 0.3)")};
  }
  .sc-gSAPjG {
    width: 22px;
    height: 22px;
  }
`;

// const LabelRow = styled.div`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: center;
//   color: ${({ theme }) => theme.text1};
//   font-size: 0.75rem;
//   line-height: 1rem;
//   /* padding: 0.75rem 1rem 0 1rem; */
//   span:hover {
//     cursor: pointer;
//     color: ${({ theme }) => darken(0.2, theme.text2)};
//   }
// `

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.1rem 0 0.1rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.purple1 : theme.purple1)};
    stroke-width: 1.5px;
  }
`;

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  /* position: relative;
  z-index: 1; */
  width: 100%;
`;
const StyledTokenName = styled.span<{ active?: boolean }>`
  white-space: nowrap;
  margin: 0 5px;
  color: ${({ theme }) => theme.purple1};
  font-weight: 500;
  font-size: 16px;
`;
const TxtDesc = styled.p`
  color: ${({ theme }) => theme.grayTxt};
  font-size: 13px;
`;

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  id: string;
  showCommonBases?: boolean;
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = "Input",
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);

  const theme = useContext(ThemeContext);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <WrapCurrencyInput>
      <InputPanel id={id}>
        <WalletHd>
          {!hideInput && (
            <RowBetween>
              <TxtDesc15>
                {account && currency && showMaxButton && label !== "To" && (
                  <MarkSquareLeft onClick={onMax}>{t("max")}</MarkSquareLeft>
                )}

                {account && (
                  <TYPE.body
                    onClick={onMax}
                    color={theme.purple3}
                    fontWeight={400}
                    fontSize={15}
                    style={{ display: "inline", cursor: "pointer" }}
                  >
                    {!hideBalance && !!currency && selectedCurrencyBalance
                      ? t("balance", { balanceInput: selectedCurrencyBalance?.toSignificant(6) })
                      : " -"}
                  </TYPE.body>
                )}
              </TxtDesc15>

              <FromTo>
                {/* <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                  {label}
                </TYPE.body> */}
                <CurrencySelect
                  style={{ marginLeft: "5px" }}
                  selected={!!currency}
                  className="open-currency-select-button"
                  onClick={() => {
                    if (!disableCurrencySelect) {
                      setModalOpen(true);
                    }
                  }}
                >
                  <Aligner>
                    {pair ? (
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin={true} />
                    ) : currency ? (
                      <CurrencyLogo currency={currency} size={"20px"} />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                            "..." +
                            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || t("selectToken")}
                      </StyledTokenName>
                    )}
                    {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                  </Aligner>
                </CurrencySelect>
              </FromTo>
            </RowBetween>
          )}
        </WalletHd>
        <WalletBd>
          <InputRow style={hideInput ? { padding: "0", borderRadius: "8px" } : {}} selected={disableCurrencySelect}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={val => {
                    onUserInput(val);
                  }}
                />
              </>
            )}
          </InputRow>
          {!disableCurrencySelect && onCurrencySelect && (
            <CurrencySearchModal
              isOpen={modalOpen}
              onDismiss={handleDismissSearch}
              onCurrencySelect={onCurrencySelect}
              selectedCurrency={currency}
              otherSelectedCurrency={otherCurrency}
              showCommonBases={showCommonBases}
            />
          )}
          {/*<SubNum>$29,000,000,000</SubNum>*/}
        </WalletBd>
      </InputPanel>
    </WrapCurrencyInput>
  );
}

export function CurrencyInputSelect({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = "Input",
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <WrapCurrencyInputBridge>
      {!hideInput && (
        <FromTo>
          {/* <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                  {label}
                </TYPE.body> */}
          <CurrencySelect
            style={{ marginLeft: "5px" }}
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true);
              }
            }}
          >
            <Aligner>
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin={true} />
              ) : currency ? (
                <CurrencyLogo currency={currency} size={"20px"} />
              ) : null}
              {pair ? (
                <StyledTokenName className="pair-name-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      "..." +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || t("selectToken")}
                </StyledTokenName>
              )}
              {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
        </FromTo>
      )}
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </WrapCurrencyInputBridge>
  );
}

interface CurrencyInputPanelPropsForBridge {
  selectedChainId?: ChainId;
  value: string;
  onUserInput: (value: string) => void;
  estimation?: string;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (chainId: string) => void;
  currency?: Currency | undefined;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  id: string;
  showCommonBases?: boolean;
}

export function CurrencyInputPanelForBridge({
  selectedChainId,
  value,
  onUserInput,
  estimation,
  onMax,
  showMaxButton,
  label = "Input",
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id
}: CurrencyInputPanelPropsForBridge) {
  const { account, chainId } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);
  const { t } = useTranslation();
  const isInput = selectedChainId === chainId;
  return (
    <WrapCurrencyInput>
      <InputPanel id={id}>
        <WalletHd>
          <SourcesLogo>
            <CurrencyLogo currency={currency} size={"22px"} style={{ marginRight: "5px" }} />
            {currency?.symbol}
            {/*<img src={ImgBiznet} className="coinLogo" alt="" /> {currency?.symbol}*/}
          </SourcesLogo>
          <FromTo>
            {id === "bridge-amount-input" ? t("swapFrom") : t("swapTo")}
            <Wallet selectedChainId={selectedChainId} onChangeBridge={onCurrencySelect} />
          </FromTo>
        </WalletHd>
        <WalletBd>
          <RowBetween>
            <TxtDesc>{label}</TxtDesc>
            {isInput ? (
              <TxtDesc15>
                {!hideBalance && !!currency && selectedCurrencyBalance
                  ? t("balance", { balanceInput: selectedCurrencyBalance?.toSignificant(6) })
                  : " -"}
                {account && currency && showMaxButton && label !== "To" && (
                  <MarkSquare onClick={onMax} style={{ marginLeft: "10px" }}>
                    {t("max")}
                  </MarkSquare>
                )}
              </TxtDesc15>
            ) : null}
          </RowBetween>
          {isInput ? (
            <InputRow style={hideInput ? { padding: "0", borderRadius: "8px" } : {}} selected={disableCurrencySelect}>
              {!hideInput && (
                <>
                  {!currency ? (
                    <NumericalInput
                      className={(!isInput ? "disable " : "") + "token-amount-input"}
                      value={value}
                      onUserInput={val => {
                        onUserInput(val);
                      }}
                      disabled
                    />
                  ) : (
                    <NumericalInput
                      className={(!isInput ? "disable " : "") + "token-amount-input"}
                      value={value}
                      onUserInput={val => {
                        onUserInput(val);
                      }}
                    />
                  )}
                </>
              )}
            </InputRow>
          ) : (
            <NumBig style={{ marginTop: "0.5rem" }}>{estimation ? estimation : ""}</NumBig>
          )}
        </WalletBd>
      </InputPanel>
    </WrapCurrencyInput>
  );
}
