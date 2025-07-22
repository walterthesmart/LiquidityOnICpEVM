#!/usr/bin/env node

/**
 * Frontend Integration Test Script
 * 
 * This script validates the frontend integration with all 39 deployed
 * Nigerian Stock Exchange tokens on Sepolia testnet.
 * 
 * Usage:
 *   node scripts/test-frontend-integration.js
 *   node scripts/test-frontend-integration.js --verbose
 * 
 * Requirements:
 *   - Node.js 16+
 *   - Deployed contracts on Sepolia
 *   - Frontend configuration files
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Test configuration
const TEST_CONFIG = {
  expectedTokenCount: 39,
  expectedChainId: 11155111,
  expectedFactoryAddress: '0xF1098eDaaB7a7D7b3bD42e7DeD9554781dfA625A',
  frontendConfigPath: '../front-end/src/config/sepolia-contracts.json',
  abiPath: '../front-end/src/abis',
  bitfinityConfigPath: '../front-end/src/lib/bitfinity-config.ts',
  deploymentPath: '../contracts/deployments/nigerian-stocks-sepolia-11155111.json',
};

/**
 * Test Results Tracking
 */
class FrontendTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      if (result === 'warning') {
        this.results.warnings++;
        this.results.tests.push({ name, status: 'WARNING' });
        console.log(`   ⚠️  WARNING: ${name}`);
      } else {
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASSED' });
        console.log(`   ✅ PASSED: ${name}`);
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`   ❌ FAILED: ${name} - ${error.message}`);
    }
  }

  printSummary() {
    console.log(`\n📊 Frontend Integration Test Summary:`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Warnings: ${this.results.warnings}`);
    console.log(`   Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
    }
    
    if (this.results.warnings > 0) {
      console.log(`\n⚠️  Warnings:`);
      this.results.tests
        .filter(test => test.status === 'WARNING')
        .forEach(test => console.log(`   - ${test.name}`));
    }
    
    return this.results.failed === 0;
  }
}

/**
 * Test Functions
 */

async function testDeploymentFile(runner) {
  await runner.runTest('Deployment File Exists', () => {
    const deploymentPath = path.resolve(__dirname, TEST_CONFIG.deploymentPath);
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment file not found: ${deploymentPath}`);
    }
  });

  await runner.runTest('Deployment File Content', () => {
    const deploymentPath = path.resolve(__dirname, TEST_CONFIG.deploymentPath);
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    if (deployment.chainId !== TEST_CONFIG.expectedChainId.toString()) {
      throw new Error(`Expected chain ID ${TEST_CONFIG.expectedChainId}, got ${deployment.chainId}`);
    }
    
    if (deployment.factoryAddress !== TEST_CONFIG.expectedFactoryAddress) {
      throw new Error(`Expected factory address ${TEST_CONFIG.expectedFactoryAddress}, got ${deployment.factoryAddress}`);
    }
    
    if (deployment.totalTokens !== TEST_CONFIG.expectedTokenCount) {
      throw new Error(`Expected ${TEST_CONFIG.expectedTokenCount} tokens, got ${deployment.totalTokens}`);
    }
    
    if (!deployment.tokens || deployment.tokens.length !== TEST_CONFIG.expectedTokenCount) {
      throw new Error(`Expected ${TEST_CONFIG.expectedTokenCount} token entries, got ${deployment.tokens?.length || 0}`);
    }
  });
}

async function testFrontendConfig(runner) {
  await runner.runTest('Frontend Config File Exists', () => {
    const configPath = path.resolve(__dirname, TEST_CONFIG.frontendConfigPath);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Frontend config file not found: ${configPath}`);
    }
  });

  await runner.runTest('Frontend Config Content', () => {
    const configPath = path.resolve(__dirname, TEST_CONFIG.frontendConfigPath);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (config.chainId !== TEST_CONFIG.expectedChainId) {
      throw new Error(`Expected chain ID ${TEST_CONFIG.expectedChainId}, got ${config.chainId}`);
    }
    
    if (config.factoryAddress !== TEST_CONFIG.expectedFactoryAddress) {
      throw new Error(`Expected factory address ${TEST_CONFIG.expectedFactoryAddress}, got ${config.factoryAddress}`);
    }
    
    if (!config.tokens || Object.keys(config.tokens).length !== TEST_CONFIG.expectedTokenCount) {
      throw new Error(`Expected ${TEST_CONFIG.expectedTokenCount} tokens, got ${Object.keys(config.tokens || {}).length}`);
    }
    
    // Validate token addresses
    Object.entries(config.tokens).forEach(([symbol, address]) => {
      if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
        throw new Error(`Invalid token address for ${symbol}: ${address}`);
      }
    });
  });
}

