export type SupportedChain = 'solana' | 'base' | 'bsc';

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  chain: SupportedChain;
  priceUsd: number;
  liquidity: number;
  marketCap: number;
  volume5m: number;
  priceChange5m: number;
  buys5m: number;
  sells5m: number;
  createdTimestamp: number;
  pairAddress: string;
  safetyScore: number;
  riskFactors: string[];
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
  topHoldersPercentage: number;
  devHoldingPercentage: number;
  lpBurned?: boolean;
  buyTax?: number;
  sellTax?: number;
  isPumpFun: boolean;
  bondingCurveProgress?: number;
  imageUrl?: string;
  socials?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

export interface Position {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: SupportedChain;
  entryPrice: number;
  currentPrice: number;
  amountTokens: number;
  investedUsd: number;
  currentValueUsd: number;
  pnlUsd: number;
  pnlPercent: number;
  highestPrice: number;
  trailingStopPrice: number;
  takeProfitStep: number;
  entryTimestamp: number;
  status: 'OPEN' | 'CLOSED';
  closeReason?: 'TAKE_PROFIT_FULL' | 'TRAILING_STOP' | 'STOP_LOSS' | 'MANUAL' | 'RUG_EMERGENCY';
}

export interface TradeLog {
  id: string;
  timestamp: number;
  type: 'BUY' | 'SELL';
  tokenSymbol: string;
  tokenAddress: string;
  chain: SupportedChain;
  amountUsd: number;
  price: number;
  pnlUsd?: number;
  pnlPercent?: number;
  reason: string;
  txHash?: string;
}

export interface BotConfig {
  isRunning: boolean;
  mode: 'PAPER' | 'LIVE';
  activeChain: 'ALL' | SupportedChain;
  autoCompound: boolean;
  balanceUsd: number;
  initialBalanceUsd: number;
  tradeSizeUsd: number;
  maxConcurrentPositions: number;
  minSafetyScore: number;
  minLiquidityUsd: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  trailingStopPercent: number;
  maxTopHolderPercent: number;
  requireMintRevoked: boolean;
  requireFreezeRevoked: boolean;
  autoSniping: boolean;
  slippagePercent: number;
  jitoTipSol: number;
  simulationSpeed: 'NORMAL' | 'TURBO';
  priceFeedMode: 'REAL_TIME_DEX' | 'ACCELERATED_SIM';
}

export interface BotStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalRealizedPnl: number;
  bestTradePnl: number;
  worstTradePnl: number;
  profitFactor: number;
}
