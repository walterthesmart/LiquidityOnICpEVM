import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenvConfig({ path: resolve(__dirname, ".env") });

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
    // Bitfinity EVM Networks
    bitfinity_testnet: {
      url: "https://testnet.bitfinity.network",
      chainId: 355113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    bitfinity_mainnet: {
      url: "https://mainnet.bitfinity.network", 
      chainId: 355110,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    // Bitfinity block explorer configuration
    apiKey: {
      bitfinity_testnet: "no-api-key-needed",
      bitfinity_mainnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "bitfinity_testnet",
        chainId: 355113,
        urls: {
          apiURL: "https://explorer.testnet.bitfinity.network/api",
          browserURL: "https://explorer.testnet.bitfinity.network",
        },
      },
      {
        network: "bitfinity_mainnet", 
        chainId: 355110,
        urls: {
          apiURL: "https://explorer.bitfinity.network/api",
          browserURL: "https://explorer.bitfinity.network",
        },
      },
    ],
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
