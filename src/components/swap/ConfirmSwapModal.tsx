import { ChainId, currencyEquals, TokenAmount, Trade } from "tigger-swap-sdk";
import React, { useCallback, useMemo } from "react";
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionBridgeConfirmationModal,
  TransactionErrorContent
} from "../TransactionConfirmationModal";
import SwapModalFooter, { BridgeModalFooter } from "./SwapModalFooter";
import SwapModalHeader, { BridgeModalHeader } from "./SwapModalHeader";
import { NETWORK_LABELS } from "../Wallet";
import { useTranslation } from "react-i18next";

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash
}: {
  isOpen: boolean;
  trade: Trade | undefined;
  originalTrade: Trade | undefined;
  attemptingTxn: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: number;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
}) {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  );
  const { t } = useTranslation();

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade]);

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null;
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade]);

  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
    trade?.inputAmount?.currency?.symbol
  } for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`;

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={t("confirmSwap")}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage, t]
  );

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  );
}

export function ConfirmBridgeModal({
  trade,
  originalTrade,
  onAcceptChanges,
  estimation,
  txFee,
  swapFee,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash
}: {
  isOpen: boolean;
  trade: Trade | undefined;
  originalTrade: Trade | undefined;
  attemptingTxn: boolean;
  txHash: string | undefined;
  recipient: string | null;
  estimation: string;
  txFee: string;
  swapFee: string;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  );

  const modalHeader = useCallback(() => {
    return trade ? (
      <BridgeModalHeader
        trade={trade}
        estimation={estimation}
        txFee={txFee}
        swapFee={swapFee}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [onAcceptChanges, estimation, swapFee, txFee, recipient, showAcceptChanges, trade]);

  const modalBottom = useCallback(() => {
    return trade ? (
      <BridgeModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        estimation={estimation}
        txFee={txFee}
        swapFee={swapFee}
      />
    ) : null;
  }, [onConfirm, showAcceptChanges, estimation, swapFee, txFee, swapErrorMessage, trade]);

  // text to show while loading
  const inputChainName = trade ? NETWORK_LABELS[(trade.inputAmount as TokenAmount).token.chainId as ChainId][0] : "";
  const outputChainName = trade ? NETWORK_LABELS[(trade.outputAmount as TokenAmount).token.chainId as ChainId][0] : "";
  const fromInfo = `${inputChainName} ${trade?.inputAmount?.toSignificant(6)} ${trade?.inputAmount?.currency?.symbol}`;
  const toInfo = `${outputChainName} ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`;
  const pendingText = t("waitingForBridgeInformation", { fromInfo, toInfo });

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={t("titleConfirmBridge")}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage, t]
  );

  return (
    <TransactionBridgeConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  );
}
