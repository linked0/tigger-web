import React from "react";
import styled from "styled-components";
import { animated, useTransition, useSpring } from "react-spring";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { isMobile } from "react-device-detect";
import "@reach/dialog/styles.css";
import { transparentize } from "polished";
import { useGesture } from "react-use-gesture";

const AnimatedDialogOverlay = animated(DialogOverlay);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.modalBG};
  }
`;

const AnimatedDialogContent = animated(DialogContent);
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  "aria-label": "dialog"
})`
  &[data-reach-dialog-content] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
    overflow: hidden;
    width: calc(100% - 32px);
    max-width: 480px;
    min-width: 320px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid ${({ theme }) => theme.purpleBoxline2};
    background-color: ${({ theme }) => theme.white};
    box-shadow: 12px 12px 28px -10px ${({ theme }) => transparentize(0.95, theme.shadow1)};

    align-self: ${({ mobile }) => (mobile ? "flex-end" : "center")};
    display: flex;
    border-radius: 20px;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number | false;
  maxHeight?: number;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 50,
  initialFocusRef,
  children
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }));
  const bind = useGesture({
    onDrag: state => {
      set({
        y: state.down ? state.movement[1] : 0
      });
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onDismiss();
      }
    }
  });

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay key={key} style={props} onDismiss={onDismiss} initialFocusRef={initialFocusRef}>
              <StyledDialogContent
                {...(isMobile
                  ? {
                      ...bind(),
                      style: { transform: y.interpolate(y => `translateY(${y > 0 ? y : 0}px)`) }
                    }
                  : {})}
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                mobile={isMobile}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  );
}
