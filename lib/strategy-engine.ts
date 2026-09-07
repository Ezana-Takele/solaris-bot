import { TokenData, Position, BotConfig } from '@/types/trading';
import { evaluateTokenSafety } from './safety-filter';

export interface BuyDecision {
  shouldBuy: boolean;
  reason: string;
  allocatedAmountUsd: number;
}

export interface PositionUpdateResult {
  updatedPosition: Position;
  shouldSell: boolean;
  sellPortion: number; // 0 to 1.0 (e.g. 0.5 for 50% ladder exit)
  sellReason?: 'TAKE_PROFIT_FULL' | 'TRAILING_STOP' | 'STOP_LOSS' | 'MANUAL' | 'RUG_EMERGENCY';
  pnlUsd: number;
  pnlPercent: number;
}

/**
 * Super Sniper: Top 1% Institutional Evaluation Engine
 * Combines Order-Flow Dominance, Bonding Curve Progression,
 * Smart-Money Whale Tracking, and Sybil Cluster Rejection.
 */
export function evaluateBuySignal(
  token: TokenData,
  currentPositions: Position[],
  currentCash: number,
  config: BotConfig
): BuyDecision {
  if (!config.isRunning) {
    return { shouldBuy: false, reason: 'Sniper paused by operator', allocatedAmountUsd: 0 };
  }

  // Position Capacity Limit
  if (currentPositions.length >= config.maxConcurrentPositions) {
    return {
      shouldBuy: false,
      reason: `Maximum concurrent positions reached (${currentPositions.length}/${config.maxConcurrentPositions})`,
      allocatedAmountUsd: 0,
    };
  }

  // Minimum viable trade is $1.00
  if (currentCash < 1.0) {
    return {
      shouldBuy: false,
      reason: `Insufficient cash ($${currentCash.toFixed(2)} < $1.00 min)`,
      allocatedAmountUsd: 0,
    };
  }

  // Adapt trade size to available cash or compound when bankroll grows
  let tradeSize = Math.min(config.tradeSizeUsd, currentCash);
  if (config.autoCompound && currentCash >= 15.0) {
    tradeSize = Math.min(Number((currentCash * 0.30).toFixed(2)), 35.0);
  }

  // Prevent duplicate positions in the same token
  const alreadyOwns = currentPositions.some(
    (p) => p.tokenAddress.toLowerCase() === token.address.toLowerCase()
  );
  if (alreadyOwns) {
    return { shouldBuy: false, reason: 'Already holding position in this token', allocatedAmountUsd: 0 };
  }

  // Exclude major bluechips and stablecoins - Sniper exclusively targets volatile memecoins
  const BANNED_SYMBOLS = new Set([
    'SOL', 'WSOL', 'ETH', 'WETH', 'BTC', 'WBTC', 'USDC', 'USDT', 'USD', 'DAI',
    'BNB', 'WBNB', 'EUR', 'BUSD', 'TUSD', 'FDUSD', 'MATIC', 'AVAX'
  ]);

  if (BANNED_SYMBOLS.has(token.symbol.toUpperCase())) {
    return {
      shouldBuy: false,
      reason: `Excluded blue-chip asset (${token.symbol}) - Sniper exclusively hunts high-velocity memecoins`,
      allocatedAmountUsd: 0,
    };
  }

  // Exclude tokens with low breakout multiplier potential
  if (token.priceUsd > 10.0) {
    return {
      shouldBuy: false,
      reason: `Unit price too high ($${token.priceUsd.toFixed(2)}) - Insufficient breakout velocity`,
      allocatedAmountUsd: 0,
    };
  }

  if (token.marketCap > 15_000_000) {
    return {
      shouldBuy: false,
      reason: `Market cap too large ($${(token.marketCap / 1e6).toFixed(1)}M) - Target micro/mid caps with 3x-10x room`,
      allocatedAmountUsd: 0,
    };
  }

  // 1. Super Sniffer Security & Rug Audit Check
  const safety = evaluateTokenSafety(token, config);
  if (!safety.isApproved) {
    return {
      shouldBuy: false,
      reason: `Sniffer Alert (Score ${safety.score}/100): ${safety.reasons[0]}`,
      allocatedAmountUsd: 0,
    };
  }

  // 2. Cabal / Sybil Cluster Veto (Connected stealth wallets)
  if (config.enableCabalFilter) {
    const clusterPct = token.clusteredHoldersPercentage ?? (token.topHoldersPercentage * 0.7);
    const maxAllowed = config.maxCabalClusterPercent || 18;
    if (clusterPct > maxAllowed) {
      return {
        shouldBuy: false,
        reason: `Cabal Alert: ${clusterPct.toFixed(1)}% of supply held by connected wallets sharing common funder (> ${maxAllowed}% cap)`,
        allocatedAmountUsd: 0,
      };
    }
  }

  // 3. Pump.fun Bonding Curve Graduation Snipe Condition
  if (config.enableBondingCurveSnipe && token.isPumpFun) {
    const progress = token.bondingCurveProgress || 0;
    const minProgress = config.bondingCurveMinPercent || 80;
    if (progress < minProgress || progress > 98) {
      return {
        shouldBuy: false,
        reason: `Bonding curve outside sniper sweet-spot (${progress}% - target: ${minProgress}% to 98% pre-graduation)`,
        allocatedAmountUsd: 0,
      };
    }
  }

  // 4. Smart-Money Multi-Whale Mirror Requirement
  if (config.enableSmartMoneyMirror) {
    const smartCount = token.smartMoneyBuysCount || 0;
    const minRequired = config.minSmartMoneyWallets || 1;
    if (smartCount < minRequired) {
      return {
        shouldBuy: false,
        reason: `Insufficient smart-money confluence (${smartCount} alpha wallets buying, requires >= ${minRequired})`,
        allocatedAmountUsd: 0,
      };
    }
  }

  // 5. Super Sniper Precision Order Flow Checks:
  // Must show established buyer surge: at least 7 buys in 5m
  if (token.buys5m < 7) {
    return { shouldBuy: false, reason: `Low buyer volume (${token.buys5m} buys in 5m, requires >= 7)`, allocatedAmountUsd: 0 };
  }

  // Buyer Dominance: Buys must overpower Sells by at least 1.30x
  if (token.sells5m > 0 && token.buys5m / token.sells5m < 1.30) {
    return {
      shouldBuy: false,
      reason: `Insufficient buyer dominance (${token.buys5m}B / ${token.sells5m}S) - Requires >= 1.30x ratio for high precision`,
      allocatedAmountUsd: 0,
    };
  }

  // Price Velocity Window: Must be moving upward (+2% to +220%)
  if (token.priceChange5m < 2.0) {
    return { shouldBuy: false, reason: `Insufficient upward momentum (+${token.priceChange5m.toFixed(1)}% 5m, requires >= +2.0%)`, allocatedAmountUsd: 0 };
  }

  if (token.priceChange5m > 220) {
    return { shouldBuy: false, reason: `Overextended pump (+${token.priceChange5m.toFixed(1)}% in 5m) - High top-buyer exhaustion risk`, allocatedAmountUsd: 0 };
  }

  // Dynamic Compounding Position Sizing with Conviction Multiplier:
  let dynamicTradeSize = tradeSize;
  const isHighConviction = (token.smartMoneyBuysCount || 0) >= 2 || (token.bondingCurveProgress || 0) >= 88;
  if (isHighConviction && currentCash >= 15.0) {
    dynamicTradeSize = Math.min(tradeSize * 1.25, currentCash);
  }

  const alphaTags: string[] = [];
  if ((token.smartMoneyBuysCount || 0) >= 2) alphaTags.push(`🐋 ${token.smartMoneyBuysCount} Smart Money Whales`);
  if (token.isPumpFun && (token.bondingCurveProgress || 0) >= 80) alphaTags.push(`⚡ Curve ${token.bondingCurveProgress}% (Graduation Snipe)`);
  if (token.jitoProtected) alphaTags.push('🔒 Jito MEV Shielded');

  const reasonPrefix = alphaTags.length > 0 ? `[${alphaTags.join(' • ')}] ` : '';

  return {
    shouldBuy: true,
    reason: `${reasonPrefix}Super Sniper: Strong buyer velocity (+${token.priceChange5m.toFixed(1)}% 5m, ${token.buys5m}B/${token.sells5m}S, Safety ${safety.score})`,
    allocatedAmountUsd: Math.max(1.0, Math.min(dynamicTradeSize, currentCash)),
  };
}

