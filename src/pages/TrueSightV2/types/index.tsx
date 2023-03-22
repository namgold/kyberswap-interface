export interface ITokenOverview {
  tags: string[]
  name: string
  symbol: string
  description: string
  webs: string[]
  communities: { key: string; value: string }[]
  address: string
  price: number
  price24hChangePercent: number
  '24hLow': number
  '24hHigh': number
  '1yLow': number
  '1yHigh': number
  atl: number
  ath: number
  '24hVolume': number
  circulatingSupply: number
  marketCap: number
  numberOfHolders: number
  kyberScore: {
    score: number
    label: string
  }
  isWatched: boolean
}

export interface INumberOfTrades {
  buy: number
  sell: number
  timestamp: number
}
export interface ITradeVolume {
  numberOfTrade: number
  tradeVolume: number
  timestamp: number
}
export interface INetflowToWhaleWallets {
  whaleType: string
  inflow: number
  outflow: number
  netflow: number
  timestamp: number
}
export interface INumberOfTransfers {
  count: number
  timestamp: number
}
export interface INumberOfHolders {
  count: number
  timestamp: number
}
export interface IHolderList {
  address: string
  percentage: number
  quantity: number
}
export interface IFundingRate {
  exchangeName: string
  timestamp: number
  rate: number
  symbol: string
}
export interface IPagination {
  page: number
  pageSize: number
  totalItems: number
}

export enum DiscoverTokenTab {
  OnChainAnalysis = 'On-Chain Analysis',
  TechnicalAnalysis = 'Technical Analysis',
  News = 'News',
}

export enum TokenListTab {
  All = 'All',
  MyWatchlist = 'My Watchlist',
  Bullish = 'Bullish',
  Bearish = 'Bearish',
  TrendingSoon = 'Trending Soon',
  CurrentlyTrending = 'Currently Trending',
  TopInflow = 'Top CEX Inflow',
  TopOutflow = 'Top CEX Outflow',
  TopTraded = 'Top Traded',
}

export enum ChartTab {
  First = 0,
  Second = 1,
  Third = 2,
}