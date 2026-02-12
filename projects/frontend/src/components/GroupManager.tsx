// @ts-nocheck
import React, { useState } from 'react';

export default function GroupManager() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Mock Database of Groups
  const [groups, setGroups] = useState([
    { 
      id: 1, 
      name: "Goa Trip 🌴", 
      code: "GOA2024", 
      members: [
        { name: "You (Leader)", role: "admin", status: "active" },
        { name: "Rahul", role: "member", status: "active" },
        { name: "Priya", role: "member", status: "pending" } 
      ],
      expenses: [
        { id: 101, title: "Villa Rent", amount: 12000, paidBy: "You", split: "equal", date: "Oct 20" },
        { id: 102, title: "Drinks", amount: 4500, paidBy: "Rahul", split: "custom", date: "Oct 21" }
      ]
    },
    { 
      id: 2, 
      name: "Flat 404 🏠", 
      code: "HOME404", 
      members: [{ name: "You", role: "member" }, { name: "Amit", role: "admin" }],
      expenses: []
    }
  ]);

  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // --- ACTIONS ---

  const createGroup = () => {
    if (!newGroupName) return;
    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      members: [{ name: "You", role: "admin", status: "active" }],
      expenses: []
    };
    setGroups([...groups, newGroup]);
    setNewGroupName("");
  };

  const openGroup = (group) => {
    setActiveGroup(group);
    setView('detail');
  };

  const goBack = () => {
    setActiveGroup(null);
    setView('list');
  };

  // --- RENDER: GROUP LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Your Groups
        </h2>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Group */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">👑 Create a Group</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Group Name (e.g. Manali Trip)" 
                className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button 
                onClick={createGroup}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Create
              </button>
            </div>
          </div>

          {/* Join Group */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">🔗 Join a Group</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Code (e.g. GOA2024)" 
                className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Existing Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div 
              key={group.id} 
              onClick={() => openGroup(group)}
              className="bg-gray-800/50 hover:bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                  {group.name[0]}
                </div>
                <span className="bg-gray-900 text-xs px-2 py-1 rounded text-gray-400 font-mono border border-gray-700">
                  {group.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{group.name}</h3>
              <p className="text-sm text-gray-400">{group.members.length} members • {group.expenses.length} expenses</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER: GROUP DETAIL VIEW ---
  return <GroupDetail group={activeGroup} onBack={goBack} />;
}

// --- SUB-COMPONENT: GROUP DETAIL DASHBOARD ---
function GroupDetail({ group, onBack }) {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [splitType, setSplitType] = useState("equal"); // 'equal' or 'custom'

  // Mock Logic for adding expense inside the dashboard
  const handleAddExpense = (e) => {
    e.preventDefault();
    if(!amount || !title) return alert("Fill details");
    
    // In a real app, this would update the backend
    alert(`💰 Expense Added: ${title} for ₹${amount}\nSplit: ${splitType.toUpperCase()}`);
    // Clear form
    setAmount("");
    setTitle("");
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
          ⬅ Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {group.name} 
            <span className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700 text-gray-400 font-mono">
              Code: {group.code}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* LEFT: Members & Settle Up */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">👥 Members</h3>
            <div className="space-y-3">
              {group.members.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{member.role}</p>
                    </div>
                  </div>
                  {member.status === 'pending' && (
                    <button className="text-xs bg-green-600 px-2 py-1 rounded text-white">Accept</button>
                  )}
                  {member.status === 'active' && (
                     <span className="text-xs text-green-400">Active</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Invite Box */}
            <div className="mt-4 pt-4 border-t border-gray-800">
               <p className="text-xs text-gray-500 mb-2">Share this code to invite:</p>
               <div className="flex bg-gray-950 p-2 rounded border border-gray-700 justify-between items-center cursor-pointer hover:border-blue-500 transition-colors">
                 <code className="text-blue-400 font-bold tracking-wider">{group.code}</code>
                 <span className="text-xs text-gray-500">Copy</span>
               </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Add Expense Form */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit">
          <h3 className="text-xl font-bold text-white mb-6">💸 Add Group Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block">TITLE</label>
              <input 
                value={title} onChange={(e) => setTitle(e.target.value)}
                type="text" placeholder="e.g. Dinner at Taj" 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold mb-1 block">TOTAL AMOUNT (₹)</label>
              <input 
                value={amount} onChange={(e) => setAmount(e.target.value)}
                type="number" placeholder="0.00" 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none text-xl font-bold"
              />
            </div>

            {/* Split Toggle */}
            <div>
              <label className="text-xs text-gray-500 font-bold mb-2 block">SPLIT METHOD</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-800 p-1 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={`py-2 rounded-md text-sm font-medium transition-all ${splitType === 'equal' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Equal (=)
                </button>
                <button 
                  type="button"
                  onClick={() => setSplitType('custom')}
                  className={`py-2 rounded-md text-sm font-medium transition-all ${splitType === 'custom' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  % Custom
                </button>
              </div>
            </div>

            {/* Simulated Custom Split View */}
            {splitType === 'custom' && (
               <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                 <p className="text-xs text-yellow-400 mb-2">⚠ Advanced splitting enabled</p>
                 {group.members.map(m => (
                   <div key={m.name} className="flex justify-between items-center mb-2 last:mb-0">
                     <span className="text-sm text-gray-300">{m.name}</span>
                     <input type="text" placeholder="%" className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-white text-sm" />
                   </div>
                 ))}
               </div>
            )}

            <div className="pt-4">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95">
                Split Bill ⚡
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Expense Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-white">Recent Expenses</h3>
             <button className="text-xs text-blue-400 hover:text-blue-300">View Report</button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {group.expenses.length === 0 ? (
              <p className="text-gray-600 text-center py-10 italic">No expenses added yet.</p>
            ) : (
              group.expenses.map(exp => (
                <div key={exp.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center hover:border-gray-600 transition-colors">
                  <div>
                    <h4 className="font-bold text-white">{exp.title}</h4>
                    <p className="text-xs text-gray-500">Paid by <span className="text-blue-400">{exp.paidBy}</span> • {exp.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{exp.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{exp.split} split</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}