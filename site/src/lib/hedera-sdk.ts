import {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionResponse,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  TokenInfoQuery
} from "@hashgraph/sdk";

// Hedera network configuration
export interface HederaConfig {
  network: 'testnet' | 'mainnet';
  operatorId?: string;
  operatorKey?: string;
  contractId?: string;
}

// Contract result interfaces
interface ContractResult {
  getUint256: (index: number) => bigint;
  getString: (index: number) => string;
  getAddress: (index: number) => string;
  getBool: (index: number) => boolean;
}

// Default configuration for testnet
const DEFAULT_CONFIG: HederaConfig = {
  network: (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  operatorId: process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID,
  operatorKey: process.env.HEDERA_OPERATOR_KEY,
  contractId: process.env.NEXT_PUBLIC_HEDERA_CONTRACT_ID
};

/**
 * Hedera SDK wrapper class for Nigerian Stock Token operations
 */
export class HederaSDK {
  private client: Client;
  private config: HederaConfig;

  constructor(config: HederaConfig = DEFAULT_CONFIG) {
    this.config = config;
    
    // Initialize Hedera client
    if (config.network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    // Set operator if provided
    if (config.operatorId && config.operatorKey) {
      this.client.setOperator(
        AccountId.fromString(config.operatorId),
        PrivateKey.fromString(config.operatorKey)
      );
    }
  }

  /**
   * Get account balance in HBAR
   */
  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client);
      
      return balance.hbars.toString();
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  /**
   * Create a new token for a Nigerian stock
   */
  async createStockToken(
    tokenName: string,
    tokenSymbol: string,
    totalSupply: number,
    treasuryAccountId: string,
    treasuryPrivateKey: string
  ): Promise<string> {
    try {
      const treasuryKey = PrivateKey.fromString(treasuryPrivateKey);
      
      const transaction = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(18)
        .setInitialSupply(totalSupply)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(totalSupply)
        .setTreasuryAccountId(AccountId.fromString(treasuryAccountId))
        .setSupplyKey(treasuryKey)
        .setAdminKey(treasuryKey)
        .setFreezeDefault(false);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      if (receipt.tokenId) {
        return receipt.tokenId.toString();
      }
      
      throw new Error('Token creation failed');
    } catch (error) {
      console.error('Error creating stock token:', error);
      throw error;
    }
  }

  /**
   * Associate a token with an account
   */
  async associateToken(
    accountId: string,
    privateKey: string,
    tokenId: string
  ): Promise<boolean> {
    try {
      const accountKey = PrivateKey.fromString(privateKey);
      
      const transaction = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([tokenId])
        .freezeWith(this.client)
        .sign(accountKey);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Error associating token:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens between accounts
   */
  async transferTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fromPrivateKey: string
  ): Promise<boolean> {
    try {
      const fromKey = PrivateKey.fromString(fromPrivateKey);
      
      const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, AccountId.fromString(fromAccountId), -amount)
        .addTokenTransfer(tokenId, AccountId.fromString(toAccountId), amount)
        .freezeWith(this.client)
        .sign(fromKey);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Transfer HBAR between accounts
   */
  async transferHBAR(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fromPrivateKey: string
  ): Promise<boolean> {
    try {
      const fromKey = PrivateKey.fromString(fromPrivateKey);
      
      const transaction = await new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(fromAccountId), Hbar.fromTinybars(-amount))
        .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(amount))
        .freezeWith(this.client)
        .sign(fromKey);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      throw error;
    }
  }

  /**
   * Call a smart contract function (read-only)
   */
  async callContractFunction(
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters
  ): Promise<unknown> {
    try {
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setFunction(functionName, parameters)
        .setGas(100000);

      const result = await query.execute(this.client);
      return result;
    } catch (error) {
      console.error('Error calling contract function:', error);
      throw error;
    }
  }

  /**
   * Execute a smart contract function (write operation)
   */
  async executeContractFunction(
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters,
    payableAmount?: number,
    signerPrivateKey?: string
  ): Promise<TransactionResponse> {
    try {
      let transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunction(functionName, parameters)
        .setGas(1000000);

      if (payableAmount) {
        transaction = transaction.setPayableAmount(Hbar.fromTinybars(payableAmount));
      }

      if (signerPrivateKey) {
        const signerKey = PrivateKey.fromString(signerPrivateKey);
        transaction = await transaction.freezeWith(this.client).sign(signerKey);
      }

      const response = await transaction.execute(this.client);
      return response;
    } catch (error) {
      console.error('Error executing contract function:', error);
      throw error;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<{
    tokenId: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    treasuryAccountId: string;
  }> {
    try {
      const query = new TokenInfoQuery()
        .setTokenId(tokenId);

      const tokenInfo = await query.execute(this.client);
      return {
        tokenId: tokenInfo.tokenId?.toString() || '',
        name: tokenInfo.name || '',
        symbol: tokenInfo.symbol || '',
        decimals: tokenInfo.decimals || 0,
        totalSupply: tokenInfo.totalSupply?.toString() || '0',
        treasuryAccountId: tokenInfo.treasuryAccountId?.toString() || ''
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  /**
   * Purchase stock tokens through smart contract
   */
  async purchaseStock(
    stockSymbol: string,
    amount: number,
    paymentAmount: number,
    buyerPrivateKey: string
  ): Promise<TransactionResponse> {
    if (!this.config.contractId) {
      throw new Error('Contract ID not configured');
    }

    const parameters = new ContractFunctionParameters()
      .addString(stockSymbol)
      .addUint256(amount);

    return this.executeContractFunction(
      this.config.contractId,
      'purchaseStock',
      parameters,
      paymentAmount,
      buyerPrivateKey
    );
  }

  /**
   * Sell stock tokens through smart contract
   */
  async sellStock(
    stockSymbol: string,
    amount: number,
    sellerPrivateKey: string
  ): Promise<TransactionResponse> {
    if (!this.config.contractId) {
      throw new Error('Contract ID not configured');
    }

    const parameters = new ContractFunctionParameters()
      .addString(stockSymbol)
      .addUint256(amount);

    return this.executeContractFunction(
      this.config.contractId,
      'sellStock',
      parameters,
      undefined,
      sellerPrivateKey
    );
  }

  /**
   * Get user stock holdings from smart contract
   */
  async getUserHoldings(userAccountId: string, stockSymbol: string): Promise<number> {
    if (!this.config.contractId) {
      throw new Error('Contract ID not configured');
    }

    const parameters = new ContractFunctionParameters()
      .addAddress(userAccountId)
      .addString(stockSymbol);

    const result = await this.callContractFunction(
      this.config.contractId,
      'getUserHoldings',
      parameters
    ) as ContractResult;

    return Number(result.getUint256(0));
  }

  /**
   * Get stock information from smart contract
   */
  async getStockInfo(stockSymbol: string): Promise<{
    symbol: string;
    name: string;
    tokenAddress: string;
    totalSupply: bigint;
    pricePerToken: bigint;
    isActive: boolean;
    lastUpdated: bigint;
  }> {
    if (!this.config.contractId) {
      throw new Error('Contract ID not configured');
    }

    const parameters = new ContractFunctionParameters()
      .addString(stockSymbol);

    const result = await this.callContractFunction(
      this.config.contractId,
      'getStock',
      parameters
    ) as ContractResult;

    return {
      symbol: result.getString(0),
      name: result.getString(1),
      tokenAddress: result.getAddress(2),
      totalSupply: result.getUint256(3),
      pricePerToken: result.getUint256(4),
      isActive: result.getBool(5),
      lastUpdated: result.getUint256(6)
    };
  }

  /**
   * Close the client connection
   */
  close(): void {
    this.client.close();
  }
}

// Export singleton instance
export const hederaSDK = new HederaSDK();

// Export utility functions
export const convertHBARToTinybar = (hbar: number): number => {
  return Math.floor(hbar * 100000000); // 1 HBAR = 100,000,000 tinybars
};

export const convertTinybarToHBAR = (tinybar: number): number => {
  return tinybar / 100000000;
};

export const formatHBAR = (amount: number): string => {
  return `${amount.toFixed(8)} HBAR`;
};
