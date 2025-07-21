/**
 * React hooks for Hedera token integration
 * Provides easy access to deployed Nigerian stock tokens on Hedera
 */

import { useState, useEffect, useMemo } from 'react';
import {
  // HEDERA_NIGERIAN_STOCK_TOKENS, // Available for future use
  HederaTokenInfo,
  HederaTokenSymbol,
  getHederaTokenBySymbol,
  getAllHederaTokens,
  getTokenIdBySymbol,
  getExplorerUrlBySymbol,
  hasHederaToken,
  getTokenDisplayInfo,
  HEDERA_NETWORK_CONFIG
} from '@/lib/hedera-tokens';

export interface UseHederaTokenReturn {
  token: HederaTokenInfo | null;
  loading: boolean;
  error: string | null;
  isDeployed: boolean;
  explorerUrl: string | null;
  tokenId: string | null;
}

/**
 * Hook to get a specific Hedera token by symbol
 */
export const useHederaToken = (symbol: string): UseHederaTokenReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!symbol) {
      return {
        token: null,
        isDeployed: false,
        explorerUrl: null,
        tokenId: null
      };
    }

    if (!hasHederaToken(symbol)) {
      return {
        token: null,
        isDeployed: false,
        explorerUrl: null,
        tokenId: null
      };
    }

    const token = getHederaTokenBySymbol(symbol as HederaTokenSymbol);
    return {
      token: token || null,
      isDeployed: true,
      explorerUrl: token?.explorerUrl || null,
      tokenId: token?.tokenId || null
    };
  }, [symbol]);

  useEffect(() => {
    setLoading(false);
    setError(null);
  }, [symbol]);

  return {
    ...result,
    loading,
    error
  };
};

/**
 * Hook to get all deployed Hedera tokens
 */
export const useAllHederaTokens = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tokens = useMemo(() => getAllHederaTokens(), []);

  useEffect(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    tokens,
    loading,
    error,
    count: tokens.length
  };
};

/**
 * Hook to search tokens by name or symbol
 */
export const useHederaTokenSearch = (query: string) => {
  const { tokens } = useAllHederaTokens();
  
  const filteredTokens = useMemo(() => {
    if (!query.trim()) return tokens;
    
    const lowercaseQuery = query.toLowerCase();
    return tokens.filter(token => 
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.symbol.toLowerCase().includes(lowercaseQuery)
    );
  }, [tokens, query]);

  return { 
    tokens: filteredTokens,
    hasResults: filteredTokens.length > 0,
    resultCount: filteredTokens.length
  };
};

/**
 * Hook to get token display information with enhanced metadata
 */
export const useTokenDisplayInfo = (symbol: string) => {
  const { token, isDeployed, loading, error } = useHederaToken(symbol);
  
  const displayInfo = useMemo(() => {
    if (!token || !isDeployed) return null;
    
    return getTokenDisplayInfo(symbol as HederaTokenSymbol);
  }, [token, isDeployed, symbol]);

  return {
    displayInfo,
    isDeployed,
    loading,
    error
  };
};

/**
 * Hook to check if multiple symbols have deployed tokens
 */
export const useTokenDeploymentStatus = (symbols: string[]) => {
  const deploymentStatus = useMemo(() => {
    return symbols.map(symbol => ({
      symbol,
      isDeployed: hasHederaToken(symbol),
      tokenId: hasHederaToken(symbol) ? getTokenIdBySymbol(symbol as HederaTokenSymbol) : null,
      explorerUrl: hasHederaToken(symbol) ? getExplorerUrlBySymbol(symbol as HederaTokenSymbol) : null
    }));
  }, [symbols]);

  const stats = useMemo(() => {
    const deployed = deploymentStatus.filter(item => item.isDeployed).length;
    const total = deploymentStatus.length;
    
    return {
      deployed,
      total,
      percentage: total > 0 ? Math.round((deployed / total) * 100) : 0
    };
  }, [deploymentStatus]);

  return {
    deploymentStatus,
    stats
  };
};

/**
 * Hook for Hedera network configuration
 */
export const useHederaNetworkConfig = () => {
  return {
    config: HEDERA_NETWORK_CONFIG,
    isTestnet: HEDERA_NETWORK_CONFIG.network === 'testnet',
    isMainnet: HEDERA_NETWORK_CONFIG.network === 'mainnet',
    explorerBaseUrl: HEDERA_NETWORK_CONFIG.explorerBaseUrl,
    mirrorNodeUrl: HEDERA_NETWORK_CONFIG.mirrorNodeUrl,
    jsonRpcUrl: HEDERA_NETWORK_CONFIG.jsonRpcUrl
  };
};

/**
 * Hook to get tokens grouped by sector (based on company names)
 */
export const useTokensBySector = () => {
  const { tokens } = useAllHederaTokens();

  const tokensBySector = useMemo(() => {
    const sectors: Record<string, HederaTokenInfo[]> = {
      Banking: [],
      Telecommunications: [],
      Cement: [],
      'Consumer Goods': [],
      'Oil & Gas': [],
      Utilities: [],
      Healthcare: [],
      Agriculture: [],
      Technology: [],
      Hospitality: [],
      Conglomerate: []
    };

    tokens.forEach(token => {
      const name = token.name.toLowerCase();
      
      if (name.includes('bank')) {
        sectors.Banking.push(token);
      } else if (name.includes('mtn') || name.includes('airtel')) {
        sectors.Telecommunications.push(token);
      } else if (name.includes('cement')) {
        sectors.Cement.push(token);
      } else if (name.includes('brewery') || name.includes('food') || name.includes('nestle') || name.includes('unilever') || name.includes('cadbury') || name.includes('guinness')) {
        sectors['Consumer Goods'].push(token);
      } else if (name.includes('oil') || name.includes('energy') || name.includes('seplat') || name.includes('oando') || name.includes('conoil') || name.includes('total') || name.includes('eterna')) {
        sectors['Oil & Gas'].push(token);
      } else if (name.includes('power') || name.includes('geregu')) {
        sectors.Utilities.push(token);
      } else if (name.includes('healthcare') || name.includes('fidson') || name.includes('baker')) {
        sectors.Healthcare.push(token);
      } else if (name.includes('presco') || name.includes('okomu') || name.includes('livestock')) {
        sectors.Agriculture.push(token);
      } else if (name.includes('cwg')) {
        sectors.Technology.push(token);
      } else if (name.includes('hotel') || name.includes('transcorp hotel')) {
        sectors.Hospitality.push(token);
      } else {
        sectors.Conglomerate.push(token);
      }
    });

    // Remove empty sectors
    return Object.fromEntries(
      Object.entries(sectors).filter(([, tokens]) => tokens.length > 0)
    );
  }, [tokens]);

  return {
    tokensBySector,
    sectors: Object.keys(tokensBySector),
    sectorCount: Object.keys(tokensBySector).length
  };
};

/**
 * Hook to validate if a symbol is supported
 */
export const useTokenValidation = () => {
  const validateSymbol = (symbol: string): {
    isValid: boolean;
    isDeployed: boolean;
    message: string;
  } => {
    if (!symbol || symbol.trim() === '') {
      return {
        isValid: false,
        isDeployed: false,
        message: 'Symbol is required'
      };
    }

    const upperSymbol = symbol.toUpperCase();
    
    if (!hasHederaToken(upperSymbol)) {
      return {
        isValid: false,
        isDeployed: false,
        message: `Token ${upperSymbol} is not deployed on Hedera`
      };
    }

    return {
      isValid: true,
      isDeployed: true,
      message: `Token ${upperSymbol} is deployed and ready`
    };
  };

  return { validateSymbol };
};
