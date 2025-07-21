/**
 * Enhanced Stock Data Service
 * Combines Nigerian stock data with Hedera token deployment information
 */

import { NIGERIAN_STOCKS_DATA } from '@/db/nigerian-stocks-data';
import { 
  getTokenIdBySymbol, 
  hasHederaToken, 
  getHederaTokenBySymbol,
  getExplorerUrlBySymbol,
  HederaTokenSymbol 
} from '@/lib/hedera-tokens';
import { Stock } from '@/db/schema';

export interface EnhancedStockData extends Omit<Stock, 'id' | 'tokenID'> {
  // Hedera integration fields
  hederaExplorerUrl?: string;
  isHederaDeployed: boolean;
  hederaNetwork?: string;
  hederaDecimals?: number;

  // Enhanced metadata
  blockchain: 'hedera';
  tokenStandard: 'HTS'; // Hedera Token Service
  deploymentStatus: 'deployed' | 'pending' | 'not_deployed';
}

/**
 * Enhance stock data with Hedera token information
 */
export function enhanceStockWithHederaData(stock: Omit<Stock, 'id' | 'tokenID' | 'hederaTokenAddress'>): EnhancedStockData {
  const symbol = stock.symbol;
  const isDeployed = hasHederaToken(symbol);
  
  let hederaData = {};
  
  if (isDeployed) {
    const hederaToken = getHederaTokenBySymbol(symbol as HederaTokenSymbol);
    hederaData = {
      hederaTokenAddress: getTokenIdBySymbol(symbol as HederaTokenSymbol),
      hederaExplorerUrl: getExplorerUrlBySymbol(symbol as HederaTokenSymbol),
      hederaNetwork: hederaToken?.network || 'testnet',
      hederaDecimals: hederaToken?.decimals || 18,
      deploymentStatus: 'deployed' as const
    };
  } else {
    hederaData = {
      deploymentStatus: 'not_deployed' as const
    };
  }

  return {
    ...stock,
    hederaTokenAddress: isDeployed ? (getTokenIdBySymbol(symbol as HederaTokenSymbol) || null) : null,
    ...hederaData,
    isHederaDeployed: isDeployed,
    blockchain: 'hedera',
    tokenStandard: 'HTS',
    deploymentStatus: isDeployed ? 'deployed' : 'not_deployed'
  };
}

/**
 * Get all enhanced Nigerian stock data with Hedera integration
 */
export function getEnhancedNigerianStocks(): EnhancedStockData[] {
  return NIGERIAN_STOCKS_DATA.map(stock => enhanceStockWithHederaData(stock));
}

/**
 * Get enhanced stock data by symbol
 */
export function getEnhancedStockBySymbol(symbol: string): EnhancedStockData | null {
  const stock = NIGERIAN_STOCKS_DATA.find(s => s.symbol === symbol);
  if (!stock) return null;
  
  return enhanceStockWithHederaData(stock);
}

/**
 * Get only stocks that have deployed Hedera tokens
 */
export function getDeployedHederaStocks(): EnhancedStockData[] {
  return getEnhancedNigerianStocks().filter(stock => stock.isHederaDeployed);
}

/**
 * Get stocks that are not yet deployed on Hedera
 */
export function getPendingHederaStocks(): EnhancedStockData[] {
  return getEnhancedNigerianStocks().filter(stock => !stock.isHederaDeployed);
}

/**
 * Get deployment statistics
 */
export function getHederaDeploymentStats() {
  const allStocks = getEnhancedNigerianStocks();
  const deployed = allStocks.filter(stock => stock.isHederaDeployed);
  const pending = allStocks.filter(stock => !stock.isHederaDeployed);
  
  return {
    total: allStocks.length,
    deployed: deployed.length,
    pending: pending.length,
    deploymentPercentage: Math.round((deployed.length / allStocks.length) * 100),
    deployedSymbols: deployed.map(stock => stock.symbol),
    pendingSymbols: pending.map(stock => stock.symbol)
  };
}

/**
 * Get stocks grouped by deployment status
 */
export function getStocksByDeploymentStatus() {
  const allStocks = getEnhancedNigerianStocks();
  
  return {
    deployed: allStocks.filter(stock => stock.deploymentStatus === 'deployed'),
    pending: allStocks.filter(stock => stock.deploymentStatus === 'pending'),
    not_deployed: allStocks.filter(stock => stock.deploymentStatus === 'not_deployed')
  };
}

