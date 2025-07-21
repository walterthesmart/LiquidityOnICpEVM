// MongoDB collections removed - using Turso database now
// Currency converter import removed as it's not used in this file
import { getEnhancedStockBySymbol } from './enhanced-stock-data';

/**
 * Nigerian Stock Exchange (NGX) Price Service
 * Fetches real-time and historical stock prices for Nigerian companies
 * Now integrated with Hedera token deployment data
 */

// Mock NGX API response interface (replace with actual API structure)
interface NGXStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

// Base stock price interface
export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

// Nigerian Stock Exchange trading hours
const NGX_TRADING_HOURS = {
  open: 9.5, // 9:30 AM
  close: 14.5, // 2:30 PM
  timezone: 'Africa/Lagos'
};

/**
 * Check if NGX market is currently open
 */
export function isNGXMarketOpen(): boolean {
  const now = new Date();
  const lagosTime = new Date(now.toLocaleString("en-US", { timeZone: NGX_TRADING_HOURS.timezone }));
  
  const day = lagosTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = lagosTime.getHours() + lagosTime.getMinutes() / 60;
  
  // Check if it's a weekday (Monday = 1, Friday = 5)
  const isWeekday = day >= 1 && day <= 5;
  
  // Check if it's within trading hours
  const isDuringTradingHours = hour >= NGX_TRADING_HOURS.open && hour <= NGX_TRADING_HOURS.close;
  
  return isWeekday && isDuringTradingHours;
}

/**
 * Mock Nigerian stock price data (replace with real API integration)
 * In production, this should integrate with NGX API or financial data providers
 */
