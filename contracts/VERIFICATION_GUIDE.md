# Contract Verification Guide

This guide explains how to verify your deployed contracts on Etherscan for transparency and trust.

## 🔍 Why Verify Contracts?

Contract verification on Etherscan provides:
- **Transparency**: Users can read the source code
- **Trust**: Proves the contract does what it claims
- **Interaction**: Enables direct contract interaction on Etherscan
- **Debugging**: Better error messages and transaction analysis

## 🚀 Quick Start

### Verify All Sepolia Contracts

```bash
cd contracts
npm run verify:sepolia
```

This will automatically verify:
- ✅ NigerianStockTokenFactory contract
- ✅ All 38 Nigerian stock token contracts
- ✅ NGN Stablecoin (if deployed)
- ✅ StockNGNDEX (if deployed)

### Manual Verification

If you need to verify individual contracts:

```bash
# Verify factory contract
npx hardhat verify --network sepolia FACTORY_ADDRESS DEPLOYER_ADDRESS

# Verify individual token (example for DANGCEM)
npx hardhat verify --network sepolia TOKEN_ADDRESS "Dangote Cement Token" "DANGCEM" "DANGCEM" "Dangote Cement Plc" "17040000000000000000000000000" "17040000000000000000000000000" ADMIN_ADDRESS
```

## 📋 Prerequisites

1. **Etherscan API Key**: Set in `.env` file
   ```bash
   ETHERSCAN_API_KEY=your_api_key_here
   ```

2. **Deployed Contracts**: Ensure contracts are deployed on Sepolia
   ```bash
   npm run deploy:sepolia
   ```

3. **Network Configuration**: Hardhat configured for Sepolia

## 📊 Verification Report

After running verification, you'll get:

```
🎉 Verification Process Complete!
📊 Factory: ✅ Verified
📊 Tokens: 38/38 verified
📊 Success Rate: 100%

🔗 View contracts on Etherscan:
   Factory: https://sepolia.etherscan.io/address/0x...
   All tokens: Check the verification report for individual links
```

## 🔧 Troubleshooting

### Common Issues

1. **"Already Verified"**
   - ✅ This is good! Contract is already verified
   - The script will continue with other contracts

2. **"Invalid API Key"**
   ```bash
   # Check your API key in .env
   ETHERSCAN_API_KEY=your_valid_key_here
   ```

3. **"Constructor arguments mismatch"**
   - The script automatically handles constructor arguments
   - If manual verification fails, check the deployment data

4. **Rate Limiting**
   - The script includes delays between verifications
   - If you hit limits, wait a few minutes and retry

### Manual Debugging

Check deployment data:
```bash
cat deployments/nigerian-stocks-sepolia-11155111.json
```

View verification report:
```bash
cat verification-reports/sepolia-verification-*.json
```

## 📁 Generated Files

The verification process creates:

```
contracts/
├── verification-reports/
│   └── sepolia-verification-[timestamp].json
└── deployments/
    ├── nigerian-stocks-sepolia-11155111.json
    └── ngn-dex-sepolia-11155111.json (if DEX deployed)
```

## 🌐 Etherscan Links

After verification, your contracts will be available at:

- **Factory**: `https://sepolia.etherscan.io/address/[FACTORY_ADDRESS]`
- **Tokens**: `https://sepolia.etherscan.io/address/[TOKEN_ADDRESS]`
- **DEX**: `https://sepolia.etherscan.io/address/[DEX_ADDRESS]`

## 🎯 Next Steps

After verification:

1. **Test Contract Interaction**: Use Etherscan's "Write Contract" tab
2. **Update Frontend**: Ensure frontend uses verified contract addresses
3. **Documentation**: Update README with verified contract links
4. **Security**: Consider getting contracts audited

## 📞 Support

If verification fails:
1. Check the troubleshooting section above
2. Review the generated verification report
3. Ensure all prerequisites are met
4. Contact the development team with error details

---

**Note**: Verification is a one-time process per contract. Once verified, the contract source code will be permanently available on Etherscan.
