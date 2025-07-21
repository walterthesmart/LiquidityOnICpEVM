import * as dotenv from 'dotenv';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenInfoQuery,
  TokenId,
  AccountBalanceQuery
} from '@hashgraph/sdk';
import { NIGERIAN_STOCKS } from '../src/constants/nigerian-stocks';

dotenv.config();

// Token IDs that were created (update these with actual token IDs from the creation script)
const CREATED_TOKEN_IDS = [
  '0.0.6362138', // DANGCEM
  '0.0.6362139' // MTNN
  // Add more token IDs as they are created
];

// Extract stock symbols from the constants
const STOCK_SYMBOLS = NIGERIAN_STOCKS.map(stock => stock.symbol);

// Initialize Hedera client
function initializeHederaClient(): Client {
  const network = process.env.HEDERA_NETWORK || 'testnet';
  let client: Client;

  switch (network) {
  case 'testnet':
    client = Client.forTestnet();
    break;
  case 'mainnet':
    client = Client.forMainnet();
    break;
  case 'previewnet':
    client = Client.forPreviewnet();
    break;
  default:
    throw new Error(`Unsupported Hedera network: ${network}`);
  }

  const operatorId = process.env.TESTNET_OPERATOR_ACCOUNT_ID || process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.TESTNET_OPERATOR_PRIVATE_KEY || process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error('Missing Hedera operator credentials');
  }

  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));
  return client;
}

async function verifyToken(client: Client, tokenId: string, expectedSymbol?: string): Promise<void> {
  try {
    console.log(`\n🔍 Verifying token ${tokenId}...`);
    
    // Get token information
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
    const tokenInfo = await tokenInfoQuery.execute(client);

    console.log(`✅ Token ${tokenId} verified successfully!`);
    console.log(`   📛 Name: ${tokenInfo.name}`);
    console.log(`   🏷️  Symbol: ${tokenInfo.symbol}`);
    console.log(`   🔢 Decimals: ${tokenInfo.decimals}`);
    console.log(`   📊 Total Supply: ${tokenInfo.totalSupply.toString()}`);
    console.log(`   🏦 Treasury: ${tokenInfo.treasuryAccountId?.toString() || 'N/A'}`);
    console.log(`   📝 Memo: ${tokenInfo.tokenMemo}`);
    console.log(`   🔑 Admin Key: ${tokenInfo.adminKey ? 'Set' : 'Not set'}`);
    console.log(`   🔑 Supply Key: ${tokenInfo.supplyKey ? 'Set' : 'Not set'}`);
    console.log(`   ❄️  Freeze Default: ${tokenInfo.defaultFreezeStatus ? 'Yes' : 'No'}`);
    console.log(`   ⏸️  Paused: ${tokenInfo.pauseStatus ? 'Yes' : 'No'}`);
    
    if (expectedSymbol && tokenInfo.symbol !== expectedSymbol) {
      console.log(`   ⚠️  Warning: Expected symbol ${expectedSymbol}, got ${tokenInfo.symbol}`);
    }

    // Check if token is in treasury account balance
    const operatorId = client.operatorAccountId;
    if (operatorId) {
      const balanceQuery = new AccountBalanceQuery().setAccountId(operatorId);
      const balance = await balanceQuery.execute(client);
      
      const tokenBalance = balance.tokens?.get(TokenId.fromString(tokenId));
      if (tokenBalance) {
        console.log(`   💰 Treasury Balance: ${tokenBalance.toString()} tokens`);
      } else {
        console.log('   💰 Treasury Balance: 0 tokens (or not associated)');
      }
    }

    // Generate explorer link
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const explorerUrl = `https://hashscan.io/${network}/token/${tokenId}`;
    console.log(`   🌐 Explorer: ${explorerUrl}`);

  } catch (error: any) {
    console.log(`❌ Failed to verify token ${tokenId}:`);
    console.log(`   Error: ${error.message}`);
    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }
  }
}

async function verifyAllTokens() {
  console.log('🔍 Verifying Nigerian Stock Tokens on Hedera...\n');

  let client: Client | null = null;
  
  try {
    // Initialize Hedera client
    console.log('🔧 Initializing Hedera client...');
    client = initializeHederaClient();
    
    const operatorId = client.operatorAccountId;
    console.log('👤 Operator Account:', operatorId?.toString());
    
    // Check operator balance
    const balanceQuery = new AccountBalanceQuery().setAccountId(operatorId!);
    const balance = await balanceQuery.execute(client);
    console.log('💰 HBAR Balance:', balance.hbars.toString());
    
    console.log(`\n${  '='.repeat(70)}`);
    
    // Verify each token
    for (let i = 0; i < CREATED_TOKEN_IDS.length; i++) {
      const tokenId = CREATED_TOKEN_IDS[i];
      const expectedSymbol = STOCK_SYMBOLS[i];
      await verifyToken(client, tokenId, expectedSymbol);
    }

    // Show all tokens in treasury account
    console.log(`\n${  '='.repeat(70)}`);
    console.log('📊 ALL TOKENS IN TREASURY ACCOUNT');
    console.log('='.repeat(70));
    
    const allTokens = balance.tokens;
    if (allTokens && allTokens.size > 0) {
      console.log(`Found ${allTokens.size} token(s) in treasury account:`);

      for (const [tokenId, tokenBalance] of allTokens) {
        console.log(`\n🪙 Token ID: ${tokenId.toString()}`);
        console.log(`   💰 Balance: ${tokenBalance.toString()}`);
        
        try {
          const tokenInfoQuery = new TokenInfoQuery().setTokenId(tokenId);
          const tokenInfo = await tokenInfoQuery.execute(client);
          console.log(`   📛 Name: ${tokenInfo.name}`);
          console.log(`   🏷️  Symbol: ${tokenInfo.symbol}`);
        } catch {
          console.log('   ❌ Could not fetch token info');
        }
      }
    } else {
      console.log('No tokens found in treasury account');
    }

    console.log(`\n${  '='.repeat(70)}`);
    console.log('✅ Token verification completed!');
    console.log('\n📋 SUMMARY:');
    console.log(`   • Verified ${CREATED_TOKEN_IDS.length} token(s)`);
    console.log(`   • Treasury has ${allTokens?.size || 0} token(s)`);
    console.log(`   • Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
    console.log(`   • Operator: ${operatorId?.toString()}`);

  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    if (error.status) {
      console.error('   Status:', error.status);
    }
    process.exit(1);
  } finally {
    // Close Hedera client connection
    if (client) {
      try {
        client.close();
        console.log('\n🔌 Hedera client connection closed');
      } catch (closeError) {
        console.warn('⚠️  Warning: Failed to close Hedera client:', closeError);
      }
    }
  }
}

// Handle script execution
if (require.main === module) {
  verifyAllTokens()
    .then(() => {
      console.log('\n🎉 Token verification process completed!');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('💥 Token verification script failed:', error);
      process.exit(1);
    });
}

export { verifyAllTokens };