const MOCK_NGX_PRICES: Record<string, NGXStockData> = {
  DANGCEM: {
    symbol: "DANGCEM",
    name: "Dangote Cement Plc",
    price: 452.50,
    change: 12.50,
    changePercent: 2.84,
    volume: 1250000,
    marketCap: 7710000000000,
    lastUpdated: new Date().toISOString()
  },
  MTNN: {
    symbol: "MTNN",
    name: "MTN Nigeria Communications Plc",
    price: 198.75,
    change: -3.25,
    changePercent: -1.61,
    volume: 2100000,
    marketCap: 4050000000000,
    lastUpdated: new Date().toISOString()
  },
  ZENITHBANK: {
    symbol: "ZENITHBANK",
    name: "Zenith Bank Plc",
    price: 35.40,
    change: 1.10,
    changePercent: 3.21,
    volume: 5600000,
    marketCap: 1112000000000,
    lastUpdated: new Date().toISOString()
  },
  GTCO: {
    symbol: "GTCO",
    name: "Guaranty Trust Holding Company Plc",
    price: 45.80,
    change: 0.80,
    changePercent: 1.78,
    volume: 3200000,
    marketCap: 1348000000000,
    lastUpdated: new Date().toISOString()
  },
  NB: {
    symbol: "NB",
    name: "Nigerian Breweries Plc",
    price: 84.20,
    change: -1.80,
    changePercent: -2.09,
    volume: 890000,
    marketCap: 675000000000,
    lastUpdated: new Date().toISOString()
  },
  ACCESS: {
    symbol: "ACCESS",
    name: "Access Holdings Plc",
    price: 18.45,
    change: 0.45,
    changePercent: 2.50,
    volume: 4100000,
    marketCap: 659000000000,
    lastUpdated: new Date().toISOString()
  },
  BUACEMENT: {
    symbol: "BUACEMENT",
    name: "BUA Cement Plc",
    price: 95.60,
    change: 3.60,
    changePercent: 3.91,
    volume: 1800000,
    marketCap: 3346000000000,
    lastUpdated: new Date().toISOString()
  },
  AIRTELAFRI: {
    symbol: "AIRTELAFRI",
    name: "Airtel Africa Plc",
    price: 492.30,
    change: 7.30,
    changePercent: 1.51,
    volume: 650000,
    marketCap: 1848000000000,
    lastUpdated: new Date().toISOString()
  },
  FBNH: {
    symbol: "FBNH",
    name: "FBN Holdings Plc",
    price: 13.25,
    change: -0.25,
    changePercent: -1.85,
    volume: 6200000,
    marketCap: 475000000000,
    lastUpdated: new Date().toISOString()
  },
  UBA: {
    symbol: "UBA",
    name: "United Bank for Africa Plc",
    price: 14.85,
    change: 0.35,
    changePercent: 2.41,
    volume: 4800000,
    marketCap: 533000000000,
    lastUpdated: new Date().toISOString()
  },
  NESTLE: {
    symbol: "NESTLE",
    name: "Nestle Nigeria Plc",
    price: 1185.50,
    change: 25.50,
    changePercent: 2.20,
    volume: 125000,
    marketCap: 1422600000000,
    lastUpdated: new Date().toISOString()
  },
  SEPLAT: {
    symbol: "SEPLAT",
    name: "Seplat Energy Plc",
    price: 485.20,
    change: 15.20,
    changePercent: 3.23,
    volume: 980000,
    marketCap: 2862680000000,
    lastUpdated: new Date().toISOString()
  },
  STANBIC: {
    symbol: "STANBIC",
    name: "Stanbic IBTC Holdings Plc",
    price: 52.75,
    change: 1.25,
    changePercent: 2.43,
    volume: 1650000,
    marketCap: 619687500000,
    lastUpdated: new Date().toISOString()
  },
  WAPCO: {
    symbol: "WAPCO",
    name: "Lafarge Africa Plc",
    price: 26.80,
    change: -0.40,
    changePercent: -1.47,
    volume: 2200000,
    marketCap: 482400000000,
    lastUpdated: new Date().toISOString()
  },
  FLOURMILL: {
    symbol: "FLOURMILL",
    name: "Flour Mills of Nigeria Plc",
    price: 32.90,
    change: 1.15,
    changePercent: 3.62,
    volume: 3100000,
    marketCap: 1283100000000,
    lastUpdated: new Date().toISOString()
  },

  // Additional Major Nigerian Stocks
  BUAFOODS: {
    symbol: "BUAFOODS",
    name: "BUA Foods Plc",
    price: 459.00,
    change: 12.50,
    changePercent: 2.80,
    volume: 1850000,
    marketCap: 8262000000000,
    lastUpdated: new Date().toISOString()
  },
  DANGSUGAR: {
    symbol: "DANGSUGAR",
    name: "Dangote Sugar Refinery Plc",
    price: 50.00,
    change: 0.20,
    changePercent: 0.40,
    volume: 2100000,
    marketCap: 607340000000,
    lastUpdated: new Date().toISOString()
  },
  GUINNESS: {
    symbol: "GUINNESS",
    name: "Guinness Nigeria Plc",
    price: 96.80,
    change: -2.20,
    changePercent: -2.22,
    volume: 890000,
    marketCap: 212030000000,
    lastUpdated: new Date().toISOString()
  },
  CADBURY: {
    symbol: "CADBURY",
    name: "Cadbury Nigeria Plc",
    price: 59.65,
    change: 1.15,
    changePercent: 1.96,
    volume: 1200000,
    marketCap: 136020000000,
    lastUpdated: new Date().toISOString()
  },
  TRANSCORP: {
    symbol: "TRANSCORP",
    name: "Transnational Corporation of Nigeria Plc",
    price: 50.75,
    change: -4.25,
    changePercent: -7.73,
    volume: 3500000,
    marketCap: 515720000000,
    lastUpdated: new Date().toISOString()
  },
  UACN: {
    symbol: "UACN",
    name: "UAC of Nigeria Plc",
    price: 48.20,
    change: 4.20,
    changePercent: 9.55,
    volume: 750000,
    marketCap: 141040000000,
    lastUpdated: new Date().toISOString()
  },
  UNILEVER: {
    symbol: "UNILEVER",
    name: "Unilever Nigeria Plc",
    price: 58.00,
    change: 0.00,
    changePercent: 0.00,
    volume: 450000,
    marketCap: 333210000000,
    lastUpdated: new Date().toISOString()
  },
  PZ: {
    symbol: "PZ",
    name: "PZ Cussons Nigeria Plc",
    price: 35.30,
    change: -0.70,
    changePercent: -1.94,
    volume: 980000,
    marketCap: 140160000000,
    lastUpdated: new Date().toISOString()
  },
  OANDO: {
    symbol: "OANDO",
    name: "Oando Plc",
    price: 52.00,
    change: -0.10,
    changePercent: -0.19,
    volume: 2800000,
    marketCap: 700300000000,
    lastUpdated: new Date().toISOString()
  },
  CONOIL: {
    symbol: "CONOIL",
    name: "Conoil Plc",
    price: 234.50,
    change: 5.50,
    changePercent: 2.40,
    volume: 320000,
    marketCap: 162730000000,
    lastUpdated: new Date().toISOString()
  },
  TOTAL: {
    symbol: "TOTAL",
    name: "TotalEnergies Marketing Nigeria Plc",
    price: 705.00,
    change: 15.00,
    changePercent: 2.17,
    volume: 180000,
    marketCap: 239360000000,
    lastUpdated: new Date().toISOString()
  },
  ETERNA: {
    symbol: "ETERNA",
    name: "Eterna Plc",
    price: 42.50,
    change: 1.00,
    changePercent: 2.41,
    volume: 650000,
    marketCap: 55430000000,
    lastUpdated: new Date().toISOString()
  },
  GEREGU: {
    symbol: "GEREGU",
    name: "Geregu Power Plc",
    price: 1141.50,
    change: 25.50,
    changePercent: 2.29,
    volume: 95000,
    marketCap: 2853750000000,
    lastUpdated: new Date().toISOString()
  },
  TRANSPOWER: {
    symbol: "TRANSPOWER",
    name: "Transcorp Power Plc",
    price: 320.00,
    change: 8.00,
    changePercent: 2.56,
    volume: 420000,
    marketCap: 2400000000000,
    lastUpdated: new Date().toISOString()
  },
  FIDSON: {
    symbol: "FIDSON",
    name: "Fidson Healthcare Plc",
    price: 46.10,
    change: 1.60,
    changePercent: 3.60,
    volume: 580000,
    marketCap: 105800000000,
    lastUpdated: new Date().toISOString()
  },
  MAYBAKER: {
    symbol: "MAYBAKER",
    name: "May & Baker Nigeria Plc",
    price: 17.00,
    change: -0.50,
    changePercent: -2.86,
    volume: 890000,
    marketCap: 29330000000,
    lastUpdated: new Date().toISOString()
  },
  PRESCO: {
    symbol: "PRESCO",
    name: "Presco Plc",
    price: 1233.00,
    change: 33.00,
    changePercent: 2.75,
    volume: 65000,
    marketCap: 1233000000000,
    lastUpdated: new Date().toISOString()
  },
  OKOMUOIL: {
    symbol: "OKOMUOIL",
    name: "The Okomu Oil Palm Company Plc",
    price: 930.00,
    change: 40.00,
    changePercent: 4.49,
    volume: 85000,
    marketCap: 887140000000,
    lastUpdated: new Date().toISOString()
  },
  LIVESTOCK: {
    symbol: "LIVESTOCK",
    name: "Livestock Feeds Plc",
    price: 8.80,
    change: -0.20,
    changePercent: -2.22,
    volume: 1200000,
    marketCap: 26400000000,
    lastUpdated: new Date().toISOString()
  },
  CWG: {
    symbol: "CWG",
    name: "CWG Plc",
    price: 16.10,
    change: 0.60,
    changePercent: 3.87,
    volume: 750000,
    marketCap: 40650000000,
    lastUpdated: new Date().toISOString()
  },
  TRANSCOHOT: {
    symbol: "TRANSCOHOT",
    name: "Transcorp Hotels Plc",
    price: 142.40,
    change: 5.40,
    changePercent: 3.94,
    volume: 380000,
    marketCap: 1458540000000,
    lastUpdated: new Date().toISOString()
  }
};

