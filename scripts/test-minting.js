#!/usr/bin/env node

/**
 * BFT Minting Test Suite
 * 
 * Test script to validate the minting functionality and utilities
 */

const { 
  toHexWei, 
  fromHexWei, 
  isValidAddress, 
  getBalance, 
  NETWORKS 
} = require('./mint-bft-tokens');

// Test configuration
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
const INVALID_ADDRESS = '0x123';
const TEST_AMOUNTS = ['1', '10', '100', '0.5', '0.001'];

console.log('🧪 BFT Minting Utility Test Suite');
console.log('==================================\n');

// Test 1: Hexadecimal conversion functions
console.log('📝 Test 1: Hexadecimal Conversion Functions');
console.log('--------------------------------------------');

let testsPassed = 0;
let totalTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`   ✅ ${testName}`);
      testsPassed++;
    } else {
      console.log(`   ❌ ${testName}`);
    }
  } catch (error) {
    console.log(`   ❌ ${testName}: ${error.message}`);
  }
}

// Test decimal to hex conversion
TEST_AMOUNTS.forEach(amount => {
  runTest(`toHexWei(${amount})`, () => {
    const hex = toHexWei(amount);
    const backToDecimal = fromHexWei(hex);
    const diff = Math.abs(parseFloat(amount) - parseFloat(backToDecimal));
    
    console.log(`     ${amount} → ${hex} → ${backToDecimal}`);
    return diff < 0.000001; // Allow for small floating point errors
  });
});

// Test 2: Address validation
console.log('\n📝 Test 2: Address Validation');
console.log('------------------------------');

runTest('Valid address validation', () => {
  return isValidAddress(TEST_ADDRESS);
});

runTest('Invalid address rejection', () => {
  return !isValidAddress(INVALID_ADDRESS);
});

runTest('Empty address rejection', () => {
  return !isValidAddress('');
});

runTest('Non-hex address rejection', () => {
  return !isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG');
});

// Test 3: Network configuration
console.log('\n📝 Test 3: Network Configuration');
console.log('---------------------------------');

runTest('Testnet configuration exists', () => {
  const testnet = NETWORKS.testnet;
  return testnet && 
         testnet.chainId === 355113 && 
         testnet.rpcUrl === 'https://testnet.bitfinity.network' &&
         testnet.currency === 'BTF';
});

runTest('Mainnet configuration exists', () => {
  const mainnet = NETWORKS.mainnet;
  return mainnet && 
         mainnet.chainId === 355110 && 
         mainnet.rpcUrl === 'https://mainnet.bitfinity.network' &&
         mainnet.currency === 'BTF';
});

// Test 4: Edge cases
console.log('\n📝 Test 4: Edge Cases');
console.log('----------------------');

runTest('Very small amount conversion', () => {
  const smallAmount = '0.000000000000000001'; // 1 wei
  const hex = toHexWei(smallAmount);
  return hex === '0x1';
});

runTest('Large amount conversion', () => {
  const largeAmount = '1000000'; // 1 million tokens
  const hex = toHexWei(largeAmount);
  const backToDecimal = fromHexWei(hex);
  const diff = Math.abs(parseFloat(largeAmount) - parseFloat(backToDecimal));
  return diff < 0.000001;
});

runTest('Zero amount conversion', () => {
  const hex = toHexWei('0');
  return hex === '0x0';
});

// Test 5: Utility functions
console.log('\n📝 Test 5: Utility Functions');
console.log('-----------------------------');

runTest('Hex wei parsing (0x0)', () => {
  return fromHexWei('0x0') === '0.000000';
});

runTest('Hex wei parsing (0x1)', () => {
  return fromHexWei('0x1') === '0.000000';
});

runTest('Hex wei parsing (0xde0b6b3a7640000)', () => {
  // This is 1 ETH in wei
  const result = fromHexWei('0xde0b6b3a7640000');
  return parseFloat(result) === 1.0;
});

// Test 6: Mock balance check (dry run)
console.log('\n📝 Test 6: Mock Network Operations');
console.log('-----------------------------------');

console.log('   ℹ️  Skipping live network tests (would require actual network access)');
console.log('   ℹ️  To test live functionality, run:');
console.log('      node balance-checker.js --address 0x... --network testnet');
console.log('      node mint-bft-tokens.js --address 0x... --amount 1 --dry-run');

// Test Summary
console.log('\n📊 Test Summary');
console.log('===============');
console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
console.log(`Success Rate: ${((testsPassed/totalTests) * 100).toFixed(1)}%`);

if (testsPassed === totalTests) {
  console.log('🎉 All tests passed! The minting utility is ready to use.');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the implementation.');
  process.exit(1);
}

// Additional utility demonstrations
console.log('\n🔧 Utility Demonstrations');
console.log('==========================');

console.log('\n💡 Hexadecimal Amount Examples:');
console.log('--------------------------------');
const examples = [
  { decimal: '1', description: '1 BTF token' },
  { decimal: '10', description: '10 BTF tokens' },
  { decimal: '100', description: '100 BTF tokens' },
  { decimal: '0.1', description: '0.1 BTF token' },
  { decimal: '0.001', description: '0.001 BTF token (1 millitoken)' }
];

examples.forEach(example => {
  const hex = toHexWei(example.decimal);
  console.log(`   ${example.description.padEnd(25)} → ${hex}`);
});

console.log('\n💡 Usage Examples:');
console.log('------------------');
console.log('   # Mint 10 BTF to an address');
console.log('   node mint-bft-tokens.js --address 0x1234... --amount 10');
console.log('');
console.log('   # Check balance');
console.log('   node balance-checker.js --address 0x1234...');
console.log('');
console.log('   # Dry run (test without minting)');
console.log('   node mint-bft-tokens.js --address 0x1234... --amount 10 --dry-run');
console.log('');
console.log('   # Using curl script');
console.log('   ./mint-bft-curl.sh 0x1234... 10 testnet');
