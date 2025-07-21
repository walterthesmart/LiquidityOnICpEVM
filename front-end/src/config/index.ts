// RainbowKit configuration for Hedera integration
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Define Hedera custom chains
export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
  iconUrl: '/logo/png/HEDERA.png',
  iconBackground: '#fff',
} as const;

export const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  network: 'hedera-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL || 'https://mainnet.hashio.io/api'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL || 'https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
  iconUrl: '/logo/png/HEDERA.png',
  iconBackground: '#fff',
} as const;

// Legacy RainbowKit configuration - now replaced by the main configuration in rainbowkit.tsx
// This config is kept for reference but the active configuration includes Hedera networks

export const config = getDefaultConfig({
  appName: 'Liquidity Nigerian Stock Trading',
  projectId,
  chains: [
    // Include popular chains for broader wallet support
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ],
  ssr: true,
});
