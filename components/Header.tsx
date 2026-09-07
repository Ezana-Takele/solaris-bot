'use client';

import React from 'react';
import { BotConfig, BotStats, Position } from '@/types/trading';
import { ShieldAlert, Zap, Volume2, VolumeX, RotateCcw, Wallet, ArrowUpRight, ArrowDownRight, Sparkles, FastForward } from 'lucide-react';
import { sounds } from '@/lib/audio';

interface HeaderProps {
  config: BotConfig;
  stats: BotStats;
  positions: Position[];
  onConfigChange: (newConfig: Partial<BotConfig>) => void;
  onResetBalance: () => void;
  onOpenExplainer: () => void;
  onOpenWallet: () => void;
  onRunDemoTrial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  stats,
  positions,
  onConfigChange,
  onResetBalance,
  onOpenExplainer,
  onOpenWallet,
  onRunDemoTrial,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const unrealizedPnlUsd = positions.reduce((acc, p) => acc + p.pnlUsd, 0);
  const investedInPositions = positions.reduce((acc, p) => acc + p.currentValueUsd, 0);
  const totalPortfolioValue = config.balanceUsd + investedInPositions;
  const totalReturnPercent =
    config.initialBalanceUsd > 0
      ? ((totalPortfolioValue - config.initialBalanceUsd) / config.initialBalanceUsd) * 100
      : 0;

  return (
    <header className="border-b border-border bg-[#0d111a]/95 sticky top-0 z-40 backdrop-blur-md px-4 py-3">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-green/20 to-brand-cyan/30 border border-brand-green/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.3)]">
              <Zap className="w-5 h-5 text-brand-green animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  SOLARIS<span className="text-brand-green">.AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-green/10 border border-brand-green/30 text-brand-green font-semibold">
                  {config.mode === 'PAPER' ? 'Continuous Trial Mode' : 'Live On-Chain'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config.isRunning ? 'bg-brand-green animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-mono font-medium text-slate-300">
                    {config.isRunning ? 'PERPETUAL TRADING ACTIVE' : 'BOT STANDBY'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-Time DEX Feed vs Accelerated Sim Toggle */}
            <button
              onClick={() => {
                const newFeedMode = config.priceFeedMode === 'REAL_TIME_DEX' ? 'ACCELERATED_SIM' : 'REAL_TIME_DEX';
                onConfigChange({
                  priceFeedMode: newFeedMode,
                  simulationSpeed: newFeedMode === 'ACCELERATED_SIM' ? 'TURBO' : 'NORMAL',
                });
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                config.priceFeedMode === 'REAL_TIME_DEX'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}
              title={
                config.priceFeedMode === 'REAL_TIME_DEX'
                  ? 'Currently streaming 100% real-time on-chain DEX prices via DexScreener. Click to toggle Accelerated Simulation.'
                  : 'Currently running high-velocity simulated candles. Click to switch to 100% Real-Time DEX prices.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  config.priceFeedMode === 'REAL_TIME_DEX' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline">
                {config.priceFeedMode === 'REAL_TIME_DEX' ? 'Live DEX Feed (Real-Time)' : 'Accelerated Sim (5x)'}
              </span>
            </button>

            <button
              onClick={onRunDemoTrial}
              className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-900/60 border border-brand-green/50 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,255,163,0.3)]"
              title="Run an instant fast-forward simulation lifecycle"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-green animate-pulse" />
              <span className="hidden sm:inline">Fast Demo Snipe</span>
            </button>

            <button
              onClick={onOpenExplainer}
              className="flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 px-2.5 py-1.5 rounded-lg transition-colors hidden md:flex"
              title="Learn the mathematical strategy"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Strategy</span>
            </button>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 md:gap-4 bg-surface/80 border border-border/80 px-4 py-2 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Total Portfolio
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base md:text-lg font-bold text-white">
                ${totalPortfolioValue.toFixed(2)}
              </span>
              <span
                className={`flex items-center text-xs font-mono font-semibold ${
                  totalReturnPercent >= 0 ? 'text-brand-green' : 'text-brand-rose'
                }`}
              >
                {totalReturnPercent >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 inline" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 inline" />
                )}
                {totalReturnPercent >= 0 ? '+' : ''}
                {totalReturnPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-border/80 hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Available Cash
            </span>
            <span className="font-mono text-sm md:text-base font-semibold text-slate-200">
              ${config.balanceUsd.toFixed(2)}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-border/80 hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Realized PnL
            </span>
            <span
              className={`font-mono text-sm md:text-base font-semibold ${
                stats.totalRealizedPnl >= 0 ? 'text-brand-green' : 'text-brand-rose'
              }`}
            >
              {stats.totalRealizedPnl >= 0 ? '+' : ''}${stats.totalRealizedPnl.toFixed(2)}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-border/80 hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Win Rate ({stats.winningTrades}/{stats.totalTrades})
            </span>
            <span className="font-mono text-sm md:text-base font-semibold text-brand-cyan">
              {stats.winRate.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Mode Switch: Paper vs Live */}
          <div className="flex items-center bg-[#151a26] p-1 rounded-lg border border-border">
            <button
              onClick={() => onConfigChange({ mode: 'PAPER' })}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                config.mode === 'PAPER'
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trial (Continuous Sim)
            </button>
            <button
              onClick={() => {
                onConfigChange({ mode: 'LIVE' });
                onOpenWallet();
              }}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                config.mode === 'LIVE'
                  ? 'bg-brand-purple/30 text-brand-purple border border-brand-purple/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3 h-3" />
              Live Trader
            </button>
          </div>

          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple/30 to-brand-cyan/20 border border-brand-purple/50 text-white font-semibold hover:border-brand-cyan transition-all shadow-sm"
            title="Access Solana, Base L2, and BNB Chain Wallets"
          >
            <Wallet className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="hidden sm:inline">Multi-Chain Wallets</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-400 ml-1">
              <span>◎</span>
              <span>🔵</span>
              <span>🟡</span>
            </span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-surface hover:bg-surface-light border border-border text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-green" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onResetBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title="Wipe historical losses and start fresh with $10.00 Moonshot bankroll"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset $10 Fresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
