// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
// This import only works in this file, NOT in App.tsx
import { GroupExpenseClient } from '../contracts/GroupExpenseClient';

const APP_ID = 1001; 

export default function ExpenseDashboard() {
  const { activeAddress, signer, wallets } = useWallet();
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(false);

  const getClient = () => {
    const algod = new algosdk.Algodv2('a'.repeat(64), 'http://localhost:4001', 4001);
    return new GroupExpenseClient(
      {
        resolveBy: 'id',
        id: BigInt(APP_ID), // Fixes the 64-bit error
        sender: { 
          addr: activeAddress || "", 
          signer: signer
        },
      },
      algod
    );
  };

  const fetchTotal = async () => {
    if (!activeAddress) return;
    try {
      const client = getClient();
      const state = await client.getGlobalState();
      const rawAmount = state.total_amount !== undefined ? state.total_amount : state.totalAmount;
      if (rawAmount !== undefined) {
        setTotalCollected(Number(rawAmount) / 1_000_000);
      }
    } catch (e) {
      console.log("State fetch error:", e);
    }
  };

  const handlePayShare = async () => {
    if (!activeAddress) return alert("Please Connect Wallet");
    setLoading(true);

    try {
      const appAddress = algosdk.getApplicationAddress(APP_ID);
      const algod = new algosdk.Algodv2('a'.repeat(64), 'http://localhost:4001', 4001);
      const params = await algod.getTransactionParams().do();
      
      const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: appAddress,
        amount: 1_000_000, 
        suggestedParams: params,
      });

      const client = getClient();
      await client.payShare({ payment });
      
      alert("✅ Payment Successful!");
      fetchTotal(); 
    } catch (e) {
      console.error(e);
      alert("❌ Payment Failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAddress) fetchTotal();
  }, [activeAddress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-900 text-white p-6 rounded-xl border border-gray-800">
      <h1 className="text-3xl font-bold mb-6">💸 Group Expense Jar</h1>
      
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md text-center border border-gray-700 shadow-lg">
        <h2 className="text-gray-400 uppercase text-xs tracking-widest mb-2">Total Collected</h2>
        <div className="text-5xl font-bold text-green-400 mb-8">
          {totalCollected} ALGO
        </div>

        {!activeAddress ? (
          <div className="space-y-3">
            <p className="text-yellow-400 text-sm mb-4">⚠️ Connect Wallet to Start</p>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => wallet.connect()}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-gray-600"
              >
                {wallet.metadata.name.includes("KMD") ? "🔑" : "👛"} Connect {wallet.metadata.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             <button 
              onClick={handlePayShare} 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              {loading ? "Processing..." : "💳 Pay My Share (1 ALGO)"}
            </button>
            <div className="text-xs text-green-400 font-mono">
              Connected: {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-xs text-gray-600 font-mono">App ID: {APP_ID}</p>
    </div>
  );
}