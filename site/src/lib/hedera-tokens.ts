/**
 * Hedera Token Integration
 * Real deployment data from hedera/exports/
 * Generated at: 2025-07-17T10:56:42.544Z
 */

export interface HederaTokenInfo {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  explorerUrl: string;
}

export interface HederaTokenMetadata {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  treasuryAccountId: string;
  memo: string;
  network: string;
  createdAt: string;
  transactionId: string;
  explorerUrl: string;
}

/**
 * Nigerian Stock Tokens deployed on Hedera Testnet
 * This data is imported from the actual deployment in hedera/exports/
 */
export const HEDERA_NIGERIAN_STOCK_TOKENS: Record<string, HederaTokenInfo> = {
  DANGCEM: {
    tokenId: "0.0.6366676",
    symbol: "DANGCEM",
    name: "Dangote Cement Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366676"
  },
  MTNN: {
    tokenId: "0.0.6366678",
    symbol: "MTNN",
    name: "MTN Nigeria Communications Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366678"
  },
  ZENITHBANK: {
    tokenId: "0.0.6366679",
    symbol: "ZENITHBANK",
    name: "Zenith Bank Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366679"
  },
  GTCO: {
    tokenId: "0.0.6366681",
    symbol: "GTCO",
    name: "Guaranty Trust Holding Company Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366681"
  },
  NB: {
    tokenId: "0.0.6366682",
    symbol: "NB",
    name: "Nigerian Breweries Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366682"
  },
  ACCESS: {
    tokenId: "0.0.6366684",
    symbol: "ACCESS",
    name: "Access Holdings Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366684"
  },
  BUACEMENT: {
    tokenId: "0.0.6366686",
    symbol: "BUACEMENT",
    name: "BUA Cement Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366686"
  },
  AIRTELAFRI: {
    tokenId: "0.0.6366691",
    symbol: "AIRTELAFRI",
    name: "Airtel Africa Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366691"
  },
  FBNH: {
    tokenId: "0.0.6366692",
    symbol: "FBNH",
    name: "FBN Holdings Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366692"
  },
  UBA: {
    tokenId: "0.0.6366695",
    symbol: "UBA",
    name: "United Bank for Africa Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366695"
  },
  NESTLE: {
    tokenId: "0.0.6366697",
    symbol: "NESTLE",
    name: "Nestle Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366697"
  },
  SEPLAT: {
    tokenId: "0.0.6366698",
    symbol: "SEPLAT",
    name: "Seplat Energy Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366698"
  },
  STANBIC: {
    tokenId: "0.0.6366699",
    symbol: "STANBIC",
    name: "Stanbic IBTC Holdings Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366699"
  },
  OANDO: {
    tokenId: "0.0.6366701",
    symbol: "OANDO",
    name: "Oando Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366701"
  },
  LAFARGE: {
    tokenId: "0.0.6366702",
    symbol: "LAFARGE",
    name: "Lafarge Africa Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366702"
  },
  CONOIL: {
    tokenId: "0.0.6366704",
    symbol: "CONOIL",
    name: "Conoil Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366704"
  },
  WAPCO: {
    tokenId: "0.0.6366707",
    symbol: "WAPCO",
    name: "Lafarge Africa Plc (WAPCO)",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366707"
  },
  FLOURMILL: {
    tokenId: "0.0.6366709",
    symbol: "FLOURMILL",
    name: "Flour Mills of Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366709"
  },
  PRESCO: {
    tokenId: "0.0.6366710",
    symbol: "PRESCO",
    name: "Presco Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366710"
  },
  CADBURY: {
    tokenId: "0.0.6366711",
    symbol: "CADBURY",
    name: "Cadbury Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366711"
  },
  GUINNESS: {
    tokenId: "0.0.6366713",
    symbol: "GUINNESS",
    name: "Guinness Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366713"
  },
  INTBREW: {
    tokenId: "0.0.6366716",
    symbol: "INTBREW",
    name: "International Breweries Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366716"
  },
  CHAMPION: {
    tokenId: "0.0.6366719",
    symbol: "CHAMPION",
    name: "Champion Breweries Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366719"
  },
  UNILEVER: {
    tokenId: "0.0.6366721",
    symbol: "UNILEVER",
    name: "Unilever Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366721"
  },
  BUAFOODS: {
    tokenId: "0.0.6366723",
    symbol: "BUAFOODS",
    name: "BUA Foods Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366723"
  },
  DANGSUGAR: {
    tokenId: "0.0.6366724",
    symbol: "DANGSUGAR",
    name: "Dangote Sugar Refinery Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366724"
  },
  UACN: {
    tokenId: "0.0.6366726",
    symbol: "UACN",
    name: "UAC of Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366726"
  },
  PZ: {
    tokenId: "0.0.6366728",
    symbol: "PZ",
    name: "PZ Cussons Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366728"
  },
  TOTAL: {
    tokenId: "0.0.6366729",
    symbol: "TOTAL",
    name: "TotalEnergies Marketing Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366729"
  },
  ETERNA: {
    tokenId: "0.0.6366731",
    symbol: "ETERNA",
    name: "Eterna Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366731"
  },
  GEREGU: {
    tokenId: "0.0.6366733",
    symbol: "GEREGU",
    name: "Geregu Power Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366733"
  },
  TRANSPOWER: {
    tokenId: "0.0.6366736",
    symbol: "TRANSPOWER",
    name: "Transcorp Power Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366736"
  },
  FIDSON: {
    tokenId: "0.0.6366740",
    symbol: "FIDSON",
    name: "Fidson Healthcare Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366740"
  },
  MAYBAKER: {
    tokenId: "0.0.6366743",
    symbol: "MAYBAKER",
    name: "May & Baker Nigeria Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366743"
  },
  OKOMUOIL: {
    tokenId: "0.0.6366745",
    symbol: "OKOMUOIL",
    name: "The Okomu Oil Palm Company Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366745"
  },
  LIVESTOCK: {
    tokenId: "0.0.6366747",
    symbol: "LIVESTOCK",
    name: "Livestock Feeds Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366747"
  },
  CWG: {
    tokenId: "0.0.6366749",
    symbol: "CWG",
    name: "CWG Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366749"
  },
  TRANSCOHOT: {
    tokenId: "0.0.6366750",
    symbol: "TRANSCOHOT",
    name: "Transcorp Hotels Plc",
    decimals: 18,
    network: "testnet",
    explorerUrl: "https://hashscan.io/testnet/token/0.0.6366750"
  }
};

