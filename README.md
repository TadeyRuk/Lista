# 📒 Lista — On-Chain Sari-Sari Store Credit

> **Stellar Journey to Mastery 2026 · White Belt Deliverable · TadeyRuk**

Lista replaces handwritten credit notebooks (*lista*) with a tamper-evident on-chain ledger on Stellar Testnet. Every utang (credit) and bayad (payment) is a Stellar transaction. The tab reconstructs entirely from Horizon — no backend, no database.

---

## The Problem

Over 1 million sari-sari stores in the Philippines extend informal credit tracked by hand. No timestamps. No receipts. Disputes happen daily. Lista fixes this with a shared, immutable ledger that both the store owner and customer can independently verify.

---

## Features (White Belt)

- **Freighter wallet** — owner connects via Freighter browser extension on Stellar Testnet
- **Barcode scanner** — point camera at product → item name auto-fills from Open Food Facts
- **Utang logger** — every credit entry is a Stellar transaction with a structured `LISTA:u:` memo
- **Bayad (payment)** — payments recorded on-chain with `LISTA:b:` memo
- **Live tab** — reconstructed in real time from Horizon; refresh the page and it's still there
- **Shared ledger URL** — `?customer=G...&owner=G...` lets anyone view the tab read-only, no wallet needed
- **Per-entry Explorer links** — every entry links to `stellar.expert` for independent verification

---

## How It Works

```
Owner scans item → Freighter signs tx → Horizon records it
Customer views tab → Horizon replays tx history → Balance computed client-side
```

### Memo Format

All Lista transactions carry a structured text memo (≤28 bytes):

```
LISTA:u:<item_name>:<php_amount>    # utang / credit
LISTA:b:<php_amount>                # bayad / payment
```

Both operations send 1 stroop (0.0000001 XLM) — the amount is irrelevant; the memo is the receipt.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React + Vite | UI, two views (Owner + Customer) |
| @stellar/stellar-sdk | Transaction building, Horizon queries, keypairs |
| @stellar/freighter-api | Freighter wallet bridge (connect, sign) |
| Horizon Testnet | `https://horizon-testnet.stellar.org` — the only database |
| Friendbot | Testnet funding for customer session keypair |
| @zxing/library | Real-time barcode decoding from browser camera |
| Open Food Facts | Product name/metadata lookup from barcode number |

---

## Getting Started

**Prerequisites:** [Freighter wallet extension](https://freighter.app) installed, set to **Testnet**.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, connect Freighter, and start logging tabs.

---

## Verifying On-Chain

Every transaction is publicly visible on Stellar Testnet Explorer:

```
https://stellar.expert/explorer/testnet/tx/<hash>
```

The tab view links directly to each entry. No trust required — the ledger speaks for itself.

---

## Belt Progression

| Belt | What Gets Added |
|------|----------------|
| ⚪ White Belt (now) | Wallet, barcode scanner, utang/bayad ledger, tab viewer |
| 🟡 Yellow Belt | Multi-customer management, trust line credit limits, SSE real-time sync |
| 🟠 Orange Belt | Full store dashboard, complete payment flow |
| 🟢 Green Belt | Production MVP, real store pilot |
| 🔵 Blue Belt | 50 users, feedback loop, pitch deck |
| ⚫ Black Belt | Mainnet launch, security audit |

---

*Lista — Built for the barangay.*
