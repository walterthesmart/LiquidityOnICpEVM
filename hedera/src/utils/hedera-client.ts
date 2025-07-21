import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
  Hbar
} from '@hashgraph/sdk';
import { HederaNetworkConfig } from '../types';

/**
 * Initialize Hedera client with proper configuration
 */
export function initializeHederaClient(config: HederaNetworkConfig): Client {
  let client: Client;

  switch (config.network) {
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
    throw new Error(`Unsupported Hedera network: ${config.network}`);
  }

  if (!config.operatorAccountId || !config.operatorPrivateKey) {
    throw new Error('Missing Hedera operator credentials. Please set operator account ID and private key');
  }

  console.log(`🔧 Setting up client for ${config.network} network`);
  console.log(`👤 Operator Account: ${config.operatorAccountId}`);

  client.setOperator(
    AccountId.fromString(config.operatorAccountId),
    PrivateKey.fromString(config.operatorPrivateKey)
  );

  return client;
}

/**
 * Check operator account balance
 */
export async function checkOperatorBalance(client: Client): Promise<{
  balance: Hbar;
  isLowBalance: boolean;
  recommendedBalance: Hbar;
}> {
  const operatorId = client.operatorAccountId;
  if (!operatorId) {
    throw new Error('Operator account not set on client');
  }

  const balanceQuery = new AccountBalanceQuery().setAccountId(operatorId);
  const balance = await balanceQuery.execute(client);
  
  const recommendedBalance = Hbar.fromString('50');
  const isLowBalance = balance.hbars.toTinybars().toNumber() < recommendedBalance.toTinybars().toNumber();

  console.log('💰 HBAR Balance:', balance.hbars.toString());
  
  if (isLowBalance) {
    console.warn('⚠️  Warning: Low HBAR balance for token creation fees');
    console.warn(`    Current: ${balance.hbars.toString()}`);
    console.warn(`    Recommended: ${recommendedBalance.toString()}`);
  }

  return {
    balance: balance.hbars,
    isLowBalance,
    recommendedBalance
  };
}

/**
 * Generate explorer URL for a token
 */
export function generateExplorerUrl(tokenId: string, network: string): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://hashscan.io/mainnet' 
    : 'https://hashscan.io/testnet';
  
  return `${baseUrl}/token/${tokenId}`;
}

/**
 * Generate explorer URL for a transaction
 */
export function generateTransactionUrl(transactionId: string, network: string): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://hashscan.io/mainnet' 
    : 'https://hashscan.io/testnet';
  
  return `${baseUrl}/transaction/${transactionId}`;
}

/**
 * Safely close Hedera client
 */
export function closeHederaClient(client: Client): void {
  try {
    client.close();
    console.log('🔌 Hedera client connection closed');
  } catch (closeError) {
    console.warn('⚠️  Warning: Failed to close Hedera client:', closeError);
  }
}
