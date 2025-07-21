# Hedera Native Token Creation (Updated)

⚠️ **IMPORTANT**: This project has been migrated from Solidity-based contracts to native Hedera token creation.

The new implementation uses the Hedera SDK directly, providing:
- Lower costs
- Simpler integration
- Better TypeScript support
- Automatic frontend file generation

## Quick Start

```bash
# Create tokens on testnet
npm run create-tokens

# Create tokens on mainnet
npm run create-tokens:mainnet
```

For detailed documentation, see [README.md](./README.md).

---

## Legacy Information

This guide explains how to create Nigerian Stock Exchange (NGX) tokens using the Hedera SDK directly, bypassing the HTS precompile issues encountered with smart contract-based token creation.

## Overview

The new approach uses the `@hashgraph/sdk` library to create HTS (Hedera Token Service) tokens programmatically, eliminating dependency on the HTS precompile (address `0x0000000000000000000000000000000000000167`) that was causing deployment issues.

## Benefits of SDK Approach

1. **Direct Token Creation**: Bypasses smart contract limitations and HTS precompile issues
2. **Better Error Handling**: More detailed error messages and status codes
3. **Full Token Control**: Access to all HTS features and token properties
4. **Network Independence**: Works consistently across testnet, mainnet, and previewnet
5. **Cost Transparency**: Clear visibility into transaction costs and fees

## Prerequisites

1. **Hedera Account**: Active Hedera account with sufficient HBAR balance
2. **Environment Setup**: Properly configured environment variables
3. **Node.js**: Version 18+ with npm/yarn
4. **Dependencies**: `@hashgraph/sdk` package installed

## Environment Configuration

Ensure your `.env` file contains:

```env
# Hedera Network Configuration
HEDERA_NETWORK=testnet
TESTNET_OPERATOR_ACCOUNT_ID=0.0.6255971
TESTNET_OPERATOR_PRIVATE_KEY=0x869c98049de05b927f749341dbbffc59544b8e2a90d97e5d2361fb101268f665
TESTNET_ENDPOINT=https://testnet.hashio.io/api
TESTNET_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

## Available Scripts

### 1. SDK-Only Token Creation (Recommended)

Creates tokens using pure Hedera SDK without smart contract interaction:

```bash
cd contracts/hedera
npm run create-tokens-sdk
```

**Features:**
- Direct HTS token creation
- Detailed transaction information
- Cost tracking
- Token verification
- No smart contract dependencies

### 2. Hybrid Approach

Creates tokens with SDK and updates smart contract:

```bash
cd contracts/hedera
npm run create-tokens
```

**Features:**
- SDK token creation
- Smart contract price updates
- Backward compatibility
- Error recovery

## Token Configuration

The scripts create tokens for these Nigerian stocks:

| Symbol | Company Name | Total Supply | Decimals |
|--------|-------------|--------------|----------|
| DANGCEM | Dangote Cement Plc | 17,040,000,000 | 18 |
| MTNN | MTN Nigeria Communications Plc | 20,354,513,050 | 18 |
| ZENITHBANK | Zenith Bank Plc | 31,396,493,786 | 18 |
| GTCO | Guaranty Trust Holding Company Plc | 29,431,127,496 | 18 |
| NB | Nigerian Breweries Plc | 8,020,000,000 | 18 |
| ACCESS | Access Holdings Plc | 35,687,500,000 | 18 |

## Token Properties

Each token is created with:

- **Type**: Fungible Common Token
- **Supply Type**: Finite (with max supply set)
- **Decimals**: 18 (for fractional shares)
- **Treasury**: Operator account
- **Admin Key**: Operator public key
- **Supply Key**: Operator public key
- **Freeze Default**: False
- **Memo**: Descriptive text about the Nigerian stock

## Usage Examples

### Basic Token Creation

```typescript
import { createStockTokensWithSDK } from './scripts/create-tokens-sdk-only';

