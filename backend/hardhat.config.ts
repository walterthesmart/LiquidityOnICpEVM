import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bitfinity_testnet: {
      url: "https://testnet.bitfinity.network",
      chainId: 355113,
      accounts: process.env.BITFINITY_PRIVATE_KEY ? [process.env.BITFINITY_PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    bitfinity_mainnet: {
      url: "https://mainnet.bitfinity.network", 
      chainId: 355110,
      accounts: process.env.BITFINITY_PRIVATE_KEY ? [process.env.BITFINITY_PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
  },
  etherscan: {
    // Bitfinity block explorer API configuration
    apiKey: {
      bitfinity_testnet: process.env.BITFINITY_API_KEY || "dummy",
      bitfinity_mainnet: process.env.BITFINITY_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "bitfinity_testnet",
        chainId: 355113,
        urls: {
          apiURL: "https://explorer-api.testnet.bitfinity.network/api",
          browserURL: "https://explorer.testnet.bitfinity.network",
        },
      },
      {
        network: "bitfinity_mainnet", 
        chainId: 355110,
        urls: {
          apiURL: "https://explorer-api.bitfinity.network/api",
          browserURL: "https://explorer.bitfinity.network",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