/**
 * Super Sniper: Position State & Multi-Stage Exit Engine
 */
export function updatePositionState(
  position: Position,
  newPrice: number,
  config: BotConfig
): PositionUpdateResult {
  const currentPrice = Math.max(0.0000000001, newPrice);
  const highestPrice = Math.max(position.highestPrice, currentPrice);

  const currentValueUsd = position.amountTokens * currentPrice;
  const pnlUsd = currentValueUsd - position.investedUsd;
  const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

  // Trailing stop trigger based on highest peak price
  const trailingThreshold = (config.trailingStopPercent || 18) / 100;
  const trailingStopPrice = highestPrice * (1 - trailingThreshold);

  const updatedPosition: Position = {
    ...position,
    currentPrice,
    highestPrice,
    trailingStopPrice,
    currentValueUsd,
    pnlUsd,
    pnlPercent,
  };

  // 1. Catastrophic Rug / Flash Dump Emergency Stop
  if (pnlPercent <= -35) {
    return {
      updatedPosition,
      shouldSell: true,
      sellPortion: 1.0,
      sellReason: 'RUG_EMERGENCY',
      pnlUsd,
      pnlPercent,
    };
  }

  // 2. Standard Hard Stop-Loss (Strictly capped at configured risk e.g. -18%)
  if (pnlPercent <= -config.stopLossPercent) {
    return {
      updatedPosition,
      shouldSell: true,
      sellPortion: 1.0,
      sellReason: 'STOP_LOSS',
      pnlUsd,
      pnlPercent,
    };
  }

  // 3. Take Profit Stage 1 (+120% target):
  // Sells 50% of position -> Recovers 110% of total original capital stake!
  // The remaining 50% becomes a completely risk-free moonbag.
  if (position.takeProfitStep === 0 && pnlPercent >= config.takeProfitPercent) {
    return {
      updatedPosition: {
        ...updatedPosition,
        takeProfitStep: 1,
      },
      shouldSell: true,
      sellPortion: 0.5,
      sellReason: 'TAKE_PROFIT_FULL',
      pnlUsd: pnlUsd * 0.5,
      pnlPercent,
    };
  }

  // 4. Take Profit Stage 2 (+300% to +350% target):
  // Sells 50% of the remaining runner (25% of total original tokens) -> Banks pure compounding ROI.
  if (position.takeProfitStep === 1 && pnlPercent >= config.takeProfitPercent * 2.5) {
    return {
      updatedPosition: {
        ...updatedPosition,
        takeProfitStep: 2,
      },
      shouldSell: true,
      sellPortion: 0.5,
      sellReason: 'TAKE_PROFIT_FULL',
      pnlUsd: pnlUsd * 0.5,
      pnlPercent,
    };
  }

  // 5. Take Profit Stage 3 (Moonshot Runner Trailing Stop):
  // Only active after Stage 1 capital is secured OR after a major +60%+ pump.
  // Never prematurely chokes runners before they have a chance to explode!
  const isEligibleForTrailing = position.takeProfitStep >= 1 || pnlPercent >= Math.max(60, config.takeProfitPercent * 0.7);
  if (isEligibleForTrailing && currentPrice <= trailingStopPrice) {
    return {
      updatedPosition,
      shouldSell: true,
      sellPortion: 1.0,
      sellReason: 'TRAILING_STOP',
      pnlUsd,
      pnlPercent,
    };
  }

  return {
    updatedPosition,
    shouldSell: false,
    sellPortion: 0,
    pnlUsd,
    pnlPercent,
  };
}
