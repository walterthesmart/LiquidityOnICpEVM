"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import { bitfinityTestnet, bitfinityMainnet, hederaTestnet, hederaMainnet } from '@/config';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

// RainbowKit configuration for EVM wallet support
// Including Hedera networks alongside standard EVM chains

const config = getDefaultConfig({
  appName: 'Liquidity Nigerian Stock Trading',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694',
  chains: [
    // Primary Bitfinity EVM networks for Nigerian stock trading
    bitfinityTestnet,
    bitfinityMainnet,
    // Legacy Hedera networks (for migration compatibility)
    hederaTestnet,
    hederaMainnet,
    // Popular EVM chains for broader wallet support
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

interface RainbowKitAppProviderProps {
  children: ReactNode;
}

export function RainbowKitAppProvider({ children }: RainbowKitAppProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#000000',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default RainbowKitAppProvider;
