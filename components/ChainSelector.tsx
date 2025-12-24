
import React, { useState, useMemo } from 'react';
import { Chain } from '../types';
import { WALLETS, WalletProvider } from '../constants';

interface ChainSelectorProps {
  selected: Chain | WalletProvider; // Allowing both for flexibility
  onSelect: (item: any) => void;
  label: string;
  theme: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ selected, onSelect, label, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const isDark = theme === 'DARK_FUTURISTIC' || theme === 'GLASSMORPHISM';

  const categories = ['All', 'Popular', 'Multi-Chain', 'Solana', 'Exchange'];

  const filteredItems = useMemo(() => {
    return WALLETS.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'All' || w.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  const getButtonStyles = () => {
    switch (theme) {
      case 'GLASSMORPHISM':
        return 'bg-white/5 border-white/10 hover:bg-white/10 text-white';
      case 'DARK_FUTURISTIC':
        return 'bg-[#151926] border-white/5 hover:border-cyan-500/30 text-white';
      case 'GRADIENT_PREMIUM':
        return 'bg-white border-blue-100 hover:border-blue-300 text-slate-900';
      default:
        return 'bg-gray-50 border-gray-100 hover:border-gray-300 text-slate-900';
    }
  };

  return (
    <>
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-30 px-1">
          {label} Bridge
        </label>
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${getButtonStyles()}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-lg shadow-sm">
              <img src={selected.icon} alt={selected.name} className="w-5 h-5 object-contain" />
            </div>
            <span className="font-black text-xs sm:text-sm tracking-tight truncate max-w-[60px] sm:max-w-none">{selected.name}</span>
          </div>
          <svg className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Modern Wallet/Network Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fadeInOverlay_0.3s_ease-out]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <div className={`relative w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col rounded-t-[32px] sm:rounded-[48px] border transition-all overflow-hidden ${
            isDark ? 'bg-[#0B0F1A] border-white/10 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-2xl'
          }`}>
            
            <div className="p-6 sm:p-10 pb-4 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">Select Entry Point</h3>
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Bridging across 20+ protocols</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Search & Tabs */}
              <div className="space-y-4">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <svg className="w-5 h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5}/></svg>
                  <input 
                    type="text" 
                    placeholder="Search wallet or network..." 
                    className="bg-transparent border-none outline-none w-full text-sm font-bold"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                        activeTab === cat 
                          ? (isDark ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-blue-600 text-white border-blue-600')
                          : (isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-gray-200 text-slate-400')
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 pt-0 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[32px] border transition-all group relative overflow-hidden ${
                      selected.id === item.id 
                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-blue-50 border-blue-500/50')
                        : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-lg')
                    }`}
                  >
                    <div className="p-2 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <img src={item.icon} alt={item.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-[11px] sm:text-xs uppercase tracking-tighter mb-0.5">{item.name}</p>
                      <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest truncate max-w-[80px]">{item.description}</p>
                    </div>

                    {item.recommended && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No operators found in sector.</p>
                </div>
              )}
            </div>

            <div className={`p-8 border-t shrink-0 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
               <p className="text-[9px] font-bold opacity-40 leading-relaxed text-center uppercase tracking-widest max-w-sm mx-auto">
                 Selected provider will act as the liquidity terminal for this cross-chain transit.
               </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChainSelector;
