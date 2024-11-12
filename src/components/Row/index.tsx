import styled from "styled-components";
import { Box } from "rebass/styled-components";

const Row = styled(Box)<{ align?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: 100%;
  display: flex;
  /* margin: 10px 0 0 10px; */
  padding: 0;
  align-items: ${({ align }) => (align ? align : "center")};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;
export const RowBetween = styled(Row)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ColumnBetween = styled(Row)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
`;

export const RowStart = styled.div`
  display: flex;
  /* flex-direction: column; */
  align-items: flex-start;
`;
export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify && justify};
  width: 100%;
  height: 100%;
  /* background-color: #f8f2ff;
  border: 1px solid #f3e7ff; */
  border-radius: 50%;
  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`;

export const RowFixed = styled(Row)<{ gap?: string; justify?: string }>``;

export default Row;
