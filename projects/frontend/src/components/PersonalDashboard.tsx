// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';

export default function PersonalDashboard() {
  // --- STATE ---
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('my_personal_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    note: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('my_personal_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // --- 🧠 REAL AI LOGIC ---
  const aiInsight = useMemo(() => {
    if (expenses.length === 0) {
      return { 
        title: "Waiting for Data...", 
        message: "Start adding expenses to unlock AI insights!",
        color: "from-gray-800 to-gray-900"
      };
    }

    // 1. Calculate Totals per Category
    const totals = {};
    let grandTotal = 0;

    expenses.forEach(exp => {
      const amount = Number(exp.amount);
      totals[exp.category] = (totals[exp.category] || 0) + amount;
      grandTotal += amount;
    });

    // 2. Find Highest Category
    let highestCategory = "";
    let maxAmount = 0;

    for (const cat in totals) {
      if (totals[cat] > maxAmount) {
        maxAmount = totals[cat];
        highestCategory = cat;
      }
    }

    // 3. Generate Smart Message based on %
    const percent = Math.round((maxAmount / grandTotal) * 100);
    const savings = Math.round(maxAmount * 0.20); // Fake "potential savings"

    switch (highestCategory) {
      case 'Food':
        return {
          title: "🍔 High Food Spending Detected",
          message: `You spent ${percent}% of your budget on Food. Cooking at home could save you ~₹${savings}/month.`,
          color: "from-orange-900/50 to-red-900/50 border-orange-500/30"
        };
      case 'Travel':
        return {
          title: "✈️ Heavy Travel Expenses",
          message: `Travel is your top expense (${percent}%). Consider a monthly pass to save ~₹${savings}.`,
          color: "from-blue-900/50 to-cyan-900/50 border-cyan-500/30"
        };
      case 'Shopping':
        return {
          title: "🛍️ Impulse Buying Alert",
          message: `Shopping took ${percent}% of your money. Try the '30-Day Rule' before buying non-essentials.`,
          color: "from-pink-900/50 to-purple-900/50 border-pink-500/30"
        };
      case 'Entertainment':
        return {
          title: "🎬 Entertainment Spike",
          message: `Fun is good, but it cost ${percent}% of your budget. Look for free local events?`,
          color: "from-purple-900/50 to-indigo-900/50 border-purple-500/30"
        };
      case 'Bills':
        return {
          title: "🧾 Fixed Costs are High",
          message: `Bills are ${percent}% of your spend. Review subscriptions you don't use anymore.`,
          color: "from-red-900/50 to-orange-900/50 border-red-500/30"
        };
      default:
        return {
          title: "💰 Spending Analysis",
          message: `Your highest expense is ${highestCategory} (${percent}%). Keep tracking to stay in control!`,
          color: "from-indigo-900/50 to-blue-900/50 border-indigo-500/30"
        };
    }
  }, [expenses]);

  // --- ACTIONS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return alert("Please enter Title and Amount");

    if (editingId) {
      const updatedExpenses = expenses.map(exp => 
        exp.id === editingId ? { ...exp, ...formData, amount: Number(formData.amount) } : exp
      );
      setExpenses(updatedExpenses);
      setEditingId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        ...formData,
        amount: Number(formData.amount),
        date: new Date().toLocaleDateString(),
        type: 'personal'
      };
      setExpenses([newExpense, ...expenses]);
    }
    setFormData({ title: '', amount: '', category: 'Food', note: '' });
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      note: expense.note || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this expense?")) {
      setExpenses(expenses.filter(exp => exp.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({ title: '', amount: '', category: 'Food', note: '' });
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', amount: '', category: 'Food', note: '' });
  };

  const visibleExpenses = showAll ? expenses : expenses.slice(0, 5);
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-500 text-sm mb-2 font-medium tracking-wide">TOTAL SPENT</h3>
          <p className="text-4xl font-bold text-white">₹ {totalSpent.toLocaleString()}</p>
        </div>

        {/* 🧠 DYNAMIC AI CARD */}
        <div className={`md:col-span-2 bg-gradient-to-br ${aiInsight.color} p-6 rounded-2xl border relative overflow-hidden shadow-lg transition-all duration-500`}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/10 text-white border border-white/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                AI Insight ✨
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{aiInsight.title}</h3>
            <p className="text-gray-200 text-sm max-w-lg leading-relaxed">
              "{aiInsight.message}"
            </p>
          </div>
          {/* Decorative Graph Background */}
          <div className="absolute bottom-0 right-0 opacity-10 transform translate-y-4 pointer-events-none">
             <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 80 C 50 80, 50 20, 100 20 C 150 20, 150 60, 200 60" stroke="white" strokeWidth="4" />
             </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: FORM */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit shadow-lg sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? "✏️ Edit Expense" : "Add New Expense"}
            </h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">TITLE</label>
              <input name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="e.g. Uber" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">AMOUNT (₹)</label>
                <input name="amount" value={formData.amount} onChange={handleInputChange} type="number" placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">CATEGORY</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option value="Food">Food 🍔</option>
                  <option value="Travel">Travel ✈️</option>
                  <option value="Bills">Bills 🧾</option>
                  <option value="Entertainment">Fun 🎬</option>
                  <option value="Health">Health 💊</option>
                  <option value="Shopping">Shopping 🛍️</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">NOTE</label>
              <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Details..." className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 h-20 transition-all"></textarea>
            </div>

            <button 
              type="submit" 
              className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {editingId ? "Update Expense" : "+ Add Expense"}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex justify-between items-center text-white">
            Recent Activity
            <button onClick={() => setShowAll(!showAll)} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {showAll ? "Show Less" : "View All"}
            </button>
          </h3>
          
          <div className="space-y-3">
            {visibleExpenses.map((expense) => (
              <div key={expense.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between hover:bg-gray-800/80 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gray-800 text-gray-400 border border-gray-700">
                    {expense.category === 'Food' && '🍔'}
                    {expense.category === 'Travel' && '✈️'}
                    {expense.category === 'Bills' && '🧾'}
                    {expense.category === 'Entertainment' && '🎬'}
                    {expense.category === 'Health' && '💊'}
                    {expense.category === 'Shopping' && '🛍️'}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{expense.title}</h4>
                    <p className="text-xs text-gray-500">{expense.date} • {expense.note || expense.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">- ₹{Number(expense.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(expense)} className="p-2 bg-gray-800 hover:bg-yellow-600/20 text-gray-400 hover:text-yellow-400 rounded-lg transition-colors" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(expense.id)} className="p-2 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-10 text-gray-600 border border-dashed border-gray-800 rounded-xl">No expenses yet. Add one! 📝</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}