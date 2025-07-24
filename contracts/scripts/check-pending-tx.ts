import { ethers } from "hardhat";

/**
 * Check Pending Transactions Script
 *
 * This script checks for pending transactions and provides options to handle them
 */

async function main(): Promise<void> {
  console.log("🔍 Checking Pending Transactions...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Address: ${deployer.address}\n`);

  try {
    // Get current nonce from network and local wallet
    const networkNonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
    const pendingNonce = await ethers.provider.getTransactionCount(deployer.address, "pending");

    console.log(`📊 Nonce Status:`);
    console.log(`   Network (confirmed): ${networkNonce}`);
    console.log(`   Pending: ${pendingNonce}`);
    console.log(`   Pending transactions: ${pendingNonce - networkNonce}`);

    if (pendingNonce > networkNonce) {
      console.log(`\n⚠️  You have ${pendingNonce - networkNonce} pending transaction(s)`);
      console.log(`   This may cause "replacement transaction underpriced" errors`);
      console.log(
        `   Wait for pending transactions to confirm, or send a replacement transaction with higher gas`
      );
    } else {
      console.log(`\n✅ No pending transactions. You can proceed with new transactions.`);
    }

    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log(`\n⛽ Current Gas Prices:`);
    console.log(
      `   Gas Price: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A"} gwei`
    );
    console.log(
      `   Max Fee: ${feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A"} gwei`
    );
    console.log(
      `   Max Priority Fee: ${feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "N/A"} gwei`
    );

    // Get account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`\n💰 ETH Balance: ${ethers.formatEther(balance)} ETH`);
  } catch (error: unknown) {
    console.error("❌ Error checking transactions:", error);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
