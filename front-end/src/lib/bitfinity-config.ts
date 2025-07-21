/**
 * Bitfinity EVM Configuration
 * Network settings and contract addresses for Nigerian Stock Exchange tokens
 */

export interface BitfinityNetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const BITFINITY_NETWORKS: Record<string, BitfinityNetworkConfig> = {
  testnet: {
    chainId: 355113,
    name: 'Bitfinity Testnet',
    rpcUrl: 'https://testnet.bitfinity.network',
    blockExplorer: 'https://explorer.testnet.bitfinity.network',
    nativeCurrency: {
      name: 'Bitfinity Token',
      symbol: 'BTF',
      decimals: 18,
    },
  },
  mainnet: {
    chainId: 355110,
    name: 'Bitfinity Mainnet',
    rpcUrl: 'https://mainnet.bitfinity.network',
    blockExplorer: 'https://explorer.bitfinity.network',
    nativeCurrency: {
      name: 'Bitfinity Token',
      symbol: 'BTF',
      decimals: 18,
    },
  },
};

export const DEFAULT_NETWORK = 'testnet';

/**
 * Contract addresses (to be updated after deployment)
 */
export interface ContractAddresses {
  factoryAddress: string;
  tokens: Record<string, string>;
}

export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  testnet: {
    factoryAddress: '', // To be filled after deployment
    tokens: {}, // To be filled after deployment
  },
  mainnet: {
    factoryAddress: '', // To be filled after deployment
    tokens: {}, // To be filled after deployment
  },
};

/**
 * Nigerian Stock Exchange tokens data
 */
export interface NigerianStockData {
  symbol: string;
  name: string;
  companyName: string;
  totalSupply: string;
  sector: string;
  description: string;
}

