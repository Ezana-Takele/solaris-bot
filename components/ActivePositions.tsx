'use client';

import React from 'react';
import { Position, SupportedChain } from '@/types/trading';
import { TrendingUp, TrendingDown, ArrowUpRight, Flame, XCircle, ExternalLink, Zap } from 'lucide-react';

interface ActivePositionsProps {
  positions: Position[];
  onManualClose: (positionId: string) => void;
  onCloseAll: () => void;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  positions,
  onManualClose,
  onCloseAll,
}) => {
  if (positions.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-border text-center">
        <div className="w-12 h-12 rounded-full bg-surface-light border border-border/70 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No Open Positions (Perpetual Sniper Active)</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          The bot is scanning Solana, Base, and BSC in real time. When a token passes safety and momentum thresholds, micro-positions will open automatically.
        </p>
      </div>
    );
  }

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnlUsd, 0);

  const getChainBadge = (chain: SupportedChain) => {
    if (chain === 'base') {
      return <span className="text-[10px] bg-blue-900/40 text-cyan-300 border border-blue-500/40 px-1 py-0.2 rounded font-mono font-bold">BASE</span>;
    }
    if (chain === 'bsc') {
      return <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">BSC</span>;
    }
    return <span className="text-[10px] bg-emerald-950/40 text-brand-green border border-emerald-500/40 px-1 py-0.2 rounded font-mono font-bold">SOL</span>;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border space-y-4">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
            Active Micro-Positions ({positions.length})
          </h2>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              totalUnrealizedPnl >= 0
                ? 'bg-emerald-500/10 text-brand-green border border-emerald-500/30'
                : 'bg-rose-500/10 text-brand-rose border border-rose-500/30'
            }`}
          >
            {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)} Total Unrealized
          </span>
        </div>

        {positions.length > 1 && (
          <button
            onClick={onCloseAll}
            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Panic Sell All Positions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {positions.map((pos) => {
          const isProfitable = pos.pnlUsd >= 0;
          const trailingDropPct =
            pos.highestPrice > 0 ? ((pos.highestPrice - pos.currentPrice) / pos.highestPrice) * 100 : 0;

          return (
            <div
              key={pos.id}
              className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-slate-600 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base tracking-wide">
                      ${pos.tokenSymbol}
                    </span>
                    {getChainBadge(pos.chain)}
                    <span className="text-xs text-slate-400 truncate max-w-[120px] font-medium">
                      {pos.tokenName}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                    Entry: ${pos.entryPrice < 0.001 ? pos.entryPrice.toExponential(3) : pos.entryPrice.toFixed(6)}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono text-base font-extrabold flex items-center justify-end gap-0.5 ${
                      isProfitable ? 'text-brand-green' : 'text-brand-rose'
                    }`}
                  >
                    {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isProfitable ? '+' : ''}
                    {pos.pnlPercent.toFixed(1)}%
                  </div>
                  <div
                    className={`text-xs font-mono font-medium ${
                      isProfitable ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfitable ? '+' : ''}${pos.pnlUsd.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#0c1017] p-2.5 rounded-lg border border-border/50 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Invested / Value</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    ${pos.investedUsd.toFixed(2)} → <span className="text-white">${pos.currentValueUsd.toFixed(2)}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Current Price</span>
                  <span className="font-mono text-slate-200 font-semibold truncate block">
                    ${pos.currentPrice < 0.001 ? pos.currentPrice.toExponential(3) : pos.currentPrice.toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                {pos.takeProfitStep >= 1 ? (
                  <div className="flex items-center gap-1.5 text-brand-green bg-emerald-950/40 border border-brand-green/30 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                    <Flame className="w-3.5 h-3.5 text-brand-green" />
                    50% Sold at Profit • Free Moonbag
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-brand-cyan bg-cyan-950/30 border border-brand-cyan/20 px-2 py-0.5 rounded text-[11px]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Targeting +50% TP to lock cost
                  </div>
                )}

                <div className="text-[10px] font-mono text-slate-400 text-right">
                  Trailing SL: ${pos.trailingStopPrice < 0.001 ? pos.trailingStopPrice.toExponential(2) : pos.trailingStopPrice.toFixed(6)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Peak: ${pos.highestPrice < 0.001 ? pos.highestPrice.toExponential(2) : pos.highestPrice.toFixed(6)}</span>
                  <span>Pullback: -{trailingDropPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      trailingDropPct > 10 ? 'bg-amber-500' : 'bg-brand-green'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, 100 - trailingDropPct * 5))}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`https://dexscreener.com/${pos.chain}/${pos.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  DexScreener ({pos.chain.toUpperCase()})
                </a>

                <button
                  onClick={() => onManualClose(pos.id)}
                  className="text-xs bg-surface-light hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-border hover:border-rose-500/50 px-3 py-1 rounded-md font-medium transition-all"
                >
                  Market Exit (Sell)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
