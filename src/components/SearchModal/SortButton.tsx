import React from "react";
import { Text } from "rebass";
import styled from "styled-components";
import { RowFixed } from "../Row";

export const FilterWrapper = styled(RowFixed)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  user-select: none;
  & > * {
    user-select: none;
    display: none;
  }
  :hover {
    cursor: pointer;
  }
`;

export default function SortButton({
  toggleSortOrder,
  ascending
}: {
  toggleSortOrder: () => void;
  ascending: boolean;
}) {
  return (
    <FilterWrapper onClick={toggleSortOrder}>
      <Text fontSize={14} fontWeight={500}>
        {ascending ? "↑" : "↓"}
      </Text>
    </FilterWrapper>
  );
}
