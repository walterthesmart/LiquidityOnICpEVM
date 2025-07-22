# Ethereum Sepolia Testnet Integration Guide

This guide covers the comprehensive Ethereum Sepolia testnet integration for the Nigerian Stock Exchange liquidity project. The integration provides an additional testing environment alongside the existing Bitfinity EVM setup.

## 🌐 Overview

The Sepolia integration adds support for:
- **Ethereum Sepolia Testnet** (Chain ID: 11155111)
- **Multi-network contract deployment**
- **Network switching capabilities**
- **Sepolia ETH faucet integration**
- **Cross-network testing utilities**

## 📋 Prerequisites

### 1. Environment Setup

Create or update your `.env` files with Sepolia configuration:

**For `/contracts/.env`:**
```bash
# Existing Bitfinity configuration
PRIVATE_KEY=your_private_key_here

# Sepolia Configuration
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**For `/backend/.env`:**
```bash
# Multi-Network Configuration
BITFINITY_PRIVATE_KEY=your_bitfinity_private_key_here
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. Get Sepolia ETH

Before deploying, you'll need Sepolia ETH for gas fees. Use these faucets:

1. **Sepolia Faucet** - https://sepoliafaucet.com/
   - Requires Alchemy account
   - Provides 0.5 ETH per day

2. **Infura Sepolia Faucet** - https://www.infura.io/faucet/sepolia
   - Requires Infura account
   - Provides 0.5 ETH per day

3. **QuickNode Sepolia Faucet** - https://faucet.quicknode.com/ethereum/sepolia
   - No account required
   - Provides 0.1 ETH per request

4. **Chainlink Sepolia Faucet** - https://faucets.chain.link/sepolia
   - Requires social media verification
   - Provides 0.1 ETH per request

### 3. Check Balance and Readiness

Use the Sepolia utilities to check your balance:

```bash
# Check Sepolia ETH balance
cd scripts
node sepolia-eth-utils.js --address 0xYourAddress --action balance

# Check deployment readiness (requires 0.1 ETH minimum)
node sepolia-eth-utils.js --address 0xYourAddress --action deployment-ready

# Get network information
node sepolia-eth-utils.js --action network-info

# Display faucet information
node sepolia-eth-utils.js --action faucet
```

## 🚀 Deployment Instructions

### 1. Deploy to Sepolia

Navigate to the contracts directory and deploy:

```bash
cd contracts

# Install dependencies (if not already done)
npm install

# Compile contracts
npm run compile

# Deploy to Sepolia (dry run first)
npx hardhat run scripts/deploy-sepolia.ts --network sepolia --dry-run

# Deploy to Sepolia
npm run deploy:sepolia
```

### 2. Verify Deployment

The deployment script will:
- Deploy the `NigerianStockTokenFactory` contract
- Deploy 5 sample Nigerian stock tokens (DANGCEM, MTNN, ZENITHBANK, GTCO, ACCESS)
- Save deployment results to `contracts/deployments/nigerian-stocks-sepolia-11155111.json`
- Generate frontend configuration at `front-end/src/config/sepolia-contracts.json`

### 3. Verify Contracts on Etherscan

```bash
# Verify the factory contract
npx hardhat verify --network sepolia FACTORY_ADDRESS DEPLOYER_ADDRESS

# Verify individual tokens (example)
npx hardhat verify --network sepolia TOKEN_ADDRESS "Token Name" "SYMBOL" "SYMBOL" "Company Name" MAX_SUPPLY INITIAL_SUPPLY ADMIN_ADDRESS
```

## 🎨 Frontend Integration

### 1. Network Configuration

The frontend now supports multiple networks through updated configuration:

```typescript
// Supported networks
const networks = {
  bitfinity_testnet: { chainId: 355113, name: "Bitfinity Testnet" },
  bitfinity_mainnet: { chainId: 355110, name: "Bitfinity Mainnet" },
  sepolia: { chainId: 11155111, name: "Ethereum Sepolia Testnet" }
};
```

