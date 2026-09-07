'use client';

import React from 'react';
import { X, ShieldAlert, Zap, Flame, Target, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

interface StrategyExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyExplainerModal: React.FC<StrategyExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0e131d] border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">The $10 Bankroll Profit Formula</h3>
              <p className="text-xs text-slate-400">Mathematical edge, anti-rug protection, and profit compounding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 text-xs leading-relaxed">
          {/* Rule 1 */}
          <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-green" />
              1. Micro-Allocations ($1.50 per trade out of $10.00)
            </h4>
            <p className="text-slate-300">
              In memecoins, putting $10 into a single token means one single rug pull eliminates 100% of your account.
              By breaking your $10 into <strong>$1.50 micro-bets</strong>, you get 6 simultaneous shots at catching a breakout runner.
              Surviving the drawdown is rule #1 to compounding profit.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-cyan" />
              2. The "Risk-Free Moonbag" Profit Lock (50% TP @ +50%)
            </h4>
            <p className="text-slate-300">
              When a token hits +50% gain, the bot immediately sells 50% of the position.
              <br />
              <strong className="text-white">Example:</strong> You invest $1.50. At +50%, the position is worth $2.25.
              Selling half returns <strong>$1.13 in cash</strong> back to your wallet.
              Now, your remaining tokens are virtually risk-free "house money".
            </p>
          </div>

          {/* Rule 3 */}
          <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-purple" />
              3. Trailing Stop-Loss for Massive Runners
            </h4>
            <p className="text-slate-300">
              Instead of selling 100% too early and missing a 5x-10x runner, the remaining 50% uses a
              <strong> 12% Trailing Stop-Loss</strong> that follows the peak price upwards.
              If the token climbs to +300% and then drops 12%, the bot sells automatically at +250% profit.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="bg-surface/90 border border-border/80 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              4. Algorithmic Scam & RugPull Disqualification
            </h4>
            <p className="text-slate-300">
              90% of new tokens launched are scams. The bot instantly rejects:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong className="text-white">Active Freeze Authority:</strong> The developer can freeze your wallet so you cannot sell (Honeypot). Score = 0, instantly blocked.</li>
              <li><strong className="text-white">Unrevoked Mint Authority:</strong> The developer can mint 100 trillion extra tokens and dump the pool. Blocked.</li>
              <li><strong className="text-white">High Top 10 Concentration:</strong> If insiders control &gt;25% of supply, dumping risk is extreme. Heavily penalized.</li>
              <li><strong className="text-white">Zero Sells Warning:</strong> Tokens with 20 buys and 0 sells are flagged as honeypots.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/70 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-green text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            I Understand • Start Trading
          </button>
        </div>
      </div>
    </div>
  );
};

