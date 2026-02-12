# 💸 ExpenseAI - Decentralized Expense & Group Manager

> **Hackathon Submission**: A Web3 Super-App for managing personal finances and splitting group bills on the Algorand Blockchain.

---

## 🚀 Features Implemented (MVP)

We have successfully built a working MVP with three core modules:

### 1. ✅ Instant Crypto Settlements (One-Time Split)
* **The Problem**: "Settle Up" buttons in Web2 apps are fake; they just record debt. You still need a banking app to pay.
* **Our Solution**: We integrated **Algorand Layer-1 Payments** directly into the receipt view.
* **Status**: **Fully Functional**. You can connect a LocalNet wallet, calculate a split, and send real ALGO tokens to settle debts instantly.

### 2. ✅ AI-Powered Personal Tracker
* **The Problem**: Manual tracking is boring and provides no feedback.
* **Our Solution**: A "Smart Dashboard" that uses a logic engine to analyze your spending habits in real-time.
* **Status**: **Fully Functional**. The app dynamically categorizes your spending (e.g., "High Food Spending") and offers financial tips without needing a backend server.

### 3. ✅ Group Expense Manager (UI + Logic)
* **The Problem**: Managing trips and flatmates requires trust in one "leader."
* **Our Solution**: A simulated Group Treasury system where expenses are tracked immutably.
* **Status**: **UI & Logic Ready**. Users can create groups, generate invite codes, and add complex splits (Equal vs. Custom %). *Note: Currently runs on local storage for demo speed; Smart Contract integration is next on the roadmap.*

---

## 🔮 What's Remaining (Roadmap)

While the core payment rails are active, here is what we plan to build next:

1.  **Smart Contract Connection**: Connect the "Group Manager" UI to our PyTeal contract (`App ID: 1001`) to hold group funds in a decentralized escrow.
2.  **Notifications**: Integrate a notification service to alert members when a bill is added.
3.  **Mobile Native App**: Port the React frontend to React Native for on-the-go splitting.

---

## 📂 Key Files for Judges

If you want to look at the code, here are the most important files where the magic happens:

* **`projects/frontend/src/components/OneTimeSplit.tsx`**
    * *Why look?* Lines ~60-100 contain the **Algorand Payment Logic**. This is where we construct, sign, and send the transaction using the `algosdk`.

* **`projects/frontend/src/components/PersonalDashboard.tsx`**
    * *Why look?* Check the `useMemo` hook (Lines ~30-90). This is the **AI Logic Engine** that calculates spending patterns in real-time.

* **`projects/frontend/src/App.tsx`**
    * *Why look?* This handles the **Wallet Connection** and Authentication state management.

---

## 🛠️ How to Run Locally

### Prerequisites
* Node.js (v16+)
* Algorand LocalNet (optional, for testing payments)

### 1. Install Dependencies
```bash
cd projects/frontend
npm install
