import React from "react";
import styled from "styled-components";

function Pagination({
  total,
  limit,
  page,
  setPage
}: {
  total: number;
  limit: number;
  page: number;
  setPage: (value: number) => void;
}) {
  const numPages = Math.ceil(total / limit);

  // @ts-ignore
  return (
    <>
      {numPages === 0 ? (
        <Nav>
          <Button aria-current="page">1</Button>
        </Nav>
      ) : (
        <Nav>
          <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
            &lt;
          </Button>
          {Array(numPages)
            .fill(undefined)
            .map((_, i) => (
              <Button key={i + 1} onClick={() => setPage(i + 1)} aria-current={page === i + 1 ? "page" : undefined}>
                {i + 1}
              </Button>
            ))}
          <Button onClick={() => setPage(page + 1)} disabled={page === numPages || numPages === 0}>
            &gt;
          </Button>
        </Nav>
      )}
    </>
  );
}

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin: 16px;
`;

const Button = styled.button`
  border: none;
  display: flex;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
  width: 20px;
  height: 20px;
  margin: 0;
  background: transparent;
  color: ${({ theme }) => theme.grayTxt};
  font-size: 12px;

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.grayDark};
  }

  &[disabled] {
    display: none;
  }

  &[aria-current] {
    font-weight: bold;
    cursor: revert;
    transform: revert;
    color: ${({ theme }) => theme.pinkPoint1};
  }
`;

export default Pagination;
