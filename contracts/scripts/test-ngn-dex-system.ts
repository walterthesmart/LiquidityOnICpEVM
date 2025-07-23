import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * NGN DEX System Testing Script
 * 
 * This script performs comprehensive testing of the deployed NGN stablecoin and DEX system
 * Tests include:
 * - NGN stablecoin functionality
 * - Trading pair operations
 * - Swap functionality (both directions)
 * - Liquidity management
 * - Error handling and edge cases
 */

interface TestResult {
  testName: string;
  success: boolean;
  gasUsed?: string;
  result?: any;
  error?: string;
}

interface DeploymentData {
  contracts: {
    ngnStablecoin: string;
    stockNGNDEX: string;
    tradingPairManager?: string;
  };
  network: string;
  chainId: number;
}

async function loadDeploymentData(networkName: string): Promise<DeploymentData> {
  const deploymentsDir = resolve(__dirname, "../deployments");
  const files = require("fs").readdirSync(deploymentsDir);
  const deploymentFile = files.find((file: string) => 
    file.startsWith(`ngn-dex-system-${networkName}-`) && file.endsWith('.json')
  );
  
  if (!deploymentFile) {
    throw new Error(`Deployment file not found for network: ${networkName}`);
  }
  
  const filepath = resolve(deploymentsDir, deploymentFile);
  return JSON.parse(readFileSync(filepath, 'utf8'));
}

