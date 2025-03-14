import { MaxUint256 } from "@ethersproject/constants";
import { TransactionResponse } from "@ethersproject/providers";
import { Trade, TokenAmount, CurrencyAmount, DEV } from "tigger-swap-sdk";
import { useCallback, useMemo } from "react";
import { ROUTER_ADDRESS } from "../constants";
import { useTokenAllowance } from "../data/Allowances";
import { Field } from "../state/swap/actions";
import { useTransactionAdder, useHasPendingApproval } from "../state/transactions/hooks";
import { computeSlippageAdjustedAmounts } from "../utils/prices";
import { calculateGasMargin } from "../utils";
import { useTokenContract } from "./useContract";
import { useActiveWeb3React } from "./index";

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
  useExact: boolean = false,
  txCategory: string = "swap"
): [ApprovalState, () => Promise<void>] {
  const { account, chainId } = useActiveWeb3React();
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender);
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === DEV) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error("approve was called unnecessarily");
      return;
    }
    if (!token) {
      console.error("no token");
      return;
    }

    if (!tokenContract) {
      console.error("tokenContract is null");
      return;
    }

    if (!amountToApprove) {
      console.error("missing amount to approve");
      return;
    }

    if (!spender) {
      console.error("no spender");
      return;
    }

    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts

      return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString());
    });
    console.log("amountToApprove.raw.toString() :", amountToApprove.raw.toString());
    return tokenContract
      .approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas)
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: "Approved " + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
          txCategory,
          txType: "approve",
          inputCurrency: {
            symbol: amountToApprove.currency.symbol,
            name: amountToApprove.currency.name,
            amount: "",
            address: token.address,
            chainId: chainId
          }
        });
      })
      .catch((error: Error) => {
        console.debug("Failed to approve token", error);
        throw error;
      });
  }, [approvalState, token, tokenContract, amountToApprove, spender, useExact, addTransaction, txCategory, chainId]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const { chainId } = useActiveWeb3React();
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  );
  return useApproveCallback(amountToApprove, ROUTER_ADDRESS[chainId ? chainId : ""]);
}
