"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatEther } from "ethers";
import {
  NGNStablecoinABI,
  NigerianStockTokenABI,
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

  // Type-safe access to token addresses
  const tokens = contractAddresses?.tokens as Record<string, string> | undefined;

  // Individual stock token balance hooks
  const dangcemBalance = useReadContract({
    address: tokens?.DANGCEM as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.DANGCEM,
    },
  });

  const mtnnBalance = useReadContract({
    address: tokens?.MTNN as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.MTNN,
    },
  });

  const zenithbankBalance = useReadContract({
    address: tokens?.ZENITHBANK as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.ZENITHBANK,
    },
  });

  const gtcoBalance = useReadContract({
    address: tokens?.GTCO as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.GTCO,
    },
  });

  const accessBalance = useReadContract({
    address: tokens?.ACCESS as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.ACCESS,
    },
  });

  const fbnhBalance = useReadContract({
    address: tokens?.FBNH as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.FBNH,
    },
  });

  const ubaBalance = useReadContract({
    address: tokens?.UBA as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.UBA,
    },
  });

  const nestleBalance = useReadContract({
    address: tokens?.NESTLE as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.NESTLE,
    },
  });

  const buacementBalance = useReadContract({
    address: tokens?.BUACEMENT as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.BUACEMENT,
    },
  });

  const airtelafriBalance = useReadContract({
    address: tokens?.AIRTELAFRI as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!tokens?.AIRTELAFRI,
    },
  });

  // Map of token balances for easy access
  const tokenBalanceMap = useMemo(() => ({
    DANGCEM: dangcemBalance,
    MTNN: mtnnBalance,
    ZENITHBANK: zenithbankBalance,
    GTCO: gtcoBalance,
    ACCESS: accessBalance,
    FBNH: fbnhBalance,
    UBA: ubaBalance,
    NESTLE: nestleBalance,
    BUACEMENT: buacementBalance,
    AIRTELAFRI: airtelafriBalance,
  }), [
    dangcemBalance,
    mtnnBalance,
    zenithbankBalance,
    gtcoBalance,
    accessBalance,
    fbnhBalance,
    ubaBalance,
    nestleBalance,
    buacementBalance,
    airtelafriBalance,
  ]);

  // Load all token balances
  const loadTokenBalances = useCallback(() => {
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

      // Add stock tokens using individual balance hooks
      for (const token of popularTokens) {
        const tokenAddress = tokens?.[token.symbol];
        const balanceHook = tokenBalanceMap[token.symbol as keyof typeof tokenBalanceMap];

        if (tokenAddress && balanceHook?.data) {
          balances.push({
            symbol: token.symbol,
            balance: formatEther(balanceHook.data.toString()),
            address: tokenAddress,
            name: token.name,
            decimals: 18,
            isStablecoin: false,
          });
        } else if (tokenAddress) {
          // Include token even if balance is 0 or not loaded yet
          balances.push({
            symbol: token.symbol,
            balance: "0",
            address: tokenAddress,
            name: token.name,
            decimals: 18,
            isStablecoin: false,
          });
        }
      }

      setTokenBalances(balances);
    } catch (err) {
      console.error("Error loading token balances:", err);
      setError("Failed to load token balances");
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddresses, ngnBalance, popularTokens, tokens, tokenBalanceMap]);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    await refetchNGN();
    // Refetch all token balances
    await Promise.all([
      dangcemBalance.refetch(),
      mtnnBalance.refetch(),
      zenithbankBalance.refetch(),
      gtcoBalance.refetch(),
      accessBalance.refetch(),
      fbnhBalance.refetch(),
      ubaBalance.refetch(),
      nestleBalance.refetch(),
      buacementBalance.refetch(),
      airtelafriBalance.refetch(),
    ]);
    loadTokenBalances();
  }, [
    refetchNGN,
    loadTokenBalances,
    dangcemBalance,
    mtnnBalance,
    zenithbankBalance,
    gtcoBalance,
    accessBalance,
    fbnhBalance,
    ubaBalance,
    nestleBalance,
    buacementBalance,
    airtelafriBalance,
  ]);

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