async function testABIFiles(runner) {
  await runner.runTest('ABI Directory Exists', () => {
    const abiPath = path.resolve(__dirname, TEST_CONFIG.abiPath);
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI directory not found: ${abiPath}`);
    }
  });

  await runner.runTest('Factory ABI File', () => {
    const factoryAbiPath = path.resolve(__dirname, TEST_CONFIG.abiPath, 'NigerianStockTokenFactory.json');
    if (!fs.existsSync(factoryAbiPath)) {
      throw new Error(`Factory ABI file not found: ${factoryAbiPath}`);
    }
    
    const abi = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));
    if (!abi.abi || !Array.isArray(abi.abi)) {
      throw new Error('Invalid factory ABI structure');
    }
  });

  await runner.runTest('Token ABI File', () => {
    const tokenAbiPath = path.resolve(__dirname, TEST_CONFIG.abiPath, 'NigerianStockToken.json');
    if (!fs.existsSync(tokenAbiPath)) {
      throw new Error(`Token ABI file not found: ${tokenAbiPath}`);
    }
    
    const abi = JSON.parse(fs.readFileSync(tokenAbiPath, 'utf8'));
    if (!abi.abi || !Array.isArray(abi.abi)) {
      throw new Error('Invalid token ABI structure');
    }
  });

  await runner.runTest('ABI Index File', () => {
    const indexPath = path.resolve(__dirname, TEST_CONFIG.abiPath, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`ABI index file not found: ${indexPath}`);
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    if (!content.includes('NigerianStockTokenFactoryABI') || !content.includes('NigerianStockTokenABI')) {
      throw new Error('ABI index file missing required exports');
    }
  });
}

async function testBitfinityConfig(runner) {
  await runner.runTest('Bitfinity Config File', () => {
    const configPath = path.resolve(__dirname, TEST_CONFIG.bitfinityConfigPath);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Bitfinity config file not found: ${configPath}`);
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for Sepolia configuration
    if (!content.includes('11155111')) {
      throw new Error('Sepolia chain ID not found in bitfinity config');
    }
    
    if (!content.includes(TEST_CONFIG.expectedFactoryAddress)) {
      throw new Error('Sepolia factory address not found in bitfinity config');
    }
    
    // Check for some key token symbols
    const keyTokens = ['DANGCEM', 'MTNN', 'ZENITHBANK', 'GTCO', 'ACCESS'];
    keyTokens.forEach(token => {
      if (!content.includes(token)) {
        throw new Error(`Token ${token} not found in bitfinity config`);
      }
    });
  });
}

async function testDataConsistency(runner) {
  await runner.runTest('Deployment vs Frontend Config Consistency', () => {
    const deploymentPath = path.resolve(__dirname, TEST_CONFIG.deploymentPath);
    const configPath = path.resolve(__dirname, TEST_CONFIG.frontendConfigPath);
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Check factory address consistency
    if (deployment.factoryAddress !== config.factoryAddress) {
      throw new Error('Factory address mismatch between deployment and frontend config');
    }
    
    // Check token count consistency
    if (deployment.tokens.length !== Object.keys(config.tokens).length) {
      throw new Error('Token count mismatch between deployment and frontend config');
    }
    
    // Check token address consistency
    deployment.tokens.forEach(token => {
      if (config.tokens[token.symbol] !== token.address) {
        throw new Error(`Token address mismatch for ${token.symbol}`);
      }
    });
  });
}

