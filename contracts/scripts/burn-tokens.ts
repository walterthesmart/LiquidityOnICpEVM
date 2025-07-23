import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as readline from "readline";

/**
 * Token Burning Script
 *
 * This script allows burning NGN or stock tokens from your address
 * Supports interactive input for token selection and amount
 */

interface DeploymentData {
  contracts: {
    ngnStablecoin: string;
    stockNGNDEX: string;
    tradingPairManager?: string;
    stockFactory?: string;
  };
  network: string;
  chainId: number;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  type: "NGN" | "STOCK";
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

function formatNumber(num: string): string {
  return parseFloat(num).toLocaleString();
}

async function getAvailableTokens(deploymentData: DeploymentData): Promise<TokenInfo[]> {
  const tokens: TokenInfo[] = [];

  // Add NGN token
  tokens.push({
    address: deploymentData.contracts.ngnStablecoin,
    symbol: "NGN",
    name: "Nigerian Naira Stablecoin",
    type: "NGN",
  });

  // Load stock tokens from sepolia-contracts.json
  try {
    const sepoliaContractsFile = resolve(
      __dirname,
      "../../front-end/src/config/sepolia-contracts.json"
    );
    const sepoliaContracts = JSON.parse(readFileSync(sepoliaContractsFile, "utf8"));

    for (const [symbol, address] of Object.entries(sepoliaContracts.tokens)) {
      tokens.push({
        address: address as string,
        symbol,
        name: `${symbol} Token`,
        type: "STOCK",
      });
    }
  } catch (error) {
    console.warn("⚠️  Could not load stock tokens from sepolia-contracts.json");
  }

  return tokens;
}

async function main(): Promise<void> {
  console.log("🔥 Token Burning Script");
  console.log("=======================\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "sepolia" : network.name;

  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`👤 Burner Address: ${deployer.address}\n`);

  // Load deployment data
  const deploymentFile = resolve(
    __dirname,
    `../deployments/ngn-dex-system-${networkName}-${network.chainId}.json`
  );

  let deploymentData: DeploymentData;
  try {
    deploymentData = JSON.parse(readFileSync(deploymentFile, "utf8")) as DeploymentData;
  } catch (error) {
    console.error(`❌ Could not load deployment file: ${deploymentFile}`);
    console.error("Please ensure the NGN DEX system is deployed first.");
    process.exit(1);
  }

  try {
    // Get available tokens
    const availableTokens = await getAvailableTokens(deploymentData);

    console.log("📋 Available Tokens:");
    availableTokens.forEach((token, index) => {
      console.log(`   ${index + 1}. ${token.symbol} (${token.name}) - ${token.type}`);
    });

    // Select token
    const tokenIndexInput = await askQuestion("\n🎯 Select token number to burn: ");
    const tokenIndex = parseInt(tokenIndexInput) - 1;

    if (isNaN(tokenIndex) || tokenIndex < 0 || tokenIndex >= availableTokens.length) {
      console.error("❌ Invalid token selection.");
      process.exit(1);
    }

    const selectedToken = availableTokens[tokenIndex];
    console.log(`✅ Selected: ${selectedToken.symbol} (${selectedToken.address})`);

    // Get token contract
    const contractName = selectedToken.type === "NGN" ? "NGNStablecoin" : "NigerianStockToken";
    const tokenContract = await ethers.getContractAt(contractName, selectedToken.address);

    // Check current balance and total supply
    const currentBalance = await tokenContract.balanceOf(deployer.address);
    const totalSupply = await tokenContract.totalSupply();

    console.log(
      `💰 Your current balance: ${formatNumber(ethers.formatEther(currentBalance))} ${selectedToken.symbol}`
    );
    console.log(
      `📊 Total supply: ${formatNumber(ethers.formatEther(totalSupply))} ${selectedToken.symbol}`
    );

    if (currentBalance === 0n) {
      console.error(`❌ You have no ${selectedToken.symbol} tokens to burn.`);
      process.exit(1);
    }

    // Check if burning is enabled (for NGN tokens)
    if (selectedToken.type === "NGN") {
      try {
        const burningEnabled = await tokenContract.burningEnabled();
        if (!burningEnabled) {
          console.error(`❌ Burning is currently disabled for ${selectedToken.symbol} tokens.`);
          process.exit(1);
        }
      } catch (error) {
        console.warn("⚠️  Could not check burning status. Proceeding...");
      }
    }

    // Get burn amount
    const amountInput = await askQuestion(`🔥 Enter amount to burn (in ${selectedToken.symbol}): `);
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
      console.error("❌ Invalid amount. Please enter a positive number.");
      process.exit(1);
    }

    const amountWei = ethers.parseEther(amount.toString());

    if (amountWei > currentBalance) {
      console.error(
        `❌ Insufficient balance. You have ${formatNumber(ethers.formatEther(currentBalance))} ${selectedToken.symbol}`
      );
      process.exit(1);
    }

    // Calculate new total supply after burning
    const newTotalSupply = totalSupply - amountWei;

    // Confirm the transaction
    console.log(`\n📋 Burn Summary:`);
    console.log(`   Token: ${selectedToken.symbol} (${selectedToken.name})`);
    console.log(`   Amount to Burn: ${formatNumber(amount.toString())} ${selectedToken.symbol}`);
    console.log(
      `   Your Balance After: ${formatNumber(ethers.formatEther(currentBalance - amountWei))} ${selectedToken.symbol}`
    );
    console.log(
      `   New Total Supply: ${formatNumber(ethers.formatEther(newTotalSupply))} ${selectedToken.symbol}`
    );

    console.log(`\n⚠️  WARNING: Burning tokens is IRREVERSIBLE!`);
    console.log(`   These tokens will be permanently destroyed and cannot be recovered.`);

    const confirm = await askQuestion("\n🔥 Confirm burning? Type 'BURN' to confirm: ");
    if (confirm !== "BURN") {
      console.log("❌ Burning cancelled.");
      process.exit(0);
    }

    // Execute burning
    console.log("\n🔥 Burning tokens...");

    let tx;
    if (selectedToken.type === "NGN") {
      // NGN tokens have a burn function
      tx = await tokenContract.burn(amountWei);
    } else {
      // Stock tokens use burnFrom (burn from your own address)
      tx = await tokenContract.burnFrom(deployer.address, amountWei);
    }

    console.log(`📤 Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Burning successful! Gas used: ${receipt?.gasUsed.toString()}`);

    // Show updated balances
    const newBalance = await tokenContract.balanceOf(deployer.address);
    const newTotalSupplyActual = await tokenContract.totalSupply();

    console.log(`\n📊 Updated Status:`);
    console.log(
      `   Your Balance: ${formatNumber(ethers.formatEther(newBalance))} ${selectedToken.symbol}`
    );
    console.log(
      `   New Total Supply: ${formatNumber(ethers.formatEther(newTotalSupplyActual))} ${selectedToken.symbol}`
    );
    console.log(
      `   Tokens Burned: ${formatNumber(ethers.formatEther(amountWei))} ${selectedToken.symbol} 🔥`
    );
  } catch (error: unknown) {
    console.error("❌ Error during burning:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Execute script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as burnTokens };
