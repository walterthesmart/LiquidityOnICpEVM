#!/usr/bin/env node

/**
 * Example Integration Script
 * 
 * Demonstrates how to integrate BFT minting utilities with your existing
 * Bitfinity EVM project for development and testing workflows.
 */

const { mintTokens, getBalance, toHexWei, fromHexWei } = require('./mint-bft-tokens');

// Example addresses (replace with your actual addresses)
const EXAMPLE_ADDRESSES = {
  deployer: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  user1: '0x8ba1f109551bD432803012645Hac136c30C6A043',
  user2: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  treasury: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2'
};

/**
 * Setup Development Environment
 * Mint test tokens to various addresses for development
 */
async function setupDevEnvironment() {
  console.log('🏗️  Setting up development environment...\n');
  
  const mintingPlan = [
    { address: EXAMPLE_ADDRESSES.deployer, amount: '1000', description: 'Deployer (admin operations)' },
    { address: EXAMPLE_ADDRESSES.user1, amount: '100', description: 'Test User 1 (trading)' },
    { address: EXAMPLE_ADDRESSES.user2, amount: '100', description: 'Test User 2 (trading)' },
    { address: EXAMPLE_ADDRESSES.treasury, amount: '10000', description: 'Treasury (liquidity)' }
  ];
  
  console.log('📋 Minting Plan:');
  mintingPlan.forEach((plan, index) => {
    console.log(`   ${index + 1}. ${plan.description}: ${plan.amount} BTF`);
    console.log(`      Address: ${plan.address}`);
  });
  
  console.log('\n⚠️  This is a demonstration. Replace addresses with your actual addresses.\n');
  
  // Uncomment the following lines to actually mint tokens
  /*
  for (const plan of mintingPlan) {
    try {
      console.log(`\n🪙 Minting ${plan.amount} BTF for ${plan.description}...`);
      await mintTokens({
        address: plan.address,
        amount: plan.amount,
        network: 'testnet'
      });
      console.log(`✅ Successfully minted tokens for ${plan.description}`);
    } catch (error) {
      console.error(`❌ Failed to mint for ${plan.description}: ${error.message}`);
    }
  }
  */
  
  console.log('💡 To execute the minting plan, uncomment the minting loop in the script.');
}

/**
 * Check All Balances
 * Verify balances across all development addresses
 */
async function checkAllBalances() {
  console.log('💰 Checking balances for all development addresses...\n');
  
  for (const [name, address] of Object.entries(EXAMPLE_ADDRESSES)) {
    try {
      console.log(`📊 ${name.toUpperCase()}:`);
      const balance = await getBalance('testnet', address);
      console.log(`   Address: ${address}`);
      console.log(`   Balance: ${balance.decimal} BTF`);
      console.log(`   Hex Wei: ${balance.hex}\n`);
    } catch (error) {
      console.error(`❌ Failed to get balance for ${name}: ${error.message}\n`);
    }
  }
}

/**
 * Demonstrate Hex Conversion Utilities
 */
function demonstrateHexConversion() {
  console.log('🔧 Hexadecimal Conversion Utilities\n');
  
  const amounts = ['1', '10', '100', '0.1', '0.001'];
  
  console.log('💡 Decimal to Hex Wei Conversion:');
  amounts.forEach(amount => {
    const hex = toHexWei(amount);
    console.log(`   ${amount.padStart(5)} BTF → ${hex}`);
  });
  
  console.log('\n💡 Hex Wei to Decimal Conversion:');
  const hexAmounts = ['0xde0b6b3a7640000', '0x8ac7230489e80000', '0x56bc75e2d63100000'];
  hexAmounts.forEach(hex => {
    const decimal = fromHexWei(hex);
    console.log(`   ${hex.padEnd(20)} → ${decimal} BTF`);
  });
}

/**
 * Generate Hardhat Script Template
 */
function generateHardhatScript() {
  console.log('📝 Hardhat Integration Script Template\n');
  
  const template = `
// scripts/setup-testnet.js
const { mintTokens } = require('./mint-bft-tokens');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Setting up testnet environment...");
  console.log("Deployer address:", deployer.address);
  
  // Mint test tokens for deployer
  await mintTokens({
    address: deployer.address,
    amount: '1000',
    network: 'testnet'
  });
  
  console.log("Testnet setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  
  console.log(template);
}

/**
 * Main Menu
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🚀 BFT Minting Integration Examples\n');
  
  switch (command) {
    case 'setup':
      await setupDevEnvironment();
      break;
      
    case 'balances':
      await checkAllBalances();
      break;
      
    case 'hex':
      demonstrateHexConversion();
      break;
      
    case 'hardhat':
      generateHardhatScript();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  setup     - Show development environment setup plan');
      console.log('  balances  - Check balances for all example addresses');
      console.log('  hex       - Demonstrate hex conversion utilities');
      console.log('  hardhat   - Generate Hardhat integration script');
      console.log('');
      console.log('Usage:');
      console.log('  node example-integration.js <command>');
      console.log('');
      console.log('Examples:');
      console.log('  node example-integration.js setup');
      console.log('  node example-integration.js balances');
      console.log('  node example-integration.js hex');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}
