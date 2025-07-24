"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatEther } from "ethers";
import {
  NGNStablecoinABI,
  CONTRACT_ADDRESSES,
} from "@/abis";

export interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  name: string;
  decimals: number;
  isStablecoin: boolean;
}

export const useTokenBalances = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract addresses for current network
  const contractAddresses = chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : null;

  // NGN Stablecoin balance
  const { data: ngnBalance, refetch: refetchNGN } = useReadContract({
    address: contractAddresses?.ngnStablecoin as `0x${string}`,
    abi: NGNStablecoinABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!contractAddresses?.ngnStablecoin,
    },
  });

  // Popular stock tokens to check balances for
  const popularTokens = useMemo(() => [
    { symbol: "DANGCEM", name: "Dangote Cement" },
    { symbol: "MTNN", name: "MTN Nigeria" },
    { symbol: "ZENITHBANK", name: "Zenith Bank" },
    { symbol: "GTCO", name: "Guaranty Trust Bank" },
    { symbol: "ACCESS", name: "Access Bank" },
    { symbol: "FBNH", name: "FBN Holdings" },
    { symbol: "UBA", name: "United Bank for Africa" },
    { symbol: "NESTLE", name: "Nestle Nigeria" },
    { symbol: "BUACEMENT", name: "BUA Cement" },
    { symbol: "AIRTELAFRI", name: "Airtel Africa" },
  ], []);

  // Function to fetch individual token balance
  const fetchTokenBalance = useCallback(async (tokenSymbol: string, tokenAddress: string, tokenName: string) => {
    if (!address) return null;

    try {
      // This would need to be implemented with individual useReadContract hooks
      // For now, we'll return a placeholder
      return {
        symbol: tokenSymbol,
        balance: "0",
        address: tokenAddress,
        name: tokenName,
        decimals: 18,
        isStablecoin: false,
      };
    } catch (error) {
      console.error(`Error fetching balance for ${tokenSymbol}:`, error);
      return null;
    }
  }, [address]);

  // Load all token balances
  const loadTokenBalances = useCallback(async () => {
    if (!address || !contractAddresses) {
      setTokenBalances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balances: TokenBalance[] = [];

      // Add NGN Stablecoin
      if (ngnBalance) {
        balances.push({
          symbol: "NGN",
          balance: formatEther(ngnBalance.toString()),
          address: contractAddresses.ngnStablecoin,
          name: "Nigerian Naira Stablecoin",
          decimals: 18,
          isStablecoin: true,
        });
      }

      // Add stock tokens
      for (const token of popularTokens) {
        const tokenAddress = contractAddresses.tokens[token.symbol as keyof typeof contractAddresses.tokens];
        if (tokenAddress) {
          const tokenBalance = await fetchTokenBalance(token.symbol, tokenAddress, token.name);
          if (tokenBalance) {
            balances.push(tokenBalance);
          }
        }
      }

      setTokenBalances(balances);
    } catch (err) {
      console.error("Error loading token balances:", err);
      setError("Failed to load token balances");
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddresses, ngnBalance, fetchTokenBalance, popularTokens]);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    await refetchNGN();
    await loadTokenBalances();
  }, [refetchNGN, loadTokenBalances]);

  // Load balances when dependencies change
  useEffect(() => {
    loadTokenBalances();
  }, [loadTokenBalances]);

  // Get balance for specific token
  const getTokenBalance = useCallback((symbol: string) => {
    return tokenBalances.find(token => token.symbol === symbol);
  }, [tokenBalances]);

  // Get total portfolio value (in NGN)
  const getTotalValue = useCallback(() => {
    const ngnBalance = getTokenBalance("NGN");
    const ngnValue = ngnBalance ? parseFloat(ngnBalance.balance) : 0;
    
    // For stock tokens, we'd need current prices to calculate total value
    // For now, just return NGN balance
    return ngnValue;
  }, [getTokenBalance]);

  return {
    tokenBalances,
    isLoading,
    error,
    refreshBalances,
    getTokenBalance,
    getTotalValue,
    hasBalances: tokenBalances.length > 0,
  };
};

export default useTokenBalances;
