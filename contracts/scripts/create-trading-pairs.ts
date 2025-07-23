import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

/**
 * Trading Pair Creation Script
 *
 * This script creates trading pairs between NGN stablecoin and existing stock tokens
 * Supports both individual and batch creation of trading pairs
 */

interface StockTokenInfo {
  address: string;
  symbol: string;
  name: string;
  companyName: string;
  initialNGNLiquidity: string;
  initialStockLiquidity: string;
  feeRate: number;
  targetLiquidity: string;
}

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

// Predefined stock tokens for different networks
const STOCK_TOKENS: Record<string, StockTokenInfo[]> = {
  sepolia: [
    {
      address: "0x2EC5d749D0DF8Aa8b1Af4128d0b0Cb76417A8DeE",
      symbol: "DANGCEM",
      name: "Dangote Cement Token",
      companyName: "Dangote Cement Plc",
      initialNGNLiquidity: ethers.parseEther("50000").toString(), // 50K NGN
      initialStockLiquidity: ethers.parseEther("1000").toString(), // 1K tokens
      feeRate: 30, // 0.3%
      targetLiquidity: ethers.parseEther("100000").toString(), // 100K NGN target
    },
    {
      address: "0xa19FB869e72ecC01797BcF57B690Ecee3101888A",
      symbol: "MTNN",
      name: "MTN Nigeria Token",
      companyName: "MTN Nigeria Communications Plc",
      initialNGNLiquidity: ethers.parseEther("40000").toString(),
      initialStockLiquidity: ethers.parseEther("800").toString(),
      feeRate: 30,
      targetLiquidity: ethers.parseEther("80000").toString(),
    },
    {
      address: "0x00b41E1164843E291bB5B496b50E3b143C278016",
      symbol: "ZENITHBANK",
      name: "Zenith Bank Token",
      companyName: "Zenith Bank Plc",
      initialNGNLiquidity: ethers.parseEther("60000").toString(),
      initialStockLiquidity: ethers.parseEther("1200").toString(),
      feeRate: 30,
      targetLiquidity: ethers.parseEther("120000").toString(),
    },
    {
      address: "0x2f6c483D1ad3659B9b915cA164Fd6BA4089788EE",
      symbol: "GTCO",
      name: "GTCO Token",
      companyName: "Guaranty Trust Holding Company Plc",
      initialNGNLiquidity: ethers.parseEther("45000").toString(),
      initialStockLiquidity: ethers.parseEther("900").toString(),
      feeRate: 30,
      targetLiquidity: ethers.parseEther("90000").toString(),
    },
    {
      address: "0x085b9cD55F29b89362C80429e8C406Cf809625C6",
      symbol: "NB",
      name: "Nigerian Breweries Token",
      companyName: "Nigerian Breweries Plc",
      initialNGNLiquidity: ethers.parseEther("35000").toString(),
      initialStockLiquidity: ethers.parseEther("700").toString(),
      feeRate: 30,
      targetLiquidity: ethers.parseEther("70000").toString(),
    },
  ],
  bitfinity_testnet: [
    // Will be populated when stock tokens are deployed to Bitfinity
  ],
  hardhat: [
    // For local testing - will deploy mock tokens
  ],
};

