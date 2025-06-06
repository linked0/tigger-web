import React, { useCallback } from "react";
import styled from "styled-components";

const StyledRangeInput = styled.input<{ size: number }>`
  /* -webkit-appearance: none; */ /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: ${({ theme }) => theme.purpleTxt}; /* Otherwise white in Chrome */
  cursor: pointer;
  margin: 0;
  height: 1px;
  border-top: 1px solid red;

  &:focus {
    outline: none;
  }

  &::-moz-focus-outer {
    border: 0;
  }

  &::-webkit-slider-thumb {
    /* -webkit-appearance: none; */
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #5a69;
    border-radius: 100%;
    border: none;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.bg1};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-moz-range-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #a69;
    border-radius: 100%;
    border: none;
    color: ${({ theme }) => theme.bg1};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-ms-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    background-color: #8e76ab;
    border-radius: 100%;
    color: ${({ theme }) => theme.purple3};

    &:hover,
    &:focus {
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.06),
        0px 24px 32px rgba(0, 0, 0, 0.04);
    }
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(90deg, ${({ theme }) => theme.bg5}, ${({ theme }) => theme.bg3});
    height: 2px;
  }

  &::-moz-range-track {
    background: linear-gradient(90deg, ${({ theme }) => theme.bg5}, ${({ theme }) => theme.bg3});
    height: 2px;
  }

  &::-ms-track {
    width: 100%;
    border-color: transparent;
    color: transparent;

    background: ${({ theme }) => theme.bg5};
    height: 2px;
  }
  &::-ms-fill-lower {
    background: ${({ theme }) => theme.bg5};
  }
  &::-ms-fill-upper {
    background: ${({ theme }) => theme.bg3};
  }
`;

interface InputSliderProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: number;
}

export default function Slider({ value, onChange, min = 0, step = 1, max = 100, size = 22 }: InputSliderProps) {
  const changeCallback = useCallback(
    e => {
      onChange(parseInt(e.target.value));
    },
    [onChange]
  );

  return (
    <StyledRangeInput
      size={size}
      type="range"
      value={value}
      onChange={changeCallback}
      aria-labelledby="input slider"
      step={step}
      min={min}
      max={max}
    />
  );
}
