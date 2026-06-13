# CLAUDE.md

This file provides guidance when working with code in this repository.

## Commands

All commands run from the root directory:

```bash
npm run dev      # Start Vite dev server
npm run build    # Vite build
npm run lint     # ESLint code checks
npm run preview  # Serve production build locally
```

## Architecture

Lista is an on-chain ledger application that replaces handwritten sari-sari store notebooks. Every credit (utang) and payment (bayad) is a Stellar Testnet transaction; the tab is reconstructed directly from Horizon. There is no backend database.

### Core Roles
- **Owner (Merchant)**: Uses a Freighter wallet browser extension on the Stellar Testnet.
- **Customer**: Uses a session-generated keypair funded via Friendbot, stored in `sessionStorage` (`lista_customer_keypair`).

### File Structure
- `src/lib/wallet.js` — Wrapper for Freighter API interaction (connect, disconnect, fetch XLM balance, send payments).
- `src/lib/customerKeypair.js` — Utility to initialize and store the session keypair for the customer.
- `src/lib/lista.js` — Implements the LISTA memo protocol, fetches transaction logs from Horizon, and calculates total balance.
- `src/lib/priceTable.js` — A seed table mapping barcodes to product names and PHP prices.
- `src/components/BarcodeScanner.jsx` — Media device scanner decoding barcodes with `@zxing/library`.
- `src/components/TabHistory.jsx` — Shared component displaying history of credit/payment entries.
- `src/views/OwnerView.jsx` — Merchant panel for adding entries (manual/scan) and marking payments.
- `src/views/CustomerView.jsx` — Customer panel showing shared logs and option to make payments.
- `src/App.jsx` — Root component managing view routes, global state, and shared link parsing.

### LISTA Memo Protocol
All actions are captured as micro-payment transactions of `0.0000001 XLM` with specific memo strings (max 28 bytes):
- **Utang (Credit)**: `LISTA:u:<item_name>:<amount_php>` (e.g., `LISTA:u:Lucky Me:18`)
- **Bayad (Payment)**: `LISTA:b:<amount_php>` (e.g., `LISTA:b:118`)

## Coding Conventions
- **Vanilla CSS styling**: Defined in `src/index.css`. Keep layouts responsive, clean, and highly visible.
- **API calls**: Use Stellar Horizon endpoints on the Testnet (`https://horizon-testnet.stellar.org`).
- **Error handling**: Handle user rejections gracefully (e.g. Freighter API's `User declined access` error) and display readable errors.
