import { ethers } from "hardhat";

async function main(): Promise<void> {
  console.log("🔍 Checking NGN Configuration...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deployer: ${deployer.address}\n`);

  // NGN contract address
  const ngnAddress = "0xc6FDE8a6D23B2A0e7f39F90bc5B7c062159e9A36";
  const ngn = await ethers.getContractAt("NGNStablecoin", ngnAddress);

  console.log(`💰 NGN Contract: ${ngnAddress}\n`);

  try {
    // Get configuration
    const config = await ngn.getConfig();
    console.log("📋 NGN Configuration:");
    console.log(`   Minting Enabled: ${config.mintingEnabled}`);
    console.log(`   Burning Enabled: ${config.burningEnabled}`);
    console.log(`   Transfers Enabled: ${config.transfersEnabled}`);
    console.log(`   Daily Minting Cap: ${ethers.formatEther(config.mintingCap)} NGN`);
    console.log(`   Current Day Minted: ${ethers.formatEther(config.currentDayMinted)} NGN`);
    console.log(`   Max Supply: ${ethers.formatEther(config.maxSupply)} NGN`);

    // Get current supply and balance
    const totalSupply = await ngn.totalSupply();
    const deployerBalance = await ngn.balanceOf(deployer.address);

    console.log(`\n📊 Current Status:`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} NGN`);
    console.log(`   Your Balance: ${ethers.formatEther(deployerBalance)} NGN`);

    // Check roles
    const DEFAULT_ADMIN_ROLE = await ngn.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await ngn.MINTER_ROLE();
    const BURNER_ROLE = await ngn.BURNER_ROLE();

    const hasAdminRole = await ngn.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinterRole = await ngn.hasRole(MINTER_ROLE, deployer.address);
    const hasBurnerRole = await ngn.hasRole(BURNER_ROLE, deployer.address);

    console.log(`\n🔐 Your Permissions:`);
    console.log(`   Admin Role: ${hasAdminRole}`);
    console.log(`   Minter Role: ${hasMinterRole}`);
    console.log(`   Burner Role: ${hasBurnerRole}`);

    // Calculate available minting capacity
    const remainingDailyCapacity = config.mintingCap - config.currentDayMinted;
    const remainingSupplyCapacity = config.maxSupply - totalSupply;
    const availableToMint = remainingDailyCapacity < remainingSupplyCapacity ? remainingDailyCapacity : remainingSupplyCapacity;

    console.log(`\n💡 Minting Capacity:`);
    console.log(`   Remaining Daily Capacity: ${ethers.formatEther(remainingDailyCapacity)} NGN`);
    console.log(`   Remaining Supply Capacity: ${ethers.formatEther(remainingSupplyCapacity)} NGN`);
    console.log(`   Available to Mint Now: ${ethers.formatEther(availableToMint)} NGN`);

    if (!config.mintingEnabled) {
      console.log(`\n❌ Issue: Minting is disabled`);
    } else if (!hasMinterRole) {
      console.log(`\n❌ Issue: You don't have MINTER_ROLE`);
    } else if (availableToMint <= 0n) {
      console.log(`\n❌ Issue: No minting capacity available`);
    } else {
      console.log(`\n✅ Minting should work for amounts up to ${ethers.formatEther(availableToMint)} NGN`);
    }

  } catch (error) {
    console.error("❌ Error checking configuration:", error);
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