### 2. Network Switching

Use the network switcher hook:

```typescript
import { useNetworkSwitcher } from '@/hooks/use-network-switcher';

function NetworkSwitcher() {
  const { 
    currentNetwork, 
    switchToSepolia, 
    switchToBitfinityTestnet,
    isCurrentNetworkSupported 
  } = useNetworkSwitcher();

  return (
    <div>
      <p>Current: {currentNetwork?.name}</p>
      <button onClick={switchToSepolia}>Switch to Sepolia</button>
      <button onClick={switchToBitfinityTestnet}>Switch to Bitfinity</button>
    </div>
  );
}
```

### 3. Network-Aware Token Operations

```typescript
import { useNetworkAwareTokens } from '@/hooks/use-network-switcher';

function TokenList() {
  const { availableTokens, isTokenAvailable, getTokenAddress } = useNetworkAwareTokens();

  return (
    <div>
      {availableTokens.map(token => (
        <div key={token.symbol}>
          {token.symbol} on {token.networkName}: {token.address}
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Testing and Validation

### 1. Network Utilities Testing

```bash
cd scripts

# Test balance checking across networks
npm run balance:sepolia -- --address 0xYourAddress
node mint-bft-tokens.js --action balance --network bitfinity_testnet --address 0xYourAddress

# Test faucet information
npm run faucet:sepolia -- --address 0xYourAddress
```

### 2. Contract Interaction Testing

Create a test script to validate contract deployment:

```bash
# Test contract interactions
cd contracts
npx hardhat run scripts/test-sepolia-deployment.ts --network sepolia
```

### 3. Frontend Testing

1. **Network Detection**: Verify the frontend detects the current network correctly
2. **Network Switching**: Test switching between Bitfinity and Sepolia
3. **Contract Interactions**: Verify token operations work on both networks
4. **Faucet Integration**: Test faucet links and information display

## 📊 Network Comparison

| Feature | Bitfinity Testnet | Ethereum Sepolia |
|---------|------------------|------------------|
| Chain ID | 355113 | 11155111 |
| Native Currency | BTF | ETH |
| Block Explorer | explorer.testnet.bitfinity.network | sepolia.etherscan.io |
| Faucet Method | Direct minting via RPC | External faucets |
| Gas Costs | Very low | Moderate |
| Ecosystem | ICP-based | Ethereum-based |

## 🛠️ Troubleshooting

### Common Issues

1. **Insufficient Sepolia ETH**
   ```bash
   # Check balance
   node sepolia-eth-utils.js --address 0xYourAddress --action balance
   
   # Get faucet information
   node sepolia-eth-utils.js --action faucet
   ```

2. **Network Not Supported in Wallet**
   - Sepolia is supported by default in MetaMask
   - For other wallets, add network manually with Chain ID 11155111

3. **Contract Verification Failed**
   ```bash
   # Make sure you have a valid Etherscan API key
   export ETHERSCAN_API_KEY=your_api_key_here
   npx hardhat verify --network sepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
   ```

4. **RPC Rate Limiting**
   - Use your own Infura/Alchemy project ID
   - Consider upgrading to paid plans for higher limits

### Getting Help

1. Check the deployment logs in `contracts/deployments/`
2. Verify network configuration in `hardhat.config.ts`
3. Test network connectivity with utilities
4. Review frontend network detection

## 📈 Next Steps

After successful Sepolia integration:

1. **Production Deployment**: Deploy to Bitfinity Mainnet when ready
2. **Cross-Chain Features**: Explore bridging between networks
3. **Advanced Testing**: Implement comprehensive test suites
4. **Monitoring**: Set up network monitoring and alerting
5. **Documentation**: Update user guides with network selection

## 🔗 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Sepolia Faucets**: Multiple options listed in prerequisites
- **Bitfinity Explorer**: https://explorer.testnet.bitfinity.network
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts

---

This integration provides a robust multi-network testing environment for the Nigerian Stock Exchange liquidity project, enabling comprehensive testing across different EVM-compatible networks.
