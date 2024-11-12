import styled from "styled-components";

const Col = styled.div`
  display: flex;
`;
export const ColCenter = styled(Col)`
  width: 100%;
  align-items: center;
`;
export const ColumnRight = styled(Col)`
  align-items: flex-end;
`;

export const AutoCol = styled.div<{
  gap?: "sm" | "md" | "lg" | string;
  justify?: "stretch" | "center" | "start" | "end" | "flex-start" | "flex-end" | "space-between";
}>`
  position: relative;
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === "sm" && "6px") || (gap === "md" && "6px") || (gap === "lg" && "6px") || gap};
  justify-items: ${({ justify }) => justify && justify};
  .sc-gVAlfg {
    background-color: transparent;
    .sc-hKdnnL {
      /* min-height: 150px; */
      border: 1px solid ${({ theme }) => theme.purpleTxt};
      background-color: ${({ theme }) => theme.purpleBg};
      border-radius: 5px;
    }
  }
  .sc-eKszNL {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background-color: ${({ theme }) => theme.white};
    .sc-hAZoDl {
      border: 1px solid #f3e7ff;
      /* background-color: ${({ theme }) => theme.purpleBg}; */
      background-color: red;
    }
  }
`;

export default Col;
