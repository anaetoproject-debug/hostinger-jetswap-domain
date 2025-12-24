
import React, { useState, useMemo } from 'react';
import { ThemeVariant } from '../types';
import { WALLETS, WalletProvider } from '../constants';

interface WalletSelectorProps {
  theme: ThemeVariant;
  onSelect: (wallet: WalletProvider) => void;
  onClose: () => void;
  connecting: string | null;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ theme, onSelect, onClose, connecting }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const categories = ['All', 'Popular', 'Multi-Chain', 'Solana', 'Smart', 'Hardware', 'Exchange'];

  const filteredWallets = useMemo(() => {
    return WALLETS.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
                            w.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || w.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const groupedWallets: Record<string, WalletProvider[]> = useMemo(() => {
    if (activeFilter !== 'All' || search.length > 0) return { "Results": filteredWallets };
    
    const groups: Record<string, WalletProvider[]> = {};
    categories.slice(1).forEach(cat => {
      groups[cat] = WALLETS.filter(w => w.category === cat);
    });
    return groups;
  }, [filteredWallets, activeFilter, search]);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC || theme === ThemeVariant.GLASSMORPHISM;

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center px-0 sm:px-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-[48px] border transition-all duration-500 overflow-hidden ${
        isDark ? 'bg-[#0B0F1A] border-white/10 text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]' : 'bg-white border-gray-100 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Drag Handle (Mobile) */}
        <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 shrink-0" />

        {/* Header */}
        <div className="p-6 sm:p-10 pb-4 shrink-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Pilot Registry</h2>
              <p className="text-[10px] sm:text-xs font-black opacity-30 uppercase tracking-[0.2em]">Deploy your wallet to the Jet protocol</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-6">
            <div className={`group flex items-center gap-4 px-6 py-4 rounded-[24px] border transition-all duration-300 ${
              isDark ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-gray-50 border-gray-100 focus-within:border-blue-500 shadow-inner'
            }`}>
              <svg className="w-5 h-5 opacity-30 group-focus-within:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text"
                placeholder="Find your bridge operator..."
                className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:opacity-40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                    activeFilter === cat 
                    ? (isDark ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20')
                    : (isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-white border-gray-200 text-slate-400 hover:border-slate-300')
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 pt-0 custom-scrollbar">
          <div className="space-y-10 pb-12">
            {Object.entries(groupedWallets).map(([groupName, wallets]) => (
              wallets.length > 0 && (
                <div key={groupName} className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 px-1 border-l-2 border-current ml-1 pl-3">{groupName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wallets.map(wallet => (
                      <button
                        key={wallet.id}
                        disabled={!!connecting}
                        onClick={() => onSelect(wallet)}
                        className={`group p-5 rounded-[32px] border text-left transition-all relative overflow-hidden flex items-center gap-5 ${
                          connecting === wallet.id 
                          ? 'border-emerald-500/50 bg-emerald-500/10' 
                          : isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10 hover:shadow-xl' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        {/* Status / Recommended Badge */}
                        {wallet.recommended && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500">Fast Path</span>
                          </div>
                        )}

                        <div className="relative shrink-0 p-1 bg-white rounded-[20px] shadow-sm group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={wallet.icon} 
                            alt={wallet.name} 
                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg" 
                          />
                        </div>
                        
                        <div className="flex flex-col min-w-0 pr-6">
                          <span className="font-black text-sm sm:text-base tracking-tight mb-0.5 group-hover:translate-x-1 transition-transform">{wallet.name}</span>
                          <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider line-clamp-1">{wallet.description}</span>
                        </div>

                        {connecting === wallet.id && (
                          <div className="absolute right-6">
                            <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v2m0 14v2m8-10h-2M4 12H2m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M6.364 6.364l1.414-1.414" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10 bg-gradient-to-tr ${isDark ? 'from-emerald-500/5 to-transparent' : 'from-blue-500/5 to-transparent'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {filteredWallets.length === 0 && (
              <div className="py-24 text-center opacity-30 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-sm font-black uppercase tracking-[0.2em]">Scanner: Zero Results</p>
                <button onClick={() => {setSearch(''); setActiveFilter('All');}} className="mt-4 px-6 py-2 rounded-full border border-white/10 text-[10px] text-emerald-500 font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-colors">Reset System Scanner</button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className={`p-8 sm:p-10 border-t shrink-0 ${isDark ? 'bg-[#0F1420] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
           <div className="flex items-center gap-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-[11px] leading-relaxed opacity-50 font-bold">
                Jet Swap utilizes industrial-grade encryption for all wallet handshakes. Always ensure you are on <span className="text-current underline">jetswap.com</span> before signing any flight authorizations.
              </p>
           </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default WalletSelector;
