import React, { useCallback, useContext, useEffect } from "react";
import { X } from "react-feather";
import { useSpring } from "react-spring/web";
import styled, { ThemeContext } from "styled-components";
import { animated } from "react-spring";
import { PopupContent } from "../../state/application/actions";
import { useRemovePopup } from "../../state/application/hooks";
import ListUpdatePopup from "./ListUpdatePopup";
import TransactionPopup from "./TransactionPopup";

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;

  :hover {
    cursor: pointer;
  }
`;
export const Popup = styled.div`
  display: inline-block;
  width: 100%;
  padding: 1em;
  background-color: ${({ theme }) => theme.white};
  position: relative;
  border-radius: 10px;
  padding: 20px;
  padding-right: 35px;
  /* overflow: hidden; */
  border: 1px solid #e8dff1;
  /* box-shadow: 12px 12px 28px -10px rgba(62, 31, 92, 0.1); */
  border-radius: 20px;
  .sc-iBkjds {
    color: ${({ theme }) => theme.black};
  }
  .sc-hQRsPl {
    display: block;
  }
  .sc-hgZZql {
    background-color: transparent;
  }
  /* .sc-fjqEFS {
    max-width: 480px;
    width: calc(100% - 2.4rem);
    margin: 0 auto;
  } */
  svg {
    stroke: ${({ theme }) => theme.purple2};
  }
`;
const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.white};
`;

const AnimatedFader = animated(Fader);

export default function PopupItem({
  removeAfterMs,
  content,
  popKey
}: {
  removeAfterMs: number | null;
  content: PopupContent;
  popKey: string;
}) {
  const removePopup = useRemovePopup();
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup]);
  useEffect(() => {
    if (removeAfterMs === null) return undefined;

    const timeout = setTimeout(() => {
      removeThisPopup();
    }, removeAfterMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [removeAfterMs, removeThisPopup]);

  const theme = useContext(ThemeContext);

  let popupContent;
  if ("txn" in content) {
    const {
      txn: { hash, success, summary }
    } = content;
    popupContent = <TransactionPopup hash={hash} success={success} summary={summary} />;
  } else if ("listUpdate" in content) {
    const {
      listUpdate: { listUrl, oldList, newList, auto }
    } = content;
    popupContent = (
      <ListUpdatePopup popKey={popKey} listUrl={listUrl} oldList={oldList} newList={newList} auto={auto} />
    );
  }

  const faderStyle = useSpring({
    from: { width: "100%" },
    to: { width: "0%" },
    config: { duration: removeAfterMs ?? undefined }
  });

  return (
    <Popup>
      <StyledClose color={theme.text2} onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </Popup>
  );
}
