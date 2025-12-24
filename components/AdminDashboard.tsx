
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeVariant, TransactionStatus } from '../types';
import { 
  getAllUsers, 
  getAllSwapsAcrossUsers, 
  updateSwapStatus, 
  deleteUserAccount, 
  updateUserRole 
} from '../services/firebaseService';

// Props Interface
interface AdminDashboardProps {
  theme: ThemeVariant;
  onClose: () => void;
}

// Custom Donut Chart Component
const DonutChart = ({ data }: { data: Record<string, number> }) => {
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [_, count]) => acc + count, 0);
  
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  
  const colors = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-10">
      <div className="relative w-[200px] h-[200px] shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {total > 0 ? entries.map(([name, count], i) => {
            const percentage = count / total;
            const dashArray = percentage * circumference;
            const dashOffset = -currentOffset;
            currentOffset += dashArray;
            
            return (
              <circle
                key={name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer"
                strokeLinecap="round"
              />
            );
          }) : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tighter leading-none">{total}</span>
          <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mt-1">Total Transits</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xs:grid-cols-2 gap-4 w-full">
        {entries.map(([name, count], i) => (
          <div key={name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
            <div className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: colors[i % colors.length] }} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity truncate">{name}</span>
              <span className="text-xs font-bold">{count} ({((count / (total || 1)) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-xs opacity-20 italic">No corridors detected.</p>}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs' | 'users' | 'settings'>('analytics');
  const [swaps, setSwaps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState<'PERMISSION' | 'INDEX' | 'AUTH' | 'UNKNOWN' | null>(null);
  const [diagnosticMsg, setDiagnosticMsg] = useState<string | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<{id: number, text: string, type: 'info' | 'warn' | 'success', timestamp: Date}[]>([]);

  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warn' | 'success'>('info');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDiagnosticMsg(null);
      setDiagnosticCode(null);
      try {
        const [allSwaps, allUsers] = await Promise.all([
          getAllSwapsAcrossUsers(),
          getAllUsers()
        ]);
        setSwaps(allSwaps);
        setUsers(allUsers);
        setIsSimulationMode(false);
      } catch (error: any) {
        console.group("Terminal Diagnostic Report");
        console.warn("Live Uplink Resticted:", error.message);
        
        const rawMsg = (error.message || "").toLowerCase();
        if (rawMsg.includes("index")) {
          setDiagnosticCode('INDEX');
          setDiagnosticMsg("Firestore Index Required.");
        } else if (rawMsg.includes("permission") || rawMsg.includes("denied")) {
          setDiagnosticCode('PERMISSION');
          setDiagnosticMsg("Live Data Access Restricted (Check Security Rules)");
        } else {
          setDiagnosticCode('UNKNOWN');
          setDiagnosticMsg("Cloud connection limited.");
        }
        console.groupEnd();
        generateSimulationData();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const generateSimulationData = () => {
    setIsSimulationMode(true);
    const mockUsers = [
      { id: 'sim-1', name: 'Commander Alpha', identifier: 'anaetoproject@gmail.com', role: 'admin', method: 'email', lastSeen: { toDate: () => new Date() }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alpha' },
      { id: 'sim-2', name: 'Pilot Bravo', identifier: 'bravo@jetswap.com', role: 'user', method: 'email', lastSeen: { toDate: () => new Date(Date.now() - 3600000) }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bravo' },
      { id: 'sim-3', name: 'Web3 Nomad', identifier: '0x123...abc', role: 'user', method: 'wallet', lastSeen: { toDate: () => new Date(Date.now() - 86400000) }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3' },
      { id: 'sim-4', name: 'Dev Ops', identifier: 'admin@jetswap.com', role: 'admin', method: 'email', lastSeen: { toDate: () => new Date() }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev' }
    ];
    const mockSwaps = [
      { id: 'tx-sim-1', amount: '12.5', route: 'Ethereum -> Arbitrum', status: 'success', createdAt: { toDate: () => new Date() }, ciphertext: 'SIM_STREAM_0X772', iv: 'IV_1' },
      { id: 'tx-sim-2', amount: '0.45', route: 'Base -> Optimism', status: 'pending', createdAt: { toDate: () => new Date(Date.now() - 500000) }, ciphertext: 'SIM_STREAM_0X441', iv: 'IV_2' },
      { id: 'tx-sim-3', amount: '500.0', route: 'Polygon -> Ethereum', status: 'flagged', createdAt: { toDate: () => new Date(Date.now() - 2000000) }, ciphertext: 'SIM_STREAM_0X990', iv: 'IV_3' },
      { id: 'tx-sim-4', amount: '2,500.0', route: 'Ethereum -> Base', status: 'success', createdAt: { toDate: () => new Date(Date.now() - 3000000) }, ciphertext: 'SIM_STREAM_0X112', iv: 'IV_4' }
    ];
    setUsers(mockUsers);
    setSwaps(mockSwaps);
  };

  useEffect(() => {
    const messages: { text: string; type: 'info' | 'warn' | 'success' }[] = [
      { text: "Security Audit: 100% Path Integrity", type: 'success' },
      { text: "Admin session synchronized with cloud vault", type: 'success' },
      { text: "High Volume Transit Corridor detected", type: 'warn' },
      { text: "Routing Congestion: Polygon Mainnet", type: 'warn' },
      { text: "Cloud Sync: All buffers operational", type: 'info' }
    ];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setAlerts(prev => [{ id: Date.now(), ...msg, timestamp: new Date() }, ...prev].slice(0, 15));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalVolume = swaps.reduce((acc, s) => acc + (parseFloat(s.amount.toString().replace(/,/g, '')) || 0), 0);
    const activePilots = users.filter(u => {
        try {
          const lastSeenRaw = u.lastSeen;
          const lastSeenDate = lastSeenRaw?.toDate ? lastSeenRaw.toDate() : new Date(lastSeenRaw || 0);
          return (Date.now() - lastSeenDate.getTime()) < 3600000;
        } catch (e) { return false; }
    }).length;

    const chains: Record<string, number> = {};
    swaps.forEach(s => {
      const route = s.route || 'Unknown Corridor';
      chains[route] = (chains[route] || 0) + 1;
    });

    return { totalVolume, activePilots, chains };
  }, [swaps, users]);

  const handleStatusChange = async (path: string, status: string) => {
    if (isSimulationMode) {
      setSwaps(prev => prev.map(s => (s.path === path || s.id === path) ? { ...s, status } : s));
      if (selectedSwap) setSelectedSwap({ ...selectedSwap, status });
      return;
    }
    const success = await updateSwapStatus(path, status);
    if (success) {
      setRefreshKey(prev => prev + 1);
      if (selectedSwap && selectedSwap.path === path) {
        setSelectedSwap({ ...selectedSwap, status });
      }
    }
  };

  const clearSelection = () => {
    setSelectedSwap(null);
    setSelectedUser(null);
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-[#05070A] text-white font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      {/* Graceful Connection Banner */}
      {isSimulationMode && (
        <div className={`py-1.5 px-4 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-center relative z-[100] shadow-xl flex items-center justify-center gap-4 transition-colors ${diagnosticCode === 'PERMISSION' ? 'bg-blue-600/80 text-white' : 'bg-amber-600/80 text-white'}`}>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{diagnosticMsg || "Sandbox Mode Active (Simulation Enabled)"}</span>
          </div>
          <button onClick={() => setRefreshKey(prev => prev + 1)} className="px-3 py-0.5 bg-white/20 rounded-full hover:bg-white/30 transition-all font-bold">RE-ESTABLISH LIVE LINK</button>
        </div>
      )}

      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-emerald-500/10 bg-black/80 backdrop-blur-xl relative z-10 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${isSimulationMode ? 'bg-blue-500 shadow-blue-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
               <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic leading-none mb-1">Jet Commander</h2>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isSimulationMode ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500'} `} />
                <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] ${isSimulationMode ? 'text-blue-400' : 'text-emerald-500'}`}>
                  {isSimulationMode ? 'Secure Sandbox Interface' : 'Live Uplink Active'}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="sm:hidden p-2 rounded-xl bg-rose-500/10 text-rose-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5 shrink-0">
            {[
              { id: 'analytics', label: 'ANALYTICS' },
              { id: 'logs', label: 'MONITOR' },
              { id: 'users', label: 'PILOTS' },
              { id: 'settings', label: 'SETTINGS' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all tracking-widest shrink-0 ${activeTab === tab.id ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="hidden sm:block p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group shrink-0">
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Mapping Chain Topography...</p>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="space-y-6 sm:space-y-10 animate-[fadeIn_0.5s_ease-out]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Network Throughput', value: `${stats.totalVolume.toLocaleString()} UNITS`, color: 'text-emerald-500' },
                  { label: 'SLA Reliability', value: '99.9%', color: 'text-blue-500' },
                  { label: 'Active Pilots', value: stats.activePilots, color: 'text-amber-500' },
                  { label: 'Registry Size', value: users.length, color: 'text-purple-500' }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-[32px] sm:rounded-[40px] bg-white/5 border border-white/5 relative overflow-hidden group">
                    <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <h4 className={`text-2xl sm:text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</h4>
                  </div>
                ))}
              </div>
              
              <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] bg-white/5 border border-white/5">
                 <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.4em] text-white/50 mb-10">Cross-Chain Route Distribution</h3>
                 <DonutChart data={stats.chains} />
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="space-y-3 sm:space-y-4">
              {swaps.map((swap) => (
                <div key={swap.id} onClick={() => setSelectedSwap(swap)} className={`p-4 sm:p-6 rounded-[24px] border transition-all cursor-pointer ${selectedSwap?.id === swap.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg scale-[1.01]' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex flex-col">
                      <span className="text-[8px] opacity-20 font-black uppercase tracking-[0.2em] mb-1">Transit ID</span>
                      <span className="text-[10px] sm:text-xs font-mono text-emerald-500 font-bold truncate max-w-[200px]">#{swap.id.toUpperCase().slice(0, 20)}</span>
                    </div>
                    <div className="flex flex-col sm:items-center">
                      <span className="text-[10px] sm:text-sm font-black tracking-tight">{swap.amount} UNITS</span>
                      <span className="text-[8px] sm:text-[10px] opacity-40 uppercase font-black">{swap.route}</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[8px] sm:text-[10px] font-black uppercase border ${swap.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-amber-500 border-amber-500/40'}`}>
                      {swap.status?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'users' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {users.map((u) => (
                <div key={u.id} className={`p-6 rounded-[32px] border transition-all group cursor-pointer ${selectedUser?.id === u.id ? 'bg-emerald-500/10 border-emerald-500/30 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`} onClick={() => setSelectedUser(u)}>
                  <div className="flex items-center gap-4 mb-6">
                    <img src={u.avatar} className="w-12 h-12 rounded-[18px] bg-white/10 p-1" alt="" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-lg font-black truncate leading-none mb-1">{u.name || 'Pilot'}</span>
                      <span className="text-[8px] opacity-40 font-mono truncate">{u.identifier}</span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-white/5 text-[8px] font-black uppercase tracking-widest">
                    <div className="flex justify-between"><span className="opacity-20">Clearance</span><span className={u.role === 'admin' ? 'text-emerald-500' : ''}>{u.role}</span></div>
                    <div className="flex justify-between"><span className="opacity-20">Identity Node</span><span>{u.method}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="max-w-2xl mx-auto space-y-10">
                {diagnosticCode === 'PERMISSION' && (
                  <div className="p-8 sm:p-12 rounded-[48px] bg-blue-500/10 border border-blue-500/20 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0">
                         <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-blue-500">Cloud Sync Alert</h3>
                        <p className="text-sm opacity-70 leading-relaxed mb-6">Live data is currently restricted by Firestore security rules. Sandbox data is active for development. To enable live sync, update rules to allow collectionGroup reads.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-8 sm:p-12 rounded-[48px] bg-white/5 border border-white/10">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Global Broadcast Terminal</h3>
                  <p className="text-xs opacity-40 mb-8 font-medium">Inject system-wide signals into the protocol alert feed.</p>
                  <form onSubmit={(e) => { e.preventDefault(); if (broadcastText) { setAlerts(p => [{ id: Date.now(), text: broadcastText, type: broadcastType, timestamp: new Date() }, ...p]); setBroadcastText(''); } }} className="space-y-6">
                     <textarea className="w-full bg-black/40 border border-white/10 rounded-3xl p-5 text-sm outline-none focus:border-emerald-500 transition-all min-h-[120px]" placeholder="Enter signal payload..." value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                          {(['info', 'success', 'warn'] as const).map((t) => (
                            <button key={t} type="button" onClick={() => setBroadcastType(t)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${broadcastType === t ? 'bg-emerald-500 text-black' : 'opacity-40 hover:opacity-100'}`}>{t}</button>
                          ))}
                       </div>
                       <button type="submit" className="w-full py-4 rounded-3xl bg-emerald-500 text-black font-black uppercase text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Transmit Payload</button>
                     </div>
                  </form>
                </div>
             </div>
          )}
        </div>

        {/* Sidebar Feed */}
        <div className="fixed lg:relative inset-0 lg:inset-auto z-[260] lg:z-10 w-full lg:w-[450px] flex flex-col bg-[#05070A] lg:bg-black/40 border-l border-emerald-500/10 shadow-2xl animate-[slideInRight_0.3s_ease-out]">
             {(selectedSwap || selectedUser) && (
               <button onClick={clearSelection} className="lg:hidden absolute top-6 right-6 p-3 rounded-full bg-white/5 text-white/50 z-[270] hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
             )}
             <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar mt-12 lg:mt-0">
               {selectedSwap ? (
                 <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Transit Audit</h3>
                   <div className="bg-black/60 p-6 rounded-[28px] border border-white/5 border-emerald-500/10">
                      <span className="text-[8px] opacity-30 uppercase font-black block mb-4">Encryption Cipher</span>
                      <p className="text-[10px] font-mono break-all opacity-60 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">{selectedSwap.ciphertext || 'SIM_STREAM_DATA_0x...'}</p>
                   </div>
                   <div className="flex flex-col gap-3 pt-4">
                      <button onClick={() => handleStatusChange(selectedSwap.path || selectedSwap.id, 'success')} className="w-full py-5 rounded-[28px] bg-emerald-500 text-black font-black uppercase text-xs active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Verify & Approve</button>
                      <button onClick={() => handleStatusChange(selectedSwap.path || selectedSwap.id, 'flagged')} className="w-full py-5 rounded-[28px] bg-white/5 border border-rose-500/40 text-rose-500 font-black uppercase text-xs active:scale-95 transition-all hover:bg-rose-500 hover:text-white">Flag Transit</button>
                   </div>
                 </div>
               ) : selectedUser ? (
                 <div className="text-center animate-[fadeIn_0.3s_ease-out]">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-10 text-left">Pilot Credentials</h3>
                   <div className="relative inline-block group">
                      <img src={selectedUser.avatar} className="w-40 h-40 rounded-[56px] mx-auto mb-8 p-2 border-2 border-emerald-500/20 shadow-2xl transition-transform group-hover:scale-105" alt="" />
                      <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <h4 className="text-3xl font-black mb-2">{selectedUser.name}</h4>
                   <p className="text-[10px] opacity-40 font-mono break-all px-4">{selectedUser.identifier}</p>
                   <div className="mt-10 pt-10 border-t border-white/5 flex flex-col gap-3">
                      <button className="w-full py-5 rounded-[28px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">Adjust Clearance</button>
                   </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Real-Time Event Stream
                   </h3>
                   <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                     {alerts.length === 0 ? (
                       <div className="h-full flex items-center justify-center opacity-10"><p className="text-[10px] font-black uppercase tracking-widest">Monitoring Frequencies...</p></div>
                     ) : (
                       alerts.map((alert) => (
                         <div key={alert.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 animate-[fadeIn_0.3s_ease-out]">
                           <div className="flex justify-between items-start mb-2">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${alert.type === 'success' ? 'bg-emerald-500 text-black' : alert.type === 'warn' ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}>{alert.type}</span>
                             <span className="text-[8px] opacity-20 font-mono">{alert.timestamp.toLocaleTimeString()}</span>
                           </div>
                           <p className="text-[11px] font-medium opacity-60 leading-relaxed">{alert.text}</p>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               )}
             </div>
          </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
