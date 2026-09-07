'use client';

import React, { useState } from 'react';
import { TradeLog } from '@/types/trading';
import { History, TrendingUp, TrendingDown, Trash2, Download } from 'lucide-react';

interface TradeHistoryProps {
  logs: TradeLog[];
  onClearLogs: () => void;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'ALL' | 'SELLS' | 'BUYS' | 'PROFITS' | 'LOSSES'>('ALL');

  const exportToCsv = () => {
    if (logs.length === 0) return;
    const headers = [
      'Timestamp',
      'Date (UTC)',
      'Action',
      'Chain',
      'Token Symbol',
      'Token Address',
      'Amount USD',
      'Price USD',
      'PnL USD',
      'PnL Percent',
      'Execution Reason'
    ];

    const rows = logs.map((l) => [
      l.timestamp,
      new Date(l.timestamp).toISOString(),
      l.type,
      l.chain || 'solana',
      `"${(l.tokenSymbol || '').replace(/"/g, '""')}"`,
      l.tokenAddress || '',
      (l.amountUsd || 0).toFixed(2),
      l.price || 0,
      l.pnlUsd !== undefined ? l.pnlUsd.toFixed(2) : '',
      l.pnlPercent !== undefined ? `${l.pnlPercent.toFixed(2)}%` : '',
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solaris_trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (logs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-5 border border-border text-center">
        <div className="w-10 h-10 rounded-full bg-surface-light border border-border flex items-center justify-center mx-auto mb-2 text-slate-500">
          <History className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No Trades Executed Yet</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          As the bot buys vetted tokens and executes take-profits or stop-losses, the trade logs will appear here.
        </p>
      </div>
    );
  }

  const closedTrades = logs.filter((l) => l.type === 'SELL' && !l.reason?.includes('Auto-Exited'));
  const winCount = closedTrades.filter((l) => (l.pnlUsd || 0) > 0).length;
  const lossCount = closedTrades.filter((l) => (l.pnlUsd || 0) < 0).length;
  const winRate = closedTrades.length > 0 ? (winCount / closedTrades.length) * 100 : 0;
  const netPnl = closedTrades.reduce((acc, l) => acc + (l.pnlUsd || 0), 0);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'SELLS') return l.type === 'SELL';
    if (filter === 'BUYS') return l.type === 'BUY';
    if (filter === 'PROFITS') return l.type === 'SELL' && (l.pnlUsd || 0) > 0;
    if (filter === 'LOSSES') return l.type === 'SELL' && (l.pnlUsd || 0) < 0;
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-cyan" />
            <h2 className="text-base font-bold text-white">Execution Audit Ledger</h2>
            <span className="text-[11px] font-mono text-slate-400 bg-surface px-2 py-0.5 rounded border border-border">
              {logs.length} events
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono mt-1">
            <span className="text-slate-400">Net Realized:</span>
            <span className={`font-bold ${netPnl >= 0 ? 'text-brand-green' : 'text-brand-rose'}`}>
              {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Wins:</span>
            <span className="text-brand-green font-semibold">{winCount}</span>
            <span className="text-slate-400">Losses:</span>
            <span className="text-brand-rose font-semibold">{lossCount}</span>
            <span className="text-slate-500 font-bold">({winRate.toFixed(0)}% Win Rate)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-light border border-border text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
            title="Download full trade history as CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-surface-light transition-colors"
            title="Clear Trade History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 rounded-md transition-all ${
            filter === 'ALL'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
              : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
          }`}
        >
          All ({logs.length})
        </button>
        <button
          onClick={() => setFilter('SELLS')}
          className={`px-2.5 py-1 rounded-md transition-all ${
            filter === 'SELLS'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
          }`}
        >
          Exits ({closedTrades.length})
        </button>
        <button
          onClick={() => setFilter('PROFITS')}
          className={`px-2.5 py-1 rounded-md transition-all ${
            filter === 'PROFITS'
              ? 'bg-emerald-500/20 text-brand-green border border-brand-green/40 font-bold'
              : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
          }`}
        >
          Wins ({winCount})
        </button>
        <button
          onClick={() => setFilter('LOSSES')}
          className={`px-2.5 py-1 rounded-md transition-all ${
            filter === 'LOSSES'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
          }`}
        >
          Losses ({lossCount})
        </button>
        <button
          onClick={() => setFilter('BUYS')}
          className={`px-2.5 py-1 rounded-md transition-all ${
            filter === 'BUYS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'bg-surface hover:bg-surface-light text-slate-400 border border-border'
          }`}
        >
          Entries ({logs.filter((l) => l.type === 'BUY').length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-border/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
            <tr className="border-b border-border/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Chain</th>
              <th className="py-2.5 px-3">Token</th>
              <th className="py-2.5 px-3">Value</th>
              <th className="py-2.5 px-3">Realized PnL</th>
              <th className="py-2.5 px-3">Execution Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const isSell = log.type === 'SELL';
              const isProfit = (log.pnlUsd || 0) >= 0;

              return (
                <tr key={log.id} className="hover:bg-surface-light/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">{timeStr}</td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        isSell
                          ? isProfit
                            ? 'bg-emerald-950/60 text-brand-green border border-brand-green/30'
                            : 'bg-rose-950/60 text-brand-rose border border-brand-rose/30'
                          : 'bg-cyan-950/60 text-brand-cyan border border-brand-cyan/30'
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface border border-border text-slate-300">
                      {log.chain === 'base' ? 'BASE' : log.chain === 'bsc' ? 'BSC' : 'SOL'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-sans font-bold text-white">${log.tokenSymbol}</td>

                  <td className="py-2.5 px-3 text-slate-200">${log.amountUsd.toFixed(2)}</td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {isSell && log.pnlUsd !== undefined ? (
                      <div className="flex items-center gap-1">
                        {isProfit ? (
                          <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-brand-rose" />
                        )}
                        <span className={`font-bold ${isProfit ? 'text-brand-green' : 'text-brand-rose'}`}>
                          {isProfit ? '+' : ''}${log.pnlUsd.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({isProfit ? '+' : ''}
                          {log.pnlPercent?.toFixed(1)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{log.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};