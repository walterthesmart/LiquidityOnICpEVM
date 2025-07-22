#!/usr/bin/env node

/**
 * Integration Test Suite
 * 
 * Comprehensive test suite to validate the multi-network integration
 * including Bitfinity EVM and Ethereum Sepolia support.
 * 
 * Usage:
 *   node scripts/test-integration.js
 *   node scripts/test-integration.js --network sepolia
 *   node scripts/test-integration.js --full-test
 * 
 * Requirements:
 *   - Node.js 16+
 *   - Deployed contracts on target networks
 *   - Test addresses with sufficient balances
 */

const { program } = require('commander');
const { 
  getBalance, 
  isValidAddress, 
  NETWORKS 
} = require('./mint-bft-tokens');
const { 
  getSepoliaBalance, 
  getNetworkInfo, 
  checkDeploymentReadiness,
  SEPOLIA_CONFIG 
} = require('./sepolia-eth-utils');

// Test configuration
const TEST_CONFIG = {
  testAddresses: [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat default account 0
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat default account 1
  ],
  networks: ['bitfinity_testnet', 'sepolia'],
  requiredBalances: {
    bitfinity_testnet: 1.0, // 1 BTF minimum
    sepolia: 0.05, // 0.05 ETH minimum
  }
};

/**
 * Test Results Tracking
 */
