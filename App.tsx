
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeVariant, TransactionStatus as StatusType, SwapState, UserProfile } from './types';
import SwapCard from './components/SwapCard';
import ThemeSwitcher from './components/ThemeSwitcher';
import TransactionStatus from './components/TransactionStatus';
import IntroScreen from './components/IntroScreen';
import AuthScreen from './components/AuthScreen';
import ChatBot from './components/ChatBot';
import AdminDashboard from './components/AdminDashboard';
import WalletSelector from './components/WalletSelector';
import { getSwapAdvice } from './services/geminiService';
import { processSecureSwap } from './services/securityService';
import { 
  syncUserProfile, 
  listenToAuthChanges, 
  logoutUser, 
  completeEmailLinkSignIn,
  getUserSwaps 
} from './services/firebaseService';
import { WalletProvider } from './constants';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeVariant>(ThemeVariant.MINIMALIST);
  const [showIntro, setShowIntro] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusType>(StatusType.IDLE);
  const [activeSwap, setActiveSwap] = useState<SwapState | null>(null);
  const [advice, setAdvice] = useState<string>("Loading swap insights...");
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC || theme === ThemeVariant.GLASSMORPHISM;

  // Real-time Auth Listening
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const baseProfile: UserProfile = {
          id: firebaseUser.uid,
          method: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'social' : 'email',
          identifier: firebaseUser.email || firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
        };
        
        syncUserProfile(baseProfile).then((fullProfile) => {
          setUser(fullProfile);
        }).catch(() => {
          setUser(baseProfile);
        });
      } else {
        setUser(null);
        setHistory([]);
      }
    });

    completeEmailLinkSignIn().catch(console.error);
    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (user?.id) {
      setIsLoadingHistory(true);
      const swaps = await getUserSwaps(user.id);
      setHistory(swaps);
      setIsLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id, fetchHistory]);

  useEffect(() => {
    updateAdvice('Ethereum', 'Arbitrum', 'ETH');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowConnectModal(false);
      setShowAuthScreen(false);
      setShowAdminDashboard(false);
      setIsChatOpen(false);
      setConnectingWallet(null);
    }
  }, []);

  useEffect(() => {
    if (showConnectModal || showAuthScreen || isChatOpen || showAdminDashboard) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConnectModal, showAuthScreen, isChatOpen, showAdminDashboard, handleKeyDown]);

  const updateAdvice = async (src: string, dst: string, tkn: string) => {
    const text = await getSwapAdvice(src, dst, tkn);
    setAdvice(text);
  };

  const handleSwap = async (state: SwapState) => {
    setActiveSwap(state);
    setStatus(StatusType.CONFIRMING);
    
    setTimeout(async () => {
        setStatus(StatusType.PENDING);
        try {
          await processSecureSwap(
            {
              user: user?.identifier || "anonymous",
              amount: state.amount,
              token: state.sourceToken.symbol,
              route: `${state.sourceChain.name} -> ${state.destChain.name}`,
              timestamp: new Date().toISOString()
            }, 
            {
              route: `${state.sourceChain.name} -> ${state.destChain.name}`,
              amount: state.amount
            },
            user?.id || 'anonymous'
          );
        } catch (e) {
          console.warn("Security process warning:", e);
        }

        setTimeout(() => {
            setStatus(StatusType.SUCCESS);
            fetchHistory();
            setShowHistory(true); 
        }, 5000);
    }, 1500);
  };

  const handleAuthResult = (profile: UserProfile) => {
    setUser(profile);
    setShowAuthScreen(false);
    setShowConnectModal(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsWalletConnected(false);
      setHistory([]);
      setShowHistory(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleWalletSelect = (wallet: WalletProvider) => {
    setConnectingWallet(wallet.id);
    // Simulate complex wallet handshake
    setTimeout(() => {
      setConnectedWalletName(wallet.name);
      setTimeout(() => {
        setIsWalletConnected(true);
        setShowConnectModal(false);
        setConnectingWallet(null);
        setConnectedWalletName(null);
        
        // Auto-create user profile if none exists
        if (!user) {
          const mockAddress = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`;
          setUser({
            id: `w-${Date.now()}`,
            method: 'wallet',
            identifier: mockAddress,
            name: `${wallet.name} User`,
            role: 'user',
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet.id}`
          });
        }
      }, 800);
    }, 1200);
  };

  const getBgStyles = () => {
    switch (theme) {
      case ThemeVariant.GLASSMORPHISM: return 'bg-[#0F172A]';
      case ThemeVariant.DARK_FUTURISTIC: return 'bg-[#0B0F1A]';
      case ThemeVariant.GRADIENT_PREMIUM: return 'bg-slate-50';
      default: return 'bg-[#F7F9FC]';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 relative flex flex-col items-center pt-6 sm:pt-10 pb-32 px-4 ${getBgStyles()}`}>
      {showIntro && <IntroScreen theme={theme} onComplete={() => setShowIntro(false)} />}
      
      <header className="w-full max-w-7xl flex justify-between items-center mb-10 sm:mb-16 relative z-50">
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${
              theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-blue-600'
          }`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Jet <span className="text-blue-500">Swap</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowAdminDashboard(true)}
              className={`p-2.5 sm:px-4 sm:py-2 rounded-xl border flex items-center gap-2 transition-all ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Admin Control</span>
            </button>
          )}
          
          {user && (
             <button 
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) fetchHistory();
              }} 
              className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}
              title="Flight Logs"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
          )}

          {!user ? (
            <button onClick={() => setShowAuthScreen(true)} className={`px-4 sm:px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Sign Up</button>
          ) : (
            <div className="flex items-center gap-2">
               <div className={`px-2.5 sm:px-4 py-2 rounded-2xl flex items-center gap-2 sm:gap-3 border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-sm'}`}>
                 <img src={user.avatar} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" alt="" />
                 <span className="hidden sm:inline text-[13px] font-bold truncate max-w-[100px]">{user.identifier}</span>
               </div>
               <button onClick={handleLogout} className={`p-2 rounded-xl border hover:text-rose-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-gray-100 text-slate-400'}`} title="Sign Out">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center w-full relative">
        <div className="text-center mb-10 px-4">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight transition-all duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>The protocol for <span className="text-blue-500 italic">instant bridging.</span></h1>
            <p className={`text-[11px] sm:text-sm opacity-40 font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Zero-latency cross-chain architecture for the high-frequency Web3.</p>
        </div>
        
        <div className="w-full flex flex-col items-center gap-6 sm:gap-8 relative z-10 px-2">
          <SwapCard theme={theme} onConfirm={handleSwap} walletConnected={isWalletConnected || !!user} onConnect={() => setShowConnectModal(true)} />
          
          <div className={`w-full max-w-[480px] p-4 rounded-2xl border flex items-center gap-3 transition-all duration-500 ${theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500/20 text-cyan-500' : 'bg-blue-500 text-white'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className={`text-[10px] sm:text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-slate-600'}`}><span className="font-black block text-blue-500 mb-0.5 uppercase tracking-tighter">Jet Intelligence</span>{advice}</p>
          </div>

          {user && showHistory && (
            <div className={`w-full max-w-[480px] p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border animate-[slideUp_0.4s_ease-out] ${isDark ? 'bg-[#0B0F1A]/90 backdrop-blur-xl border-white/10 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-2xl'}`}>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  Flight Registry
                  <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-50 text-blue-600'}`}>SYNCED</span>
                </h3>
                <button onClick={() => setShowHistory(false)} className="opacity-30 hover:opacity-100 p-2 hover:bg-white/5 rounded-xl">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {isLoadingHistory ? (
                   <div className="py-10 sm:py-20 flex flex-col items-center opacity-40">
                     <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mapping Chains...</span>
                   </div>
                ) : history.length > 0 ? (
                  history.map((tx) => (
                    <div key={tx.id} className={`p-4 sm:p-5 rounded-[20px] sm:rounded-3xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-lg'}`}>
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-black tracking-tight">{tx.amount} Units</span>
                          <span className="text-[8px] sm:text-[10px] opacity-40 font-bold uppercase tracking-widest">{tx.route}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-[7px] sm:text-[9px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-black uppercase tracking-widest border ${
                            tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                          }`}>
                            {tx.status?.replace(/_/g, ' ') || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 sm:py-20 text-center opacity-30 flex flex-col items-center gap-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">No active flight data.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Responsive Chat FAB */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-24 sm:bottom-8 right-6 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[24px] z-[100] flex items-center justify-center transition-all duration-500 shadow-2xl group active:scale-90 ${
          isDark ? 'bg-cyan-500 shadow-cyan-500/40' : 'bg-blue-600 shadow-blue-600/40'
        }`}
      >
        <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] bg-white/40 animate-ping opacity-100 transition-opacity" />
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {showConnectModal && (
        <WalletSelector 
          theme={theme}
          onSelect={handleWalletSelect}
          onClose={() => setShowConnectModal(false)}
          connecting={connectingWallet}
        />
      )}

      {showAuthScreen && <AuthScreen theme={theme} onSelect={handleAuthResult} onClose={() => setShowAuthScreen(false)} />}
      {showAdminDashboard && <AdminDashboard theme={theme} onClose={() => setShowAdminDashboard(false)} />}
      
      <ChatBot theme={theme} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <TransactionStatus status={status} onClose={() => setStatus(StatusType.IDLE)} theme={theme} activeSwap={activeSwap} />
      
      <ThemeSwitcher current={theme} onChange={setTheme} />
    </div>
  );
};

export default App;
