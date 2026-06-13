# 🚀 Lista — Soroban Smart Contract Integration Guide

This guide explains how to compile, deploy, and integrate the newly added Rust Soroban smart contract for the Lista credit ledger.

---

## 1. Smart Contract Architecture

The Rust contract is located inside [contracts/lista/src/lib.rs](file:///home/tadeyruk/Documents/Projects/Lista/contracts/lista/src/lib.rs). It manages:
* **Account-based balances**: Tracks outstanding credit values between a merchant/store address and customer address.
* **On-chain logs (Tab History)**: Maintains a vector of structured transaction entries (utang and bayad) in instance storage for direct querying without external indexers.
* **Secured authorization**: Enforces signature checks using `require_auth()` for both parties:
  - `add_utang` requires the **merchant's signature** (Freighter).
  - `add_bayad` requires the **customer's signature** (session keypair).

---

## 2. Compilation

To compile the smart contract into a WebAssembly (WASM) binary, navigate to the contract directory and run:

```bash
cd contracts/lista
cargo build --target wasm32-unknown-unknown --release
```

The resulting optimized contract file will be located at:
`contracts/lista/target/wasm32-unknown-unknown/release/lista_contract.wasm`

---

## 3. Deploying to Stellar Testnet

You will need the **Stellar CLI** installed to deploy the contract. If you don't have it, install it via cargo:

```bash
cargo install --locked stellar-cli --features opt
```

### Steps to Deploy:

1. **Add Testnet Network**:
   ```bash
   stellar network add --global testnet \
     --rpc-url https://soroban-testnet.stellar.org:443 \
     --network-passphrase "Test Stellar Network ; September 2015"
   ```

2. **Add Deployer Account**:
   Generate or import an account (e.g. your Freighter wallet secret key or a fresh keypair funded via Friendbot):
   ```bash
   stellar keys generate --global deployer --network testnet
   ```

3. **Deploy the WASM contract**:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/lista_contract.wasm \
     --source deployer \
     --network testnet
   ```

Upon success, this command will output your **Contract ID** (e.g. `CCLE2B3H7X...`).

---

## 4. Connecting the Smart Contract to the UI

We have created two client wrapper libraries that handle building, preparing, and submitting the contract transactions:
* **Web UI wrapper**: [src/lib/soroban.js](file:///home/tadeyruk/Documents/Projects/Lista/src/lib/soroban.js)
* **Mobile UI wrapper**: [lista-react-native/src/services/soroban.js](file:///home/tadeyruk/Documents/Projects/Lista/lista-react-native/src/services/soroban.js)

### Integration Setup:

1. Copy the **Contract ID** returned from the deploy command.
2. Open [src/lib/soroban.js](file:///home/tadeyruk/Documents/Projects/Lista/src/lib/soroban.js) and update the `CONTRACT_ID` constant:
   ```javascript
   export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID";
   ```
3. Open [lista-react-native/src/services/soroban.js](file:///home/tadeyruk/Documents/Projects/Lista/lista-react-native/src/services/soroban.js) and update the `CONTRACT_ID` constant there as well:
   ```javascript
   export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID";
   ```

---

## 5. Swapping Memos with Smart Contracts

To swap the application from standard memo-based Horizon payments to smart contract invocations:

### Web App:
In [src/views/OwnerView.jsx](file:///home/tadeyruk/Documents/Projects/Lista/src/views/OwnerView.jsx) and [src/views/CustomerView.jsx](file:///home/tadeyruk/Documents/Projects/Lista/src/views/CustomerView.jsx), swap:
```javascript
// From standard Horizon:
import { submitUtang, submitBayad } from "../lib/lista.js";

// To Soroban Smart Contract:
import { submitUtangContract as submitUtang, submitBayadContract as submitBayad } from "../lib/soroban.js";
```

### Mobile App:
In [lista-react-native/src/context/AppContext.js](file:///home/tadeyruk/Documents/Projects/Lista/lista-react-native/src/context/AppContext.js), swap:
```javascript
// From standard Horizon:
import { fetchLedger, recordEntry } from '../services/stellar';

// To Soroban Smart Contract:
import { getContractHistory, submitUtangContract, submitBayadContract } from '../services/soroban';
```
And update the context handlers to invoke these contract methods instead of `recordEntry`.
