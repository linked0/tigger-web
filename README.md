# Tigger Web Project

## Build & Run

Install packages:

```
yarn install
```

현재는 상시적 업그레이드로 인하여 최신버전을 사용하고 있으나,
추후에 특정 버전을 명시해야 합니다. 
```
yarn upgrade tigger-swap-sdk
```

Run: 테스트시 Admin 키(ADMIN_KEY)와 주소를 이용
```
yarn start:dev
```

When `ERR_OSSL_EVP_UNSUPPORTED` error occurs, set the following environment variable.
```
export NODE_OPTIONS=--openssl-legacy-provider
```

## Set network information
**🪀새로운 체인을 추가했을때, 수정해야하는 부분**

#### 1. `src/connectors/index.ts`
지원가능한 ChainId를 추가
```
export const injected = new InjectedConnector({
  supportedChainIds: [1, 2, 12301, 12309, 7212309, 2, 2151, 31337, 7212301, 7212302, 7212303]
});
```
If chain IDs don't exist in the contant `injected` in `tigger-web/src/connector.index.ts`, connections are failed.

The details are described in the document, [Tigger-Summary](https://docs.google.com/document/d/11M0V9ECldZ7PioU8JPOY9Xr28cOVF0kHaGqozHmylj0/edit?tab=t.0).

#### 2. `src/components/Wallet/index.tsx`
새로 추가되는 체인 정보
```
[ChainId.MARIGOLD_LOCALNET]: [
    "Marigold Localnet",
    "ico-eth",
    STAGE === "LOCAL" ? "visible" : STAGE === "PROD" ? "invisible" : "visible",
    "12309",
    "Ethereum ETH",
    "ETH",
    "18",
    "http://localhost:8885",
    "https://sepolia.etherscan.io"
  ],
```

디폴트 `selectedChainId`, `currentChainId` 세팅
```
export default function Wallet({ selectedChainId, onChangeBridge }: CurProps) {
  const { chainId } = useActiveWeb3React();
  console.log("Wallet chainId :", chainId);
  let currentChainId = chainId as ChainId;
  if (currentChainId === undefined) {
    selectedChainId = ChainId.MARIGOLD_LOCALNET;
    currentChainId = ChainId.MARIGOLD_LOCALNET;
  }
```

#### 3. `src/constants/index.ts`
Router, Opposite Chain, Direction, WDEV_ONLY 추가

##### ROUTER_ADDRESS
```
export const ROUTER_ADDRESS: { [key: string]: string } = {
   [ChainId.HARDHAT]: CONTRACT_ADDRESS_NETWORKS[ChainId.HARDHAT].routerv2,
   [ChainId.STANDALONE]: CONTRACT_ADDRESS_NETWORKS[ChainId.STANDALONE].routerv2,
   [ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].routerv2,
   [ChainId.MARIGOLD]: CONTRACT_ADDRESS_NETWORKS[ChainId.MARIGOLD].routerv2,
   [ChainId.MARIGOLD_LOCALNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MARIGOLD_LOCALNET].routerv2,
   ...
```

##### OPPOSITE_CHAIN
```
export const OPPOSITE_CHAIN: { [key: string]: number } = {
   [ChainId.HARDHAT]: ChainId.STANDALONE,
   [ChainId.STANDALONE]: ChainId.MARIGOLD_LOCALNET,
   ...
```

##### DIRECTION_CHAIN
```
export const DIRECTION_CHAIN: { [key: string]: number } = {
   [ChainId.HARDHAT]: BridgeDirection.ETHNET_BIZNET,
   [ChainId.STANDALONE]: BridgeDirection.ETHNET_BIZNET,
   [ChainId.STANDALONE]: BridgeDirection.BIZNET_ETHNET,
   ...
```

##### WDEV_ONLY
```
const WDEV_ONLY: ChainTokenList = {
   [ChainId.MAINNET]: [WDEV[ChainId.MAINNET]],
   [ChainId.HARDHAT]: [WDEV[ChainId.HARDHAT]],
   ...
   [ChainId.MARIGOLD_LOCALNET]: [WDEV[ChainId.MARIGOLD_LOCALNET]],
   ...
```

#### 4. `src/constants/multicall/index.ts`
Multicall, Bridge, Token Bridge 컨트랙트 매칭
```
const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  ...
  [ChainId.MARIGOLD_LOCALNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MARIGOLD_LOCALNET].multicall,
  ...
};

const BRIDGE_NETWORKS: { [chainId in ChainId]: string } = {
  ...
  [ChainId.MARIGOLD_LOCALNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MARIGOLD_LOCALNET].bridge,
  ...
};

const TOKEN_BRIDGE_NETWORKS: { [chainId in ChainId]: string } = {
  ...
  [ChainId.MARIGOLD_LOCALNET]: CONTRACT_ADDRESS_NETWORKS[ChainId.MARIGOLD_LOCALNET].tokenBridge,
  ...
};
```

#### 5. `src/hooks/useContract.ts`
`useENSRegistrarContract` 세팅
```
export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  ...
  if (chainId) {
    switch (chainId) {
      ...
      case ChainId.MARIGOLD_LOCALNET:
        break;
      ...
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible);
}
```

#### 6. `src/state/lists/hooks.ts`
`TokenAddressMap` 세팅
```
const EMPTY_LIST: TokenAddressMap = {
  ...
  [ChainId.MARIGOLD_LOCALNET]: {},
  ...
};
```

#### 7. `src/utils/index.ts`
`DEVSCAN_PREFIXES` 세팅, 항목만 추가하고 아무값이나 써도 됨.
```
const DEVSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  ...
  12309: "https://marigoldlocal.etherscan.io",
  ...
};
```

#### 8. Setting Environment Variables in .env or .env.dev
```
# ETHEREUM_LOCAL
REACT_APP_ETHEREUM_URL="http://localhost:8885"
REACT_APP_ETHEREUM_CHAIN_ID="12309"

# BIZNET_LOCAL
REACT_APP_BIZNET_URL="http://localhost:8585"
REACT_APP_BIZNET_CHAIN_ID="7212309"
```

#### 9. Token List
스왑에서 사용되는 정보를 앱 시작시 처리하기 위한 부분임. (**추가 분석 필요함**)

On startup, your reducer’s initialState.byUrl[DEFAULT_TOKEN_LIST_URL].current is set to the contents of tokens.json (or tokens_test.json in non-PROD).

네크워크 추가 이후에는 해당 네트워크에서 사용될 토큰을 토큰리스트에 추가합니다. 
https://github.com/she110ff/uniswap-interface/blob/main/boaswap-interface/src/tokens.json 에 추가된 네트워크의 토큰을 추가합니다. 
 
** 추후 토큰 주소는 변경 예정입니다.

##### (1) 샘플
```
{
  "name": "BIZBOA Menu",
  "logoURI": "https://raw.githubusercontent.com/PureStake/moonbase-mintableERC20/main/mintableERC20-interface/public/logos/White_Icon.svg",
  "keywords": ["bizboa", "tokens", "uniswap"],
  "timestamp": "2022-05-10T00:00:00+00:00",
  "tokens": [
    {
      "address": "0xfE5D3c52F7ee9aa32a69b96Bfbb088Ba0bCd8EfC",
      "chainId": 1281,
      "name": "A Game Token",
      "symbol": "GT-A",
      "decimals": 18,
      "tags": ["TOKEN"],
      "logoURI": "https://raw.githubusercontent.com/PureStake/moonbase-mintableERC20/main/mintableERC20-interface/public/logos/White_Icon.svg"
    },    
    
    ...
    
    {
      "address": "0x05c2fa4D4eDCDad6F8CF8cF44110dE71B6B22cee",
      "chainId": 3,
      "name": "BOA",
      "symbol": "BOA",
      "decimals": 7,
      "tags": ["BOA"],
      "logoURI": "https://raw.githubusercontent.com/PureStake/moonbase-mintableERC20/main/mintableERC20-interface/public/logos/White_Icon.svg"
    }
  ],
  "version": {
    "major": 2,
    "minor": 0,
    "patch": 3
  }
}
```

##### (2) 엔티티
* name : 토큰 리스트 메뉴의 명칭으로 팝업 화면등에서 사용합니다. 
* logoURI : 토큰 리스트 메뉴의 로고이며 팝업 화면등에서 사용합니다.
* keyword : 토큰 리스트의 키워드를 나열합니다.
* timestamp : 토큰 리스트 작성 시점에 대한 기술입니다.
* tokens : 토큰 목록 배열입니다. 
  * address : 컨트렉트 주소 체크섬
  * chainId : 토큰이 배포된 네트워크 체인 ID
  * name : 토큰 이름, 1~40
  * symbol : 토큰 심볼, alphanumeric, 1~20
  * decimals : 0 ~ 255
  * tags : 토큰과 관련된 식별 정보, ~ 10
  * logoURI : 토큰 로고 URI
* versions
  * major : 토큰이 삭제되었거나 주소가 변경되었을 때 반드시 변경
  * minor : 토큰이 추가되었을 때 반드시 변경
  * patch : major, minor 이외의 정보가 변경되었을 때 변경

https://github.com/Uniswap/token-lists/blob/main/src/tokenlist.schema.json
