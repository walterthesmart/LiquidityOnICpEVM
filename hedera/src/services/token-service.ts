import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Status,
  Hbar,
  TokenInfoQuery,
  TokenId
} from '@hashgraph/sdk';
import {
  NigerianStockData,
  TokenCreationResult,
  TokenServiceConfig,
  TokenCreationSummary
} from '../types';
import {
  initializeHederaClient,
  checkOperatorBalance,
  generateExplorerUrl,
  closeHederaClient
} from '../utils/hedera-client';

export class HederaNativeTokenService {
  private client: Client | null = null;
  private config: TokenServiceConfig;

  constructor(config: TokenServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Hedera Native Token Service...');
    this.client = initializeHederaClient(this.config);
    
    // Check operator balance
    await checkOperatorBalance(this.client);
  }

  /**
   * Create a single token using Hedera SDK
   */
  async createToken(stock: NigerianStockData): Promise<TokenCreationResult> {
    if (!this.client) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    console.log(`   🔧 Creating token for ${stock.symbol}...`);
    
    const operatorId = this.client.operatorAccountId;
    const operatorKey = this.client.operatorPublicKey;
    
    if (!operatorId || !operatorKey) {
      throw new Error('Operator account not set on client');
    }

    const decimals = stock.decimals || 18;

    // Create the token
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(stock.name)
      .setTokenSymbol(stock.symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(decimals)
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
    const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
    
    console.log('   ⏳ Waiting for transaction receipt...');
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);

    if (tokenCreateReceipt.status !== Status.Success) {
      throw new Error(`Token creation failed with status: ${tokenCreateReceipt.status}`);
    }

    const tokenId = tokenCreateReceipt.tokenId;
    if (!tokenId) {
      throw new Error('Token creation succeeded but no token ID returned');
    }

    // Get transaction cost
    const transactionRecord = await tokenCreateSubmit.getRecord(this.client);
    const cost = transactionRecord.transactionFee.toString();

    const result: TokenCreationResult = {
      tokenId: tokenId.toString(),
      transactionId: tokenCreateSubmit.transactionId.toString(),
      cost,
      symbol: stock.symbol,
      name: stock.name,
      totalSupply: stock.totalSupply,
      decimals,
      treasuryAccountId: operatorId.toString(),
      memo: stock.memo,
      explorerUrl: generateExplorerUrl(tokenId.toString(), this.config.network)
    };

    console.log(`   ✅ Token created with ID: ${tokenId.toString()}`);
    console.log(`   📝 Transaction ID: ${tokenCreateSubmit.transactionId.toString()}`);
    console.log(`   💰 Transaction cost: ${cost}`);

    return result;
  }

  /**
   * Get detailed token information
   */
  async getTokenDetails(tokenId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    try {
      console.log('   🔍 Fetching token details...');
      const tokenInfoQuery = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
      const tokenInfo = await tokenInfoQuery.execute(this.client);

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

  /**
   * Create multiple tokens
   */
  async createTokens(stocks: NigerianStockData[]): Promise<TokenCreationSummary> {
    if (!this.client) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    console.log(`\n🏦 Creating ${stocks.length} Nigerian Stock Tokens using Hedera SDK...`);
    console.log('='.repeat(70));
    
    let successCount = 0;
    let failureCount = 0;
    let totalCost = Hbar.fromTinybars(0);
    const tokens: TokenCreationResult[] = [];
    const errors: Array<{ symbol: string; error: string }> = [];
    
    for (const stock of stocks) {
      console.log(`\n📈 Creating token for ${stock.symbol} (${stock.name})...`);
      
      try {
        // Create token using Hedera SDK
        const tokenResult = await this.createToken(stock);
        
        console.log(`   ✅ ${stock.symbol} token created successfully!`);
        console.log(`   🎯 Token ID: ${tokenResult.tokenId}`);
        console.log(`   📊 Total Supply: ${stock.totalSupply} tokens (${tokenResult.decimals} decimals)`);
        
        // Add to total cost
        const tokenCost = Hbar.fromString(tokenResult.cost);
        totalCost = Hbar.fromTinybars(totalCost.toTinybars().add(tokenCost.toTinybars()));
        
        // Get detailed token information
        await this.getTokenDetails(tokenResult.tokenId);
        
        tokens.push(tokenResult);
        successCount++;
        
        // Wait between token creations to avoid rate limiting
        if (successCount + failureCount < stocks.length) {
          console.log('   ⏳ Waiting 5 seconds before next token...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error: any) {
        console.log(`   ❌ Failed to create token for ${stock.symbol}:`);
        console.log(`      Error: ${error.message}`);
        if (error.status) {
          console.log(`      Status: ${error.status}`);
        }
        
        errors.push({
          symbol: stock.symbol,
          error: error.message
        });
        failureCount++;
      }
    }

    return {
      totalTokens: stocks.length,
      successfulCreations: successCount,
      failedCreations: failureCount,
      totalCost: totalCost.toString(),
      tokens,
      errors
    };
  }

  /**
   * Close the service and cleanup resources
   */
  close(): void {
    if (this.client) {
      closeHederaClient(this.client);
      this.client = null;
    }
  }
}
