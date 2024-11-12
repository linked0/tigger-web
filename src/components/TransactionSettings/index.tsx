import React, { useState, useRef, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { useTranslation } from "react-i18next";

import QuestionHelper from "../QuestionHelper";
import { TYPE } from "../../theme";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";

// import { darken } from "polished";

enum SlippageError {
  InvalidInput = "InvalidInput",
  RiskyLow = "RiskyLow",
  RiskyHigh = "RiskyHigh"
}

enum DeadlineError {
  InvalidInput = "InvalidInput"
}

const FancyButton = styled.button`
  color: ${({ theme }) => theme.purple1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 15px;
  width: auto;
  min-width: 60px;
  border: 1px solid #f0e1ff;
  outline: none;
  background: ${({ theme }) => theme.purpleBg};
  * {
    color: ${({ theme }) => theme.purple1};
  }
  :hover,
  :focus {
    border: 1px solid ${({ theme }) => theme.purple2};
    background: ${({ theme }) => theme.purple2};
    color: #fff;
    * {
      color: #fff;
    }
    input {
      color: #fff;
    }
  }
`;

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
    color: ${({ theme }) => theme.white};
  }
  background-color: ${({ active, theme }) => active && theme.purple2};
  color: ${({ active, theme }) => (active ? theme.white : theme.purple1)};
`;

const Input = styled.input`
  display: inline-block;
  vertical-align: middle;
  background: ${({ theme }) => theme.bg1};
  font-size: 14px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === "red" ? theme.red1 : theme.purple1)};
  text-align: right;
  ::placeholder {
    color: ${({ theme }) => theme.purple1};
  }
`;

const OptionCustom = styled.div<{ active?: boolean; warning?: boolean }>`
  display: flex;
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : theme.primary1}`};
  color: ${({ theme }) => theme.purple1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 15px;
  width: auto;
  min-width: 60px;
  border: 1px solid #f0e1ff;
  outline: none;
  background: ${({ theme }) => theme.purpleBg};
  :hover {
    border-color: ${({ theme }) => theme.purpleDisabledColor};
  }
  input {
    display: inline-block;
    width: 100%;
    /* height: 100%; */
    margin-right: 3px;
    border: 0px;
    border-radius: 2rem;
    background-color: transparent;
    color: ${({ theme }) => theme.purple1};
    font-size: 15px;
    vertical-align: middle;
    ::placeholder {
      color: ${({ theme }) => theme.purple3};
    }
  }
`;

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`;

export interface SlippageTabsProps {
  rawSlippage: number;
  setRawSlippage: (rawSlippage: number) => void;
  deadline: number;
  setDeadline: (deadline: number) => void;
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>();

  const [slippageInput, setSlippageInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");

  const slippageInputIsValid =
    slippageInput === "" || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2);
  const deadlineInputIsValid = deadlineInput === "" || (deadline / 60).toString() === deadlineInput;

  let slippageError: SlippageError | undefined;
  if (slippageInput !== "" && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput;
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow;
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh;
  } else {
    slippageError = undefined;
  }

  let deadlineError: DeadlineError | undefined;
  if (deadlineInput !== "" && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput;
  } else {
    deadlineError = undefined;
  }

  function parseCustomSlippage(value: string) {
    setSlippageInput(value);

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setRawSlippage(valueAsIntFromRoundedFloat);
      }
    } catch {}
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value);

    try {
      const valueAsInt: number = Number.parseInt(value) * 60;
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt);
      }
    } catch {}
  }

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed style={{ marginBottom: "5px" }}>
          <QuestionHelper text={t("slippageHelper")} />
          <TYPE.black fontWeight={400} fontSize={15} color={theme.grayDark}>
            {t("slippageTolerance")}
          </TYPE.black>
        </RowFixed>
        <RowBetween style={{ padding: "0 5px" }}>
          <Option
            onClick={() => {
              setSlippageInput("");
              setRawSlippage(10);
            }}
            active={rawSlippage === 10}
          >
            0.1%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput("");
              setRawSlippage(50);
            }}
            active={rawSlippage === 50}
          >
            0.5%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput("");
              setRawSlippage(100);
            }}
            active={rawSlippage === 100}
          >
            1%
          </Option>
          <OptionCustom active={![10, 50, 100].includes(rawSlippage)} warning={!slippageInputIsValid} tabIndex={-1}>
            {!!slippageInput &&
            (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
              <SlippageEmojiContainer>
                <span role="img" aria-label="warning">
                  ⚠️
                </span>
              </SlippageEmojiContainer>
            ) : null}
            {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
            <Input
              ref={inputRef as any}
              placeholder={(rawSlippage / 100).toFixed(2)}
              value={slippageInput}
              onBlur={() => {
                parseCustomSlippage((rawSlippage / 100).toFixed(2));
              }}
              onChange={e => parseCustomSlippage(e.target.value)}
              color={!slippageInputIsValid ? "red" : ""}
            />
            %
          </OptionCustom>
        </RowBetween>
        {!!slippageError && (
          <RowBetween
            style={{
              fontSize: "14px",
              paddingTop: "7px",
              color: slippageError === SlippageError.InvalidInput ? "red" : "#F3841E"
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? t("enterValidSlippagePercentage")
              : slippageError === SlippageError.RiskyLow
              ? t("yourTransactionMayFail")
              : t("yourTransactionMayBeFrontRun")}
          </RowBetween>
        )}
      </AutoColumn>

      <AutoColumn style={{ marginTop: "20px" }}>
        <RowFixed style={{ marginBottom: "5px" }}>
          <QuestionHelper text={t("transactionDeadLineHelper")} />
          <TYPE.black fontSize={15} fontWeight={400} color={theme.grayDark}>
            {t("transactionDeadline")}
          </TYPE.black>
        </RowFixed>
        <RowFixed style={{ padding: "0 5px" }}>
          <OptionCustom style={{ width: "80px" }} tabIndex={-1}>
            <Input
              color={!!deadlineError ? "red" : undefined}
              onBlur={() => {
                parseCustomDeadline((deadline / 60).toString());
              }}
              placeholder={(deadline / 60).toString()}
              value={deadlineInput}
              onChange={e => parseCustomDeadline(e.target.value)}
            />
          </OptionCustom>
          <TYPE.body style={{ paddingLeft: "8px" }} fontSize={14}>
            {t("minutes")}
          </TYPE.body>
        </RowFixed>
      </AutoColumn>
    </AutoColumn>
  );
}
