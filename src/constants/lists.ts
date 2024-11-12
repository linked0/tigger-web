// the DCTDEX Default token list lives here

const STAGE = process.env.REACT_APP_STAGE;
export const DEFAULT_TOKEN_LIST_URL =
  STAGE === "PROD"
    ? "https://raw.githubusercontent.com/bosagora/token-list/v0.x.x/src/tokens/tokens.json"
    : "https://raw.githubusercontent.com/bosagora/token-list/v0.x.x/src/tokens/tokens_test.json";

export const DEFAULT_LIST_OF_LISTS: string[] = [
  DEFAULT_TOKEN_LIST_URL

  // 't2crtokens.eth', // kleros
  //'tokens.1inch.eth', // 1inch
  // 'synths.snx.eth',
  // 'tokenlist.dharma.eth',
  // 'defi.cmc.eth',
  // 'erc20.cmc.eth',
  // 'stablecoin.cmc.eth',
  // 'tokenlist.zerion.eth',
  // 'tokenlist.aave.eth',
  //'https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json',
  // 'https://app.tryroll.com/tokens.json',
  //'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  // 'https://defiprime.com/defiprime.tokenlist.json',
  // 'https://umaproject.org/uma.tokenlist.json'
];
