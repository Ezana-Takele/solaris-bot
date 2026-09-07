'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { botWallet, evmWallet } from '@/lib/wallet-manager';
import { SupportedChain } from '@/types/trading';
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Key,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated?: (usd: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onBalanceUpdated }) => {
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('solana');
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'KEYS'>('DEPOSIT');

  // Solana state
  const [solPublicKey, setSolPublicKey] = useState('');
  const [solPrivateKey, setSolPrivateKey] = useState('');
  const [solBalance, setSolBalance] = useState(0);
  const [solUsdBalance, setSolUsdBalance] = useState(0);

  // EVM (Base & BSC) state
  const [evmAddress, setEvmAddress] = useState('');
  const [evmPrivateKey, setEvmPrivateKey] = useState('');
  const [baseEthBalance, setBaseEthBalance] = useState(0);
  const [baseUsdBalance, setBaseUsdBalance] = useState(0);
  const [bscBnbBalance, setBscBnbBalance] = useState(0);
  const [bscUsdBalance, setBscUsdBalance] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Withdraw state
  const [destAddress, setDestAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Import key state
  const [importKeyInput, setImportKeyInput] = useState('');

  const refreshBalances = async () => {
    setIsLoading(true);
    try {
      const sBal = await botWallet.fetchOnChainBalance();
      setSolBalance(sBal.sol);
      setSolUsdBalance(sBal.usd);

      const bBal = await evmWallet.fetchOnChainBalance('base');
      setBaseEthBalance(bBal.nativeAmount);
      setBaseUsdBalance(bBal.usdValue);

      const bscBal = await evmWallet.fetchOnChainBalance('bsc');
      setBscBnbBalance(bscBal.nativeAmount);
      setBscUsdBalance(bscBal.usdValue);

      const totalUsd = sBal.usd + bBal.usdValue + bscBal.usdValue;
      if (onBalanceUpdated) {
        onBalanceUpdated(totalUsd);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSolPublicKey(botWallet.getPublicKey());
      setSolPrivateKey(botWallet.getPrivateKeyBase58());

      setEvmAddress(evmWallet.getAddress());
      setEvmPrivateKey(evmWallet.getPrivateKey());

      refreshBalances();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, isPriv = false) => {
    navigator.clipboard.writeText(text);
    if (isPriv) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentAddress = selectedChain === 'solana' ? solPublicKey : evmAddress;
  const currentPrivKey = selectedChain === 'solana' ? solPrivateKey : evmPrivateKey;
  const currentNativeSymbol = selectedChain === 'solana' ? 'SOL' : selectedChain === 'base' ? 'ETH' : 'BNB';
  const currentNativeBalance =
    selectedChain === 'solana' ? solBalance : selectedChain === 'base' ? baseEthBalance : bscBnbBalance;
  const currentUsdValue =
    selectedChain === 'solana' ? solUsdBalance : selectedChain === 'base' ? baseUsdBalance : bscUsdBalance;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destAddress || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawStatus('Error: Invalid amount entered');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawStatus(`Submitting transfer on ${selectedChain.toUpperCase()}...`);

    if (selectedChain === 'solana') {
      const res = await botWallet.withdrawSol(destAddress, amount);
      setIsWithdrawing(false);
      if (res.success) {
        setWithdrawStatus(`Success! TX: ${res.signature?.slice(0, 16)}...`);
        setWithdrawAmount('');
        refreshBalances();
      } else {
        setWithdrawStatus(`Failed: ${res.error}`);
      }
    } else {
      const res = await evmWallet.withdraw(selectedChain, destAddress, amount);
      setIsWithdrawing(false);
      if (res.success) {
        setWithdrawStatus(`Success! Transfer Broadcasted (TX: ${res.txHash?.slice(0, 16)}...)`);
        setWithdrawAmount('');
        refreshBalances();
      } else {
        setWithdrawStatus(`Failed: ${res.error}`);
      }
    }
  };

  const handleImportKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importKeyInput.trim()) return;

    if (selectedChain === 'solana') {
      const ok = botWallet.importPrivateKey(importKeyInput.trim());
      if (ok) {
        setSolPublicKey(botWallet.getPublicKey());
        setSolPrivateKey(botWallet.getPrivateKeyBase58());
        setImportKeyInput('');
        refreshBalances();
        alert('Solana Key imported successfully!');
      } else {
        alert('Invalid Solana Base58 private key format.');
      }
    } else {
      const ok = evmWallet.importPrivateKey(importKeyInput.trim());
      if (ok) {
        setEvmAddress(evmWallet.getAddress());
        setEvmPrivateKey(evmWallet.getPrivateKey());
        setImportKeyInput('');
        refreshBalances();
        alert('EVM Key imported successfully for Base & BSC!');
      } else {
        alert('Invalid EVM private key format (must be 64 hex characters or 0x...).');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Multi-Chain Bot Wallets
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-mono font-bold">
                Self-Custodial
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deposit, withdraw, and export keys for Solana, Base L2, and BNB Chain.
            </p>
          </div>
        </div>

        {/* Blockchain Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-surface-dark border border-border rounded-xl mb-5">
          <button
            onClick={() => {
              setSelectedChain('solana');
              setWithdrawStatus(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedChain === 'solana'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <span>◎</span>
            <span>Solana</span>
          </button>

          <button
            onClick={() => {
              setSelectedChain('base');
              setWithdrawStatus(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedChain === 'base'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <span>🔵</span>
            <span>Base L2</span>
          </button>

          <button
            onClick={() => {
              setSelectedChain('bsc');
              setWithdrawStatus(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedChain === 'bsc'
                ? 'bg-amber-600/30 text-amber-200 border border-amber-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <span>🟡</span>
            <span>BNB Chain</span>
          </button>
        </div>

        {/* Balance Card for Selected Chain */}
        <div className="bg-surface-dark border border-border rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
              {selectedChain.toUpperCase()} On-Chain Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-white">
                {currentNativeBalance.toFixed(4)} {currentNativeSymbol}
              </span>
              <span className="text-sm font-mono text-slate-400 font-medium">
                ≈ ${currentUsdValue.toFixed(2)} USD
              </span>
            </div>
          </div>

          <button
            onClick={refreshBalances}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-brand-cyan hover:text-white bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
            title="Refresh On-Chain RPC Balances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="font-mono">Refresh</span>
          </button>
        </div>

        {/* Action Tabs: DEPOSIT / WITHDRAW / KEYS */}
        <div className="flex border-b border-border mb-5">
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'DEPOSIT'
                ? 'text-brand-green border-brand-green'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('WITHDRAW')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'WITHDRAW'
                ? 'text-brand-cyan border-brand-cyan'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => setActiveTab('KEYS')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'KEYS'
                ? 'text-amber-400 border-amber-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Private Key</span>
          </button>
        </div>

        {/* TAB 1: DEPOSIT */}
        {activeTab === 'DEPOSIT' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-surface-dark border border-border rounded-xl">
              <div className="p-2.5 bg-white rounded-xl shadow-md">
                {currentAddress ? (
                  <QRCodeSVG value={currentAddress} size={130} />
                ) : (
                  <div className="w-[130px] h-[130px] flex items-center justify-center text-slate-400 text-xs">
                    Generating...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  Dedicated {selectedChain.toUpperCase()} Deposit Address
                </span>
                <div className="font-mono text-xs text-slate-200 bg-surface border border-border p-2.5 rounded-lg break-all select-all">
                  {currentAddress || 'Generating keypair...'}
                </div>
                <button
                  onClick={() => copyToClipboard(currentAddress)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/50 px-3 py-1.5 rounded-lg font-semibold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Address!' : 'Copy Deposit Address'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-dark border border-border/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>How Funding Works for {selectedChain.toUpperCase()}:</span>
              </div>
              <p>
                {selectedChain === 'solana' && (
                  <>Send <b>SOL</b> from Phantom, Solflare, or Coinbase to start live micro-sniping. Recommended: $10 (~0.07 SOL).</>
                )}
                {selectedChain === 'base' && (
                  <>Send <b>ETH on Base L2</b> from Coinbase or MetaMask. Sub-cent fees make $1.50 trades frictionless.</>
                )}
                {selectedChain === 'bsc' && (
                  <>Send <b>BNB on BSC</b> from Trust Wallet or Binance. Recommended: $10 (~0.018 BNB).</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAW */}
        {activeTab === 'WITHDRAW' && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Your Personal {selectedChain.toUpperCase()} Destination Address
              </label>
              <input
                type="text"
                placeholder={selectedChain === 'solana' ? 'Solana public address (Phantom/Solflare)' : 'EVM address (0x...)'}
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                className="w-full bg-surface-dark border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-400 uppercase">Amount to Withdraw</label>
                <span className="text-[11px] font-mono text-slate-400">
                  Max: {currentNativeBalance.toFixed(4)} {currentNativeSymbol}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-surface-dark border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan transition-colors pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const gasReserve = selectedChain === 'solana' ? 0.001 : 0.0005;
                    setWithdrawAmount(Math.max(0, currentNativeBalance - gasReserve).toFixed(4));
                  }}
                  className="absolute right-2 top-2 px-2 py-1 text-[10px] font-mono bg-surface hover:bg-surface-light text-brand-cyan rounded border border-border transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {withdrawStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-mono border ${
                  withdrawStatus.includes('Success')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : withdrawStatus.includes('Error') || withdrawStatus.includes('Failed')
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                }`}
              >
                {withdrawStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={isWithdrawing || currentNativeBalance <= 0}
              className="w-full py-3 bg-brand-cyan hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isWithdrawing ? 'Sending On-Chain...' : `Withdraw ${currentNativeSymbol} to Personal Wallet`}
            </button>
          </form>
        )}

        {/* TAB 3: PRIVATE KEYS */}
        {activeTab === 'KEYS' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <b>Full Self-Custody:</b> Your private keys are stored locally in your browser. You can export them at any time into Phantom, Solflare, MetaMask, or Coinbase Wallet.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  {selectedChain.toUpperCase()} Private Key
                </label>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="text-xs text-brand-cyan hover:underline font-mono"
                >
                  {showPrivateKey ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>

              <div className="bg-surface-dark border border-border p-3 rounded-xl font-mono text-xs text-slate-200 break-all select-all">
                {showPrivateKey ? currentPrivKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>

              {showPrivateKey && (
                <button
                  onClick={() => copyToClipboard(currentPrivKey, true)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface hover:bg-surface-light border border-border px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied Private Key!' : 'Copy Private Key'}</span>
                </button>
              )}
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Import Existing {selectedChain.toUpperCase()} Key
              </label>
              <form onSubmit={handleImportKey} className="flex gap-2">
                <input
                  type="password"
                  placeholder={selectedChain === 'solana' ? 'Solana base58 private key' : 'EVM 64-char hex key (0x...)'}
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                  className="flex-1 bg-surface-dark border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-surface hover:bg-surface-light border border-border text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Import
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
