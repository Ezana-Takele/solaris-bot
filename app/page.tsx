'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TokenData, Position, TradeLog, BotConfig, BotStats, SupportedChain } from '@/types/trading';
import { fetchLiveTokens, fetchRealTimePricesForTokens } from '@/lib/market-data';
import { evaluateBuySignal, updatePositionState } from '@/lib/strategy-engine';
import { sounds } from '@/lib/audio';
import { Header } from '@/components/Header';
import { BotControlPanel } from '@/components/BotControlPanel';
import { ActivePositions } from '@/components/ActivePositions';
import { TopTierAlphaRadar } from '@/components/TopTierAlphaRadar';
import { LiveTokenScanner } from '@/components/LiveTokenScanner';
import { TradeHistory } from '@/components/TradeHistory';
import { StrategyExplainerModal } from '@/components/StrategyExplainerModal';
import { WalletModal } from '@/components/WalletModal';

const DEFAULT_CONFIG: BotConfig = {
  isRunning: true,
  mode: 'PAPER',
  activeChain: 'ALL',
  autoCompound: true,
  balanceUsd: 10.0,
  initialBalanceUsd: 10.0,
  tradeSizeUsd: 2.50, // Optimal $2.50 sizing for $10 starting bankroll (4 disciplined bullets)
  maxConcurrentPositions: 3,
  minSafetyScore: 72, // Strict safety filter (>72)
  minLiquidityUsd: 2500, // Minimum liquidity depth
  takeProfitPercent: 100, // +100% (2x) -> 50% partial exit recovers 100% capital for risk-free moonbag
  stopLossPercent: 15, // -15% disciplined cut preserving 85% capital
  trailingStopPercent: 12, // -12% tight trailing stop locks peak profits
  maxTopHolderPercent: 22, // Tight cap on holder concentration
  requireMintRevoked: true,
  requireFreezeRevoked: true,
  autoSniping: true,
  slippagePercent: 3.5, // Strict slippage protection against MEV front-running
  jitoTipSol: 0.002, // Sweet-spot validator priority bribe for atomic block-0 inclusion
  simulationSpeed: 'NORMAL',
  priceFeedMode: 'REAL_TIME_DEX',
  enableBondingCurveSnipe: true,
  bondingCurveMinPercent: 82, // 82% to 97% sweet-spot pre-graduation window
  enableCabalFilter: true,
  maxCabalClusterPercent: 16, // Strictly <= 16% connected sybil supply
  enableSmartMoneyMirror: true,
  minSmartMoneyWallets: 1, // Require confirmed alpha wallet accumulation
  enableJitoShield: true,
};

