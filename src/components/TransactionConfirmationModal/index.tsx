import { ChainId } from "tigger-swap-sdk";
import React, { useMemo } from "react"; // , { useContext }
import styled, { keyframes } from "styled-components";
import Modal from "../Modal";
import { ExternalLink } from "../../theme";
import { Text } from "rebass";
import { CloseIcon } from "../../theme/components";
import { AutoRow, RowBetween } from "../Row";
// import {
//   AlertTriangle
//   //   ArrowUpCircle
// } from 'react-feather'
import { ButtonPrimary, ButtonError } from "../Button";
import { AutoColumn } from "../Column";
// import Circle from '../../assets/images/blue-loader.svg'
import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from "../../hooks";
import { ModalBd, ModalHd } from "../../pages/styleds";
import ImgIcoWaiting from "../../assets/images/icon/ico-waiting.svg";
import ImgIcoSubmit from "../../assets/images/icon/ico-submit.svg";
import ImgIcoError from "../../assets/images/icon/ico-error.svg";
import { useAllTransactions } from "../../state/transactions/hooks";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
  width: 100%;
`;
const Section = styled(AutoColumn)`
  /* padding: 24px; */
`;

const BottomSection = styled(Section)`
  /* background-color: ${({ theme }) => theme.bg2}; */
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

// const ConfirmedIcon = styled(ColumnCenter)`
//   padding: 60px 0;
// `

// const CustomLightSpinner = styled(Spinner)<{ size: string }>`
//   height: ${({ size }) => size};
//   width: ${({ size }) => size};
// `
const Turn = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(365deg);
  }
`;
const IcoComm = styled.i`
  display: block;
  width: 100px;
  height: 100px;
  margin: 50px auto 70px;
  border: none;
  background: url(${ImgIcoSubmit}) no-repeat 0 0 / contain;
  outline: none;
`;
const IcoWaiting = styled(IcoComm)`
  background: url(${ImgIcoWaiting}) no-repeat 0 0 / contain;
  animation: ${Turn} 3s linear infinite both;
`;
const IcoSubmit = styled(IcoComm)`
  background: url(${ImgIcoSubmit}) no-repeat 0 0 / contain;
`;
const IcoError = styled(IcoComm)`
  margin-bottom: 30px;
  background: url(${ImgIcoError}) no-repeat 0 0 / contain;
`;
const TxtLDefault = styled.strong`
  display: block;
  font-weight: 400;
  font-size: 25px;
  text-align: center;
  color: ${({ theme }) => theme.purple1};
`;
const TxtMDefaultRed = styled(TxtLDefault)`
  margin-bottom: 50px;
  color: ${({ theme }) => theme.pinkPoint1};
`;
const TxtMDefault = styled.p`
  margin-top: 15px;
  font-weight: 500;
  font-size: 15px;
  text-align: center;
  color: ${props => props.color || "#777"};
`;
const TxtSBot = styled.small`
  margin: 40px 0 10px;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.pinkPoint1};
`;
const TxtSLink = styled.a`
  display: inline-block;
  margin-top: 30px;
  font-weight: 400;
  font-size: 13px;
  text-align: center;
  letter-spacing: 0.03em;
  color: #8637d5;
  text-decoration: underline;
