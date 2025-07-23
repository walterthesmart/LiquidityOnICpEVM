# Unified Deployment Guide

This guide explains how to use the new unified deployment script that consolidates all contract deployments into a single command.

## Overview

The unified deployment script (`scripts/deploy-unified.ts`) provides:

- **Single Command Deployment**: Deploy all contracts with one command
- **Multi-Network Support**: Bitfinity, Sepolia, Hedera, and localhost
- **Automatic ABI Transfer**: ABIs are automatically copied to the front-end
- **Deployment Verification**: All contracts are verified after deployment
- **Comprehensive Logging**: Detailed deployment summary and gas usage
- **Error Handling**: Graceful failure handling with clear error messages

## Supported Networks

| Network | Command | Chain ID | Description |
|---------|---------|----------|-------------|
| Bitfinity Testnet | `npm run deploy:bitfinity` | 355113 | Primary testnet for development |
| Sepolia Testnet | `npm run deploy:sepolia` | 11155111 | Ethereum testnet with existing tokens |
| Hedera Testnet | `npm run deploy:hedera` | 296 | Hedera Hashgraph testnet |
| Localhost | `npm run deploy:localhost` | 31337 | Local Hardhat network |

## Quick Start

### 1. Environment Setup

Create a `.env` file in the `contracts` directory:

```bash
# Bitfinity
PRIVATE_KEY=your_private_key_here

# Sepolia
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key

# Hedera
HEDERA_PRIVATE_KEY=your_hedera_private_key_here
HEDERA_RPC_URL=https://testnet.hashio.io/api

# Etherscan (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Install Dependencies

```bash
cd contracts
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy to Your Target Network

```bash
# Deploy to Bitfinity Testnet
npm run deploy:bitfinity

# Deploy to Sepolia Testnet  
npm run deploy:sepolia

# Deploy to Hedera Testnet
npm run deploy:hedera

# Deploy to Local Network
npm run deploy:localhost
```

## What Gets Deployed

The unified deployment script deploys the following contracts in order:

### 1. NGN Stablecoin
- **Contract**: `NGNStablecoin.sol`
- **Purpose**: Nigerian Naira stablecoin for trading
- **Features**: Minting, burning, transfer controls

### 2. Stock Token Factory (Optional)
- **Contract**: `NigerianStockTokenFactory.sol`
- **Purpose**: Deploy and manage stock tokens
- **Note**: Only deployed on networks configured to create new tokens

### 3. Stock Tokens (If Factory Deployed)
- **Contract**: `NigerianStockToken.sol`
- **Purpose**: Individual tokenized stocks (DANGCEM, MTNN, etc.)
- **Features**: ERC20 with stock metadata

### 4. StockNGNDEX
- **Contract**: `StockNGNDEX.sol`
- **Purpose**: Decentralized exchange for stock-to-NGN trading
- **Features**: Automated market maker, liquidity pools

### 5. TradingPairManager
- **Contract**: `TradingPairManager.sol`
- **Purpose**: Unified interface for managing trading pairs
- **Features**: Batch operations, cross-network compatibility

## Network-Specific Behavior

### Bitfinity Testnet
- Deploys all core contracts (NGN, DEX, Manager)
- Does not deploy stock tokens (uses existing ones from Sepolia)
- Optimized for BFT token gas payments

### Sepolia Testnet
- Deploys all contracts including stock tokens
- Creates sample stock tokens (DANGCEM, MTNN)
- Full testing environment

### Hedera Testnet
- Deploys core contracts only
- Integrates with existing Hedera native tokens
- Uses HBAR for gas payments

### Localhost
- Deploys all contracts including test tokens
- Creates test stock tokens for development
- Fast deployment for testing

## Post-Deployment

After successful deployment, the script automatically:

### 1. Transfers ABIs
- Copies contract ABIs to `front-end/src/abis/`
- Updates the ABI index file with new addresses
- Ensures front-end can immediately use new contracts

### 2. Verifies Contracts
- Tests all deployed contracts
- Verifies basic functionality
- Reports any issues

### 3. Saves Results
- Creates deployment record in `contracts/deployments/`
- Saves both timestamped and latest versions
- Includes all contract addresses and transaction hashes

### 4. Provides Summary
- Shows all deployed contract addresses
- Displays total gas used and estimated cost
- Provides block explorer links
- Lists next steps

## Example Output

```
🎉 DEPLOYMENT SUMMARY
=====================================
📡 Network: Bitfinity EVM Testnet (Chain ID: 355113)
👤 Deployer: 0x1234...5678
⏰ Timestamp: 2024-01-15T10:30:00.000Z
⛽ Total Gas Used: 2,450,000
💰 Estimated Cost: 0.0245 BFT

📦 DEPLOYED CONTRACTS:
   NGN Stablecoin: 0xabcd...1234
   └─ Transaction: 0x1111...2222
   StockNGNDEX: 0xefgh...5678
   └─ Transaction: 0x3333...4444
   TradingPairManager: 0xijkl...9012
   └─ Transaction: 0x5555...6666

🔍 VERIFICATION: ✅ All contracts verified successfully
📁 ABI TRANSFER: ✅ ABIs transferred successfully to front-end

🔗 NEXT STEPS:
1. Update front-end configuration with new contract addresses
2. Create trading pairs for stock tokens
3. Add initial liquidity to trading pairs
4. Test swapping functionality
5. Set up monitoring and alerts
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure you have enough native tokens for gas
2. **Network Connection**: Check RPC URL and network connectivity
3. **Private Key**: Verify private key is correct and has permissions
4. **Contract Verification**: Some networks may have verification delays

### Getting Help

- Check the deployment logs for detailed error messages
- Verify your environment variables are set correctly
- Ensure you're using the correct network name
- Review the contract compilation output for any issues

## Advanced Usage

### Custom Configuration

You can modify the deployment configuration in `scripts/deploy-unified.ts`:

- Adjust contract parameters for different networks
- Add new networks to `NETWORK_CONFIGS`
- Customize stock token creation in `CONTRACT_CONFIGS`

### Integration with CI/CD

The unified deployment script is designed to work with automated deployment pipelines:

```bash
# Set network via environment variable
HARDHAT_NETWORK=bitfinity npm run deploy:bitfinity
```

This unified deployment system streamlines the entire deployment process, making it easy to deploy your tokenized asset trading system to any supported network with a single command.
