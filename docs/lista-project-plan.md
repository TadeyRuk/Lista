# Lista — Full Project Implementation Plan

## Context

Lista replaces handwritten sari-sari store credit notebooks with an on-chain Stellar ledger.
Every utang (credit) and bayad (payment) is a Stellar transaction; the tab reconstructs
entirely from Horizon — no backend, no local database.

**White Belt judging criteria (must satisfy):**
1. Freighter wallet setup + Stellar Testnet
2. Connect / disconnect wallet
3. Fetch + display XLM balance
4. Send XLM transaction → show tx hash + success/failure
5. Clean code: UI setup, wallet integration, balance fetch, tx logic, error handling

**Architecture decision:** Owner = Freighter wallet. Customer = session-generated keypair
funded via Friendbot. Two-layer lib split: `wallet.js` (judging rubric) + `lista.js`
(Lista mechanics).

---

## Tech Stack

```bash
npm install @stellar/stellar-sdk        # tx building, Horizon, keypairs
npm install @stellar/freighter-api      # Freighter extension bridge
npm install @zxing/library              # barcode decoding (Phase 5)
```

Framework: React + Vite (TypeScript optional, plain JS for speed).

---

## File Structure

```
lista/
  src/
    lib/
      wallet.js          # Freighter connect, balance, sendPayment
      lista.js           # LISTA memo protocol, tab fetch, balance math
      customerKeypair.js # session keypair generation + Friendbot funding
      priceTable.js      # barcode → PHP price seed table
    components/
      BarcodeScanner.jsx # ZXing camera modal
      TabHistory.jsx     # renders parsed TabEntry[]
      UtangForm.jsx      # item name + price confirmation form
    views/
      OwnerView.jsx      # scan, manual entry, tab, mark payment
      CustomerView.jsx   # read-only tab + pay button
    App.jsx              # state root: ownerKey, customerKeypair, tab entries
    main.jsx
  index.html
  vite.config.js
  CLAUDE.md
  docs/
    lista-project-plan.md   # copy of this file (written during Phase 0)
```

---

## Phase 0 — Project Scaffold

```bash
npm create vite@latest lista -- --template react
cd lista
npm install
npm install @stellar/stellar-sdk @stellar/freighter-api
```

Delete boilerplate: `App.css`, `assets/react.svg`, contents of `App.jsx`.
Commit: `chore: scaffold Vite React project`.

Copy this plan to `docs/lista-project-plan.md`.

---

## Phase 1 — `src/lib/wallet.js`

Covers entire judging rubric. No React — pure async functions.

### Freighter API functions used

```javascript
import {
  isConnected,      // → Promise<{ isConnected: boolean }>
  requestAccess,    // → Promise<{ address: string }>   connect + get key
  getAddress,       // → Promise<{ address: string }>   get key without prompt
  signTransaction,  // → Promise<{ signedTxXdr, signerAddress }>
} from "@stellar/freighter-api";

import {
  Horizon, Networks, TransactionBuilder, Asset,
  Operation, Memo, BASE_FEE,
} from "@stellar/stellar-sdk";
```

### Exports

```javascript
// Returns true if Freighter extension is installed
export async function isFreighterAvailable()

// Prompts Freighter allow-list popup; returns publicKey string or throws
export async function connectWallet()

// Returns stored publicKey without prompting, or null if not connected
export async function getConnectedKey()

// Clears app-level connection state (Freighter has no disconnect API)
export function disconnectWallet(setOwnerKey)

// Fetches XLM balance from Horizon testnet
// Returns { xlm: "10000.0000000" } or throws
export async function fetchBalance(publicKey)

// Builds + signs (Freighter) + submits a payment transaction
// Returns { hash, success: true } or { success: false, error: string }
export async function sendPayment({ to, amount, memo })
```

### `sendPayment` internals

```javascript
const server = new Horizon.Server(HORIZON_URL);
const account = await server.loadAccount(ownerPublicKey); // load sequence number
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.payment({ destination: to, asset: Asset.native(), amount }))
  .addMemo(memo ? Memo.text(memo) : Memo.none())
  .setTimeout(30)
  .build();
const { signedTxXdr } = await signTransaction(tx.toXDR(), { networkPassphrase: Networks.TESTNET });
const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET));
return { hash: result.hash, success: true };
```

Error handling: catch `{ response.data.extras.result_codes }` from Horizon, return
`{ success: false, error: humanReadableCode }`. Catch Freighter rejection
(`error.message === 'User declined access'`) → `{ success: false, error: 'rejected' }`.

---

## Phase 2 — `src/lib/customerKeypair.js`

Session keypair for demo customer. Not Freighter.

