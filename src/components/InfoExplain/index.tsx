import React from "react";
import styled from "styled-components";
import { BiErrorCircle } from "react-icons/bi";
import { TxtDesc } from "../../pages/styleds";

const TxtDesc13 = styled(TxtDesc)`
  font-size: 13px;
`;
const WrapInfo = styled.div`
  display: block;
  margin-top: 0.5rem;
  &.arrow {
    dl {
      padding-right: 1.6rem;
      &::after {
        content: "\f107";
        position: absolute;
        top: 50%;
        right: 0.3rem;
        transform: translateY(-50%);
        font-family: "Line Awesome Free";
        font-weight: 900;
        font-size: 1rem;
      }
    }
  }
  dl {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0 0.3rem 0 0.2rem;
    border-bottom: 1px solid #e0e0e0;
    line-height: 40px;
  }
  dt {
    display: flex;
    font-weight: 400;
    font-size: 13px;
    color: #777;
    line-height: 40px;
  }
  dd {
    font-weight: 400;
    font-size: 14px;
    span {
      display: inline-block;
      vertical-align: middle;
      font-size: 1.2rem;
    }
  }
`;
const TxtDescRight = styled.p`
  padding: 0.4rem 0.3rem 0 0;
  text-align: right;
  font-weight: 400;
  font-size: 12px;
  color: #8637d5;
`;
const ButtonReference = styled.button`
  width: 20px;
  height: 35px;
  margin-right: 4px;
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  line-height: 46px;
  color: #777;
`;

export default function InfoExplain() {
  return (
    <>
      <WrapInfo className="arrow">
        <ul>
          <li>
            <dl>
              <dt>
                <ButtonReference>
                  <BiErrorCircle />
                </ButtonReference>{" "}
                Rate
              </dt>
              <dd>
                1 GBOA <span>≈</span> 0.01 BOA
              </dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>Free</dt>
              <dd>0.01 BOA</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>Minimum received after slippage</dt>
              <dd>9990.123 BOA </dd>
            </dl>
          </li>
        </ul>
        <TxtDescRight>Slippage Tolerance : 5%</TxtDescRight>
      </WrapInfo>
      <TxtDesc13 style={{ margin: "2.6rem 0.5rem 1.4rem 0.5rem" }}>
        This route optimizes your total output by considering split routes, multiple hops, and the gas cost of each
        step.
      </TxtDesc13>
    </>
  );
}