// Create all Nigerian stock tokens
await createStockTokensWithSDK();
```

### Individual Token Creation

```typescript
import { Client, TokenCreateTransaction, TokenType, TokenSupplyType } from '@hashgraph/sdk';

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName("Dangote Cement Plc")
  .setTokenSymbol("DANGCEM")
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(18)
  .setInitialSupply(17040000000)
  .setTreasuryAccountId(operatorId)
  .setSupplyType(TokenSupplyType.Finite)
  .setMaxSupply(17040000000)
  .setTokenMemo("Nigerian Stock: Dangote Cement")
  .setAdminKey(operatorKey)
  .setSupplyKey(operatorKey);

const tokenCreateSubmit = await tokenCreateTx.execute(client);
const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
const tokenId = tokenCreateReceipt.tokenId;
```

## Expected Output

```
🏦 Creating Nigerian Stock Tokens using Hedera SDK directly...

🔧 Initializing Hedera client...
🔧 Setting up client for testnet network
👤 Operator Account: 0.0.6255971
💰 HBAR Balance: 588.12345678 ℏ

======================================================================

📈 Creating token for DANGCEM (Dangote Cement Plc)...
   🔧 Creating token using Hedera SDK...
   📤 Submitting token creation transaction...
   ⏳ Waiting for transaction receipt...
   ✅ Token created with ID: 0.0.1234567
   📝 Transaction ID: 0.0.6255971@1642123456.789012345
   💰 Transaction cost: 1.00000000 ℏ
   ✅ DANGCEM token created successfully!
   🎯 Token ID: 0.0.1234567
   📝 Transaction ID: 0.0.6255971@1642123456.789012345
   📊 Total Supply: 17040000000 tokens (18 decimals)
   🔍 Fetching token details...
   📊 Token Details:
      Name: Dangote Cement Plc
      Symbol: DANGCEM
      Decimals: 18
      Total Supply: 17040000000
      Treasury: 0.0.6255971
      Memo: Nigerian Stock: Dangote Cement - Leading cement manufacturer in Nigeria
```

## Cost Estimation

Typical costs for token creation on Hedera testnet:

- **Token Creation**: ~1-2 HBAR per token
- **Total for 6 stocks**: ~6-12 HBAR
- **Recommended balance**: 50+ HBAR for safety

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: INSUFFICIENT_PAYER_BALANCE
   Solution: Add more HBAR to operator account
   ```

2. **Invalid Credentials**
   ```
   Error: INVALID_SIGNATURE
   Solution: Verify operator account ID and private key
   ```

3. **Network Issues**
   ```
   Error: Connection timeout
   Solution: Check internet connection and network endpoints
   ```

4. **Rate Limiting**
   ```
   Error: BUSY
   Solution: Increase delays between token creations
   ```

### Debug Mode

Enable detailed logging by setting:

```env
LOG_LEVEL=debug
```

## Integration with Smart Contracts

After creating tokens with the SDK, you can integrate them with your smart contracts:

1. **Update Contract State**: Store token IDs in contract storage
2. **Price Management**: Use contract functions to manage token prices
3. **Trading Logic**: Implement buy/sell functionality
4. **User Management**: Handle user balances and permissions

## Next Steps

1. **Test Token Creation**: Run the SDK script to create tokens
2. **Verify on Explorer**: Check tokens on [HashScan](https://hashscan.io/testnet)
3. **Integrate with Frontend**: Update frontend to use new token IDs
4. **Implement Trading**: Add token transfer and trading functionality
5. **Deploy to Mainnet**: When ready, deploy to Hedera mainnet

## Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use secure environment variable management
- **Access Control**: Implement proper role-based access control
- **Monitoring**: Set up monitoring for token operations
- **Backup**: Maintain secure backups of operator keys

## Support

For issues or questions:

1. Check Hedera documentation: https://docs.hedera.com/
2. Review error messages and status codes
3. Test on Hedera testnet first
4. Monitor transactions on HashScan explorer

---

**Status**: ✅ Ready for use
**Last Updated**: 2025-07-16
**Hedera SDK Version**: 2.40.0