```javascript
import { Keypair } from "@stellar/stellar-sdk";

const SESSION_KEY = "lista_customer_keypair";

// Returns { publicKey, secretKey }; generates + Friendbot-funds on first call
export async function initCustomer() {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return JSON.parse(stored);

  const keypair = Keypair.random();
  await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
  const result = { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
  return result;
}

export function clearCustomer() {
  sessionStorage.removeItem(SESSION_KEY);
}
```

---

## Phase 3 — `src/lib/lista.js`

Lista mechanics. Imports from `wallet.js`.

### Memo protocol

```
utang:  "LISTA:u:<name>:<php>"     e.g. "LISTA:u:Lucky Me:18"
bayad:  "LISTA:b:<php>"            e.g. "LISTA:b:118"
```

`LISTA:u:` = 8 bytes. Max price 5 digits. Name budget = **15 chars** (truncate + rtrim).
Total always ≤ 28 bytes.

### Exports

```javascript
// Memo builders
export function buildUtangMemo(itemName, amountPhp)   // → string, validated ≤28 bytes
export function buildBayadMemo(amountPhp)              // → string

// Submit utang — owner signs via Freighter
// Sends 0.0000001 XLM owner→customer, memo = LISTA:u:...
export async function submitUtang({ customerPublicKey, itemName, amountPhp })
// → { hash, success, error? }

// Submit bayad — customer session keypair signs (NOT Freighter)
// Sends 0.0000001 XLM customer→owner, memo = LISTA:b:...
export async function submitBayad({ customerSecret, ownerPublicKey, amountPhp })
// → { hash, success, error? }

// Fetch all LISTA txns for this owner<->customer pair from Horizon (paginated)
export async function fetchTab(customerPublicKey, ownerPublicKey)
// → TabEntry[]

// Sum entries
export function computeBalance(entries)
// → { totalUtang, totalBayad, outstanding }
```

### TabEntry shape

```javascript
{
  type: 'utang' | 'bayad',
  item: string | null,   // null for bayad entries
  amount: number,        // PHP pesos
  timestamp: string,     // ISO 8601 from Horizon ledger_close_time
  hash: string,          // tx hash for Stellar Explorer link
}
```

### `fetchTab` internals

```javascript
const server = new Horizon.Server(HORIZON_URL);
let entries = [];
let page = await server.transactions().forAccount(customerPublicKey).order('asc').limit(200).call();
while (true) {
  for (const tx of page.records) {
    if (!tx.memo?.startsWith("LISTA:")) continue;
    // filter: tx must involve ownerPublicKey (check tx.source_account or payment ops)
    entries.push(parseMemo(tx));
  }
  if (page.records.length < 200) break;
  page = await page.next();
}
return entries;
```

### `submitBayad` internals (session keypair, not Freighter)

```javascript
import { Keypair, TransactionBuilder, ... } from "@stellar/stellar-sdk";
const keypair = Keypair.fromSecret(customerSecret);
const account = await server.loadAccount(keypair.publicKey());
const tx = new TransactionBuilder(account, ...)
  .addOperation(Operation.payment({ destination: ownerPublicKey, asset: Asset.native(), amount: "0.0000001" }))
  .addMemo(Memo.text(buildBayadMemo(amountPhp)))
  .setTimeout(30)
  .build();
tx.sign(keypair);
const result = await server.submitTransaction(tx);
return { hash: result.hash, success: true };
```

---

## Transparency Design

Both owner and customer see the **same ledger from the same source** — Stellar Horizon.
Neither party has a privileged view. Neither can modify what the other sees.

Three transparency layers:

1. **Shared tab view** — `TabHistory` component is identical in both OwnerView and CustomerView.
   Same entries, same amounts, same timestamps, from the same Horizon query.

2. **Per-entry tx hash links** — Every utang and bayad entry shows a clickable hash:
   `https://stellar.expert/explorer/testnet/tx/{hash}`
   Either party can independently verify the entry on Stellar Explorer without trusting the app.

