import { ethers } from "hardhat";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Test script to verify unified deployment results
 *
 * This script:
 * 1. Loads the latest deployment results
 * 2. Verifies all contracts are deployed and working
 * 3. Tests basic functionality
 * 4. Validates ABI transfer
 */

interface DeploymentResult {
  network: {
    name: string;
    chainId: number;
  };
  deployer: string;
  contracts: {
    ngnStablecoin?: { address: string };
    stockFactory?: { address: string };
    stockNGNDEX?: { address: string };
    tradingPairManager?: { address: string };
  };
  stockTokens: Array<{
    symbol: string;
    address: string;
  }>;
}

async function testDeployment(): Promise<void> {
  console.log("🧪 Testing Unified Deployment Results...\n");

  // Get current network
  const network = await ethers.provider.getNetwork();
  const networkName = network.name.toLowerCase().replace(/\s+/g, "-");

  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Load deployment results
  const deploymentFile = resolve(__dirname, "../deployments", `${networkName}-latest.json`);

  if (!existsSync(deploymentFile)) {
    console.error(`❌ No deployment file found: ${deploymentFile}`);
    console.log("   Please run the unified deployment script first.");
    process.exit(1);
  }

  const deploymentResult: DeploymentResult = JSON.parse(readFileSync(deploymentFile, "utf8"));
  console.log(`📄 Loaded deployment from: ${deploymentFile}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: NGN Stablecoin
  if (deploymentResult.contracts.ngnStablecoin) {
    console.log("🧪 Testing NGN Stablecoin...");
    try {
      const ngnContract = await ethers.getContractAt(
        "NGNStablecoin",
        deploymentResult.contracts.ngnStablecoin.address
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        ngnContract.name(),
        ngnContract.symbol(),
        ngnContract.decimals(),
        ngnContract.totalSupply(),
      ]);

      console.log(`   ✅ Name: ${name}`);
      console.log(`   ✅ Symbol: ${symbol}`);
      console.log(`   ✅ Decimals: ${decimals}`);
      console.log(`   ✅ Total Supply: ${ethers.formatEther(totalSupply)} NGN`);
      testsPassed++;
    } catch (error) {
      console.error(`   ❌ NGN Stablecoin test failed: ${error}`);
      testsFailed++;
    }
  } else {
    console.log("⏭️  Skipping NGN Stablecoin test (not deployed)");
  }

  // Test 2: Stock Factory
  if (deploymentResult.contracts.stockFactory) {
    console.log("\n🧪 Testing Stock Factory...");
    try {
      const factoryContract = await ethers.getContractAt(
        "NigerianStockTokenFactory",
        deploymentResult.contracts.stockFactory.address
      );

      const totalTokens = await factoryContract.totalDeployedTokens();
      console.log(`   ✅ Total Deployed Tokens: ${totalTokens}`);
      testsPassed++;
    } catch (error) {
      console.error(`   ❌ Stock Factory test failed: ${error}`);
      testsFailed++;
    }
  } else {
    console.log("\n⏭️  Skipping Stock Factory test (not deployed)");
  }

  // Test 3: StockNGNDEX
  if (deploymentResult.contracts.stockNGNDEX) {
    console.log("\n🧪 Testing StockNGNDEX...");
    try {
      const dexContract = await ethers.getContractAt(
        "StockNGNDEX",
        deploymentResult.contracts.stockNGNDEX.address
      );

      const ngnToken = await dexContract.ngnToken();
      console.log(`   ✅ NGN Token Address: ${ngnToken}`);

      if (deploymentResult.contracts.ngnStablecoin) {
        const expectedNGN = deploymentResult.contracts.ngnStablecoin.address;
        if (ngnToken.toLowerCase() === expectedNGN.toLowerCase()) {
          console.log(`   ✅ NGN Token correctly linked`);
        } else {
          console.error(`   ❌ NGN Token mismatch: expected ${expectedNGN}, got ${ngnToken}`);
          testsFailed++;
          return;
        }
      }
      testsPassed++;
    } catch (error) {
      console.error(`   ❌ StockNGNDEX test failed: ${error}`);
      testsFailed++;
    }
  } else {
    console.log("\n⏭️  Skipping StockNGNDEX test (not deployed)");
  }

  // Test 4: TradingPairManager
  if (deploymentResult.contracts.tradingPairManager) {
    console.log("\n🧪 Testing TradingPairManager...");
    try {
      const managerContract = await ethers.getContractAt(
        "TradingPairManager",
        deploymentResult.contracts.tradingPairManager.address
      );

      const [ngnToken, dexContract] = await Promise.all([
        managerContract.ngnToken(),
        managerContract.dexContract(),
      ]);

      console.log(`   ✅ NGN Token: ${ngnToken}`);
      console.log(`   ✅ DEX Contract: ${dexContract}`);

      // Verify links are correct
      if (
        deploymentResult.contracts.ngnStablecoin &&
        ngnToken.toLowerCase() === deploymentResult.contracts.ngnStablecoin.address.toLowerCase()
      ) {
        console.log(`   ✅ NGN Token correctly linked`);
      }

      if (
        deploymentResult.contracts.stockNGNDEX &&
        dexContract.toLowerCase() === deploymentResult.contracts.stockNGNDEX.address.toLowerCase()
      ) {
        console.log(`   ✅ DEX Contract correctly linked`);
      }

      testsPassed++;
    } catch (error) {
      console.error(`   ❌ TradingPairManager test failed: ${error}`);
      testsFailed++;
    }
  } else {
    console.log("\n⏭️  Skipping TradingPairManager test (not deployed)");
  }

  // Test 5: Stock Tokens
  if (deploymentResult.stockTokens.length > 0) {
    console.log("\n🧪 Testing Stock Tokens...");
    for (const token of deploymentResult.stockTokens) {
      try {
        const tokenContract = await ethers.getContractAt("NigerianStockToken", token.address);

        const [name, symbol] = await Promise.all([tokenContract.name(), tokenContract.symbol()]);

        console.log(`   ✅ ${symbol}: ${name} at ${token.address}`);
      } catch (error) {
        console.error(`   ❌ ${token.symbol} test failed: ${error}`);
        testsFailed++;
        continue;
      }
    }
    testsPassed++;
  } else {
    console.log("\n⏭️  Skipping Stock Tokens test (none deployed)");
  }

  // Test 6: ABI Transfer
  console.log("\n🧪 Testing ABI Transfer...");
  const frontendABIDir = resolve(__dirname, "../../front-end/src/abis");
  const requiredABIs = [
    "NGNStablecoin.json",
    "NigerianStockTokenFactory.json",
    "NigerianStockToken.json",
    "StockNGNDEX.json",
    "TradingPairManager.json",
  ];

  let abisFound = 0;
  for (const abiFile of requiredABIs) {
    const abiPath = resolve(frontendABIDir, abiFile);
    if (existsSync(abiPath)) {
      console.log(`   ✅ ${abiFile} found`);
      abisFound++;
    } else {
      console.log(`   ⚠️  ${abiFile} not found`);
    }
  }

  if (abisFound === requiredABIs.length) {
    console.log(`   ✅ All ABIs transferred successfully`);
    testsPassed++;
  } else {
    console.log(`   ⚠️  ${abisFound}/${requiredABIs.length} ABIs found`);
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("🧪 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);

  if (testsFailed === 0) {
    console.log("\n🎉 All tests passed! Deployment is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the deployment.");
  }

  console.log("\n🔗 Next Steps:");
  console.log("1. Update front-end configuration with contract addresses");
  console.log("2. Create trading pairs for stock tokens");
  console.log("3. Add initial liquidity");
  console.log("4. Test the full trading flow");
}

// Execute tests
if (require.main === module) {
  testDeployment()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

export { testDeployment };