async function loadDeploymentData(networkName: string): Promise<DeploymentData> {
  const deploymentsDir = resolve(__dirname, "../deployments");

  // Find the deployment file
  const files = require("fs").readdirSync(deploymentsDir);
  const deploymentFile = files.find(
    (file: string) => file.startsWith(`ngn-dex-system-${networkName}-`) && file.endsWith(".json")
  );

  if (!deploymentFile) {
    throw new Error(`Deployment file not found for network: ${networkName}`);
  }

  const filepath = resolve(deploymentsDir, deploymentFile);
  const data = JSON.parse(readFileSync(filepath, "utf8"));

  return {
    contracts: data.contracts,
    network: data.network,
    chainId: data.chainId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTradingPair(dexContract: any, ngnContract: any, stockInfo: StockTokenInfo) {
  console.log(`📦 Creating trading pair for ${stockInfo.symbol}...`);

  try {
    // Check if stock token exists and get its info
    const stockContract = await ethers.getContractAt("NigerianStockToken", stockInfo.address);
    const stockMetadata = await stockContract.getStockInfo();

    console.log(`   Company: ${stockMetadata.companyName}`);
    console.log(`   Symbol: ${stockMetadata.symbol}`);

    // Check if pair already exists
    try {
      const existingPair = await dexContract.getTradingPair(stockInfo.address);
      if (existingPair.isActive) {
        console.log(`   ⚠️  Trading pair already exists for ${stockInfo.symbol}`);
        return false;
      }
    } catch {
      // Pair doesn't exist, continue with creation
    }

    // Approve tokens for DEX
    console.log(`   💰 Approving ${ethers.formatEther(stockInfo.initialNGNLiquidity)} NGN...`);
    const ngnApproveTx = await ngnContract.approve(
      await dexContract.getAddress(),
      stockInfo.initialNGNLiquidity
    );
    await ngnApproveTx.wait();

    console.log(
      `   💰 Approving ${ethers.formatEther(stockInfo.initialStockLiquidity)} ${stockInfo.symbol}...`
    );
    const stockApproveTx = await stockContract.approve(
      await dexContract.getAddress(),
      stockInfo.initialStockLiquidity
    );
    await stockApproveTx.wait();

    // Create trading pair
    console.log(`   🔄 Creating trading pair...`);
    const createTx = await dexContract.createTradingPair(
      stockInfo.address,
      stockInfo.initialNGNLiquidity,
      stockInfo.initialStockLiquidity,
      stockInfo.feeRate
    );

    const receipt = await createTx.wait();
    console.log(`   ✅ Trading pair created! Gas used: ${receipt.gasUsed.toString()}`);

    // Get the current price
    const currentPrice = await dexContract.getCurrentPrice(stockInfo.address);
    console.log(
      `   💱 Initial price: ${ethers.formatEther(currentPrice)} NGN per ${stockInfo.symbol}`
    );

    return true;
  } catch (error) {
    console.error(`   ❌ Failed to create trading pair for ${stockInfo.symbol}:`, error);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Trading Pair Creation...\n");

  // Get network information
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  console.log(`📡 Network: ${networkName}\n`);

  // Load deployment data
  const deploymentData = await loadDeploymentData(networkName);
  console.log(`📋 Loaded deployment data for ${deploymentData.network}`);
  console.log(`🔗 NGN Stablecoin: ${deploymentData.contracts.ngnStablecoin}`);
  console.log(`🔗 StockNGNDEX: ${deploymentData.contracts.stockNGNDEX}\n`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get contract instances
  const ngnContract = await ethers.getContractAt(
    "NGNStablecoin",
    deploymentData.contracts.ngnStablecoin
  );

  const dexContract = await ethers.getContractAt(
    "StockNGNDEX",
    deploymentData.contracts.stockNGNDEX
  );

  // Check NGN balance
  const ngnBalance = await ngnContract.balanceOf(deployer.address);
  console.log(`💰 NGN Balance: ${ethers.formatEther(ngnBalance)} NGN\n`);

  if (ngnBalance === 0n) {
    console.log("⚠️  No NGN balance found. Minting initial supply...");
    const mintAmount = ethers.parseEther("1000000"); // 1M NGN
    const mintTx = await ngnContract.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log(`✅ Minted ${ethers.formatEther(mintAmount)} NGN\n`);
  }

  // Get stock tokens for this network
  const stockTokens = STOCK_TOKENS[networkName] || [];

  if (stockTokens.length === 0) {
    console.log(`⚠️  No stock tokens configured for network: ${networkName}`);
    console.log("Please add stock token configurations to the STOCK_TOKENS object.");
    return;
  }

  console.log(`📊 Found ${stockTokens.length} stock tokens to process\n`);

  let successfulPairs = 0;
  const createdPairs: Array<{
    stockToken: string;
    symbol: string;
    companyName: string;
    initialNGNLiquidity: string;
    initialStockLiquidity: string;
    feeRate: number;
  }> = [];

  // Create trading pairs
  for (const stockInfo of stockTokens) {
    const success = await createTradingPair(dexContract, ngnContract, stockInfo);

    if (success) {
      successfulPairs++;
      createdPairs.push({
        stockToken: stockInfo.address,
        symbol: stockInfo.symbol,
        companyName: stockInfo.companyName,
        initialNGNLiquidity: stockInfo.initialNGNLiquidity,
        initialStockLiquidity: stockInfo.initialStockLiquidity,
        feeRate: stockInfo.feeRate,
      });
    }

    console.log(""); // Add spacing between pairs
  }

  // Save results
  const resultsDir = resolve(__dirname, "../deployments");
  const resultsFile = resolve(resultsDir, `trading-pairs-${networkName}-${Date.now()}.json`);

  const results = {
    network: deploymentData.network,
    chainId: deploymentData.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    totalPairsProcessed: stockTokens.length,
    successfulPairs,
    failedPairs: stockTokens.length - successfulPairs,
    contracts: deploymentData.contracts,
    createdPairs,
  };

  writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  // Display summary
  console.log("🎉 Trading Pair Creation Summary:");
  console.log("=".repeat(50));
  console.log(`Network: ${deploymentData.network}`);
  console.log(`Total Pairs Processed: ${stockTokens.length}`);
  console.log(`Successful Pairs: ${successfulPairs}`);
  console.log(`Failed Pairs: ${stockTokens.length - successfulPairs}`);
  console.log(`Results saved to: ${resultsFile}\n`);

  if (successfulPairs > 0) {
    console.log("✅ Created Trading Pairs:");
    createdPairs.forEach((pair) => {
      console.log(`   ${pair.symbol} (${pair.companyName})`);
      console.log(`   Address: ${pair.stockToken}`);
      console.log(
        `   Initial Liquidity: ${ethers.formatEther(pair.initialNGNLiquidity)} NGN / ${ethers.formatEther(pair.initialStockLiquidity)} ${pair.symbol}`
      );
      console.log(`   Fee Rate: ${pair.feeRate / 100}%\n`);
    });
  }

  console.log("🔗 Next Steps:");
  console.log("1. Test swapping functionality");
  console.log("2. Monitor liquidity and rebalance if needed");
  console.log("3. Update frontend with new trading pairs");
  console.log("4. Set up automated liquidity management");
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

export { main as createTradingPairs, STOCK_TOKENS };
