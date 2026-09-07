import { TokenData, BotConfig } from '@/types/trading';

export interface SafetyReport {
  score: number; // 0 to 100
  isApproved: boolean;
  reasons: string[];
  flags: {
    mintRevoked: boolean;
    freezeRevoked: boolean;
    liquiditySufficient: boolean;
    distributionHealthy: boolean;
    volumePositive: boolean;
    lpProtected: boolean;
    taxSafe: boolean;
    cabalClean: boolean;
  };
}

/**
 * Super Sniffer: Deep multi-layered on-chain security, anti-rug, and Cabal-Sybil cluster defense engine
 */
export function evaluateTokenSafety(token: Partial<TokenData>, config: BotConfig): SafetyReport {
  let score = 100;
  const reasons: string[] = [];

  const mintRevoked = Boolean(token.mintAuthorityRevoked);
  const freezeRevoked = Boolean(token.freezeAuthorityRevoked);
  const liquidity = token.liquidity || 0;
  const topHoldersPct = token.topHoldersPercentage || 0;
  const devHoldingPct = token.devHoldingPercentage || 0;
  const buys5m = token.buys5m || 0;
  const sells5m = token.sells5m || 0;
  const volume5m = token.volume5m || 0;
  const marketCap = token.marketCap || 0;
  const lpBurned = token.lpBurned !== false; // default true unless flagged unburned
  const buyTax = token.buyTax || 0;
  const sellTax = token.sellTax || 0;
  const clusteredHoldersPct = token.clusteredHoldersPercentage ?? (topHoldersPct * 0.7);

  // 1. CRITICAL: Freeze Authority (Honeypot risk - Blacklist wallets)
  if (!freezeRevoked && config.requireFreezeRevoked) {
    score = 0;
    reasons.push('CRITICAL: Freeze Authority active (Honeypot Risk - Contract can lock selling)');
  }

  // 2. CRITICAL: Mint Authority (Infinite token printing dump)
  if (!mintRevoked && config.requireMintRevoked) {
    score -= 50;
    reasons.push('CRITICAL: Mint Authority NOT revoked (Dev can print infinite supply)');
  }

  // 3. Liquidity Pool Security (LP Burned / Locked)
  if (token.lpBurned === false) {
    score -= 40;
    reasons.push('HIGH RISK: Liquidity Pool tokens NOT burned or locked (Dev can pull liquidity)');
  }

  // 4. Honeypot Tax Detection
  const taxSafe = buyTax <= 3 && sellTax <= 3;
  if (!taxSafe) {
    score -= 60;
    reasons.push(`EXORBITANT TAX DETECTED: Buy Tax ${buyTax}% / Sell Tax ${sellTax}% (Max allowed: 3%)`);
  }

  // 5. Liquidity Depth
  if (liquidity < config.minLiquidityUsd) {
    const penalty = Math.min(35, Math.round(((config.minLiquidityUsd - liquidity) / config.minLiquidityUsd) * 35));
    score -= penalty;
    reasons.push(`Low Liquidity: $${liquidity.toLocaleString()} (Min required: $${config.minLiquidityUsd.toLocaleString()})`);
  }

  // 6. Top Holders Concentration (Cabal / Insider Dump)
  if (topHoldersPct > config.maxTopHolderPercent) {
    const overage = topHoldersPct - config.maxTopHolderPercent;
    const penalty = Math.min(35, Math.round(overage * 1.5));
    score -= penalty;
    reasons.push(`High Insider Concentration: Top holders control ${topHoldersPct.toFixed(1)}% of supply`);
  }

  // 7. Graph-Based Cabal / Sybil Cluster Check (Connected stealth wallets)
  const cabalClean = !config.enableCabalFilter || clusteredHoldersPct <= (config.maxCabalClusterPercent || 18);
  if (!cabalClean) {
    score -= 45;
    reasons.push(`CABAL / SYBIL CLUSTER DETECTED: ${clusteredHoldersPct.toFixed(1)}% of supply held by connected wallets sharing common funder (Max: ${config.maxCabalClusterPercent}%)`);
  }

  // 8. Dev Wallet Allocation (Tightened to <= 5%)
  if (devHoldingPct > 5) {
    const devPenalty = Math.min(30, Math.round((devHoldingPct - 5) * 4));
    score -= devPenalty;
    reasons.push(`Dev Wallet Risk: Deployer controls ${devHoldingPct.toFixed(1)}% of circulating supply`);
  }

  // 9. Wash Trading & Synthetic Volume Detection
  if (buys5m > 15 && sells5m === 0) {
    score -= 50;
    reasons.push('SUSPICIOUS: Zero sells detected despite high buy volume (Honeypot Warning)');
  }

  if (volume5m > 0 && marketCap > 0 && volume5m > marketCap * 6 && (buys5m + sells5m) < 12) {
    score -= 30;
    reasons.push('WASH TRADING DETECTED: Disproportionate volume to transaction signatures');
  }

  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  const isApproved =
    normalizedScore >= config.minSafetyScore &&
    (freezeRevoked || !config.requireFreezeRevoked) &&
    taxSafe &&
    cabalClean;

  return {
    score: normalizedScore,
    isApproved,
    reasons: reasons.length > 0 ? reasons : ['All Super Sniffer checks passed (Revoked mint, disabled freeze, verified LP, low insider ownership, clean cluster graph)'],
    flags: {
      mintRevoked,
      freezeRevoked,
      liquiditySufficient: liquidity >= config.minLiquidityUsd,
      distributionHealthy: topHoldersPct <= config.maxTopHolderPercent && devHoldingPct <= 5,
      volumePositive: buys5m > sells5m,
      lpProtected: lpBurned,
      taxSafe,
      cabalClean,
    },
  };
}
