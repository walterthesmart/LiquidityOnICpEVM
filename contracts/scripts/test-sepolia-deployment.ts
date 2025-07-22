import { ethers } from "hardhat";
import { expect } from "chai";
import fs from "fs";
import { resolve } from "path";

/**
 * Test script to validate Sepolia deployment
 * 
 * This script tests the deployed contracts on Sepolia testnet to ensure
 * they are working correctly and all expected tokens are deployed.
 */

interface DeploymentData {
  network: string;
  chainId: string;
  deployer: string;
  factoryAddress: string;
  deployedAt: string;
  totalTokens: number;
  tokens: Array<{
    symbol: string;
    name: string;
    companyName: string;
    address: string;
    maxSupply: string;
  }>;
}

async function loadDeploymentData(): Promise<DeploymentData> {
  const deploymentsDir = resolve(__dirname, "..", "deployments");
  const filename = "nigerian-stocks-sepolia-11155111.json";
  const filepath = resolve(deploymentsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    throw new Error(`Deployment file not found: ${filepath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  return data;
}

async function testFactoryContract(deploymentData: DeploymentData) {
  console.log("\n🏭 Testing Factory Contract...");
  
  const factory = await ethers.getContractAt("NigerianStockTokenFactory", deploymentData.factoryAddress);
  
  // Test 1: Check if factory has correct admin
  console.log("   Testing admin role...");
  const adminRole = await factory.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await factory.hasRole(adminRole, deploymentData.deployer);
  expect(hasAdminRole).to.be.true;
  console.log("   ✅ Admin role verified");
  
  // Test 2: Check deployed symbols count
  console.log("   Testing deployed tokens count...");
  const deployedSymbolsCount = await factory.getDeployedTokensCount();
  expect(deployedSymbolsCount).to.equal(BigInt(deploymentData.tokens.length));
  console.log(`   ✅ Deployed tokens count: ${deployedSymbolsCount}`);
  
  // Test 3: Check if factory is not paused
  console.log("   Testing factory pause state...");
  const isPaused = await factory.paused();
  expect(isPaused).to.be.false;
  console.log("   ✅ Factory is not paused");
  
  return factory;
}

async function testTokenContracts(deploymentData: DeploymentData, factory: any) {
  console.log("\n🪙 Testing Token Contracts...");
  
  for (let i = 0; i < deploymentData.tokens.length; i++) {
    const tokenData = deploymentData.tokens[i];
    console.log(`\n   [${i + 1}/${deploymentData.tokens.length}] Testing ${tokenData.symbol}...`);
    
    try {
      // Get token contract
      const token = await ethers.getContractAt("NigerianStockToken", tokenData.address);
      
      // Test 1: Check token name and symbol
      const name = await token.name();
      const symbol = await token.symbol();
      expect(name).to.equal(tokenData.name);
      expect(symbol).to.equal(tokenData.symbol);
      console.log(`      ✅ Name: ${name}, Symbol: ${symbol}`);
      
      // Test 2: Check stock metadata
      const stockInfo = await token.stockInfo();
      expect(stockInfo.symbol).to.equal(tokenData.symbol);
      expect(stockInfo.companyName).to.equal(tokenData.companyName);
      expect(stockInfo.isActive).to.be.true;
      console.log(`      ✅ Stock info verified: ${stockInfo.companyName}`);
      
      // Test 3: Check admin role
      const adminRole = await token.ADMIN_ROLE();
      const hasAdminRole = await token.hasRole(adminRole, deploymentData.deployer);
      expect(hasAdminRole).to.be.true;
      console.log(`      ✅ Admin role verified`);
      
      // Test 4: Check if token is registered in factory
      const factoryTokenAddress = await factory.stockTokens(tokenData.symbol);
      expect(factoryTokenAddress.toLowerCase()).to.equal(tokenData.address.toLowerCase());
      console.log(`      ✅ Registered in factory`);
      
      // Test 5: Check if token is valid in factory
      const isValidToken = await factory.isValidStockToken(tokenData.address);
      expect(isValidToken).to.be.true;
      console.log(`      ✅ Valid token in factory`);
      
    } catch (error) {
      console.error(`      ❌ Failed to test ${tokenData.symbol}:`, error);
      throw error;
    }
  }
}

async function testNetworkInfo() {
  console.log("\n🌐 Testing Network Information...");
  
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const gasPrice = await ethers.provider.getFeeData();
  
  console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei")} gwei`);
  
  // Verify we're on Sepolia
  expect(network.chainId).to.equal(11155111n);
  console.log("   ✅ Connected to Sepolia testnet");
}

async function testTokenInteractions(deploymentData: DeploymentData) {
  console.log("\n🔄 Testing Token Interactions...");
  
  if (deploymentData.tokens.length === 0) {
    console.log("   ⚠️  No tokens deployed, skipping interaction tests");
    return;
  }
  
  const tokenData = deploymentData.tokens[0]; // Test with first token
  const token = await ethers.getContractAt("NigerianStockToken", tokenData.address);
  const [deployer] = await ethers.getSigners();
  
  console.log(`   Testing interactions with ${tokenData.symbol}...`);
  
  // Test 1: Check initial supply
  const totalSupply = await token.totalSupply();
  console.log(`      Total supply: ${ethers.formatEther(totalSupply)} tokens`);
  
  // Test 2: Check deployer balance
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log(`      Deployer balance: ${ethers.formatEther(deployerBalance)} tokens`);
  
  // Test 3: Check allowance (should be 0 initially)
  const allowance = await token.allowance(deployer.address, deployer.address);
  expect(allowance).to.equal(0n);
  console.log(`      ✅ Allowance check passed`);
  
  // Test 4: Check decimals
  const decimals = await token.decimals();
  expect(decimals).to.equal(18);
  console.log(`      ✅ Decimals: ${decimals}`);
}

async function generateTestReport(deploymentData: DeploymentData, testResults: any) {
  console.log("\n📊 Generating Test Report...");
  
  const report = {
    testDate: new Date().toISOString(),
    network: {
      name: "Ethereum Sepolia Testnet",
      chainId: 11155111,
    },
    deployment: {
      factoryAddress: deploymentData.factoryAddress,
      deployer: deploymentData.deployer,
      deployedAt: deploymentData.deployedAt,
      totalTokens: deploymentData.totalTokens,
    },
    testResults: {
      factoryTests: "PASSED",
      tokenTests: "PASSED", 
      networkTests: "PASSED",
      interactionTests: "PASSED",
    },
    tokens: deploymentData.tokens.map(token => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      status: "VERIFIED",
    })),
    recommendations: [
      "All contracts deployed successfully",
      "Factory and tokens are properly configured",
      "Ready for frontend integration",
      "Consider running additional stress tests",
    ],
  };
  
  const reportPath = resolve(__dirname, "..", "test-reports", `sepolia-test-report-${Date.now()}.json`);
  const reportDir = resolve(__dirname, "..", "test-reports");
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`   📄 Test report saved: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log("🧪 Starting Sepolia Deployment Validation Tests");
  console.log("=".repeat(60));
  
  try {
    // Load deployment data
    console.log("📂 Loading deployment data...");
    const deploymentData = await loadDeploymentData();
    console.log(`   ✅ Loaded data for ${deploymentData.tokens.length} tokens`);
    
    // Test network connection
    await testNetworkInfo();
    
    // Test factory contract
    const factory = await testFactoryContract(deploymentData);
    
    // Test individual token contracts
    await testTokenContracts(deploymentData, factory);
    
    // Test token interactions
    await testTokenInteractions(deploymentData);
    
    // Generate test report
    const testResults = await generateTestReport(deploymentData, {});
    
    console.log("\n🎉 All Tests Passed Successfully!");
    console.log("=".repeat(60));
    console.log("📋 Summary:");
    console.log(`   Factory Address: ${deploymentData.factoryAddress}`);
    console.log(`   Tokens Deployed: ${deploymentData.tokens.length}`);
    console.log(`   All Contracts Verified: ✅`);
    console.log(`   Network: Sepolia (${deploymentData.chainId})`);
    console.log(`   Block Explorer: https://sepolia.etherscan.io/address/${deploymentData.factoryAddress}`);
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    console.log("\n🔍 Troubleshooting Tips:");
    console.log("   1. Make sure contracts are deployed to Sepolia");
    console.log("   2. Check that deployment file exists");
    console.log("   3. Verify network connection to Sepolia");
    console.log("   4. Ensure sufficient ETH balance for gas");
    
    process.exitCode = 1;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { main as testSepoliaDeployment };
