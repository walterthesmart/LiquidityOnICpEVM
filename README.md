
# Liquidity - Nigerian Stock Trading Platform 🇳🇬

Liquidity is a decentralized stock trading platform that allows users to trade tokenized stocks from the Nigerian Stock Exchange (NGX) on the Hedera Hashgraph network. The platform provides a seamless experience for Nigerian investors to buy and sell blue-chip stock tokens using HBAR and traditional Nigerian payment methods.

## 🚀 Key Features

- **Hedera Hashgraph Integration**: Fast, secure, and low-cost transactions
- **Tokenized NGX Stocks**: Access to major Nigerian companies like Dangote Cement, MTN Nigeria, Zenith Bank
- **Multiple Wallet Support**: HashPack, Blade, Kabila, and MetaMask compatibility
- **Real-time Price Updates**: Live NGX stock prices and market data
- **Nigerian Payment Methods**: Paystack integration with cards, bank transfers, USSD
- **Portfolio Management**: Track your Nigerian stock holdings and performance
- **Security Features**: Advanced rate limiting, blacklisting, and emergency controls

## 📈 Supported Nigerian Stocks

### Banking Sector
- **ZENITHBANK** - Zenith Bank Plc
- **GTCO** - Guaranty Trust Holding Company Plc
- **ACCESS** - Access Holdings Plc
- **UBA** - United Bank for Africa Plc
- **FBNH** - FBN Holdings Plc
- **STANBIC** - Stanbic IBTC Holdings Plc

### Industrial/Cement Sector
- **DANGCEM** - Dangote Cement Plc
- **BUACEMENT** - BUA Cement Plc
- **WAPCO** - Lafarge Africa Plc

### Telecommunications
- **MTNN** - MTN Nigeria Communications Plc
- **AIRTELAFRI** - Airtel Africa Plc

### Consumer Goods
- **NB** - Nigerian Breweries Plc
- **NESTLE** - Nestle Nigeria Plc
- **FLOURMILL** - Flour Mills of Nigeria Plc

### Oil & Gas
- **SEPLAT** - Seplat Energy Plc

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with TypeScript (Strict Mode)
- **Blockchain**: Hedera Hashgraph (Testnet/Mainnet)
- **Smart Contracts**: Solidity with Hedera Token Service (HTS)
- **Database**: MongoDB with Nigerian stock data
- **Authentication**: Clerk
- **Payments**: Paystack (Nigerian payment processor)
- **Styling**: Tailwind CSS
- **Security**: OpenZeppelin contracts with custom enhancements

## 🏗 Architecture

### Smart Contract Layer
- **NigerianStockToken.sol**: Main contract for stock tokenization
- **SecurityEnhancements.sol**: Advanced security patterns
- **Hedera Token Service**: Native token creation and management

### Backend Services
- **Nigerian Stock Price Service**: Real-time NGX price fetching
- **Payment Service**: Paystack integration for Naira payments
- **Hedera SDK**: Blockchain interaction utilities

### Frontend Components
- **Hedera Wallet Manager**: Multi-wallet connection support
- **Stock Trading Interface**: Buy/sell Nigerian stocks
- **Portfolio Dashboard**: Track holdings and performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Hedera Testnet Account
- Paystack Account (for payments)
- Supported Hedera wallet (HashPack, Blade, Kabila, or MetaMask)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/Liquidity.git
cd Liquidity
```

2. **Install frontend dependencies:**
```bash
cd site
npm install
```

3. **Install contract dependencies:**
```bash
cd ../contracts/hedera
npm install
```

4. **Set up environment variables:**
```bash
cd ../../site
cp .env.example .env.local
```

5. **Configure your environment variables in `.env.local`:**
```env
# Database
CONN_STRING=mongodb://localhost:27017/Liquidity

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Hedera Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=your_private_key
NEXT_PUBLIC_HEDERA_CONTRACT_ID=0.0.CONTRACT_ID

# Hedera URLs
NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
NEXT_PUBLIC_HEDERA_TESTNET_MIRROR_URL=https://testnet.mirrornode.hedera.com

# Paystack (Nigerian Payments)
PAYSTACK_URL=https://api.paystack.co
TEST_PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
LIVE_PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key

