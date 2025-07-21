import * as dotenv from 'dotenv';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Status,
  Hbar,
  AccountBalanceQuery,
  TokenInfoQuery,
  TokenId
} from '@hashgraph/sdk';
import { NIGERIAN_STOCKS } from '../src/constants/nigerian-stocks';
import { NigerianStockData } from '../src/types';

dotenv.config();

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
    throw new Error('Missing Hedera operator credentials. Please set TESTNET_OPERATOR_ACCOUNT_ID and TESTNET_OPERATOR_PRIVATE_KEY');
  }

  console.log(`🔧 Setting up client for ${network} network`);
  console.log(`👤 Operator Account: ${operatorId}`);

  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));
  return client;
}

/**
 * Create a token using Hedera SDK directly
 */
async function createTokenWithHederaSDK(
  client: Client, 
  stock: NigerianStockData
): Promise<{ tokenId: string; transactionId: string; cost: string }> {
  console.log('   🔧 Creating token using Hedera SDK...');
  
  const operatorId = client.operatorAccountId;
  const operatorKey = client.operatorPublicKey;
  
  if (!operatorId || !operatorKey) {
    throw new Error('Operator account not set on client');
  }

  // Create the token
  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName(stock.name)
    .setTokenSymbol(stock.symbol)
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(18) // 18 decimals for fractional shares
    .setInitialSupply(parseInt(stock.totalSupply))
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(parseInt(stock.totalSupply))
    .setTokenMemo(stock.memo)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .setFreezeDefault(false);

  // Execute the transaction
  console.log('   📤 Submitting token creation transaction...');
  const tokenCreateSubmit = await tokenCreateTx.execute(client);
  
  console.log('   ⏳ Waiting for transaction receipt...');
  const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

  if (tokenCreateReceipt.status !== Status.Success) {
    throw new Error(`Token creation failed with status: ${tokenCreateReceipt.status}`);
  }

  const tokenId = tokenCreateReceipt.tokenId;
  if (!tokenId) {
    throw new Error('Token creation succeeded but no token ID returned');
  }

  // Get transaction cost
  const transactionRecord = await tokenCreateSubmit.getRecord(client);
  const cost = transactionRecord.transactionFee.toString();

  console.log(`   ✅ Token created with ID: ${tokenId.toString()}`);
  console.log(`   📝 Transaction ID: ${tokenCreateSubmit.transactionId.toString()}`);
  console.log(`   💰 Transaction cost: ${cost}`);

  return {
    tokenId: tokenId.toString(),
    transactionId: tokenCreateSubmit.transactionId.toString(),
    cost
  };
}

/**
 * Get detailed token information
 */
async function getTokenDetails(client: Client, tokenId: string): Promise<void> {
  try {
    console.log('   🔍 Fetching token details...');
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
    const tokenInfo = await tokenInfoQuery.execute(client);

    console.log('   📊 Token Details:');
    console.log(`      Name: ${tokenInfo.name}`);
    console.log(`      Symbol: ${tokenInfo.symbol}`);
    console.log(`      Decimals: ${tokenInfo.decimals}`);
    console.log(`      Total Supply: ${tokenInfo.totalSupply.toString()}`);
    console.log(`      Treasury: ${tokenInfo.treasuryAccountId?.toString() || 'N/A'}`);
    console.log(`      Memo: ${tokenInfo.tokenMemo}`);
  } catch (error: any) {
    console.log(`   ⚠️  Could not fetch token details: ${error.message}`);
  }
}

async function createStockTokensWithSDK() {
  console.log('🏦 Creating Nigerian Stock Tokens using Hedera SDK directly...\n');

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
    
    const requiredBalance = Hbar.fromString('50');
    if (balance.hbars.toTinybars().toNumber() < requiredBalance.toTinybars().toNumber()) {
      console.warn('⚠️  Warning: Low HBAR balance for token creation fees');
      console.warn(`    Current: ${balance.hbars.toString()}`);
      console.warn(`    Recommended: ${requiredBalance.toString()}`);
    }

    console.log(`\n${  '='.repeat(70)}`);
    
    let successCount = 0;
    let failureCount = 0;
    let totalCost = Hbar.fromTinybars(0);
    
    for (const stock of NIGERIAN_STOCKS) {
      console.log(`\n📈 Creating token for ${stock.symbol} (${stock.name})...`);
      
      try {
        // Create token using Hedera SDK
        const tokenResult = await createTokenWithHederaSDK(client, stock);
        
        console.log(`   ✅ ${stock.symbol} token created successfully!`);
        console.log(`   🎯 Token ID: ${tokenResult.tokenId}`);
        console.log(`   📝 Transaction ID: ${tokenResult.transactionId}`);
        console.log(`   📊 Total Supply: ${stock.totalSupply} tokens (18 decimals)`);
        
        // Add to total cost
        const tokenCost = Hbar.fromString(tokenResult.cost);
        totalCost = Hbar.fromTinybars(totalCost.toTinybars().add(tokenCost.toTinybars()));
        
        // Get detailed token information
        await getTokenDetails(client, tokenResult.tokenId);
        
        successCount++;
        
        // Wait between token creations to avoid rate limiting
        if (successCount + failureCount < NIGERIAN_STOCKS.length) {
          console.log('   ⏳ Waiting 5 seconds before next token...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error: any) {
        console.log(`   ❌ Failed to create token for ${stock.symbol}:`);
        console.log(`      Error: ${error.message}`);
        if (error.status) {
          console.log(`      Status: ${error.status}`);
        }
        failureCount++;
      }
    }

    // Summary
    console.log(`\n${  '='.repeat(70)}`);
    console.log('📊 TOKEN CREATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Total: ${NIGERIAN_STOCKS.length}`);
    console.log(`💰 Total Cost: ${totalCost.toString()}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Tokens were created successfully using Hedera SDK!');
      console.log('These tokens are now available on the Hedera network and can be:');
      console.log('  • Transferred between accounts');
      console.log('  • Associated with user accounts');
      console.log('  • Integrated with smart contracts');
      console.log('  • Viewed on Hedera explorers');
    }
    
    if (failureCount > 0) {
      console.log('\n⚠️  Some token creations failed.');
      console.log('Common issues and solutions:');
      console.log('  • Insufficient HBAR balance - Add more HBAR to operator account');
      console.log('  • Network connectivity - Check internet connection');
      console.log('  • Invalid credentials - Verify operator account ID and private key');
      console.log('  • Rate limiting - Increase delays between token creations');
    }

  } catch (error: any) {
    console.error('❌ Stock token creation failed:', error.message);
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
  createStockTokensWithSDK()
    .then(() => {
      console.log('\n🎉 Nigerian Stock Token creation process completed!');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('💥 Stock token creation script failed:', error);
      process.exit(1);
    });
}

export { createStockTokensWithSDK };
