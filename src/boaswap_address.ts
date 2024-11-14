import { ChainId } from "tigger-swap-sdk";
type DeployedContract = {
  WETH: string;
  factory: string;
  routerv2: string;
  multicall: string;
  bridge: string;
  tokenBridge: string;
};
export const CONTRACT_ADDRESS_NETWORKS: { [chainId in ChainId]: DeployedContract } = {
  [ChainId.MAINNET]: {
    WETH: "0xC2Bf5F29a4384b1aB0C063e1c666f02121B6084a",
    factory: "0x5c4242beB94dE30b922f57241f1D02f36e906915",
    routerv2: "0x42e2EE7Ba8975c473157634Ac2AF4098190fc741",
    multicall: "0xF8cef78E923919054037a1D03662bBD884fF4edf",
    bridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452",
    tokenBridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452"
  },
  [ChainId.HARDHAT]: {
    WETH: "0xC2Bf5F29a4384b1aB0C063e1c666f02121B6084a",
    factory: "0x5c4242beB94dE30b922f57241f1D02f36e906915",
    routerv2: "0x42e2EE7Ba8975c473157634Ac2AF4098190fc741",
    multicall: "0xeAB4eEBa1FF8504c124D031F6844AD98d07C318f",
    bridge: "0x970951a12F975E6762482ACA81E57D5A2A4e73F4",
    tokenBridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452"
  },
  [ChainId.STANDALONE]: {
    WETH: "0xC2Bf5F29a4384b1aB0C063e1c666f02121B6084a",
    factory: "0x5c4242beB94dE30b922f57241f1D02f36e906915",
    routerv2: "0x42e2EE7Ba8975c473157634Ac2AF4098190fc741",
    multicall: "0xF8cef78E923919054037a1D03662bBD884fF4edf",
    bridge: "0x970951a12F975E6762482ACA81E57D5A2A4e73F4",
    tokenBridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452"
  },
  [ChainId.SEPOLIA]: {
    WETH: "0xA0be228CA989c4225682EbfaF1a372298993bdB9",
    factory: "0x96BfB45907879216CF504E81aFB2948048249A12",
    routerv2: "0x761d69Ba08C571AE2247be65f42e79E4126ae4DF",
    multicall: "0xD3078B0eC7FdfE525D8C004Fde41ec473d60Cdd5",
    bridge: "0x2988EF2c89E22a2Ffdf46aA005B46853d20eb423",
    tokenBridge: "0xB619373A82A4f19eE45abFd72eD23c172E10B31B"
  },
  [ChainId.BIZTESTNET]: {
    WETH: "0x0B102b3b321E0D9983907618eC3b685C83a43184",
    factory: "0x21B560eB10be590b722d1061FC098a1e668c5061",
    routerv2: "0xA6065fabdc56d3713B820D499ff6e11d31aC4bEf",
    multicall: "0xbD9cffA1ABaEecDD75e197eBC18d12E172ff82E3",
    bridge: "0x1296aCf5d1F8Fbb9097fb2Ace1C4B5E3421050bE",
    tokenBridge: "0x42933f098f4698A0259e5e2BB779Ad8E589EEf8c"
  },
  [ChainId.BIZNET]: {
    WETH: "0x8EE9f32627d29Dd83d8a8C0aEd9d79F97BD381a1",
    factory: "0x48CC297D54a8d14eebb8AfCDfa67E150DDb6a69B",
    routerv2: "0xe6571E84414ef85d7098c6975B9779e9ACBE93c4",
    multicall: "0x045d5aFA977791EFA0A78d9Cd31D0327DB79C632",
    bridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452",
    tokenBridge: "0x95075eDc815e9Cd62Ff6D4598ea922307416B452"
  }
};