# WhatsApp Notifications (Optional)
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_id
NOTIFIER_NUMBER=your_notification_number
```

6. **Run database migration:**
```bash
npm run migrate:nigerian-stocks
```

7. **Start the development server:**
```bash
npm run dev
```

## 📝 Smart Contract Deployment

### Deploy to Hedera Testnet

1. **Navigate to contracts directory:**
```bash
cd contracts/hedera
```

2. **Compile contracts:**
```bash
npm run compile
```

3. **Deploy to Hedera Testnet:**
```bash
npm run deploy:testnet
```

4. **Update environment variables with deployed contract address**

### Deploy to Hedera Mainnet

```bash
npm run deploy:mainnet
```

## 🔧 API Endpoints

### Nigerian Stocks API

- `GET /api/nigerian-stocks?action=stocks` - Get all Nigerian stocks
- `GET /api/nigerian-stocks?action=prices` - Get all stock prices
- `GET /api/nigerian-stocks?action=prices&symbol=DANGCEM` - Get specific stock price
- `GET /api/nigerian-stocks?action=market-stats` - Get market statistics
- `POST /api/nigerian-stocks` - Handle stock purchases and sales

### Example Usage

```javascript
// Fetch all Nigerian stocks
const response = await fetch('/api/nigerian-stocks?action=stocks');
const { data: stocks } = await response.json();

// Get Dangote Cement price
const priceResponse = await fetch('/api/nigerian-stocks?action=prices&symbol=DANGCEM');
const { data: price } = await priceResponse.json();

// Purchase stock
const purchaseResponse = await fetch('/api/nigerian-stocks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'purchase',
    userEmail: 'user@example.com',
    userWallet: '0.0.123456',
    stockSymbol: 'DANGCEM',
    sharesAmount: 100
  })
});
```

## 🔐 Security Features

- **Rate Limiting**: Prevents spam transactions
- **Blacklisting**: Admin can blacklist suspicious addresses
- **Emergency Stop**: Circuit breaker for emergency situations
- **Transaction Limits**: Daily and per-transaction limits
- **Access Control**: Role-based permissions
- **ReentrancyGuard**: Prevents reentrancy attacks

## 💰 Payment Integration

### Supported Payment Methods

- **Bank Cards**: Visa, Mastercard, Verve
- **Bank Transfer**: Direct bank transfers
- **USSD**: Mobile banking codes
- **Mobile Money**: Various mobile money providers
- **QR Codes**: Quick payment via QR scanning

### Nigerian Banks Supported

All major Nigerian banks are supported including:
- Access Bank, First Bank, GTBank, Zenith Bank, UBA, Stanbic IBTC, and more

## 📱 Wallet Integration

### Supported Wallets

The application uses RainbowKit for wallet connectivity, supporting all major EVM wallets including:

1. **MetaMask** - Most popular Ethereum wallet
2. **WalletConnect** - Connect with mobile wallets
3. **Coinbase Wallet** - Coinbase's native wallet
4. **Rainbow Wallet** - Mobile-first Ethereum wallet
5. **And many more** - RainbowKit supports 100+ wallets

### Wallet Connection

```javascript
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function WalletConnection() {
  const { isConnected, address } = useAccount();

  return (
    <div>
      <ConnectButton />
      {isConnected && <p>Connected: {address}</p>}
    </div>
  );
}
```

## 🧪 Testing

### Run Tests

```bash
# Frontend tests
cd site
npm test

# Smart contract tests
cd contracts/hedera
npm test
```

### Test Coverage

```bash
npm run coverage
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contract Deployment

Contracts are deployed to Hedera Testnet/Mainnet using the deployment scripts.

## 📊 Monitoring

### Market Data

- Real-time NGX stock prices
- Market statistics and trends
- Trading volume and market cap

### Transaction Monitoring

- Payment status tracking
- Blockchain transaction monitoring
- Error logging and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Update documentation
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔗 Links

- [Hedera Hashgraph](https://hedera.com)
- [Nigerian Stock Exchange](https://ngxgroup.com)
- [Paystack](https://paystack.com)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Made with ❤️ for Nigerian investors**
