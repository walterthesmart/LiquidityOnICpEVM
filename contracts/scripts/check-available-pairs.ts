import { ethers } from "hardhat";

/**
 * Check Available Trading Pairs Script
 *
 * This script checks what trading pairs are currently available in the DEX
 * and displays their information for frontend integration
 */

async function main(): Promise<void> {
  console.log("🔍 Checking Available Trading Pairs...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Address: ${deployer.address}\n`);

  // DEX contract address
  const dexAddress = "0x1fb6d61A02eF94564e90e14BeACbba17A0C9482a";
  const dex = await ethers.getContractAt("StockNGNDEX", dexAddress);

  console.log(`🔗 DEX Contract: ${dexAddress}\n`);

  try {
    // Get all stock tokens registered in the DEX
    const allStockTokens = await dex.getAllStockTokens();
    console.log(`📊 Total registered stock tokens: ${allStockTokens.length}`);

    if (allStockTokens.length === 0) {
      console.log("❌ No trading pairs found in the DEX.");
      return;
    }

    console.log("\n📋 Available Trading Pairs:");
    console.log("=".repeat(80));

    for (let i = 0; i < allStockTokens.length; i++) {
      const stockAddress = allStockTokens[i];

      try {
        // Get trading pair info
        const pairInfo = await dex.getTradingPair(stockAddress);

        // Get stock token info
        const stockContract = await ethers.getContractAt("NigerianStockToken", stockAddress);
        const stockInfo = await stockContract.getStockInfo();

        // Get current price
        const currentPrice = await dex.getCurrentPrice(stockAddress);

        // Get liquidity info
        const ngnReserve = pairInfo.ngnReserve;
        const stockReserve = pairInfo.stockReserve;

        console.log(`\n${i + 1}. ${stockInfo.symbol} (${stockInfo.companyName})`);
        console.log(`   📍 Address: ${stockAddress}`);
        console.log(
          `   💱 Current Price: ${ethers.formatEther(currentPrice)} NGN per ${stockInfo.symbol}`
        );
        console.log(`   💰 NGN Reserve: ${ethers.formatEther(ngnReserve)} NGN`);
        console.log(`   📈 Stock Reserve: ${ethers.formatEther(stockReserve)} ${stockInfo.symbol}`);
        console.log(`   🔄 Fee Rate: ${Number(pairInfo.feeRate) / 100}%`);
        console.log(`   ✅ Active: ${pairInfo.isActive}`);
      } catch (error) {
        console.log(`\n${i + 1}. ${stockAddress}`);
        console.log(`   ❌ Error getting pair info: ${error}`);
      }
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `\n✅ Found ${allStockTokens.length} trading pairs ready for frontend integration!`
    );

    // Show addresses for frontend configuration
    console.log(`\n📋 Stock Token Addresses for Frontend:`);
    allStockTokens.forEach((address, index) => {
      console.log(`   ${index + 1}. ${address}`);
    });
  } catch (error: unknown) {
    console.error("❌ Error checking trading pairs:", error);
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
