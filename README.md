# 📒 Lista — On-Chain Sari-Sari Store Credit Ledger

Lista digitizes the handwritten **utang** (credit tab) notebook of sari-sari stores into a tamper-evident, real-time **Stellar** blockchain record. This ensures both the store owner (tindera) and the customer (suki) always share the exact same immutable ledger.

This repository contains two implementations of the Lista project:
1. **Web App (Vite + React)**: A fully functional web interface with Freighter Wallet integration, barcode scanning (via camera), and shared read-only public ledger links.
2. **Mobile App (React Native + Expo)**: A mobile interface featuring custom design tokens, native screens, navigation, and on-chain syncing.

---

## 💻 Web App (Vite + React)
The web application is located at the root of this project.

### Features
- **Freighter Wallet**: Owner connects via Freighter browser extension on Stellar Testnet.
- **Barcode Scanner**: Point camera at product → item name auto-fills from Open Food Facts.
- **Utang Logger**: Log credit entries to the Stellar ledger using `LISTA:u:` text memos.
- **Bayad Logger**: Log payments to the Stellar ledger using `LISTA:b:` text memos.
- **Shared Ledger URL**: `?customer=G...&owner=G...` query parameters allow read-only sharing of the tab.
- **Explorer Links**: Direct links to `stellar.expert` for transaction verification.

### Quick Start
Ensure you have the [Freighter Wallet](https://freighter.app) browser extension installed and set to **Testnet**.

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Mobile App (React Native + Expo)
The mobile application is located inside the [lista-react-native](file:///home/tadeyruk/Documents/Projects/Lista/lista-react-native) folder.

### Features
- **Mobile Screens**: Native flow covering Onboarding, Dashboard, Tab Viewer, Camera Scanner, and Custom Keyboard for Payments.
- **Optimistic State**: Fast client-side updates with background Stellar sync.
- **CSPRNG Integration**: Cryptographically secure random values integration for React Native.

### Quick Start
Requires **Node 18+** and the **Expo Go** app on your physical device.

```bash
cd lista-react-native
npm install
npx expo install # Align native dependencies with installed Expo SDK
npm start
```
Scan the QR code in your terminal with the **Expo Go** app (Android) or your camera (iOS).
