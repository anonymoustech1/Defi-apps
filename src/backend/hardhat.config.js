import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import hardhatEthersChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    hardhatEthers,
    hardhatKeystore,
    hardhatMocha,
    hardhatEthersChaiMatchers,
    hardhatNetworkHelpers,
  ],
  solidity: {
    version: "0.8.28",
  },
  paths: {
    sources: "./contracts",
    tests: { mocha: "./test"},
    cache: "./cache",
    // artifacts: "./src/backend/artifacts",
  },
    networks: {
      sepolia: {
        type: "http",
        url: process.env.SEPOLIA_API_URL,
        accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      },
    }
  
});