/**
 * Enhanced stock price interface with Hedera integration
 */
export interface EnhancedStockPrice extends StockPrice {
  hederaTokenId?: string;
  hederaExplorerUrl?: string;
  isHederaDeployed: boolean;
  blockchain: 'hedera';
  tokenStandard: 'HTS';
}

/**
 * Enhance stock price data with Hedera token information
 */
function enhanceStockPriceWithHedera(stockPrice: StockPrice): EnhancedStockPrice {
  const enhancedStock = getEnhancedStockBySymbol(stockPrice.symbol);

  return {
    ...stockPrice,
    hederaTokenId: enhancedStock?.hederaTokenAddress || undefined,
    hederaExplorerUrl: enhancedStock?.hederaExplorerUrl,
    isHederaDeployed: enhancedStock?.isHederaDeployed || false,
    blockchain: 'hedera',
    tokenStandard: 'HTS'
  };
}

/**
 * Fetch current stock price for a Nigerian stock with Hedera integration
 */
export async function fetchNigerianStockPrice(symbol: string): Promise<StockPrice | null> {
  try {
    // In production, replace this with actual NGX API call
    // const response = await fetch(`${process.env.NGX_API_URL}/stocks/${symbol}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.NGX_API_KEY}`
    //   }
    // });
    // const data = await response.json();
    
    // For now, use mock data
    const stockData = MOCK_NGX_PRICES[symbol];
    
    if (!stockData) {
      console.warn(`No price data found for stock: ${symbol}`);
      return null;
    }

    // Add random variation to simulate real-time price changes
    const priceVariation = (Math.random() - 0.5) * 2; // -1 to +1 NGN
    const adjustedPrice = Math.max(0.01, stockData.price + priceVariation);
    const adjustedChange = stockData.change + priceVariation;

    return {
      symbol: stockData.symbol,
      name: stockData.name,
      price: adjustedPrice,
      change: adjustedChange,
      changePercent: (adjustedChange / (adjustedPrice - adjustedChange)) * 100,
      volume: stockData.volume,
      marketCap: stockData.marketCap,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch prices for all Nigerian stocks
 */
export async function fetchAllNigerianStockPrices(): Promise<StockPrice[]> {
  const symbols = Object.keys(MOCK_NGX_PRICES);
  const prices: StockPrice[] = [];

  for (const symbol of symbols) {
    const price = await fetchNigerianStockPrice(symbol);
    if (price) {
      prices.push(price);
    }
  }

  return prices;
}

/**
 * Fetch enhanced stock price with Hedera integration
 */
export async function fetchEnhancedNigerianStockPrice(symbol: string): Promise<EnhancedStockPrice | null> {
  const stockPrice = await fetchNigerianStockPrice(symbol);
  if (!stockPrice) return null;

  return enhanceStockPriceWithHedera(stockPrice);
}

/**
 * Fetch all enhanced stock prices with Hedera integration
 */
export async function fetchAllEnhancedNigerianStockPrices(): Promise<EnhancedStockPrice[]> {
  const prices = await fetchAllNigerianStockPrices();
  return prices.map(price => enhanceStockPriceWithHedera(price));
}

/**
 * Fetch only stocks that have deployed Hedera tokens
 */
export async function fetchHederaDeployedStockPrices(): Promise<EnhancedStockPrice[]> {
  const allPrices = await fetchAllEnhancedNigerianStockPrices();
  return allPrices.filter(price => price.isHederaDeployed);
}

/**
 * Get historical price data for a stock (mock implementation)
 */
export async function getHistoricalPrices(
  symbol: string,
  days: number = 30
): Promise<Array<{ date: Date; price: number; volume: number }>> {
  const basePrice = MOCK_NGX_PRICES[symbol]?.price || 100;
  const historical: Array<{ date: Date; price: number; volume: number }> = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate mock historical data with some volatility
    const volatility = 0.05; // 5% daily volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomChange * (i / days));
    const volume = Math.floor(Math.random() * 2000000) + 500000;

    historical.push({
      date,
      price: Math.max(0.01, price),
      volume
    });
  }

  return historical;
}

/**
 * Calculate market statistics for Nigerian stocks
 */
export async function calculateMarketStats(): Promise<{
  totalMarketCap: number;
  totalVolume: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  topGainers: Array<{ symbol: string; change: number }>;
  topLosers: Array<{ symbol: string; change: number }>;
}> {
  const prices = await fetchAllNigerianStockPrices();
  
  let totalMarketCap = 0;
  let totalVolume = 0;
  let advancers = 0;
  let decliners = 0;
  let unchanged = 0;

  const gainersLosers = prices.map(stock => ({
    symbol: stock.symbol,
    change: stock.change
  }));

  prices.forEach(stock => {
    totalMarketCap += stock.marketCap || 0;
    totalVolume += stock.volume || 0;
    
    if (stock.change > 0) advancers++;
    else if (stock.change < 0) decliners++;
    else unchanged++;
  });

  // Sort for top gainers and losers
  gainersLosers.sort((a, b) => b.change - a.change);
  const topGainers = gainersLosers.slice(0, 5);
  const topLosers = gainersLosers.slice(-5).reverse();

  return {
    totalMarketCap,
    totalVolume,
    advancers,
    decliners,
    unchanged,
    topGainers,
    topLosers
  };
}

/**
 * Get real-time exchange rate for NGN to HBAR conversion
 */
export async function getNGNToHBARRate(): Promise<number> {
  try {
    // In production, fetch from a reliable exchange rate API
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/NGN?access_key=${process.env.EXCHANGE_RATE_API_KEY}`);
    // const data = await response.json();
    // return data.rates.HBAR || 0.00125; // fallback rate
    
    // Mock exchange rate: 1 HBAR = 800 NGN (so 1 NGN = 0.00125 HBAR)
    return 0.00125;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 0.00125; // fallback rate
  }
}

/**
 * Format Nigerian Naira currency
 */
export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage change
 */
export function formatPercentage(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