/**
 * Array of all token symbols for easy iteration
 */
export const HEDERA_TOKEN_SYMBOLS = [
  "DANGCEM", "MTNN", "ZENITHBANK", "GTCO", "NB", "ACCESS", "BUACEMENT",
  "AIRTELAFRI", "FBNH", "UBA", "NESTLE", "SEPLAT", "STANBIC", "OANDO",
  "LAFARGE", "CONOIL", "WAPCO", "FLOURMILL", "PRESCO", "CADBURY",
  "GUINNESS", "INTBREW", "CHAMPION", "UNILEVER", "BUAFOODS", "DANGSUGAR",
  "UACN", "PZ", "TOTAL", "ETERNA", "GEREGU", "TRANSPOWER", "FIDSON",
  "MAYBAKER", "OKOMUOIL", "LIVESTOCK", "CWG", "TRANSCOHOT"
] as const;

export type HederaTokenSymbol = typeof HEDERA_TOKEN_SYMBOLS[number];

/**
 * Utility functions for working with Hedera tokens
 */
export const getHederaTokenBySymbol = (symbol: HederaTokenSymbol): HederaTokenInfo | undefined => {
  return HEDERA_NIGERIAN_STOCK_TOKENS[symbol];
};

export const getAllHederaTokens = (): HederaTokenInfo[] => {
  return Object.values(HEDERA_NIGERIAN_STOCK_TOKENS);
};

export const getTokenIdBySymbol = (symbol: HederaTokenSymbol): string | undefined => {
  return HEDERA_NIGERIAN_STOCK_TOKENS[symbol]?.tokenId;
};

export const getExplorerUrlBySymbol = (symbol: HederaTokenSymbol): string | undefined => {
  return HEDERA_NIGERIAN_STOCK_TOKENS[symbol]?.explorerUrl;
};

/**
 * Network configuration for Hedera integration
 */
export const HEDERA_NETWORK_CONFIG = {
  network: 'testnet',
  explorerBaseUrl: 'https://hashscan.io/testnet',
  mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
  jsonRpcUrl: 'https://testnet.hashio.io/api'
};

/**
 * Check if a symbol has a deployed Hedera token
 */
export const hasHederaToken = (symbol: string): symbol is HederaTokenSymbol => {
  return symbol in HEDERA_NIGERIAN_STOCK_TOKENS;
};

/**
 * Get token metadata for frontend display
 */
export const getTokenDisplayInfo = (symbol: HederaTokenSymbol) => {
  const token = HEDERA_NIGERIAN_STOCK_TOKENS[symbol];
  if (!token) return null;

  return {
    ...token,
    shortName: token.name.replace(' Plc', '').replace(' Nigeria', ''),
    isDeployed: true,
    blockchain: 'Hedera',
    standard: 'HTS' // Hedera Token Service
  };
};