async function testTokenCoverage(runner) {
  await runner.runTest('All Expected Tokens Present', () => {
    const configPath = path.resolve(__dirname, TEST_CONFIG.frontendConfigPath);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const expectedTokens = [
      'DANGCEM', 'MTNN', 'ZENITHBANK', 'GTCO', 'NB', 'ACCESS', 'BUACEMENT',
      'AIRTELAFRI', 'FBNH', 'UBA', 'NESTLE', 'SEPLAT', 'STANBIC', 'OANDO',
      'LAFARGE', 'CONOIL', 'WAPCO', 'FLOURMILL', 'PRESCO', 'CADBURY',
      'GUINNESS', 'INTBREW', 'CHAMPION', 'UNILEVER', 'TRANSCORP', 'BUAFOODS',
      'DANGSUGAR', 'UACN', 'PZ', 'TOTAL', 'ETERNA', 'GEREGU', 'TRANSPOWER',
      'FIDSON', 'MAYBAKER', 'OKOMUOIL', 'LIVESTOCK', 'CWG', 'TRANSCOHOT'
    ];
    
    const missingTokens = expectedTokens.filter(token => !config.tokens[token]);
    if (missingTokens.length > 0) {
      throw new Error(`Missing tokens: ${missingTokens.join(', ')}`);
    }
    
    const extraTokens = Object.keys(config.tokens).filter(token => !expectedTokens.includes(token));
    if (extraTokens.length > 0) {
      console.log(`   ℹ️  Extra tokens found: ${extraTokens.join(', ')}`);
      return 'warning';
    }
  });
}

/**
 * Main Test Runner
 */
async function runFrontendIntegrationTests(options) {
  const { verbose } = options;
  
  console.log(`\n🚀 Frontend Integration Test Suite`);
  console.log(`=`.repeat(60));
  console.log(`Testing integration of ${TEST_CONFIG.expectedTokenCount} Nigerian Stock Exchange tokens`);
  console.log(`Expected Factory: ${TEST_CONFIG.expectedFactoryAddress}`);
  console.log(`Expected Chain ID: ${TEST_CONFIG.expectedChainId}`);
  console.log(`=`.repeat(60));

  const runner = new FrontendTestRunner();

  try {
    // Test deployment files
    console.log(`\n📂 Testing Deployment Files`);
    await testDeploymentFile(runner);
    
    // Test frontend configuration
    console.log(`\n🎨 Testing Frontend Configuration`);
    await testFrontendConfig(runner);
    
    // Test ABI files
    console.log(`\n📋 Testing ABI Files`);
    await testABIFiles(runner);
    
    // Test bitfinity config
    console.log(`\n⚙️  Testing Bitfinity Config`);
    await testBitfinityConfig(runner);
    
    // Test data consistency
    console.log(`\n🔄 Testing Data Consistency`);
    await testDataConsistency(runner);
    
    // Test token coverage
    console.log(`\n🪙 Testing Token Coverage`);
    await testTokenCoverage(runner);

    // Print results
    const success = runner.printSummary();
    
    if (success) {
      console.log(`\n🎉 All frontend integration tests passed!`);
      console.log(`\n📋 Integration Status:`);
      console.log(`   ✅ All ${TEST_CONFIG.expectedTokenCount} tokens properly integrated`);
      console.log(`   ✅ Frontend configuration files generated`);
      console.log(`   ✅ Contract ABIs properly imported`);
      console.log(`   ✅ Multi-network support configured`);
      console.log(`   ✅ Data consistency validated`);
      
      console.log(`\n🚀 Ready for frontend testing!`);
      console.log(`   Visit: http://localhost:3000/test-integration`);
      console.log(`   Or run: npm run dev (in front-end directory)`);
    } else {
      console.log(`\n❌ Some integration tests failed. Please review and fix issues.`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n💥 Test suite failed with error:`, error);
    process.exit(1);
  }
}

/**
 * CLI Setup
 */
program
  .name('test-frontend-integration')
  .description('Frontend integration test suite for Nigerian Stock Exchange tokens')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (options) => {
    await runFrontendIntegrationTests(options);
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
if (require.main === module) {
  program.parse();
}

module.exports = {
  runFrontendIntegrationTests,
  FrontendTestRunner,
  TEST_CONFIG
};