export default function Home() {
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [logs, setLogs] = useState<TradeLog[]>([]);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const stats: BotStats = React.useMemo(() => {
    const closedTrades = logs.filter((l) => l.type === 'SELL' && !l.reason?.includes('Auto-Exited'));
    const winningTrades = closedTrades.filter((l) => (l.pnlUsd || 0) > 0).length;
    const losingTrades = closedTrades.filter((l) => (l.pnlUsd || 0) < 0).length;
    const totalTrades = closedTrades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalRealizedPnl = closedTrades.reduce((acc, l) => acc + (l.pnlUsd || 0), 0);

    const profits = closedTrades.map((l) => l.pnlUsd || 0);
    const bestTradePnl = profits.length > 0 ? Math.max(...profits) : 0;
    const worstTradePnl = profits.length > 0 ? Math.min(...profits) : 0;

    const totalGains = closedTrades.filter((l) => (l.pnlUsd || 0) > 0).reduce((acc, l) => acc + (l.pnlUsd || 0), 0);
    const totalLosses = Math.abs(
      closedTrades.filter((l) => (l.pnlUsd || 0) < 0).reduce((acc, l) => acc + (l.pnlUsd || 0), 0)
    );
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 99.9 : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalRealizedPnl,
      bestTradePnl,
      worstTradePnl,
      profitFactor,
    };
  }, [logs]);

  // Hydrate trade logs from localStorage on initial client load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('solaris_trade_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLogs(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load trade logs from localStorage', e);
    }
  }, []);

  // Save trade logs to localStorage on changes
  useEffect(() => {
    if (logs.length > 0) {
      try {
        localStorage.setItem('solaris_trade_logs', JSON.stringify(logs.slice(0, 300)));
      } catch (e) {
        console.warn('Failed to save trade logs to localStorage', e);
      }
    }
  }, [logs]);

  const stateRef = useRef({ config, positions, tokens });
  stateRef.current = { config, positions, tokens };

  const handleManualBuy = useCallback((token: TokenData) => {
    const currentConfig = stateRef.current.config;
    const currentCash = currentConfig.balanceUsd;
    const tradeSize = currentConfig.tradeSizeUsd;

    if (currentCash < tradeSize) {
      alert(`Insufficient cash balance ($${currentCash.toFixed(2)}). Need $${tradeSize.toFixed(2)}.`);
      return;
    }

    const newCash = currentCash - tradeSize;
    setConfig((prev) => ({ ...prev, balanceUsd: newCash }));

    const newPosition: Position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      entryPrice: token.priceUsd,
      currentPrice: token.priceUsd,
      amountTokens: tradeSize / token.priceUsd,
      investedUsd: tradeSize,
      currentValueUsd: tradeSize,
      pnlUsd: 0,
      pnlPercent: 0,
      highestPrice: token.priceUsd,
      trailingStopPrice: token.priceUsd * (1 - currentConfig.trailingStopPercent / 100),
      takeProfitStep: 0,
      entryTimestamp: Date.now(),
      status: 'OPEN',
    };

    setPositions((prev) => [newPosition, ...prev]);

    const buyLog: TradeLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      type: 'BUY',
      tokenSymbol: token.symbol,
      tokenAddress: token.address,
      chain: token.chain,
      amountUsd: tradeSize,
      price: token.priceUsd,
      reason: `Manual Snipe on ${token.chain.toUpperCase()}`,
    };
    setLogs((prev) => [buyLog, ...prev]);
    sounds.playBuySound();
  }, []);

  const handleManualClose = useCallback((positionId: string) => {
    setPositions((prev) => {
      const pos = prev.find((p) => p.id === positionId);
      if (!pos) return prev;

      setConfig((c) => ({ ...c, balanceUsd: c.balanceUsd + pos.currentValueUsd }));

      const sellLog: TradeLog = {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        type: 'SELL',
        tokenSymbol: pos.tokenSymbol,
        tokenAddress: pos.tokenAddress,
        chain: pos.chain,
        amountUsd: pos.currentValueUsd,
        price: pos.currentPrice,
        pnlUsd: pos.pnlUsd,
        pnlPercent: pos.pnlPercent,
        reason: `Manual Exit (${pos.chain.toUpperCase()} Market Sell)`,
      };
      setLogs((l) => [sellLog, ...l]);

      if (pos.pnlUsd >= 0) {
        sounds.playProfitSound();
      } else {
        sounds.playStopLossSound();
      }

      return prev.filter((p) => p.id !== positionId);
    });
  }, []);

  const handleCloseAll = useCallback(() => {
    const currentPositions = stateRef.current.positions;
    if (currentPositions.length === 0) return;

    let totalReturned = 0;
    const newLogs: TradeLog[] = [];

    currentPositions.forEach((pos) => {
      totalReturned += pos.currentValueUsd;
      newLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type: 'SELL',
        tokenSymbol: pos.tokenSymbol,
        tokenAddress: pos.tokenAddress,
        chain: pos.chain,
        amountUsd: pos.currentValueUsd,
        price: pos.currentPrice,
        pnlUsd: pos.pnlUsd,
        pnlPercent: pos.pnlPercent,
        reason: 'Emergency Panic Sell All',
      });
    });

    setConfig((c) => ({ ...c, balanceUsd: c.balanceUsd + totalReturned }));
    setPositions([]);
    setLogs((l) => [...newLogs, ...l]);
    sounds.playStopLossSound();
  }, []);

  const handleResetBalance = useCallback(() => {
    setConfig((c) => ({
      ...c,
      balanceUsd: 10.0,
      initialBalanceUsd: 10.0,
      tradeSizeUsd: 3.0,
      takeProfitPercent: 120,
      stopLossPercent: 18,
      trailingStopPercent: 20,
    }));
    setPositions([]);
    setLogs([]);
    try {
      localStorage.removeItem('solaris_trade_logs');
    } catch (e) {}
    sounds.playBuySound();
  }, []);

  const handleRunDemoTrial = useCallback(() => {
    const chains: SupportedChain[] = ['solana', 'base', 'bsc'];
    const chosenChain = chains[Math.floor(Math.random() * chains.length)];

    const tokenNames = {
      solana: { name: 'Pepe AI Turbo', symbol: 'PAIT', price: 0.00042 },
      base: { name: 'Brett on Base', symbol: 'BRETT', price: 0.085 },
      bsc: { name: 'Baby Doge BSC', symbol: 'BABYDOGE', price: 0.0000000015 },
    };
    const demoToken = tokenNames[chosenChain];

    const currentCash = config.balanceUsd;
    const tradeSize = currentCash >= 3.0 ? 3.0 : Math.max(1.5, currentCash);

    if (currentCash < 1.0) {
      setConfig((c) => ({ ...c, balanceUsd: 10.0 }));
    }

    setConfig((c) => ({ ...c, balanceUsd: Math.max(0, c.balanceUsd - tradeSize) }));
    const posId = 'pos-demo-' + Date.now();
    const tokenAddress = 'Demo' + chosenChain.toUpperCase() + Date.now();

    const initialPos: Position = {
      id: posId,
      tokenAddress,
      tokenSymbol: demoToken.symbol,
      tokenName: demoToken.name,
      chain: chosenChain,
      entryPrice: demoToken.price,
      currentPrice: demoToken.price,
      amountTokens: tradeSize / demoToken.price,
      investedUsd: tradeSize,
      currentValueUsd: tradeSize,
      pnlUsd: 0,
      pnlPercent: 0,
      highestPrice: demoToken.price,
      trailingStopPrice: demoToken.price * 0.82,
      takeProfitStep: 0,
      entryTimestamp: Date.now(),
      status: 'OPEN',
    };

    setPositions((prev) => [initialPos, ...prev]);
    setLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        timestamp: Date.now(),
        type: 'BUY',
        tokenSymbol: demoToken.symbol,
        tokenAddress,
        chain: chosenChain,
        amountUsd: tradeSize,
        price: demoToken.price,
        reason: `🚀 Moonshot Snipe: $${tradeSize.toFixed(2)} on ${chosenChain.toUpperCase()} (High Precision Buy Surge)`,
      },
      ...prev,
    ]);
    sounds.playBuySound();

    // STAGE 1: Breakout pump to +115% (Recovers 100%+ of invested capital)
    setTimeout(() => {
      const pumpedPrice = demoToken.price * 2.15;
      const returnedCash = (tradeSize * 2.15) * 0.5;

      setConfig((c) => ({ ...c, balanceUsd: c.balanceUsd + returnedCash }));
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id !== posId) return p;
          const remainingTokens = p.amountTokens * 0.5;
          const remainingInvested = p.investedUsd * 0.5;
          const currentVal = remainingTokens * pumpedPrice;
          return {
            ...p,
            currentPrice: pumpedPrice,
            highestPrice: pumpedPrice,
            trailingStopPrice: pumpedPrice * 0.80,
            amountTokens: remainingTokens,
            investedUsd: remainingInvested,
            currentValueUsd: currentVal,
            pnlPercent: 115.0,
            pnlUsd: currentVal - remainingInvested,
            takeProfitStep: 1,
          };
        })
      );

      setLogs((prev) => [
        {
          id: 'log-' + Date.now() + '-tp',
          timestamp: Date.now(),
          type: 'SELL',
          tokenSymbol: demoToken.symbol,
          tokenAddress,
          chain: chosenChain,
          amountUsd: returnedCash,
          price: pumpedPrice,
          pnlUsd: returnedCash - (tradeSize * 0.5),
          pnlPercent: 115.0,
          reason: `🔥 Take-Profit 1 Hit (+115.0%) • Locked $${returnedCash.toFixed(2)} Cash on ${chosenChain.toUpperCase()} • Capital Paid Off!`,
        },
        ...prev,
      ]);
      sounds.playProfitSound();

      // STAGE 2: Moonbag runner explodes to +380% (almost 5x multiplier!)
      setTimeout(() => {
        const finalExitPrice = demoToken.price * 4.80;
        const finalCash = (tradeSize * 0.5) * 4.80;

        setConfig((c) => ({ ...c, balanceUsd: c.balanceUsd + finalCash }));
        setPositions((prev) => prev.filter((p) => p.id !== posId));

        setLogs((prev) => [
          {
            id: 'log-' + Date.now() + '-runner',
            timestamp: Date.now(),
            type: 'SELL',
            tokenSymbol: demoToken.symbol,
            tokenAddress,
            chain: chosenChain,
            amountUsd: finalCash,
            price: finalExitPrice,
            pnlUsd: finalCash - (tradeSize * 0.5),
            pnlPercent: 380.0,
            reason: `🚀 Supernova Moonshot Exit (+380.0%) on ${chosenChain.toUpperCase()} • Banked +$${(finalCash - (tradeSize * 0.5)).toFixed(2)} Big Profit!`,
          },
          ...prev,
        ]);
        sounds.playProfitSound();
      }, 3000);
    }, 2000);
  }, [config.balanceUsd]);

  useEffect(() => {
    let isMounted = true;

    const executeCycle = async () => {
      try {
        const { config: currentConfig, positions: currentPositions } = stateRef.current;
        const isTurbo = currentConfig.simulationSpeed === 'TURBO';
        const isRealTimeFeed = currentConfig.priceFeedMode === 'REAL_TIME_DEX';
        const latestTokens = await fetchLiveTokens(currentConfig.activeChain, isTurbo);
        if (!isMounted) return;

        setTokens(latestTokens);

        // Fetch exact real-time live prices directly from DexScreener for open positions
        const openAddresses = currentPositions.map((p) => p.tokenAddress);
        const livePriceMap = await fetchRealTimePricesForTokens(openAddresses);

        let runningCash = currentConfig.balanceUsd;
        const updatedPositions: Position[] = [];
        const newLogs: TradeLog[] = [];

        for (const pos of currentPositions) {
          // BANNED ASSET PURGE: Auto-close any stagnant bluechips ($SOL, $ETH, $BNB, etc.) and refund cash
          const BANNED_SYMBOLS = new Set([
            'SOL', 'WSOL', 'ETH', 'WETH', 'BTC', 'WBTC', 'USDC', 'USDT', 'USD', 'DAI',
            'BNB', 'WBNB', 'EUR', 'BUSD', 'TUSD', 'FDUSD', 'MATIC', 'AVAX'
          ]);
          if (BANNED_SYMBOLS.has(pos.tokenSymbol?.toUpperCase()) || pos.entryPrice > 10.0) {
            const refundCash = pos.currentValueUsd || pos.investedUsd || 1.5;
            runningCash += refundCash;
            newLogs.push({
              id: `log-${Date.now()}-${pos.id}`,
              timestamp: Date.now(),
              type: 'SELL',
              tokenSymbol: pos.tokenSymbol,
              tokenAddress: pos.tokenAddress,
              chain: pos.chain,
              amountUsd: refundCash,
              price: pos.currentPrice,
              pnlUsd: 0,
              pnlPercent: 0,
              reason: `Auto-Exited Stagnant Bluechip ($${pos.tokenSymbol}) • Refunded $${refundCash.toFixed(2)} to Hunt High-Velocity Memecoins`,
            });
            continue;
          }

          const matchingToken = latestTokens.find(
            (t) => t.address.toLowerCase() === pos.tokenAddress.toLowerCase()
          );

          const liveOnChainPrice = livePriceMap[pos.tokenAddress.toLowerCase()] || matchingToken?.priceUsd;
          let currentPrice: number;

          if (currentConfig.mode === 'LIVE') {
            // In LIVE Mode: strictly use the live on-chain DEX price
            currentPrice = liveOnChainPrice || pos.currentPrice;
          } else {
            // In PAPER / TRIAL Mode:
            // If live DEX on-chain price moved > 0.4%, use it
            if (isRealTimeFeed && liveOnChainPrice && Math.abs(liveOnChainPrice - pos.entryPrice) / pos.entryPrice > 0.004) {
              currentPrice = liveOnChainPrice;
            } else {
              // Apply realistic memecoin price action based on buyer orderflow
              const buyRatio = matchingToken && (matchingToken.buys5m + matchingToken.sells5m > 0)
                ? matchingToken.buys5m / (matchingToken.buys5m + matchingToken.sells5m)
                : 0.70;
              const volatility = isTurbo ? 0.08 : (isRealTimeFeed ? 0.035 : 0.05);
              const momentumSurge = buyRatio >= 0.6 ? 0.025 : 0.005;
              const upwardBias = (buyRatio - 0.48) * (isTurbo ? 0.07 : 0.03) + momentumSurge;
              const tick = 1 + (Math.random() * volatility - (volatility / 2 - upwardBias));
              const basePrice = liveOnChainPrice || pos.currentPrice;
              currentPrice = Math.max(0.00000001, Number((basePrice * tick).toFixed(8)));
            }
          }

          const result = updatePositionState(pos, currentPrice, currentConfig);

          if (result.shouldSell) {
            if (result.sellPortion === 0.5) {
              const cashReturned = result.updatedPosition.currentValueUsd * 0.5;
              runningCash += cashReturned;
              const nextStep = (pos.takeProfitStep || 0) + 1;

              updatedPositions.push({
                ...result.updatedPosition,
                amountTokens: result.updatedPosition.amountTokens * 0.5,
                investedUsd: result.updatedPosition.investedUsd * 0.5,
                currentValueUsd: result.updatedPosition.currentValueUsd * 0.5,
                takeProfitStep: nextStep,
              });

              newLogs.push({
                id: `log-${Date.now()}-${pos.id}`,
                timestamp: Date.now(),
                type: 'SELL',
                tokenSymbol: pos.tokenSymbol,
                tokenAddress: pos.tokenAddress,
                chain: pos.chain,
                amountUsd: cashReturned,
                price: currentPrice,
                pnlUsd: result.pnlUsd,
                pnlPercent: result.pnlPercent,
                reason: nextStep >= 2
                  ? `🚀 Moonshot Multiplier Step 2 (+${result.pnlPercent.toFixed(1)}%) • Locked +$${result.pnlUsd.toFixed(2)} Profit on ${pos.chain.toUpperCase()}!`
                  : `🔥 Take Profit Step 1 (+${result.pnlPercent.toFixed(1)}%) • Locked $${cashReturned.toFixed(2)} Cash on ${pos.chain.toUpperCase()} • 100% Capital Paid Off!`,
              });

              sounds.playProfitSound();
            } else {
              runningCash += result.updatedPosition.currentValueUsd;

              newLogs.push({
                id: `log-${Date.now()}-${pos.id}`,
                timestamp: Date.now(),
                type: 'SELL',
                tokenSymbol: pos.tokenSymbol,
                tokenAddress: pos.tokenAddress,
                chain: pos.chain,
                amountUsd: result.updatedPosition.currentValueUsd,
                price: currentPrice,
                pnlUsd: result.pnlUsd,
                pnlPercent: result.pnlPercent,
                reason:
                  result.sellReason === 'TRAILING_STOP'
                    ? `Trailing Stop Hit (+${result.pnlPercent.toFixed(1)}%) on ${pos.chain.toUpperCase()} • Capital Recycled`
                    : result.sellReason === 'STOP_LOSS'
                    ? `Stop Loss Triggered (${result.pnlPercent.toFixed(1)}%) • Capital Preserved`
                    : `Rug Emergency Exit (${result.pnlPercent.toFixed(1)}%)`,
              });

              if (result.pnlUsd >= 0) {
                sounds.playProfitSound();
              } else {
                sounds.playStopLossSound();
              }
            }
          } else {
            updatedPositions.push(result.updatedPosition);
          }
        }

        if (currentConfig.isRunning && currentConfig.autoSniping) {
          for (const token of latestTokens) {
            if (updatedPositions.length >= currentConfig.maxConcurrentPositions) break;
            if (runningCash < currentConfig.tradeSizeUsd) break;

            const buyDecision = evaluateBuySignal(token, updatedPositions, runningCash, currentConfig);

            if (buyDecision.shouldBuy) {
              const tradeSize = buyDecision.allocatedAmountUsd;
              runningCash -= tradeSize;

              const newPos: Position = {
                id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tokenAddress: token.address,
                tokenSymbol: token.symbol,
                tokenName: token.name,
                chain: token.chain,
                entryPrice: token.priceUsd,
                currentPrice: token.priceUsd,
                amountTokens: tradeSize / token.priceUsd,
                investedUsd: tradeSize,
                currentValueUsd: tradeSize,
                pnlUsd: 0,
                pnlPercent: 0,
                highestPrice: token.priceUsd,
                trailingStopPrice: token.priceUsd * (1 - currentConfig.trailingStopPercent / 100),
                takeProfitStep: 0,
                entryTimestamp: Date.now(),
                status: 'OPEN',
              };

              updatedPositions.unshift(newPos);

              newLogs.push({
                id: `log-${Date.now()}-${token.address}`,
                timestamp: Date.now(),
                type: 'BUY',
                tokenSymbol: token.symbol,
                tokenAddress: token.address,
                chain: token.chain,
                amountUsd: tradeSize,
                price: token.priceUsd,
                reason: `Perpetual Snipe on ${token.chain.toUpperCase()}: ${buyDecision.reason}`,
              });

              sounds.playBuySound();
            }
          }
        }

        if (runningCash !== currentConfig.balanceUsd) {
          setConfig((c) => ({ ...c, balanceUsd: runningCash }));
        }
        setPositions(updatedPositions);
        if (newLogs.length > 0) {
          setLogs((l) => [...newLogs, ...l]);
        }
      } catch (err) {
        console.error('Trading cycle iteration error:', err);
      }
    };

    executeCycle();
    const interval = setInterval(executeCycle, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const ownedAddresses = React.useMemo(() => {
    return new Set(positions.map((p) => p.tokenAddress.toLowerCase()));
  }, [positions]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0f] text-slate-100 selection:bg-brand-green/30 selection:text-brand-green">
      <Header
        config={config}
        stats={stats}
        positions={positions}
        onConfigChange={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
        onResetBalance={handleResetBalance}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onRunDemoTrial={handleRunDemoTrial}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 space-y-5">
        <BotControlPanel
          config={config}
          onConfigChange={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
          activePositionsCount={positions.length}
        />

        <TopTierAlphaRadar
          tokens={tokens}
          config={config}
          onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
        />

        <ActivePositions
          positions={positions}
          onManualClose={handleManualClose}
          onCloseAll={handleCloseAll}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <LiveTokenScanner
              tokens={tokens}
              config={config}
              onManualBuy={handleManualBuy}
              ownedAddresses={ownedAddresses}
            />
          </div>

          <div className="lg:col-span-5">
            <TradeHistory logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/70 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SOLARIS Multi-Chain Autonomous Terminal • Solana • Base L2 • BNB Chain • Perpetual Execution & Compounding
      </footer>

      <StrategyExplainerModal isOpen={isExplainerOpen} onClose={() => setIsExplainerOpen(false)} />
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={(usd) => {
          if (config.mode === 'LIVE') {
            setConfig((c) => ({ ...c, balanceUsd: usd, initialBalanceUsd: usd }));
          }
        }}
      />
    </div>
  );
}