3. **Shareable public ledger URL** — App generates a read-only link:
   `?customer={publicKey}&owner={publicKey}`
   Anyone with this URL (the customer's family, a mediator, a judge) can open the tab
   without logging in — pure Horizon data, no account needed. `App.jsx` reads URL params
   on load; if both keys present, renders CustomerView in read-only mode and skips wallet connect.

Add to `App.jsx`:
```javascript
// On mount — check for shared link params
const params = new URLSearchParams(window.location.search);
const sharedCustomer = params.get('customer');
const sharedOwner = params.get('owner');
if (sharedCustomer && sharedOwner) {
  // read-only mode: fetch tab, skip wallet connect
  setView('shared');
}
```

Add **"Share Tab"** button in both views → copies URL with customer+owner keys to clipboard.

---

## Phase 4 — React Integration

### `App.jsx` state

```javascript
const [ownerKey, setOwnerKey] = useState(null);         // Freighter public key
const [balance, setBalance] = useState(null);            // { xlm }
const [customer, setCustomer] = useState(null);          // { publicKey, secretKey }
const [tab, setTab] = useState([]);                      // TabEntry[]
const [view, setView] = useState('owner');               // 'owner' | 'customer'
```

On mount: `initCustomer()` → set customer state.
On `ownerKey` change: `fetchBalance(ownerKey)` + `fetchTab(customer.publicKey, ownerKey)`.

### Connect flow

```jsx
// ConnectButton
const handleConnect = async () => {
  const key = await connectWallet();   // prompts Freighter
  setOwnerKey(key);
};
```

### OwnerView sections

1. **Header**: owner address (truncated), XLM balance, disconnect button
2. **Scan Item** button → `<BarcodeScanner>` modal (Phase 5)
3. **Manual Entry** → `<UtangForm>` with blank fields
4. **Tab History** → `<TabHistory entries={tab} />`
5. **Outstanding** total + **Mark Payment** button → triggers `submitBayad`

### CustomerView sections

1. **"Your Tab"** header with store name (owner address truncated)
2. `<TabHistory entries={tab} />` (read-only)
3. **Total Utang** display
4. **Pay** button → amount input + `submitBayad`

### Transaction feedback pattern

```jsx
const [txStatus, setTxStatus] = useState(null); // null | { hash, success, error }

// After submitUtang / submitBayad:
setTxStatus(result);
if (result.success) await refreshTab();

// Render:
{txStatus?.success && <div>✓ Submitted: <a href={explorerUrl(txStatus.hash)}>{txStatus.hash.slice(0,8)}...</a></div>}
{txStatus?.error && <div>✗ Failed: {txStatus.error}</div>}
```

Stellar Testnet Explorer: `https://stellar.expert/explorer/testnet/tx/{hash}`

---

## Phase 5 — Barcode Scanner

Install: `npm install @zxing/library`

### `BarcodeScanner.jsx` flow

1. `MediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`
2. Pipe stream to `<video>` element
3. `BrowserMultiFormatReader` from `@zxing/library` decodes frames
4. On successful decode → stop stream → query Open Food Facts → populate `UtangForm`
5. Camera unavailable → show `UtangForm` directly (manual entry)

### Open Food Facts fetch

```javascript
const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
const { product } = await res.json();
const name = [product.product_name, product.quantity].filter(Boolean).join(' ').slice(0, 15);
const price = priceTable[barcode] ?? null;
```

Cache response: `sessionStorage.setItem('off_' + barcode, JSON.stringify({ name, price }))`.

### `src/lib/priceTable.js`

```javascript
// barcode → suggested PHP price for common PH sari-sari items
export const priceTable = {
  "4800016651018": 18,   // Lucky Me Pancit Canton original
  "4800016500085": 22,   // Tide Powder 66g
  // ... seed ~20 common SKUs
};
```

Fallback: if barcode not in table, price field left blank.

---

## Verification

**Judging rubric checklist:**

1. Freighter extension installed, app detects it via `isConnected()`
2. Connect button prompts Freighter allow-list popup; public key displayed
3. Disconnect clears owner state; reconnect works
4. XLM balance shown after connect (from Horizon testnet)
5. Submit utang → Freighter signs → Stellar Explorer shows tx with LISTA:u: memo
6. Submit bayad → customer session key signs → Explorer shows LISTA:b: memo
7. Tab reconstructs from Horizon (refresh page → tab still shows from on-chain data)
8. Barcode scan populates item in < 2 seconds (test with Lucky Me barcode)
9. Manual entry works when camera skipped
10. Freighter rejection (user clicks Cancel) shows error state, does not crash

**Test sequence:**
```
1. Open app → Friendbot funds customer automatically
2. Click Connect → Freighter popup → approve
3. Verify balance shows ~10000 XLM
4. Scan or manually enter: "Lucky Me Pancit Canton", ₱18
5. Freighter signs → check tx hash on stellar.expert
6. Switch to Customer View → tab shows entry
7. Click Pay ₱18 → session key signs → balance updates
8. Refresh page → tab still reconstructs from Horizon
```

---

## Implementation Order

1. Phase 0 — scaffold + install deps
2. Phase 1 — `wallet.js` → verify connect + balance + send in browser console
3. Phase 2 — `customerKeypair.js` → verify Friendbot funding
4. Phase 3 — `lista.js` → verify memo format + tab fetch in console
5. Phase 4 — React wiring → `App.jsx` + views + tx feedback
6. Phase 5 — `BarcodeScanner.jsx` + `priceTable.js`

Each phase is independently testable before the next begins.
