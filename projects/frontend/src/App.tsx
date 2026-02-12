// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react';
import { SnackbarProvider } from 'notistack';
import PersonalDashboard from './components/PersonalDashboard';
import GroupManager from './components/GroupManager';
import OneTimeSplit from './components/OneTimeSplit';
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs';

// --- WALLET CONFIGURATION ---
let supportedWallets = [];
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment();
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ];
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    { id: WalletId.LUTE },
  ];
}

const algodConfig = getAlgodConfigFromViteEnvironment();
const walletManager = new WalletManager({
  wallets: supportedWallets,
  defaultNetwork: algodConfig.network,
  networks: {
    [algodConfig.network]: {
      algod: {
        baseServer: algodConfig.server,
        port: algodConfig.port,
        token: String(algodConfig.token),
      },
    },
  },
  options: { resetNetwork: true },
});

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <DashboardLayout />
      </WalletProvider>
    </SnackbarProvider>
  );
}

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('personal');
  const { activeAddress, wallets } = useWallet();

  // DEBUGGING: This prints your address to the Console (F12)
  useEffect(() => {
    console.log("Current Wallet Address:", activeAddress);
  }, [activeAddress]);

  const handleConnect = () => {
    const kmdWallet = wallets.find(w => w.id === WalletId.KMD);
    if (kmdWallet) {
        kmdWallet.connect();
    } else {
        alert("KMD Wallet not found! Is LocalNet running?");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-10">
          Expense<span className="text-white">AI</span>
        </h1>
        
        <nav className="space-y-2 flex-1">
          <NavButton label="Personal Tracker" active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon="👤" />
          <NavButton label="Group Manager" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon="👥" />
          <NavButton label="One-Time Split" active={activeTab === 'onetime'} onClick={() => setActiveTab('onetime')} icon="⚡" />
        </nav>

        {/* --- WALLET SECTION (UPDATED) --- */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          {!activeAddress ? (
            <button 
              onClick={handleConnect}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transition-all animate-pulse"
            >
              🔌 Connect Wallet
            </button>
          ) : (
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Connected</p>
                  <p className="text-green-400 text-xs font-bold">LocalNet</p>
                </div>
              </div>
              
              {/* THE ADDRESS BOX */}
              <div className="bg-black/50 p-2 rounded border border-gray-600 break-all">
                <p className="text-[10px] font-mono text-yellow-300 select-all leading-tight">
                  {activeAddress}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                (Copy this to receive payments)
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-950">
        {activeTab === 'personal' && <PersonalDashboard />}
        {activeTab === 'groups' && <GroupManager />}
        {activeTab === 'onetime' && <OneTimeSplit />}
      </main>

    </div>
  );
}

function NavButton({ label, active, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}