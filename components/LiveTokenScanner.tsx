'use client';

import React from 'react';
import { TokenData, BotConfig, SupportedChain } from '@/types/trading';
import { evaluateTokenSafety } from '@/lib/safety-filter';
import { Zap, Flame, CheckCircle2, XCircle } from 'lucide-react';

interface LiveTokenScannerProps {
  tokens: TokenData[];
  config: BotConfig;
  onManualBuy: (token: TokenData) => void;
  ownedAddresses: Set<string>;
}

export const LiveTokenScanner: React.FC<LiveTokenScannerProps> = ({
  tokens,
  config,
  onManualBuy,
  ownedAddresses,
}) => {
  const getChainBadge = (chain: SupportedChain) => {
    if (chain === 'base') {
      return (
        <span className="text-[10px] bg-blue-900/40 text-cyan-300 border border-blue-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
          BASE
        </span>
      );
    }
    if (chain === 'bsc') {
      return (
        <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
          BSC
        </span>
      );
    }
    return (
      <span className="text-[10px] bg-emerald-950/40 text-brand-green border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
        SOL
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-ping" />
              Multi-Chain Token Scanner (Solana • Base • BSC)
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-border">
              {tokens.length} Active Feeds
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming live token deployments across multiple blockchains with on-chain rug defenses
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-green" /> Approved (&gt;{config.minSafetyScore})
          </span>
          <span className="flex items-center gap-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-brand-rose" /> Rejected (Rug/Risk)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Token & Chain</th>
              <th className="py-2.5 px-3">Price / 5m</th>
              <th className="py-2.5 px-3">Liquidity / Cap</th>
              <th className="py-2.5 px-3">Safety Score</th>
              <th className="py-2.5 px-3">Rug Defense Analysis</th>
              <th className="py-2.5 px-3 text-right">Sniper Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {tokens.map((token) => {
              const safety = evaluateTokenSafety(token, config);
              const isOwned = ownedAddresses.has(token.address.toLowerCase());
              const isApproved = safety.isApproved;

              return (
                <tr
                  key={token.address}
                  className={`hover:bg-surface-light/60 transition-colors ${
                    isApproved ? 'bg-emerald-950/10' : 'bg-transparent'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-light border border-border flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {token.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm font-sans">{token.symbol}</span>
                          {getChainBadge(token.chain)}
                          {token.isPumpFun && (
                            <span className="text-[10px] bg-brand-purple/20 text-brand-purple border border-brand-purple/40 px-1 py-0.2 rounded font-mono flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Pump
                            </span>
                          )}
                          {token.bondingCurveProgress !== undefined && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              token.bondingCurveProgress >= 80
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-surface text-slate-400 border-border'
                            }`}>
                              ⚡ {token.bondingCurveProgress}%
                            </span>
                          )}
                          {(token.smartMoneyBuysCount || 0) >= 1 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                              🐋 {token.smartMoneyBuysCount}W
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans truncate max-w-[120px]">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-100 font-semibold">
                      ${token.priceUsd < 0.001 ? token.priceUsd.toExponential(2) : token.priceUsd.toFixed(6)}
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        token.priceChange5m >= 0 ? 'text-brand-green' : 'text-brand-rose'
                      }`}
                    >
                      {token.priceChange5m >= 0 ? '+' : ''}
                      {token.priceChange5m.toFixed(1)}% (5m)
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-200">${token.liquidity.toLocaleString()} Liq</div>
                    <div className="text-[11px] text-slate-400">
                      ${(token.marketCap / 1000).toFixed(1)}k MC
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded-md border ${
                          safety.score >= 80
                            ? 'bg-emerald-950/40 text-brand-green border-brand-green/40 shadow-sm'
                            : safety.score >= 60
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                            : 'bg-rose-950/40 text-brand-rose border-rose-500/40'
                        }`}
                      >
                        {safety.score}/100
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          safety.flags.freezeRevoked
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-950/50 text-rose-300 border-rose-500/50 font-bold'
                        }`}
                      >
                        {safety.flags.freezeRevoked ? 'Freeze Revoked' : '⚠️ FREEZE ACTIVE'}
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          safety.flags.mintRevoked
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {safety.flags.mintRevoked ? 'Mint Revoked' : '⚠️ Mint Active'}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Top10: {token.topHoldersPercentage}%
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                          (token.clusteredHoldersPercentage || 0) <= 18
                            ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-950/40 text-rose-300 border-rose-500/40 font-bold'
                        }`}
                      >
                        {(token.clusteredHoldersPercentage || 0) <= 18
                          ? `Sybil: ${token.clusteredHoldersPercentage || 0}%`
                          : `⚠️ CABAL ${token.clusteredHoldersPercentage}%`}
                      </span>

                      {token.jitoProtected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/30 text-cyan-300 border border-cyan-500/30 font-mono">
                          🔒 Jito Shield
                        </span>
                      )}
                    </div>
                    {!isApproved && (
                      <p className="text-[10px] text-rose-400/90 font-mono mt-1 truncate max-w-[240px]">
                        {safety.reasons[0]}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-brand-cyan bg-cyan-950/40 border border-brand-cyan/30 px-2.5 py-1 rounded-md font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Position Held
                      </span>
                    ) : isApproved ? (
                      <button
                        onClick={() => onManualBuy(token)}
                        className="inline-flex items-center gap-1 text-xs bg-brand-green hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-[0_0_12px_rgba(0,255,163,0.5)] transition-all font-sans"
                        title={`Snipe $${config.tradeSizeUsd.toFixed(2)} into ${token.symbol} on ${token.chain.toUpperCase()}`}
                      >
                        <Zap className="w-3 h-3 fill-black" />
                        Snipe (${config.tradeSizeUsd.toFixed(2)})
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-surface/80 border border-border px-2 py-1 rounded">
                        <XCircle className="w-3 h-3 text-rose-500" /> Filtered Out
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