`;

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <ModalBd>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>

        <IcoWaiting />
        {/* <ConfirmedIcon>
          <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
        </ConfirmedIcon> */}
        <TxtLDefault>{t("waitingForConfirmation")}</TxtLDefault>
        <TxtMDefault>{pendingText}</TxtMDefault>
        {/* <AutoColumn gap="12px" justify={'center'}>
          </AutoColumn> */}
        <TxtSBot>{t("waitingForConfirmationInfo")}</TxtSBot>
      </ModalBd>
    </Wrapper>
  );
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
}) {
  // const theme = useContext(ThemeContext)
  const { t } = useTranslation();

  return (
    <Wrapper>
      {/* <Section> */}
      <ModalBd>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>

        <IcoSubmit />
        {/* <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
          </ConfirmedIcon> */}
        <TxtLDefault>{t("transactionSubmitted")}</TxtLDefault>

        {/*<TxtMDefault>Add BOA Token of BOA BizNet to Metamask</TxtMDefault>*/}
        {chainId && hash && (
          <ExternalLink href={getEtherscanLink(chainId, hash, "transaction")}>
            <TxtSLink>{t("goBlockExplorer")}</TxtSLink>
          </ExternalLink>
        )}
        <ButtonPrimary onClick={onDismiss} style={{ margin: "20px 0 0 0" }}>
          <Text fontWeight={500} fontSize={20}>
            {t("close")}
          </Text>
        </ButtonPrimary>
      </ModalBd>
      {/* </Section> */}
    </Wrapper>
  );
}

function TransactionBridgeSubmittedContent({
  onDismiss,
  chainId,
  hash
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
}) {
  //
  // export enum BridgeServerCallState {
  //   DISMISSED,0
  //   OPENDED,1
  //   DEPOSITED,2
  //   SENT_DEPOSIT,3
  //   CHECKED_WITHDRAW,4
  //   SENT_SECRET,5
  //   EXPIRED,6
  //   ERROR,7
  //   COMPLETED, 8
  // }
  //

  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    return Object.values(allTransactions);
  }, [allTransactions]);
  const { t } = useTranslation();
  const rightTx = sortedRecentTransactions.filter(tx => tx.hash === hash);
  const tx = rightTx.length > 0 ? rightTx[0] : null;

  return (
    <Wrapper>
      {/* <Section> */}
      <ModalBd>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>

        <IcoSubmit />
        <TxtLDefault>{t("transactionSubmitted")}</TxtLDefault>

        <TxtMDefault>
          {tx && tx.bridgeStatus && tx.bridgeStatus < 6
            ? tx.bridgeStatus === 7
              ? t("transactionConfirmationInfo1")
              : t("transactionConfirmationInfo2")
            : t("transactionConfirmationInfo3")}
        </TxtMDefault>
        {chainId && hash && (
          <ExternalLink href={getEtherscanLink(chainId, hash, "transaction")}>
            <div>
              <TxtSLink>{t("goBlockExplorer")}</TxtSLink>
            </div>
          </ExternalLink>
        )}
        {tx && tx.bridgeStatus && tx.bridgeStatus < 6 ? (
          <ButtonPrimary style={{ margin: "20px 0 0 0" }}>
            <AutoRow gap="6px" justify="center">
              {t("running")} <Loader stroke="white" />
            </AutoRow>
          </ButtonPrimary>
        ) : tx && tx.bridgeStatus && tx.bridgeStatus === 7 ? (
          <ButtonError style={{ margin: "20px 0 0 0" }}>
            <Text fontWeight={500} fontSize={20}>
              {t("error")}
            </Text>
          </ButtonError>
        ) : (
          <ButtonPrimary onClick={onDismiss} style={{ margin: "20px 0 0 0" }}>
            <Text fontWeight={500} fontSize={20}>
              {t("close")}
            </Text>
          </ButtonPrimary>
        )}
      </ModalBd>
      {/* </Section> */}
    </Wrapper>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string;
  onDismiss: () => void;
  topContent: () => React.ReactNode;
  bottomContent: () => React.ReactNode;
}) {
  return (
    <Wrapper>
      <ModalHd>
        <h2>{title}</h2>
        <CloseIcon onClick={onDismiss} />
      </ModalHd>
      <ModalBd>
        {topContent()}
        {bottomContent()}
      </ModalBd>
      {/* <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section> */}
      {/* <BottomSection gap="12px">{bottomContent()}</BottomSection> */}
    </Wrapper>
  );
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  // const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <ModalHd>
        <h2>Error</h2>
        <CloseIcon onClick={onDismiss} />
      </ModalHd>
      <ModalBd>
        <IcoError />
        <TxtMDefaultRed>{message}</TxtMDefaultRed>
      </ModalBd>
      {/* <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text fontWeight={500} fontSize={16} color={theme.red1} style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section> */}
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => React.ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </Modal>
  );
}

export function TransactionBridgeConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionBridgeSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </Modal>
  );
}
