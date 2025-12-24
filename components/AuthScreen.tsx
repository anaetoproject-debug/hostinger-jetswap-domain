
import React, { useState } from 'react';
import { ThemeVariant, UserProfile } from '../types';
import { loginWithGoogle, loginUserWithEmail, sendMagicLink, registerUser } from '../services/firebaseService';

interface AuthScreenProps {
  theme: ThemeVariant;
  onSelect: (user: UserProfile) => void;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ theme, onSelect, onClose }) => {
  const [view, setView] = useState<'login' | 'register' | 'email-link'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC || theme === ThemeVariant.GLASSMORPHISM;

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await loginWithGoogle();
      onSelect({
        id: result.user.uid,
        method: 'social',
        identifier: result.user.email || result.user.uid,
        name: result.user.displayName || 'Jet Pilot',
        avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setAuthError(error.message || "Failed to sign in with Google.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await loginUserWithEmail(formData.email, formData.password);
      onSelect({
        id: result.user.uid,
        method: 'email',
        identifier: result.user.email!,
        name: result.user.displayName || result.user.email?.split('@')[0],
        avatar: result.user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${result.user.uid}`
      });
    } catch (error: any) {
      setAuthError("Invalid email or password. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setAuthError("All fields are required.");
      return;
    }
    if (formData.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const user = await registerUser(formData.email, formData.password, formData.name);
      onSelect({
        id: user.uid,
        method: 'email',
        identifier: user.email!,
        name: user.displayName!,
        avatar: user.photoURL!
      });
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await sendMagicLink(formData.email);
      setLinkSent(true);
    } catch (error: any) {
      setAuthError(error.message || "Failed to send magic link.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getContainerStyles = () => {
    if (isDark) return 'bg-[#151926] border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
    return 'bg-white border-gray-100 text-slate-900 shadow-2xl';
  };

  const getAccentColor = () => theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500' : 'bg-blue-600';
  const getInputStyles = () => isDark 
    ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-cyan-500' 
    : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400 focus:border-blue-500';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] px-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md p-8 rounded-[32px] border transition-all duration-500 transform scale-100 ${getContainerStyles()}`}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${getAccentColor()} shadow-lg`}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {view === 'login' ? 'Welcome Back, Pilot' : view === 'register' ? 'Create Jet Account' : 'Magic Link Entry'}
          </h2>
          <p className="text-sm opacity-50 mt-1">
            {view === 'login' ? 'Sign in to access the cross-chain skies.' : view === 'register' ? 'Start your journey across chains.' : 'Access your account without a password.'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs leading-relaxed animate-[shake_0.5s_ease-in-out]">
            <div className="flex gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {isAuthenticating ? (
          <div className="py-12 flex flex-col items-center">
            <div className={`w-12 h-12 border-4 ${theme === ThemeVariant.DARK_FUTURISTIC ? 'border-cyan-500' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mb-4`} />
            <p className="text-sm font-medium animate-pulse">Establishing secure connection...</p>
          </div>
        ) : linkSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Check your email</h3>
            <p className="text-sm opacity-60 mb-6">We've sent a magic link to <span className="font-bold">{formData.email}</span>.</p>
            <button onClick={() => setLinkSent(false)} className="text-blue-500 text-sm font-bold">Try another method</button>
          </div>
        ) : view === 'login' ? (
          <div className="space-y-6">
            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white shadow-sm'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span className="font-bold">Continue with Google</span>
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className={`px-2 ${isDark ? 'bg-[#151926] text-white/30' : 'bg-white text-slate-400'}`}>OR EMAIL LOGIN</span></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                  required
                />
              </div>
              <button type="submit" className={`w-full py-4 rounded-2xl font-bold transition-all text-white ${getAccentColor()} shadow-lg`}>
                Sign In
              </button>
            </form>

            <div className="flex flex-col gap-3 text-center">
              <button onClick={() => setView('register')} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
                Don't have an account? <span className="text-blue-500 font-bold">Sign Up</span>
              </button>
              <button onClick={() => setView('email-link')} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                Forgot password? Use Magic Link
              </button>
            </div>
          </div>
        ) : view === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Pilot Display Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                required
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Choose Password (min. 6 chars)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                required
              />
            </div>
            <button type="submit" className={`w-full py-4 rounded-2xl font-bold transition-all text-white ${getAccentColor()} shadow-lg`}>
              Create Account
            </button>
            <button type="button" onClick={() => setView('login')} className="w-full text-sm font-medium opacity-50 hover:opacity-100 transition-opacity">
              Already have an account? <span className="text-blue-500 font-bold">Sign In</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
             <p className="text-xs opacity-60 text-center mb-2">We will send a secure link to your inbox for instant entry.</p>
             <div>
               <input 
                autoFocus
                type="email" 
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-4 rounded-2xl border outline-none transition-all ${getInputStyles()}`}
                required
               />
             </div>
             <button type="submit" className={`w-full py-4 rounded-2xl font-bold transition-all text-white ${getAccentColor()} shadow-lg`}>
               Send Magic Link
             </button>
             <button type="button" onClick={() => setView('login')} className="w-full text-xs font-medium opacity-50 hover:opacity-100 transition-opacity">
               Back to Login
             </button>
          </form>
        )}

        <p className="mt-8 text-[11px] text-center opacity-30 leading-relaxed">
          Secured by Jet Identity Protocol. Powered by Firebase.
        </p>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;
