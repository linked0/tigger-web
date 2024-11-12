
## Build

Install packages:

```
yarn install
```

Run:

```
yarn start
```

## Add network
네트워크 추가에 대한 다음 설명은 sepolia 네트워크를 예를 들어 관련 정보의 추가 및 변경 순서에 따라서 설명합니다.

### BOASwap Contract
#### 1.env 환경변수 추가
```
URL_SEPOLIA=https://sepolia.infura.io/v3/0128f6...
CHAIN_ID_SEPOLIA=11155111
PRIVATE_KEY_SEPOLIA=0x99b3c12...
```
#### 2.hardhat.config.js 에 네트워크 추가
```
  sepolia: {
     url: process.env.URL_SEPOLIA,
     accounts: [process.env.PRIVATE_KEY_SEPOLIA],
     chainId: parseInt(process.env.CHAIN_ID_SEPOLIA),
     gas: 2100000,
     gasPrice: 8000000000
  },
```
#### 3.배포 스크립트 작성
```
# 1. 필요한 경우에만 테스트용 ERC20 토큰을 생성 로직을 포합시킵니다.
# 2. 배포 주소가 프린트 되도록 합니다.

script > sepolia-deploy-factory.js
```
#### 4.package.json에 실행 스크립트 추가
```
"sepolia:deploy": "hardhat run --network sepolia scripts/sepolia-deploy-factory.js"
```
#### 5.컨트랙트 배포
```
# 배포된 컨트랙트 주소를 복사하여 SDK, WEB에서 사용합니다.

yarn sepolia:deploy
```

### BOASwap SDK
#### 1.constant.ts > ChainId 추가
```
SEPOLIA = 11155111,
```
#### 2.constant.ts > BOASwap Contract 배포 주소를 추가합니다.
```
  # CONTRACT_ADDRESS_NETWORKS
  [ChainId.SEPOLIA]: {
    WETH: '0xA0be228CA989c4225682EbfaF1a372298993bdB9',
    factory: '0x96BfB45907879216CF504E81aFB2948048249A12',
    routerv2: '0x761d69Ba08C571AE2247be65f42e79E4126ae4DF',
    multicall: '0x5869297F41dD79Df34818c5f00a0814933657309'
  },
```
#### 3.tokens.ts > WDEV에 WETH 주소값을 매핑
```
  # WETH를 실제로 사용하지는 않지만 관련 코드를 유지합니다.
  
  [ChainId.SEPOLIA]: new Token(
      ChainId.SEPOLIA,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].WETH,
      18,
      'WETH',
      'Wrapped Ether'
  ),
```
#### 4.npm 버전 변경
```
# 일반적인 경우 patch version을 변경합니다.

"version": "0.8.4",
```
#### 5.npm publish
```
# bosagora팀 계정으로 배포합니다.

npm publish
```

### BOASwap Web
#### 1. BOASwap SDK upgrade
```
# 현재는 상시적 업그레이드로 인하여 최신버전을 사용하고 있으나,
# 추후에 특정 버전을 명시해야 합니다. 

yarn upgrade bizboa-swap-sdk
```
#### 2. boaswap_address.ts 
```
  # CONTRACT_ADDRESS_NETWORKS에 BOASwap Contract 배포 주소를 추가합니다. 

  [ChainId.SEPOLIA]: {
    WETH: '0xA0be228CA989c4225682EbfaF1a372298993bdB9',
    factory: '0x96BfB45907879216CF504E81aFB2948048249A12',
    routerv2: '0x761d69Ba08C571AE2247be65f42e79E4126ae4DF',
    multicall: '0x5869297F41dD79Df34818c5f00a0814933657309'
  },
```
#### 3. Components>Header>index.tsx
```
# ChainId의 문구를 NETWORK_LABELS에 추가합니다.

[ChainId.SEPOLIA]: 'SEPOLIA Network',
```
#### 4. connectors>index.ts
```
# 지원가능한 ChainId를 추가합니다.

supportedChainIds: [1, 2, 11155111, 1281, 1287, 1288]
```
#### 5. constants>multicall>index.ts
```
# MULTICALL_NETWORKS를 추가합니다.

[ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].multicall,
```
#### 6. constants>index.ts
```
# ROUTER_ADDRESS를 추가합니다. 

[ChainId.SEPOLIA]: CONTRACT_ADDRESS_NETWORKS[ChainId.SEPOLIA].routerv2,

# WDEV_ONLY의 토크리스트를 추가합니다.

[ChainId.SEPOLIA]: [WDEV[ChainId.SEPOLIA]]
```
#### 7. utils>index.ts
```
# DEVSCAN_PREFIXES에 스캔 링크를 추가합니다.

3: 'https://sepolia.etherscan.io',
```
#### 8. 토큰 추가
네크워크 추가 이후에는 해당 네트워크에서 사용될 토큰을 토큰리스트에 추가합니다. 

## Token List
https://github.com/she110ff/uniswap-interface/blob/main/boaswap-interface/src/tokens.json 에 추가된 네트워크의 토큰을 추가합니다. 

** 추후 토큰 주소는 변경 예정입니다.

#### 1. 샘플
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

#### 2. 엔티티
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

