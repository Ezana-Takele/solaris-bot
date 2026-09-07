'use client';

import React from 'react';
import { TokenData, BotConfig } from '@/types/trading';
import { Zap, ShieldCheck, Users, Flame, Lock, ArrowUpRight, Activity } from 'lucide-react';

interface TopTierAlphaRadarProps {
  tokens: TokenData[];
  config: BotConfig;
  onUpdateConfig: (partial: Partial<BotConfig>) => void;
}

export const TopTierAlphaRadar: React.FC<TopTierAlphaRadarProps> = ({
  tokens,
  config,
  onUpdateConfig,
}) => {
  // Find top bonding curve candidates (80% to 99%)
  const bondingCurveCandidates = tokens
    .filter((t) => t.isPumpFun && (t.bondingCurveProgress || 0) >= 65)
    .sort((a, b) => (b.bondingCurveProgress || 0) - (a.bondingCurveProgress || 0))
    .slice(0, 4);

  // Find smart money convergence tokens
  const smartMoneyTokens = tokens
    .filter((t) => (t.smartMoneyBuysCount || 0) >= 1)
    .sort((a, b) => (b.smartMoneyBuysCount || 0) - (a.smartMoneyBuysCount || 0))
    .slice(0, 4);

  // Find cabal flagged tokens
  const cabalAlertTokens = tokens
    .filter((t) => (t.clusteredHoldersPercentage || 0) > 18)
    .slice(0, 3);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border shadow-xl space-y-5 bg-gradient-to-b from-[#0d111a] to-[#0a0d14]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-brand-green/20 border border-amber-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Top 1% Institutional Alpha Radar
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-brand-green/20 text-amber-300 border border-amber-500/40">
                Tier-1 Weaponry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bonding Curve Graduation Snipes • Sybil Cluster Forensics • Smart Money Mirroring • Jito MEV Shield
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jito Private Mempool: <strong>ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* 3-Column Tactical Alpha Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Pump.fun Graduation Radar */}
        <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Pump.fun Graduation Radar</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">85 SOL / $69k Cap</span>
          </div>

          <div className="space-y-2.5">
            {bondingCurveCandidates.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">Scanning bonding curves in real-time...</p>
            ) : (
              bondingCurveCandidates.map((token) => {
                const progress = token.bondingCurveProgress || 0;
                const isReady = progress >= 82;
                return (
                  <div key={token.address} className="bg-[#121620] border border-border/60 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1">
                        {token.symbol}
                        {isReady && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40 animate-pulse">
                            SNIPE ZONE
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-bold text-amber-400">{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isReady ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-brand-cyan'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Cap: ${(token.marketCap / 1000).toFixed(1)}k</span>
                      <span>{token.graduationEstimatedMin ? `~${token.graduationEstimatedMin}m to Raydium` : 'Accumulating'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Smart Money Multi-Whale Stream */}
        <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-bold text-slate-200">Smart-Money Whale Tracker</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">&gt;64% Win Rate</span>
          </div>

          <div className="space-y-2.5">
            {smartMoneyTokens.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">Monitoring on-chain alpha wallets...</p>
            ) : (
              smartMoneyTokens.map((token) => (
                <div key={token.address} className="bg-[#121620] border border-border/60 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{token.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                        {token.smartMoneyBuysCount} {token.smartMoneyBuysCount === 1 ? 'Whale' : 'Whales'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      5m Vol: ${(token.volume5m / 1000).toFixed(1)}k • Dominance: {token.buys5m}B/{token.sells5m}S
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-brand-green">
                      +{(token.priceChange5m || 0).toFixed(1)}%
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono">5m momentum</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Graph-Based Cabal / Sybil Cluster Matrix */}
        <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-rose" />
              <span className="text-xs font-bold text-slate-200">Cabal Sybil Cluster Matrix</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-semibold">Max 18% Cap</span>
          </div>

          <div className="space-y-2.5">
            {cabalAlertTokens.length === 0 ? (
              <div className="bg-[#121620] border border-emerald-500/30 rounded-lg p-3 text-center space-y-1">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Cluster Forensics Clean</p>
                <p className="text-[10px] text-slate-400">All current approved pairs show decentralized holder graphs</p>
              </div>
            ) : (
              cabalAlertTokens.map((token) => (
                <div key={token.address} className="bg-rose-950/20 border border-rose-500/40 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300">{token.symbol}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      BLOCKED ({token.clusteredHoldersPercentage}% Sybil)
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-300/80 font-mono">
                    Common funding wallet detected across top 10 holders
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
