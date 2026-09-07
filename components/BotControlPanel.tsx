'use client';

import React from 'react';
import { BotConfig } from '@/types/trading';
import { Play, Pause, Sliders, ShieldCheck, Flame, Shield, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface BotControlPanelProps {
  config: BotConfig;
  onConfigChange: (newConfig: Partial<BotConfig>) => void;
  activePositionsCount: number;
}

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  config,
  onConfigChange,
  activePositionsCount,
}) => {
  const applyPreset = (preset: 'SAFE' | 'BALANCED' | 'AGGRESSIVE' | 'MOONSHOT') => {
    if (preset === 'SAFE') {
      onConfigChange({
        tradeSizeUsd: 1.0,
        maxConcurrentPositions: 4,
        minSafetyScore: 85,
        takeProfitPercent: 40,
        stopLossPercent: 12,
        trailingStopPercent: 10,
        minLiquidityUsd: 2500,
        requireMintRevoked: true,
        requireFreezeRevoked: true,
      });
    } else if (preset === 'BALANCED') {
      onConfigChange({
        tradeSizeUsd: 1.5,
        maxConcurrentPositions: 4,
        minSafetyScore: 75,
        takeProfitPercent: 60,
        stopLossPercent: 15,
        trailingStopPercent: 14,
        minLiquidityUsd: 1500,
        requireMintRevoked: true,
        requireFreezeRevoked: true,
      });
    } else if (preset === 'AGGRESSIVE') {
      onConfigChange({
        tradeSizeUsd: 2.0,
        maxConcurrentPositions: 4,
        minSafetyScore: 65,
        takeProfitPercent: 80,
        stopLossPercent: 18,
        trailingStopPercent: 16,
        minLiquidityUsd: 1000,
        requireMintRevoked: true,
        requireFreezeRevoked: true,
      });
    } else if (preset === 'MOONSHOT') {
      onConfigChange({
        tradeSizeUsd: 3.0,
        maxConcurrentPositions: 3,
        minSafetyScore: 70,
        takeProfitPercent: 120,
        stopLossPercent: 18,
        trailingStopPercent: 20,
        minLiquidityUsd: 2000,
        requireMintRevoked: true,
        requireFreezeRevoked: true,
        autoCompound: true,
      });
    } else if (preset === 'QUANTUM') {
      onConfigChange({
        tradeSizeUsd: 2.50,
        maxConcurrentPositions: 3,
        minSafetyScore: 72,
        takeProfitPercent: 100,
        stopLossPercent: 15,
        trailingStopPercent: 12,
        minLiquidityUsd: 2500,
        requireMintRevoked: true,
        requireFreezeRevoked: true,
        autoCompound: true,
        enableBondingCurveSnipe: true,
        bondingCurveMinPercent: 82,
        enableCabalFilter: true,
        maxCabalClusterPercent: 16,
        enableSmartMoneyMirror: true,
        minSmartMoneyWallets: 1,
        enableJitoShield: true,
        slippagePercent: 3.5,
        jitoTipSol: 0.002,
      });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-cyan" />
            Autonomous Execution Engine (Multi-Chain Sniper)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Perpetual automated execution across Solana, Base L2, and BNB Chain with anti-rug protection
          </p>
        </div>

        <button
          onClick={() => onConfigChange({ isRunning: !config.isRunning })}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-mono text-sm tracking-wider uppercase transition-all shadow-lg ${
            config.isRunning
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 hover:border-rose-400 shadow-rose-900/20'
              : 'bg-brand-green text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]'
          }`}
        >
          {config.isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              Stop Autonomous Trading
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current animate-pulse" />
              Start Autonomous Trading
            </>
          )}
        </button>
      </div>

      <div className="bg-surface/80 border border-border/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-cyan shrink-0" />
          <span className="text-xs font-semibold text-slate-200">Active Blockchain Network:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onConfigChange({ activeChain: 'ALL' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              config.activeChain === 'ALL'
                ? 'bg-gradient-to-r from-brand-green/30 to-brand-cyan/30 text-white border border-brand-cyan shadow-sm'
                : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
            }`}
          >
            ⚡ All Chains (Solana + Base + BSC)
          </button>

          <button
            onClick={() => onConfigChange({ activeChain: 'solana' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              config.activeChain === 'solana'
                ? 'bg-emerald-500/30 text-brand-green border border-brand-green shadow-sm'
                : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
            }`}
          >
            ◎ Solana (Pump.fun)
          </button>

          <button
            onClick={() => onConfigChange({ activeChain: 'base' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              config.activeChain === 'base'
                ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400 shadow-sm'
                : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
            }`}
          >
            🔵 Base L2 (Coinbase)
          </button>

          <button
            onClick={() => onConfigChange({ activeChain: 'bsc' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              config.activeChain === 'bsc'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-sm'
                : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
            }`}
          >
            🟡 BNB Chain
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Strategy Presets (Tailored for Maximum ROI)</span>
          <span className="text-[11px] text-slate-500 font-normal">Click to apply preset</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('QUANTUM')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
              config.tradeSizeUsd === 2.5 && config.takeProfitPercent === 100
                ? 'bg-gradient-to-br from-amber-950/60 via-[#131926] to-emerald-950/40 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400'
                : 'bg-surface hover:bg-surface-light border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-xs font-black text-amber-400">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                🏆 Quantum Alpha
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                1% Default
              </span>
            </div>
            <p className="text-[11px] text-slate-200">
              $2.50 bets • 100% TP (Risk-free) • -15% SL • Curve 82%
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('MOONSHOT')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
              config.takeProfitPercent >= 100
                ? 'bg-amber-950/50 border-amber-400/80 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                : 'bg-surface hover:bg-surface-light border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-bounce" />
                🚀 Moonshot (Big Profit)
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Max Gains
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              $3.00 power-bets • +120% TP • +350% Runner • Compounding
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('BALANCED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              config.tradeSizeUsd === 1.5 && config.takeProfitPercent === 60
                ? 'bg-cyan-950/40 border-brand-cyan/60 text-cyan-300 shadow-sm'
                : 'bg-surface hover:bg-surface-light border-border text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Balanced Sniper
            </div>
            <p className="text-[11px] text-slate-400">
              $1.50 bets • 75+ safety • 60% TP / 15% SL
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('AGGRESSIVE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              config.tradeSizeUsd === 2.0 && config.takeProfitPercent === 80
                ? 'bg-purple-950/40 border-brand-purple/60 text-purple-300 shadow-sm'
                : 'bg-surface hover:bg-surface-light border-border text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-brand-purple" />
              Degen Velocity
            </div>
            <p className="text-[11px] text-slate-400">
              $2.00 bets • 65+ safety • 80% TP / 18% SL
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('SAFE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              config.tradeSizeUsd === 1.0 && config.minSafetyScore === 85
                ? 'bg-emerald-950/40 border-brand-green/60 text-emerald-300 shadow-sm'
                : 'bg-surface hover:bg-surface-light border-border text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1">
              <Shield className="w-3.5 h-3.5 text-brand-green" />
              Capital Preserver
            </div>
            <p className="text-[11px] text-slate-400">
              $1.00 micro-bets • 85+ safety • 40% TP / 12% SL
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <div className="bg-surface/90 border border-border/70 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Trade Size (Per Buy)</span>
            <span className="font-mono font-bold text-brand-green">${config.tradeSizeUsd.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={config.tradeSizeUsd}
            onChange={(e) => onConfigChange({ tradeSizeUsd: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-green"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>$0.50</span>
            <span>$3.00</span>
            <span>$10.00 (Max Impact)</span>
          </div>
        </div>

        <div className="bg-surface/90 border border-border/70 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Min Safety Score</span>
            <span className="font-mono font-bold text-brand-cyan">{config.minSafetyScore}/100</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={config.minSafetyScore}
            onChange={(e) => onConfigChange({ minSafetyScore: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>50 (Risky)</span>
            <span>95 (Strict)</span>
          </div>
        </div>

        <div className="bg-surface/90 border border-border/70 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Take Profit Target</span>
            <span className="font-mono font-bold text-amber-400">+{config.takeProfitPercent}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="400"
            step="10"
            value={config.takeProfitPercent}
            onChange={(e) => onConfigChange({ takeProfitPercent: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>+30%</span>
            <span>+120%</span>
            <span>+400% (4x Moonshot)</span>
          </div>
        </div>

        <div className="bg-surface/90 border border-border/70 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Hard Stop Loss</span>
            <span className="font-mono font-bold text-brand-rose">-{config.stopLossPercent}%</span>
          </div>
          <input
            type="range"
            min="8"
            max="30"
            step="1"
            value={config.stopLossPercent}
            onChange={(e) => onConfigChange({ stopLossPercent: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-rose"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-8%</span>
            <span>-18%</span>
            <span>-30%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-border/60">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none text-brand-green hover:text-emerald-300 font-semibold bg-emerald-950/30 border border-brand-green/30 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.autoCompound}
              onChange={(e) => onConfigChange({ autoCompound: e.target.checked })}
              className="w-4 h-4 rounded bg-surface border-border text-brand-green focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-brand-green" />
              Perpetual Trading & Compounding
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={config.requireFreezeRevoked}
              onChange={(e) => onConfigChange({ requireFreezeRevoked: e.target.checked })}
              className="w-4 h-4 rounded bg-surface border-border text-brand-green focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              Freeze Revoked (Anti-Honeypot)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={config.requireMintRevoked}
              onChange={(e) => onConfigChange({ requireMintRevoked: e.target.checked })}
              className="w-4 h-4 rounded bg-surface border-border text-brand-cyan focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
              Mint Revoked (Anti-Dump)
            </span>
          </label>
        </div>

        {/* Top 1% Institutional Alpha Toggles */}
        <div className="flex items-center gap-3 flex-wrap pt-2 w-full border-t border-border/40">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            Top 1% Alpha
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-amber-300 bg-amber-950/30 border border-amber-500/40 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.enableBondingCurveSnipe}
              onChange={(e) => onConfigChange({ enableBondingCurveSnipe: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-surface border-border text-amber-400 focus:ring-0 cursor-pointer"
            />
            <span>⚡ Curve Snipe (80-99%)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-500/40 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.enableCabalFilter}
              onChange={(e) => onConfigChange({ enableCabalFilter: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-surface border-border text-rose-400 focus:ring-0 cursor-pointer"
            />
            <span>🛡️ Anti-Cabal Cluster (&le;18%)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-emerald-300 bg-emerald-950/30 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.enableSmartMoneyMirror}
              onChange={(e) => onConfigChange({ enableSmartMoneyMirror: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-surface border-border text-emerald-400 focus:ring-0 cursor-pointer"
            />
            <span>🐋 Smart-Money Mirror</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-cyan-300 bg-cyan-950/30 border border-cyan-500/40 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.enableJitoShield}
              onChange={(e) => onConfigChange({ enableJitoShield: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-surface border-border text-cyan-400 focus:ring-0 cursor-pointer"
            />
            <span>🔒 Jito MEV Shield</span>
          </label>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Simultaneous Positions: <span className="text-white font-bold">{config.maxConcurrentPositions} max</span> (Active: {activePositionsCount})
        </div>
      </div>
    </div>
  );
};