export const NIGERIAN_STOCKS: NigerianStockData[] = [
  {
    symbol: 'DANGCEM',
    name: 'Dangote Cement Token',
    companyName: 'Dangote Cement Plc',
    totalSupply: '17040000000000000000000000000',
    sector: 'Industrial/Cement',
    description: 'Leading cement manufacturer in Nigeria',
  },
  {
    symbol: 'MTNN',
    name: 'MTN Nigeria Token',
    companyName: 'MTN Nigeria Communications Plc',
    totalSupply: '20354513050000000000000000000',
    sector: 'Telecommunications',
    description: 'Largest telecommunications company in Nigeria',
  },
  {
    symbol: 'ZENITHBANK',
    name: 'Zenith Bank Token',
    companyName: 'Zenith Bank Plc',
    totalSupply: '31396493786000000000000000000',
    sector: 'Banking',
    description: 'Leading commercial bank in Nigeria',
  },
  {
    symbol: 'GTCO',
    name: 'GTCO Token',
    companyName: 'Guaranty Trust Holding Company Plc',
    totalSupply: '29431127496000000000000000000',
    sector: 'Banking',
    description: 'Premier financial services group in Nigeria',
  },
  {
    symbol: 'NB',
    name: 'Nigerian Breweries Token',
    companyName: 'Nigerian Breweries Plc',
    totalSupply: '8020000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Leading brewery and beverage company',
  },
  {
    symbol: 'ACCESS',
    name: 'Access Holdings Token',
    companyName: 'Access Holdings Plc',
    totalSupply: '35687500000000000000000000000',
    sector: 'Banking',
    description: 'Major commercial bank in Nigeria',
  },
  {
    symbol: 'BUACEMENT',
    name: 'BUA Cement Token',
    companyName: 'BUA Cement Plc',
    totalSupply: '16000000000000000000000000000',
    sector: 'Industrial/Cement',
    description: 'Major cement producer in Nigeria',
  },
  {
    symbol: 'AIRTELAFRI',
    name: 'Airtel Africa Token',
    companyName: 'Airtel Africa Plc',
    totalSupply: '3700000000000000000000000000',
    sector: 'Telecommunications',
    description: 'Leading telecommunications and mobile money services',
  },
  {
    symbol: 'FBNH',
    name: 'FBN Holdings Token',
    companyName: 'FBN Holdings Plc',
    totalSupply: '35895292792000000000000000000',
    sector: 'Banking',
    description: "Nigeria's oldest commercial bank holding company",
  },
  {
    symbol: 'UBA',
    name: 'UBA Token',
    companyName: 'United Bank for Africa Plc',
    totalSupply: '35130641814000000000000000000',
    sector: 'Banking',
    description: 'Pan-African financial services group',
  },
  {
    symbol: 'NESTLE',
    name: 'Nestle Nigeria Token',
    companyName: 'Nestle Nigeria Plc',
    totalSupply: '1500000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Leading food and beverage company',
  },
  {
    symbol: 'SEPLAT',
    name: 'Seplat Energy Token',
    companyName: 'Seplat Energy Plc',
    totalSupply: '5882353000000000000000000000',
    sector: 'Oil & Gas',
    description: 'Independent oil and gas exploration company',
  },
  {
    symbol: 'STANBIC',
    name: 'Stanbic IBTC Token',
    companyName: 'Stanbic IBTC Holdings Plc',
    totalSupply: '15557000000000000000000000000',
    sector: 'Banking',
    description: 'Leading financial services group',
  },
  {
    symbol: 'OANDO',
    name: 'Oando Token',
    companyName: 'Oando Plc',
    totalSupply: '8000000000000000000000000000',
    sector: 'Oil & Gas',
    description: 'Integrated energy solutions company',
  },
  {
    symbol: 'LAFARGE',
    name: 'Lafarge Africa Token',
    companyName: 'Lafarge Africa Plc',
    totalSupply: '17040000000000000000000000000',
    sector: 'Industrial/Cement',
    description: 'Leading cement and building materials company',
  },
  {
    symbol: 'CONOIL',
    name: 'Conoil Token',
    companyName: 'Conoil Plc',
    totalSupply: '1200000000000000000000000000',
    sector: 'Oil & Gas',
    description: 'Petroleum products marketing and lubricants company',
  },
  {
    symbol: 'WAPCO',
    name: 'WAPCO Token',
    companyName: 'Lafarge Africa Plc (WAPCO)',
    totalSupply: '17040000000000000000000000000',
    sector: 'Industrial/Cement',
    description: 'West African Portland Cement Company',
  },
  {
    symbol: 'FLOURMILL',
    name: 'Flour Mills Token',
    companyName: 'Flour Mills of Nigeria Plc',
    totalSupply: '39000000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Leading food and agro-allied company',
  },
  {
    symbol: 'PRESCO',
    name: 'Presco Token',
    companyName: 'Presco Plc',
    totalSupply: '8000000000000000000000000000',
    sector: 'Agriculture',
    description: 'Palm oil plantation and processing company',
  },
  {
    symbol: 'CADBURY',
    name: 'Cadbury Nigeria Token',
    companyName: 'Cadbury Nigeria Plc',
    totalSupply: '1800000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Confectionery and beverage company',
  },
  {
    symbol: 'GUINNESS',
    name: 'Guinness Nigeria Token',
    companyName: 'Guinness Nigeria Plc',
    totalSupply: '2000000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Brewery and beverage company',
  },
  {
    symbol: 'INTBREW',
    name: 'International Breweries Token',
    companyName: 'International Breweries Plc',
    totalSupply: '9000000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Beer and malt drinks producer',
  },
  {
    symbol: 'CHAMPION',
    name: 'Champion Breweries Token',
    companyName: 'Champion Breweries Plc',
    totalSupply: '2500000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Beer and malt drinks company',
  },
  {
    symbol: 'UNILEVER',
    name: 'Unilever Nigeria Token',
    companyName: 'Unilever Nigeria Plc',
    totalSupply: '6000000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Consumer goods and personal care products',
  },
  {
    symbol: 'TRANSCORP',
    name: 'Transcorp Token',
    companyName: 'Transnational Corporation Plc',
    totalSupply: '40000000000000000000000000000',
    sector: 'Conglomerate',
    description: 'Diversified conglomerate with interests in power, hospitality, and oil & gas',
  },
  {
    symbol: 'BUAFOODS',
    name: 'BUA Foods Token',
    companyName: 'BUA Foods Plc',
    totalSupply: '18000000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Leading food and sugar manufacturing company',
  },
  {
    symbol: 'DANGSUGAR',
    name: 'Dangote Sugar Token',
    companyName: 'Dangote Sugar Refinery Plc',
    totalSupply: '12150000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Leading sugar refinery and manufacturing company',
  },
  {
    symbol: 'UACN',
    name: 'UACN Token',
    companyName: 'UAC of Nigeria Plc',
    totalSupply: '2925000000000000000000000000',
    sector: 'Conglomerate',
    description: 'Diversified conglomerate with interests in food, real estate, and logistics',
  },
  {
    symbol: 'PZ',
    name: 'PZ Cussons Token',
    companyName: 'PZ Cussons Nigeria Plc',
    totalSupply: '3970000000000000000000000000',
    sector: 'Consumer Goods',
    description: 'Personal care and household products manufacturer',
  },
  {
    symbol: 'TOTAL',
    name: 'TotalEnergies Token',
    companyName: 'TotalEnergies Marketing Nigeria Plc',
    totalSupply: '339500000000000000000000000',
    sector: 'Oil & Gas',
    description: 'Petroleum products marketing and distribution',
  },
  {
    symbol: 'ETERNA',
    name: 'Eterna Token',
    companyName: 'Eterna Plc',
    totalSupply: '1305000000000000000000000000',
    sector: 'Oil & Gas',
    description: 'Petroleum products marketing and distribution company',
  },
  {
    symbol: 'GEREGU',
    name: 'Geregu Power Token',
    companyName: 'Geregu Power Plc',
    totalSupply: '2500000000000000000000000000',
    sector: 'Power',
    description: 'Independent power producer and electricity generation',
  },
  {
    symbol: 'TRANSPOWER',
    name: 'Transcorp Power Token',
    companyName: 'Transcorp Power Plc',
    totalSupply: '7500000000000000000000000000',
    sector: 'Power',
    description: 'Power generation and electricity distribution',
  },
  {
    symbol: 'FIDSON',
    name: 'Fidson Healthcare Token',
    companyName: 'Fidson Healthcare Plc',
    totalSupply: '2295000000000000000000000000',
    sector: 'Healthcare',
    description: 'Pharmaceutical manufacturing and healthcare services',
  },
  {
    symbol: 'MAYBAKER',
    name: 'May & Baker Token',
    companyName: 'May & Baker Nigeria Plc',
    totalSupply: '1725000000000000000000000000',
    sector: 'Healthcare',
    description: 'Pharmaceutical manufacturing and healthcare products',
  },
  {
    symbol: 'OKOMUOIL',
    name: 'Okomu Oil Token',
    companyName: 'The Okomu Oil Palm Company Plc',
    totalSupply: '954000000000000000000000000',
    sector: 'Agriculture',
    description: 'Palm oil plantation and processing company',
  },
  {
    symbol: 'LIVESTOCK',
    name: 'Livestock Feeds Token',
    companyName: 'Livestock Feeds Plc',
    totalSupply: '3000000000000000000000000000',
    sector: 'Agriculture',
    description: 'Animal feed production and agribusiness',
  },
  {
    symbol: 'CWG',
    name: 'CWG Token',
    companyName: 'CWG Plc',
    totalSupply: '2525000000000000000000000000',
    sector: 'Technology',
    description: 'Information technology and digital services company',
  },
  {
    symbol: 'TRANSCOHOT',
    name: 'Transcorp Hotels Token',
    companyName: 'Transcorp Hotels Plc',
    totalSupply: '10240000000000000000000000000',
    sector: 'Hospitality',
    description: 'Hospitality and hotel management services',
  },
];

/**
 * Get stock data by symbol
 */
export function getStockBySymbol(symbol: string): NigerianStockData | undefined {
  return NIGERIAN_STOCKS.find(stock => stock.symbol === symbol);
}

/**
 * Get all stocks by sector
 */
export function getStocksBySector(sector: string): NigerianStockData[] {
  return NIGERIAN_STOCKS.filter(stock => stock.sector === sector);
}

/**
 * Get all unique sectors
 */
export function getAllSectors(): string[] {
  return [...new Set(NIGERIAN_STOCKS.map(stock => stock.sector))];
}
