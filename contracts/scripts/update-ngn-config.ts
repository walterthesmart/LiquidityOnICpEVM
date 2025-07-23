import { ethers } from "hardhat";
import * as readline from "readline";

/**
 * NGN Configuration Update Script
 * 
 * This script allows updating NGN stablecoin configuration
 * Including minting cap, enabling/disabling features, etc.
 */

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

async function main(): Promise<void> {
  console.log("⚙️  NGN Configuration Update Script");
  console.log("===================================\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Admin: ${deployer.address}\n`);

  // NGN contract address
  const ngnAddress = "0xc6FDE8a6D23B2A0e7f39F90bc5B7c062159e9A36";
  const ngn = await ethers.getContractAt("NGNStablecoin", ngnAddress);

  console.log(`💰 NGN Contract: ${ngnAddress}\n`);

  try {
    // Check admin permissions
    const DEFAULT_ADMIN_ROLE = await ngn.DEFAULT_ADMIN_ROLE();
    const hasAdminRole = await ngn.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

    if (!hasAdminRole) {
      console.error("❌ You don't have admin permissions to update configuration.");
      process.exit(1);
    }

    // Get current configuration
    const config = await ngn.getConfig();
    console.log("📋 Current Configuration:");
    console.log(`   Minting Enabled: ${config.mintingEnabled}`);
    console.log(`   Burning Enabled: ${config.burningEnabled}`);
    console.log(`   Transfers Enabled: ${config.transfersEnabled}`);
    console.log(`   Daily Minting Cap: ${formatNumber(ethers.formatEther(config.mintingCap))} NGN`);
    console.log(`   Current Day Minted: ${formatNumber(ethers.formatEther(config.currentDayMinted))} NGN`);
    console.log(`   Max Supply: ${formatNumber(ethers.formatEther(config.maxSupply))} NGN\n`);

    // Show update options
    console.log("🔧 Available Updates:");
    console.log("   1. Update daily minting cap");
    console.log("   2. Enable/disable minting");
    console.log("   3. Enable/disable burning");
    console.log("   4. Enable/disable transfers");
    console.log("   5. Reset daily minting counter");

    const choice = await askQuestion("\n🎯 Select update option (1-5): ");

    switch (choice) {
      case "1":
        await updateMintingCap(ngn, config);
        break;
      case "2":
        await toggleMinting(ngn, config);
        break;
      case "3":
        await toggleBurning(ngn, config);
        break;
      case "4":
        await toggleTransfers(ngn, config);
        break;
      case "5":
        await resetDailyMinting(ngn);
        break;
      default:
        console.log("❌ Invalid choice.");
        process.exit(1);
    }

  } catch (error: unknown) {
    console.error("❌ Error updating configuration:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function updateMintingCap(ngn: any, config: any): Promise<void> {
  const currentCap = ethers.formatEther(config.mintingCap);
  console.log(`\n💰 Current daily minting cap: ${formatNumber(currentCap)} NGN`);

  const newCapInput = await askQuestion("💰 Enter new daily minting cap (in NGN): ");
  const newCap = parseFloat(newCapInput);

  if (isNaN(newCap) || newCap <= 0) {
    console.error("❌ Invalid amount. Please enter a positive number.");
    return;
  }

  const newCapWei = ethers.parseEther(newCap.toString());

  console.log(`\n📋 Update Summary:`);
  console.log(`   Current Cap: ${formatNumber(currentCap)} NGN`);
  console.log(`   New Cap: ${formatNumber(newCap.toString())} NGN`);

  const confirm = await askQuestion("\n✅ Confirm update? (y/N): ");
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log("❌ Update cancelled.");
    return;
  }

  console.log("\n🔄 Updating minting cap...");
  const tx = await ngn.updateMintingCap(newCapWei);
  console.log(`📤 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Minting cap updated! Gas used: ${receipt?.gasUsed.toString()}`);
}

async function toggleMinting(ngn: any, config: any): Promise<void> {
  const currentState = config.mintingEnabled;
  const newState = !currentState;

  console.log(`\n🔄 ${newState ? 'Enabling' : 'Disabling'} minting...`);
  console.log(`   Current state: ${currentState ? 'Enabled' : 'Disabled'}`);
  console.log(`   New state: ${newState ? 'Enabled' : 'Disabled'}`);

  const confirm = await askQuestion("\n✅ Confirm change? (y/N): ");
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log("❌ Change cancelled.");
    return;
  }

  const tx = await ngn.toggleMinting();
  console.log(`📤 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Minting ${newState ? 'enabled' : 'disabled'}! Gas used: ${receipt?.gasUsed.toString()}`);
}

async function toggleBurning(ngn: any, config: any): Promise<void> {
  const currentState = config.burningEnabled;
  const newState = !currentState;

  console.log(`\n🔥 ${newState ? 'Enabling' : 'Disabling'} burning...`);
  console.log(`   Current state: ${currentState ? 'Enabled' : 'Disabled'}`);
  console.log(`   New state: ${newState ? 'Enabled' : 'Disabled'}`);

  const confirm = await askQuestion("\n✅ Confirm change? (y/N): ");
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log("❌ Change cancelled.");
    return;
  }

  const tx = await ngn.toggleBurning();
  console.log(`📤 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Burning ${newState ? 'enabled' : 'disabled'}! Gas used: ${receipt?.gasUsed.toString()}`);
}

async function toggleTransfers(ngn: any, config: any): Promise<void> {
  const currentState = config.transfersEnabled;
  const newState = !currentState;

  console.log(`\n💸 ${newState ? 'Enabling' : 'Disabling'} transfers...`);
  console.log(`   Current state: ${currentState ? 'Enabled' : 'Disabled'}`);
  console.log(`   New state: ${newState ? 'Enabled' : 'Disabled'}`);

  const confirm = await askQuestion("\n✅ Confirm change? (y/N): ");
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log("❌ Change cancelled.");
    return;
  }

  const tx = await ngn.toggleTransfers();
  console.log(`📤 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Transfers ${newState ? 'enabled' : 'disabled'}! Gas used: ${receipt?.gasUsed.toString()}`);
}

async function resetDailyMinting(ngn: any): Promise<void> {
  console.log(`\n🔄 Resetting daily minting counter...`);
  console.log(`   This will reset currentDayMinted to 0 and update lastMintReset to current time.`);

  const confirm = await askQuestion("\n✅ Confirm reset? (y/N): ");
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log("❌ Reset cancelled.");
    return;
  }

  const tx = await ngn.resetDailyMinting();
  console.log(`📤 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Daily minting counter reset! Gas used: ${receipt?.gasUsed.toString()}`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