/**
 * Get stocks grouped by sector with Hedera deployment info
 */
export function getStocksBySectorWithHederaInfo() {
  const allStocks = getEnhancedNigerianStocks();
  const sectors: Record<string, EnhancedStockData[]> = {};
  
  allStocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!sectors[sector]) {
      sectors[sector] = [];
    }
    sectors[sector].push(stock);
  });
  
  // Add deployment stats for each sector
  const sectorsWithStats = Object.entries(sectors).map(([sector, stocks]) => {
    const deployed = stocks.filter(stock => stock.isHederaDeployed).length;
    const total = stocks.length;
    
    return {
      sector,
      stocks,
      deploymentStats: {
        deployed,
        total,
        percentage: Math.round((deployed / total) * 100)
      }
    };
  });
  
  return sectorsWithStats;
}

/**
 * Validate stock symbol and return enhanced data if available
 */
export function validateAndGetEnhancedStock(symbol: string): {
  isValid: boolean;
  stock: EnhancedStockData | null;
  isHederaDeployed: boolean;
  message: string;
} {
  if (!symbol || symbol.trim() === '') {
    return {
      isValid: false,
      stock: null,
      isHederaDeployed: false,
      message: 'Symbol is required'
    };
  }

  const stock = getEnhancedStockBySymbol(symbol.toUpperCase());
  
  if (!stock) {
    return {
      isValid: false,
      stock: null,
      isHederaDeployed: false,
      message: `Stock ${symbol.toUpperCase()} not found in Nigerian stocks database`
    };
  }

  return {
    isValid: true,
    stock,
    isHederaDeployed: stock.isHederaDeployed,
    message: stock.isHederaDeployed 
      ? `Stock ${symbol.toUpperCase()} is available with Hedera token ${stock.hederaTokenAddress}`
      : `Stock ${symbol.toUpperCase()} is available but not yet deployed on Hedera`
  };
}

/**
 * Get market cap in different currencies (mock conversion rates)
 */
export function getMarketCapWithCurrency(stock: EnhancedStockData) {
  const ngn = stock.marketCap || 0;

  // Mock conversion rates (in production, use real exchange rates)
  const usdRate = 0.0012; // 1 NGN = 0.0012 USD (approximate)
  const eurRate = 0.0011; // 1 NGN = 0.0011 EUR (approximate)

  return {
    ngn,
    usd: Math.round(ngn * usdRate),
    eur: Math.round(ngn * eurRate),
    formatted: {
      ngn: `₦${(ngn / 1000000000).toFixed(2)}B`,
      usd: `$${((ngn * usdRate) / 1000000).toFixed(2)}M`,
      eur: `€${((ngn * eurRate) / 1000000).toFixed(2)}M`
    }
  };
}

/**
 * Search enhanced stocks with multiple criteria
 */
export function searchEnhancedStocks(query: string, filters?: {
  sector?: string;
  isHederaDeployed?: boolean;
  minMarketCap?: number;
  maxMarketCap?: number;
}) {
  let stocks = getEnhancedNigerianStocks();
  
  // Apply text search
  if (query && query.trim() !== '') {
    const lowercaseQuery = query.toLowerCase();
    stocks = stocks.filter(stock => 
      stock.name.toLowerCase().includes(lowercaseQuery) ||
      stock.symbol.toLowerCase().includes(lowercaseQuery) ||
      stock.sector?.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Apply filters
  if (filters) {
    if (filters.sector) {
      stocks = stocks.filter(stock => stock.sector === filters.sector);
    }
    
    if (filters.isHederaDeployed !== undefined) {
      stocks = stocks.filter(stock => stock.isHederaDeployed === filters.isHederaDeployed);
    }
    
    if (filters.minMarketCap !== undefined) {
      stocks = stocks.filter(stock => (stock.marketCap || 0) >= filters.minMarketCap!);
    }

    if (filters.maxMarketCap !== undefined) {
      stocks = stocks.filter(stock => (stock.marketCap || 0) <= filters.maxMarketCap!);
    }
  }
  
  return stocks;
}
