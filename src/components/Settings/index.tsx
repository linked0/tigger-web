import React, { useRef, useState } from "react";
import { Settings, X } from "react-feather";
import styled from "styled-components";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { useUserSlippageTolerance, useExpertModeManager, useUserDeadline } from "../../state/user/hooks";
//useDarkModeManager
import TransactionSettings from "../TransactionSettings";
import { RowBetween } from "../Row";
import { AutoColumn } from "../Column";
import { ButtonError } from "../Button";
// import { ButtonWhiteCircle } from '../Button'
import { useSettingsMenuOpen, useToggleSettingsMenu } from "../../state/application/hooks";
import { Text } from "rebass";
import Modal from "../Modal";
import { useTranslation } from "react-i18next";

const StyledMenuIcon = styled(Settings)`
  height: 23px;
  width: 23px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`;

const StyledCloseIcon = styled(X)`
  height: 23px;
  width: 23px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`;

const StyledMenuButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 30px;
  height: 30px;
  border: none;
  background-color: ${({ theme }) => theme.white};
  svg > * {
    stroke: ${({ theme }) => theme.purple3};
  }
  :hover,
  :focus {
    cursor: pointer;
    svg > * {
      stroke: ${({ theme }) => theme.purple2};
    }
  }
`;
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`;

const StyledMenu = styled.div`
  margin-left: 0.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

const MenuFlyout = styled.span`
  min-width: 22.125rem;
  background-color: ${({ theme }) => theme.white};
  box-shadow: 12px 12px 28px -10px rgba(62, 31, 92, 0.1);
  border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.3rem;
  right: 0rem;
  z-index: 100;

  /* ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 18.125rem;
    right: -46px;
  `}; */
`;

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`;

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.purpleBg};
  border-radius: 40px;
  border: 1px solid #f0e1ff;
`;
const HdTitle = styled.div`
  padding-bottom: 5px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.grayDark};
  border-bottom: 1px solid ${({ theme }) => theme.gray1};
`;

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>();
  const open = useSettingsMenuOpen();
  const toggle = useToggleSettingsMenu();
  const { t } = useTranslation();

  // const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();

  const [deadline, setDeadline] = useUserDeadline();

  const [expertMode, toggleExpertMode] = useExpertModeManager();

  //const [darkMode, toggleDarkMode] = useDarkModeManager()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false);

  useOnClickOutside(node, open ? toggle : undefined);

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="lg">
            <RowBetween style={{ padding: "0 2rem" }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                {t("areYouSure")}
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: "0 2rem" }}>
              <Text fontWeight={500} fontSize={20}>
                {t("expertModeTips1")}
              </Text>
              <Text fontWeight={600} fontSize={20}>
                {t("expertModeTips2")}
              </Text>
              <ButtonError
                error={true}
                padding={"12px"}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === "confirm") {
                    toggleExpertMode();
                    setShowConfirmation(false);
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                  {t("turnOnExpertMode")}
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon />
        {expertMode && (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        )}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: "1rem" }}>
            <HdTitle>{t("transactionSettings")}</HdTitle>
            <Text fontWeight={500} fontSize={18}></Text>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={deadline}
              setDeadline={setDeadline}
            />
            {/*<Text fontWeight={600} fontSize={14}>*/}
            {/*  {t('interfaceSettings')}*/}
            {/*</Text>*/}
            {/*<RowBetween>*/}
            {/*  <RowFixed>*/}
            {/*    <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>*/}
            {/*      {t('toggleExpertMode')}*/}
            {/*    </TYPE.black>*/}
            {/*    <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />*/}
            {/*  </RowFixed>*/}
            {/*  <Toggle*/}
            {/*    id="toggle-expert-mode-button"*/}
            {/*    isActive={expertMode}*/}
            {/*    toggle={*/}
            {/*      expertMode*/}
            {/*        ? () => {*/}
            {/*            toggleExpertMode()*/}
            {/*            setShowConfirmation(false)*/}
            {/*          }*/}
            {/*        : () => {*/}
            {/*            toggle()*/}
            {/*            setShowConfirmation(true)*/}
            {/*          }*/}
            {/*    }*/}
            {/*  />*/}
            {/*</RowBetween>*/}
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}

/*
<RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  {t('toggleDarkMode')}
                </TYPE.black>
              </RowFixed>
              <Toggle isActive={darkMode} toggle={toggleDarkMode} />
            </RowBetween>
  */
