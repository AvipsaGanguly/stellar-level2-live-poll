# 🌟 Stellar Live Poll - Web3 Governance dApp

> A decentralized **Live Poll DApp** built using **Soroban Smart Contracts** on the **Stellar Testnet** with **real Wallet integration**, on-chain voting, optimistic UI updates, transaction tracking, and a modern Web3 interface.

---

## 🚀 Live Demo

🔗 https://stellar-level2-live-poll.vercel.app/

---

## 📂 GitHub Repository

🔗 https://github.com/AvipsaGanguly/stellar-level2-live-poll

---

# 📖 Overview

Stellar Live Poll is a decentralized voting application where users securely cast votes using their connected wallet. 

Each vote is stored on-chain through a **Soroban Smart Contract** deployed on the Stellar Testnet. The frontend communicates directly with the deployed smart contract, displaying live voting statistics, progress bars, and transaction statuses. 

This project was built as part of the **Rise In Stellar Journey to Mastery – Level 2 (Yellow Belt)** and features a production-ready Web3 design suitable for Stellar ecosystem governance proposals.

---

# ✨ Features

✅ **Wallet Integration**: Support for official Freighter Wallet.
✅ **Smart Contract**: Deployed securely on the Stellar Testnet.
✅ **Governance Proposal**: Vote YES or NO on ecosystem initiatives.
✅ **Live On-Chain Data**: Read vote counts directly from the blockchain.
✅ **Optimistic UI Updates**: Immediate visual feedback before block confirmation.
✅ **Transaction Status Tracking**:
   - ⏳ Pending (with spinner)
   - ✅ Success
   - ❌ Failed
✅ **Transaction Explorer Link**: Direct link to Stellar Expert for verification.
✅ **Modern Web3 UI**: Glassmorphism design, interactive hover states, micro-animations.
✅ **Wallet Connection Status**: Truncated address display (e.g., `GCETTG...4MFS`) with full-address tooltip on hover.
✅ **Live Poll Analytics**: Dynamic percentage distribution and total vote count.

---

# 📸 Screenshots

*(Replace the placeholder URLs below with your actual screenshots)*

## 🏠 Home Page / Web3 Dashboard

<!-- ADD HOME PAGE SCREENSHOT HERE -->
![Home Page Placeholder](put_your_home_page_screenshot_here.png)

---

## 👛 Wallet Connected & Hover Tooltip

<!-- ADD WALLET CONNECTED SCREENSHOT HERE -->
![Wallet Connected Placeholder](put_your_wallet_connected_screenshot_here.png)

---

## 🗳 Active Voting (Optimistic UI / Pending State)

<!-- ADD PENDING VOTING SCREENSHOT HERE -->
![Pending Vote Placeholder](put_your_pending_vote_screenshot_here.png)

---

## ✅ Successful Transaction & Poll Analytics

<!-- ADD SUCCESS TRANSACTION SCREENSHOT HERE -->
![Success Transaction Placeholder](put_your_success_screenshot_here.png)

---

# 🛠 Technologies Used

| Technology | Purpose |
|------------|---------|
| React + Vite | Frontend |
| Pure CSS | Styling & Animations (No external heavy UI libraries) |
| Rust | Smart Contract |
| Soroban SDK | Smart Contract Development |
| Stellar CLI | Deployment |
| Freighter API | Wallet Connection |
| Stellar SDK | Contract Interaction |
| Vercel | Deployment |

---

# ⚙ Smart Contract Functions

### `vote_yes()`
Records a YES vote on-chain.

---

### `vote_no()`
Records a NO vote on-chain.

---

### `get_yes_votes()`
Returns the total YES votes.

---

### `get_no_votes()`
Returns the total NO votes.

---

# 🔐 Wallet Integration

The application uses the official package:
```bash
@stellar/freighter-api
```

Implemented features:
- Connect Wallet
- Read & Format Wallet Address
- Wallet Authentication
- Transaction Signing
- Contract Invocation
- Transaction Status Updates

---

# 📜 Smart Contract Details

### Network
```
Stellar Testnet
```

### Contract Address
```
CDP345GRKIPU4ZRBNUGPJC63DISJN67B645RRZHLS7CTRK2IKK2GWN55
```

---

# 🔄 Transaction Verification

### Sample Transaction Hash
```
40f32166ae03b306db737dc0a504d9de2c239a51df8570e593f92a364b7c2fce
```

### Stellar Expert Explorer
[View Sample Transaction on Stellar Expert](https://stellar.expert/explorer/testnet/tx/40f32166ae03b306db737dc0a504d9de2c239a51df8570e593f92a364b7c2fce)

---

# 📂 Project Structure

```
stellar-level2-live-poll/
│
├── contracts/
│   └── hello-world/
│       ├── src/
│       │   ├── lib.rs
│       │   └── test.rs
│       ├── Cargo.toml
│       └── Makefile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── stellar.js
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 💻 Installation

Clone the repository:
```bash
git clone https://github.com/AvipsaGanguly/stellar-level2-live-poll.git
```

Go to the frontend directory:
```bash
cd stellar-level2-live-poll/frontend
```

Install dependencies:
```bash
npm install
```

Run locally:
```bash
npm run dev
```

Build project for production:
```bash
npm run build
```

---

# 📋 Level 2 Requirements Checklist

| Requirement | Status |
|------------|---------|
| Smart Contract | ✅ |
| Contract deployed on Testnet | ✅ |
| Frontend calls contract | ✅ |
| Freighter Wallet Integration | ✅ |
| Transaction Status Tracking | ✅ |
| Wallet Address Display | ✅ |
| Responsive UI | ✅ |
| GitHub Repository | ✅ |
| Vercel Deployment | ✅ |

---

# 🧪 Testing

The smart contract has been tested using Soroban's testing framework.

Implemented tests include:
- ✅ Create Poll
- ✅ Vote Yes
- ✅ Vote No
- ✅ Multiple Votes

Run tests:
```bash
cargo test
```

Expected Output:
```
running 3 tests

test_create_poll .... ok
test_vote_yes .... ok
test_vote_no .... ok

test result: ok
```

---

# 🌍 Deployment

**Frontend**: [Vercel](https://stellar-level2-live-poll.vercel.app/)

**Backend**: Soroban Smart Contract Deployed on Stellar Testnet.

---

# 👩‍💻 Author

**Avipsa Ganguly**