
import React, { useState, useEffect } from 'react';
import { ThemeVariant, SwapState, Chain, Token } from '../types';
import { WALLETS, TOKENS } from '../constants';
import ChainSelector from './ChainSelector';

interface SwapCardProps {
  theme: ThemeVariant;
  onConfirm: (state: SwapState) => void;
  walletConnected: boolean;
  onConnect: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ theme, onConfirm, walletConnected, onConnect }) => {
  // Use Wallet objects for the source/dest selection state
  const [state, setState] = useState<any>({
    sourceChain: WALLETS[0], // MetaMask
    destChain: WALLETS[1],   // Coinbase
    sourceToken: TOKENS[0],
    destToken: TOKENS[1],
    amount: '',
    estimatedOutput: '0.00'
  });

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    if (parseFloat(state.amount) > 0) {
      setIsLoadingQuote(true);
      const timer = setTimeout(() => {
        const rate = state.sourceToken.symbol === 'ETH' ? 2640 : 0.00038;
        const output = (parseFloat(state.amount) * rate * 0.995).toFixed(2);
        setState(prev => ({ ...prev, estimatedOutput: output }));
        setIsLoadingQuote(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setState(prev => ({ ...prev, estimatedOutput: '0.00' }));
    }
  }, [state.amount, state.sourceToken, state.destToken]);

  const handleSwapDirection = () => {
    setState(prev => ({
      ...prev,
      sourceChain: prev.destChain,
      destChain: prev.sourceChain,
      sourceToken: prev.destToken,
      destToken: prev.sourceToken,
    }));
  };

  const getCardStyles = () => {
    switch (theme) {
      case ThemeVariant.GLASSMORPHISM:
        return 'bg-white/10 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-white';
      case ThemeVariant.DARK_FUTURISTIC:
        return 'bg-[#0B0F1A] border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] text-gray-100';
      case ThemeVariant.GRADIENT_PREMIUM:
        return 'bg-white border-blue-50 shadow-2xl text-slate-800';
      default:
        return 'bg-white border-gray-100 shadow-xl text-slate-900';
    }
  };

  const getInputStyles = () => {
    switch (theme) {
      case ThemeVariant.GLASSMORPHISM:
        return 'bg-white/5 border-white/10 text-white placeholder-white/30';
      case ThemeVariant.DARK_FUTURISTIC:
        return 'bg-[#151926] border-white/5 text-white placeholder-white/20';
      default:
        return 'bg-gray-50 border-gray-100 text-slate-900 placeholder-slate-400';
    }
  };

  const getButtonStyles = () => {
    if (!walletConnected) {
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
    }
    switch (theme) {
      case ThemeVariant.DARK_FUTURISTIC:
        return 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] text-white';
      case ThemeVariant.GRADIENT_PREMIUM:
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-blue-200 shadow-lg';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
    }
  };

  return (
    <div className={`w-full max-w-[480px] p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden ${getCardStyles()}`}>
      <div className="flex flex-col gap-6">
        {/* Wallet Selectors (From/To) */}
        <div className="flex items-center gap-2 relative">
          <ChainSelector 
            label="From" 
            selected={state.sourceChain} 
            onSelect={(w) => setState({...state, sourceChain: w})} 
            theme={theme}
          />
          
          <button 
            onClick={handleSwapDirection}
            className={`absolute left-1/2 -translate-x-1/2 top-[38px] z-10 p-2 rounded-full border transition-transform hover:scale-110 active:scale-95 ${
              theme === ThemeVariant.GLASSMORPHISM ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <ChainSelector 
            label="To" 
            selected={state.destChain} 
            onSelect={(w) => setState({...state, destChain: w})} 
            theme={theme}
          />
        </div>

        {/* Input Area */}
        <div className={`p-5 rounded-[28px] border ${getInputStyles()}`}>
          <div className="flex justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Payment Buffer</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Bal: 1.24 {state.sourceToken.symbol}</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="number"
              placeholder="0.0"
              className="bg-transparent text-3xl font-black outline-none w-full tracking-tighter"
              value={state.amount}
              onChange={(e) => setState({...state, amount: e.target.value})}
            />
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-colors ${
              theme === ThemeVariant.GLASSMORPHISM ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
              <img src={state.sourceToken.icon} className="w-5 h-5 rounded-lg object-contain" alt="" />
              <span className="font-black text-xs">{state.sourceToken.symbol}</span>
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className={`p-5 rounded-[28px] border ${getInputStyles()}`}>
          <div className="flex justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Yield</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">EST ~12s</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-black w-full tracking-tighter ${isLoadingQuote ? 'animate-pulse opacity-50' : ''}`}>
              {state.estimatedOutput}
            </div>
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-colors ${
              theme === ThemeVariant.GLASSMORPHISM ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
              <img src={state.destToken.icon} className="w-5 h-5 rounded-lg object-contain" alt="" />
              <span className="font-black text-xs">{state.destToken.symbol}</span>
            </button>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-2 px-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Fuel Consumption</span>
            <span className="text-[10px] font-black tracking-widest">~$4.20 GAS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Security Margin</span>
            <span className="text-[10px] font-black text-emerald-500 tracking-widest">SAFE (0.01%)</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
          onClick={() => walletConnected ? onConfirm(state) : onConnect()}
          disabled={walletConnected && (!state.amount || parseFloat(state.amount) <= 0)}
          className={`w-full py-5 rounded-[28px] font-black text-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden active:scale-95 ${getButtonStyles()}`}
        >
          <div className="flex items-center justify-center gap-3 relative z-10 uppercase italic tracking-tighter">
            {walletConnected ? 'Launch Swap' : 'Connect Pilot'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SwapCard;
