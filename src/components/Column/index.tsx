import styled from "styled-components";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`;
export const ColumnRight = styled(Column)`
  align-items: flex-end;
`;

export const AutoColumn = styled.div<{
  gap?: "sm" | "md" | "lg" | string;
  justify?: "stretch" | "center" | "start" | "end" | "flex-start" | "flex-end" | "space-between";
}>`
  position: relative;
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === "sm" && "6px") || (gap === "md" && "6px") || (gap === "lg" && "6px") || gap};
  justify-items: ${({ justify }) => justify && justify};
`;

export default Column;
