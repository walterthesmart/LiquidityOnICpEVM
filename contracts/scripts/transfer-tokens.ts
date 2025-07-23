import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as readline from "readline";

/**
 * Token Transfer Script
 *
 * This script allows transferring any token (NGN or stock tokens) to any address
 * Supports interactive input for token selection, amount, and recipient
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
  console.log("💸 Token Transfer Script");
  console.log("========================\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "sepolia" : network.name;

  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`👤 From Address: ${deployer.address}\n`);

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
    const tokenIndexInput = await askQuestion("\n🎯 Select token number: ");
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

    // Check current balance
    const currentBalance = await tokenContract.balanceOf(deployer.address);
    console.log(
      `💰 Your current balance: ${formatNumber(ethers.formatEther(currentBalance))} ${selectedToken.symbol}`
    );

    if (currentBalance === 0n) {
      console.error(`❌ You have no ${selectedToken.symbol} tokens to transfer.`);
      process.exit(1);
    }

    // Get transfer amount
    const amountInput = await askQuestion(
      `💰 Enter amount to transfer (in ${selectedToken.symbol}): `
    );
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

    // Get recipient address
    const recipient = await askQuestion("📍 Enter recipient address: ");

    // Validate recipient address
    if (!ethers.isAddress(recipient)) {
      console.error("❌ Invalid recipient address.");
      process.exit(1);
    }

    if (recipient.toLowerCase() === deployer.address.toLowerCase()) {
      console.error("❌ Cannot transfer to yourself.");
      process.exit(1);
    }

    // Get recipient's current balance
    const recipientCurrentBalance = await tokenContract.balanceOf(recipient);

    // Confirm the transaction
    console.log(`\n📋 Transfer Summary:`);
    console.log(`   Token: ${selectedToken.symbol} (${selectedToken.name})`);
    console.log(`   Amount: ${formatNumber(amount.toString())} ${selectedToken.symbol}`);
    console.log(`   From: ${deployer.address}`);
    console.log(`   To: ${recipient}`);
    console.log(
      `   Recipient Current Balance: ${formatNumber(ethers.formatEther(recipientCurrentBalance))} ${selectedToken.symbol}`
    );

    const confirm = await askQuestion("\n✅ Confirm transfer? (y/N): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.log("❌ Transfer cancelled.");
      process.exit(0);
    }

    // Execute transfer
    console.log("\n🔄 Transferring tokens...");
    const tx = await tokenContract.transfer(recipient, amountWei);
    console.log(`📤 Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Transfer successful! Gas used: ${receipt?.gasUsed.toString()}`);

    // Show updated balances
    const newSenderBalance = await tokenContract.balanceOf(deployer.address);
    const newRecipientBalance = await tokenContract.balanceOf(recipient);

    console.log(`\n📊 Updated Balances:`);
    console.log(
      `   Your Balance: ${formatNumber(ethers.formatEther(newSenderBalance))} ${selectedToken.symbol}`
    );
    console.log(
      `   Recipient Balance: ${formatNumber(ethers.formatEther(newRecipientBalance))} ${selectedToken.symbol}`
    );
  } catch (error: unknown) {
    console.error("❌ Error during transfer:", error);
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

export { main as transferTokens };
