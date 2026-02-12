// @ts-nocheck
import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';

export default function OneTimeSplit() {
  // --- WALLET HOOKS ---
  const { activeAddress, signer } = useWallet();

  // --- STATE ---
  const [people, setPeople] = useState(['You']);
  const [personInput, setPersonInput] = useState('');
  
  const [billDetails, setBillDetails] = useState({
    title: '',
    amount: '',
    receiverAddress: '', // NEW: We need to know who to pay!
  });

  const [splitResult, setSplitResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LOGIC ---

  const addPerson = (e) => {
    e.preventDefault();
    if (personInput.trim() && !people.includes(personInput.trim())) {
      setPeople([...people, personInput.trim()]);
      setPersonInput('');
    }
  };

  const removePerson = (name) => {
    if (name === 'You') return;
    setPeople(people.filter(p => p !== name));
  };

  const generateSplit = () => {
    if (!billDetails.amount || !billDetails.title) return alert("Please enter bill details!");
    if (people.length < 2) return alert("Add at least one other person!");
    if (!billDetails.receiverAddress) return alert("Please enter the Wallet Address of the person who paid!");

    const total = parseFloat(billDetails.amount);
    const share = total / people.length;

    setSplitResult({
      total: total,
      share: share,
      breakdown: people.map(p => ({
        name: p,
        amount: share,
        status: p === 'You' ? 'owing' : 'owing' // Simplified: Everyone owes the 'Receiver'
      }))
    });
  };

  // --- 💰 THE PAYMENT FUNCTION ---
  const handlePayMyShare = async () => {
    if (!activeAddress) return alert("⚠️ Please connect your wallet (Top Sidebar) first!");
    if (!splitResult) return;

    setLoading(true);

    try {
      const algod = new algosdk.Algodv2('a'.repeat(64), 'http://localhost:4001', 4001);
      const params = await algod.getTransactionParams().do();

      // Convert Amount to MicroAlgos (1 ALGO = 1,000,000 MicroAlgos)
      // We assume the input amount is in ALGOs for this demo
      const amountToPay = Math.floor(splitResult.share * 1_000_000);

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: billDetails.receiverAddress, // Sending to the person who paid
        amount: amountToPay,
        note: new Uint8Array(Buffer.from(`Split: ${billDetails.title}`)), // Add a note!
        suggestedParams: params,
      });

      // Sign & Send
      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      const signedTxn = await signer([encodedTxn], [activeAddress]);
      const { txId } = await algod.sendRawTransaction(signedTxn).do();

      await algosdk.waitForConfirmation(algod, txId, 4);
      
      alert(`✅ Payment Sent! Transaction ID: ${txId}`);
      
      // Update UI to show "Paid"
      // (In a real app, we'd verify this on chain)
      
    } catch (e) {
      console.error(e);
      alert("❌ Payment Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPeople(['You']);
    setBillDetails({ title: '', amount: '', receiverAddress: '' });
    setSplitResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      
      {/* LEFT: Inputs */}
      <div className="space-y-6">
        <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            ⚡ Quick Split (ALGO)
          </h2>

          {/* 1. People */}
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Who is splitting?</label>
            <form onSubmit={addPerson} className="flex gap-2 mb-4">
              <input type="text" value={personInput} onChange={(e) => setPersonInput(e.target.value)} placeholder="Name (e.g. Sam)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl font-bold text-xl">+</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {people.map((person) => (
                <div key={person} className="flex items-center gap-2 px-3 py-1 rounded-full border bg-gray-800 border-gray-600 text-gray-300">
                  <span className="text-sm font-medium">{person}</span>
                  {person !== 'You' && <button onClick={() => removePerson(person)} className="text-gray-500 hover:text-red-400 font-bold">×</button>}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Bill Details */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">2. Bill Details</label>
            <div className="space-y-4">
              <input type="text" value={billDetails.title} onChange={(e) => setBillDetails({...billDetails, title: e.target.value})} placeholder="Expense Title (e.g. Lunch)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
              
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-blue-400 font-bold">ALGO</span>
                <input type="number" value={billDetails.amount} onChange={(e) => setBillDetails({...billDetails, amount: e.target.value})} placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-16 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-purple-500" />
              </div>

              {/* NEW: Receiver Address */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">WHO PAID? (Wallet Address)</label>
                <input 
                  type="text" 
                  value={billDetails.receiverAddress} 
                  onChange={(e) => setBillDetails({...billDetails, receiverAddress: e.target.value})} 
                  placeholder="Paste Address (e.g. AB7...XYZ)" 
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-xs text-gray-400 font-mono focus:outline-none focus:border-green-500" 
                />
                <p className="text-[10px] text-gray-600 mt-1">Copy this from your friend's wallet.</p>
              </div>
            </div>
          </div>

          <button onClick={generateSplit} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
            Calculate Shares 🧮
          </button>
        </div>
      </div>

      {/* RIGHT: Receipt & Pay */}
      <div className="flex items-center justify-center">
        {!splitResult ? (
          <div className="text-center text-gray-600 opacity-50">
            <div className="text-6xl mb-4">🧾</div>
            <p>Enter details to generate receipt</p>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white text-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Receipt Holes */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gray-900 flex justify-between px-2">
               {[...Array(12)].map((_,i) => <div key={i} className="w-4 h-4 rounded-full bg-gray-950 -mt-2"></div>)}
            </div>

            <div className="text-center mb-6 mt-4">
              <h3 className="text-gray-500 text-sm uppercase tracking-widest font-bold">Bill Receipt</h3>
              <h2 className="text-2xl font-black mt-1">{billDetails.title}</h2>
              <p className="text-gray-400 text-xs truncate max-w-[200px] mx-auto">Paid to: {billDetails.receiverAddress.slice(0,8)}...</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 py-4 space-y-3">
              {splitResult.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-700">{item.name}</span>
                  <span className="font-mono text-gray-500">
                    {item.amount.toFixed(2)} ALGO
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-black py-4 flex justify-between items-end mb-4">
              <span className="text-xl font-bold">Total Bill</span>
              <span className="text-3xl font-black">{splitResult.total} ALGO</span>
            </div>

            {/* PAYMENT SECTION */}
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">Your Share</p>
              <p className="text-2xl font-bold text-blue-600 mb-3">{splitResult.share.toFixed(2)} ALGO</p>
              
              <button 
                onClick={handlePayMyShare}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 shadow-green-500/30'
                }`}
              >
                {loading ? "Processing..." : `💸 Pay My Share`}
              </button>
              
              <p className="text-[10px] text-gray-500 mt-2">
                Sends {splitResult.share.toFixed(2)} ALGO to the address above.
              </p>
            </div>
            
            <button onClick={reset} className="w-full text-gray-400 text-sm hover:text-black mt-4">
              Start Over
            </button>
          </div>
        )}
      </div>

    </div>
  );
}