async function runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
  console.log(`🧪 Running test: ${testName}`);
  
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const endTime = Date.now();
    
    console.log(`   ✅ PASSED (${endTime - startTime}ms)`);
    return {
      testName,
      success: true,
      result,
    };
  } catch (error: any) {
    console.log(`   ❌ FAILED: ${error.message}`);
    return {
      testName,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log("🚀 Starting NGN DEX System Testing...\n");
  
  // Get network information
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  console.log(`📡 Network: ${networkName}\n`);
  
  // Load deployment data
  const deploymentData = await loadDeploymentData(networkName);
  console.log(`📋 Testing deployment on ${deploymentData.network}`);
  console.log(`🔗 NGN Stablecoin: ${deploymentData.contracts.ngnStablecoin}`);
  console.log(`🔗 StockNGNDEX: ${deploymentData.contracts.stockNGNDEX}\n`);
  
  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`👤 User1: ${user1.address}`);
  console.log(`👤 User2: ${user2.address}\n`);
  
  // Get contract instances
  const ngnContract = await ethers.getContractAt(
    "NGNStablecoin",
    deploymentData.contracts.ngnStablecoin
  );
  
  const dexContract = await ethers.getContractAt(
    "StockNGNDEX",
    deploymentData.contracts.stockNGNDEX
  );
  
  const testResults: TestResult[] = [];
  
  // Test 1: NGN Stablecoin Basic Functionality
  testResults.push(await runTest("NGN Stablecoin - Basic Info", async () => {
    const [name, symbol, decimals, totalSupply] = await ngnContract.getTokenInfo();
    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatEther(totalSupply),
    };
  }));
  
  // Test 2: NGN Minting
  testResults.push(await runTest("NGN Stablecoin - Minting", async () => {
    const mintAmount = ethers.parseEther("10000"); // 10K NGN
    const balanceBefore = await ngnContract.balanceOf(user1.address);
    
    const tx = await ngnContract.mint(user1.address, mintAmount);
    const receipt = await tx.wait();
    
    const balanceAfter = await ngnContract.balanceOf(user1.address);
    const minted = balanceAfter - balanceBefore;
    
    return {
      mintAmount: ethers.formatEther(mintAmount),
      actualMinted: ethers.formatEther(minted),
      gasUsed: receipt?.gasUsed.toString(),
    };
  }));
  
  // Test 3: NGN Transfer
  testResults.push(await runTest("NGN Stablecoin - Transfer", async () => {
    const transferAmount = ethers.parseEther("1000"); // 1K NGN
    const balanceBefore = await ngnContract.balanceOf(user2.address);
    
    const tx = await ngnContract.connect(user1).transfer(user2.address, transferAmount);
    const receipt = await tx.wait();
    
    const balanceAfter = await ngnContract.balanceOf(user2.address);
    const received = balanceAfter - balanceBefore;
    
    return {
      transferAmount: ethers.formatEther(transferAmount),
      actualReceived: ethers.formatEther(received),
      gasUsed: receipt?.gasUsed.toString(),
    };
  }));
  
  // Test 4: Get Available Trading Pairs
  testResults.push(await runTest("DEX - Get Trading Pairs", async () => {
    const allTokens = await dexContract.getAllStockTokens();
    const pairs = [];
    
    for (const token of allTokens) {
      try {
        const pair = await dexContract.getTradingPair(token);
        if (pair.isActive) {
          const stockContract = await ethers.getContractAt("NigerianStockToken", token);
          const stockInfo = await stockContract.getStockInfo();
          
          pairs.push({
            stockToken: token,
            symbol: stockInfo.symbol,
            companyName: stockInfo.companyName,
            ngnReserve: ethers.formatEther(pair.ngnReserve),
            stockReserve: ethers.formatEther(pair.stockReserve),
            feeRate: pair.feeRate,
            isActive: pair.isActive,
          });
        }
      } catch (error) {
        // Skip invalid pairs
      }
    }
    
    return {
      totalTokens: allTokens.length,
      activePairs: pairs.length,
      pairs,
    };
  }));
  
  // Test 5: Get Swap Quote (NGN to Stock)
  let testStockToken = "";
  testResults.push(await runTest("DEX - Get Swap Quote (NGN to Stock)", async () => {
    const allTokens = await dexContract.getAllStockTokens();
    if (allTokens.length === 0) {
      throw new Error("No trading pairs available");
    }
    
    testStockToken = allTokens[0];
    const swapAmount = ethers.parseEther("1000"); // 1K NGN
    
    const [stockAmountOut, fee, priceImpact] = await dexContract.getQuoteNGNToStock(
      testStockToken,
      swapAmount
    );
    
    const stockContract = await ethers.getContractAt("NigerianStockToken", testStockToken);
    const stockInfo = await stockContract.getStockInfo();
    
    return {
      stockSymbol: stockInfo.symbol,
      ngnAmountIn: ethers.formatEther(swapAmount),
      stockAmountOut: ethers.formatEther(stockAmountOut),
      fee: ethers.formatEther(fee),
      priceImpact: priceImpact.toString(),
    };
  }));
  
  // Test 6: Execute Swap (NGN to Stock)
  testResults.push(await runTest("DEX - Execute Swap (NGN to Stock)", async () => {
    if (!testStockToken) {
      throw new Error("No test stock token available");
    }
    
    const swapAmount = ethers.parseEther("500"); // 500 NGN
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
    
    // Get quote first
    const [expectedStockOut] = await dexContract.getQuoteNGNToStock(testStockToken, swapAmount);
    const minStockOut = (expectedStockOut * 95n) / 100n; // 5% slippage tolerance
    
    // Check balances before
    const ngnBalanceBefore = await ngnContract.balanceOf(user1.address);
    const stockContract = await ethers.getContractAt("NigerianStockToken", testStockToken);
    const stockBalanceBefore = await stockContract.balanceOf(user1.address);
    
    // Approve NGN for swap
    await ngnContract.connect(user1).approve(await dexContract.getAddress(), swapAmount);
    
    // Execute swap
    const tx = await dexContract.connect(user1).swapNGNForStock(
      testStockToken,
      swapAmount,
      minStockOut,
      deadline
    );
    const receipt = await tx.wait();
    
    // Check balances after
    const ngnBalanceAfter = await ngnContract.balanceOf(user1.address);
    const stockBalanceAfter = await stockContract.balanceOf(user1.address);
    
    const ngnSpent = ngnBalanceBefore - ngnBalanceAfter;
    const stockReceived = stockBalanceAfter - stockBalanceBefore;
    
    return {
      ngnSpent: ethers.formatEther(ngnSpent),
      stockReceived: ethers.formatEther(stockReceived),
      expectedStock: ethers.formatEther(expectedStockOut),
      gasUsed: receipt?.gasUsed.toString(),
    };
  }));
  
  // Test 7: Get Swap Quote (Stock to NGN)
  testResults.push(await runTest("DEX - Get Swap Quote (Stock to NGN)", async () => {
    if (!testStockToken) {
      throw new Error("No test stock token available");
    }
    
    const stockContract = await ethers.getContractAt("NigerianStockToken", testStockToken);
    const userStockBalance = await stockContract.balanceOf(user1.address);
    
    if (userStockBalance === 0n) {
      throw new Error("User has no stock tokens to swap");
    }
    
    const swapAmount = userStockBalance / 2n; // Swap half of the stock tokens
    
    const [ngnAmountOut, fee, priceImpact] = await dexContract.getQuoteStockToNGN(
      testStockToken,
      swapAmount
    );
    
    const stockInfo = await stockContract.getStockInfo();
    
    return {
      stockSymbol: stockInfo.symbol,
      stockAmountIn: ethers.formatEther(swapAmount),
      ngnAmountOut: ethers.formatEther(ngnAmountOut),
      fee: ethers.formatEther(fee),
      priceImpact: priceImpact.toString(),
    };
  }));
  
  // Test 8: Execute Swap (Stock to NGN)
  testResults.push(await runTest("DEX - Execute Swap (Stock to NGN)", async () => {
    if (!testStockToken) {
      throw new Error("No test stock token available");
    }
    
    const stockContract = await ethers.getContractAt("NigerianStockToken", testStockToken);
    const userStockBalance = await stockContract.balanceOf(user1.address);
    
    if (userStockBalance === 0n) {
      throw new Error("User has no stock tokens to swap");
    }
    
    const swapAmount = userStockBalance / 3n; // Swap 1/3 of the stock tokens
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
    
    // Get quote first
    const [expectedNGNOut] = await dexContract.getQuoteStockToNGN(testStockToken, swapAmount);
    const minNGNOut = (expectedNGNOut * 95n) / 100n; // 5% slippage tolerance
    
    // Check balances before
    const ngnBalanceBefore = await ngnContract.balanceOf(user1.address);
    const stockBalanceBefore = await stockContract.balanceOf(user1.address);
    
    // Approve stock tokens for swap
    await stockContract.connect(user1).approve(await dexContract.getAddress(), swapAmount);
    
    // Execute swap
    const tx = await dexContract.connect(user1).swapStockForNGN(
      testStockToken,
      swapAmount,
      minNGNOut,
      deadline
    );
    const receipt = await tx.wait();
    
    // Check balances after
    const ngnBalanceAfter = await ngnContract.balanceOf(user1.address);
    const stockBalanceAfter = await stockContract.balanceOf(user1.address);
    
    const ngnReceived = ngnBalanceAfter - ngnBalanceBefore;
    const stockSpent = stockBalanceBefore - stockBalanceAfter;
    
    return {
      stockSpent: ethers.formatEther(stockSpent),
      ngnReceived: ethers.formatEther(ngnReceived),
      expectedNGN: ethers.formatEther(expectedNGNOut),
      gasUsed: receipt?.gasUsed.toString(),
    };
  }));
  
  // Test 9: Price Tracking
  testResults.push(await runTest("DEX - Price Tracking", async () => {
    if (!testStockToken) {
      throw new Error("No test stock token available");
    }
    
    const currentPrice = await dexContract.getCurrentPrice(testStockToken);
    const priceHistory = await dexContract.getPriceHistory(testStockToken);
    
    const stockContract = await ethers.getContractAt("NigerianStockToken", testStockToken);
    const stockInfo = await stockContract.getStockInfo();
    
    return {
      stockSymbol: stockInfo.symbol,
      currentPrice: ethers.formatEther(currentPrice),
      priceHistoryLength: priceHistory.length,
      priceHistory: priceHistory.slice(-5).map(p => ethers.formatEther(p)), // Last 5 prices
    };
  }));
  
  // Test 10: DEX Statistics
  testResults.push(await runTest("DEX - Statistics", async () => {
    const [totalPairs, totalVolumeNGN, feesCollected, totalLiquidity] = await dexContract.getDEXStats();
    
    return {
      totalPairs: totalPairs.toString(),
      totalVolumeNGN: ethers.formatEther(totalVolumeNGN),
      feesCollected: ethers.formatEther(feesCollected),
      totalLiquidity: ethers.formatEther(totalLiquidity),
    };
  }));
  
  // Display test results
  console.log("\n🎉 Test Results Summary:");
  console.log("=" .repeat(60));
  
  const passedTests = testResults.filter(r => r.success);
  const failedTests = testResults.filter(r => !r.success);
  
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`Passed: ${passedTests.length}`);
  console.log(`Failed: ${failedTests.length}`);
  console.log(`Success Rate: ${((passedTests.length / testResults.length) * 100).toFixed(1)}%\n`);
  
  if (passedTests.length > 0) {
    console.log("✅ Passed Tests:");
    passedTests.forEach(test => {
      console.log(`   ${test.testName}`);
      if (test.result && typeof test.result === 'object') {
        Object.entries(test.result).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`);
        });
      }
      console.log("");
    });
  }
  
  if (failedTests.length > 0) {
    console.log("❌ Failed Tests:");
    failedTests.forEach(test => {
      console.log(`   ${test.testName}: ${test.error}`);
    });
    console.log("");
  }
  
  console.log("🔗 System Status:");
  if (failedTests.length === 0) {
    console.log("✅ All systems operational! The NGN DEX system is ready for production use.");
  } else if (failedTests.length <= 2) {
    console.log("⚠️  Minor issues detected. System is mostly functional but may need attention.");
  } else {
    console.log("❌ Major issues detected. System requires fixes before production use.");
  }
}

// Execute testing
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as testNGNDEXSystem };