class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Running: ${name}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      console.log(`   ✅ PASSED: ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`   ❌ FAILED: ${name} - ${error.message}`);
    }
  }

  skipTest(name, reason) {
    this.results.skipped++;
    this.results.tests.push({ name, status: 'SKIPPED', reason });
    console.log(`   ⏭️  SKIPPED: ${name} - ${reason}`);
  }

  printSummary() {
    console.log(`\n📊 Test Summary:`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Skipped: ${this.results.skipped}`);
    console.log(`   Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
    }
    
    return this.results.failed === 0;
  }
}

/**
 * Network Connectivity Tests
 */
async function testNetworkConnectivity(runner) {
  console.log(`\n🌐 Network Connectivity Tests`);
  console.log(`=`.repeat(40));

  // Test Bitfinity Testnet
  await runner.runTest('Bitfinity Testnet Connectivity', async () => {
    const testAddress = TEST_CONFIG.testAddresses[0];
    const balance = await getBalance('bitfinity_testnet', testAddress);
    if (!balance || !balance.decimal) {
      throw new Error('Failed to get balance from Bitfinity testnet');
    }
  });

  // Test Sepolia Connectivity
  await runner.runTest('Sepolia Testnet Connectivity', async () => {
    const testAddress = TEST_CONFIG.testAddresses[0];
    const balance = await getSepoliaBalance(testAddress);
    if (!balance || !balance.decimal) {
      throw new Error('Failed to get balance from Sepolia testnet');
    }
  });

  // Test Network Info
  await runner.runTest('Sepolia Network Info', async () => {
    const networkInfo = await getNetworkInfo();
    if (!networkInfo || !networkInfo.chainId) {
      throw new Error('Failed to get Sepolia network information');
    }
  });
}

/**
 * Address Validation Tests
 */
async function testAddressValidation(runner) {
  console.log(`\n🔍 Address Validation Tests`);
  console.log(`=`.repeat(40));

  await runner.runTest('Valid Address Check', async () => {
    const validAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    if (!isValidAddress(validAddress)) {
      throw new Error('Valid address failed validation');
    }
  });

  await runner.runTest('Invalid Address Check', async () => {
    const invalidAddress = '0xinvalid';
    if (isValidAddress(invalidAddress)) {
      throw new Error('Invalid address passed validation');
    }
  });

  await runner.runTest('Empty Address Check', async () => {
    if (isValidAddress('')) {
      throw new Error('Empty address passed validation');
    }
  });
}

/**
 * Balance Tests
 */
async function testBalances(runner, targetNetwork = null) {
  console.log(`\n💰 Balance Tests`);
  console.log(`=`.repeat(40));

  const networksToTest = targetNetwork ? [targetNetwork] : TEST_CONFIG.networks;

  for (const network of networksToTest) {
    for (const address of TEST_CONFIG.testAddresses) {
      await runner.runTest(`${network} Balance Check - ${address.slice(0, 8)}...`, async () => {
        let balance;
        
        if (network === 'sepolia') {
          balance = await getSepoliaBalance(address);
        } else {
          balance = await getBalance(network, address);
        }
        
        if (!balance || balance.decimal === undefined) {
          throw new Error(`Failed to get balance for ${address} on ${network}`);
        }
        
        const balanceNum = parseFloat(balance.decimal);
        const required = TEST_CONFIG.requiredBalances[network] || 0;
        
        if (balanceNum < required) {
          console.log(`   ⚠️  Low balance: ${balance.decimal} ${NETWORKS[network]?.currency || 'ETH'} (required: ${required})`);
        }
      });
    }
  }
}

/**
 * Deployment Readiness Tests
 */
async function testDeploymentReadiness(runner, targetNetwork = null) {
  console.log(`\n🚀 Deployment Readiness Tests`);
  console.log(`=`.repeat(40));

  const networksToTest = targetNetwork ? [targetNetwork] : TEST_CONFIG.networks;

  for (const network of networksToTest) {
    const testAddress = TEST_CONFIG.testAddresses[0];
    
    if (network === 'sepolia') {
      await runner.runTest(`Sepolia Deployment Readiness`, async () => {
        const isReady = await checkDeploymentReadiness(testAddress, 0.05);
        if (!isReady) {
          throw new Error('Insufficient Sepolia ETH for deployment');
        }
      });
    } else {
      await runner.runTest(`${network} Deployment Readiness`, async () => {
        const balance = await getBalance(network, testAddress);
        const balanceNum = parseFloat(balance.decimal);
        const required = TEST_CONFIG.requiredBalances[network] || 1.0;
        
        if (balanceNum < required) {
          throw new Error(`Insufficient ${NETWORKS[network]?.currency} for deployment: ${balanceNum} < ${required}`);
        }
      });
    }
  }
}

/**
 * Configuration Tests
 */
async function testConfiguration(runner) {
  console.log(`\n⚙️  Configuration Tests`);
  console.log(`=`.repeat(40));

  await runner.runTest('Network Configuration', async () => {
    const requiredNetworks = ['bitfinity_testnet', 'sepolia'];
    
    for (const network of requiredNetworks) {
      if (network === 'sepolia') {
        if (!SEPOLIA_CONFIG || !SEPOLIA_CONFIG.chainId) {
          throw new Error(`Sepolia configuration missing`);
        }
      } else {
        if (!NETWORKS[network] || !NETWORKS[network].chainId) {
          throw new Error(`Network configuration missing for ${network}`);
        }
      }
    }
  });

  await runner.runTest('Test Addresses Configuration', async () => {
    if (TEST_CONFIG.testAddresses.length === 0) {
      throw new Error('No test addresses configured');
    }
    
    for (const address of TEST_CONFIG.testAddresses) {
      if (!isValidAddress(address)) {
        throw new Error(`Invalid test address: ${address}`);
      }
    }
  });
}

/**
 * Faucet Information Tests
 */
async function testFaucetInfo(runner) {
  console.log(`\n💧 Faucet Information Tests`);
  console.log(`=`.repeat(40));

  await runner.runTest('Sepolia Faucet Info', async () => {
    if (!SEPOLIA_CONFIG.faucets || SEPOLIA_CONFIG.faucets.length === 0) {
      throw new Error('No Sepolia faucet information configured');
    }
    
    for (const faucet of SEPOLIA_CONFIG.faucets) {
      if (!faucet.name || !faucet.url) {
        throw new Error('Incomplete faucet information');
      }
    }
  });
}

/**
 * Main Test Runner
 */
async function runIntegrationTests(options) {
  const { network, fullTest } = options;
  
  console.log(`\n🚀 Multi-Network Integration Test Suite`);
  console.log(`=`.repeat(60));
  console.log(`Target Network: ${network || 'All supported networks'}`);
  console.log(`Full Test Mode: ${fullTest ? 'Enabled' : 'Disabled'}`);
  console.log(`=`.repeat(60));

  const runner = new TestRunner();

  try {
    // Core tests (always run)
    await testConfiguration(runner);
    await testAddressValidation(runner);
    await testNetworkConnectivity(runner);
    await testBalances(runner, network);
    
    // Extended tests
    if (fullTest) {
      await testDeploymentReadiness(runner, network);
      await testFaucetInfo(runner);
    }

    // Print results
    const success = runner.printSummary();
    
    if (success) {
      console.log(`\n🎉 All tests passed! Integration is working correctly.`);
      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Deploy contracts using deployment scripts`);
      console.log(`   2. Test frontend network switching`);
      console.log(`   3. Validate contract interactions`);
    } else {
      console.log(`\n❌ Some tests failed. Please review and fix issues before proceeding.`);
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
  .name('test-integration')
  .description('Multi-network integration test suite')
  .version('1.0.0')
  .option('-n, --network <network>', 'Target specific network (bitfinity_testnet|sepolia)')
  .option('--full-test', 'Run full test suite including deployment readiness')
  .action(async (options) => {
    await runIntegrationTests(options);
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
  runIntegrationTests,
  TestRunner,
  TEST_CONFIG
};
