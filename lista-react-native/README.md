# Lista — React Native (Expo)

On-chain credit ledger for sari-sari stores. Lista digitizes the handwritten
**utang** (tab) notebook into a tamper-evident, real-time **Stellar** record, so
the *tindera* (store owner) and the *suki* (customer) always see the same list.

> Design direction: **clean fintech, subtle Filipino accents** — the 8-ray
> Philippine sun mark, Taglish action words (Utang, Bayad, I-scan), and a
> "resibo"-style receipt. The blockchain stays mostly invisible behind a
> *verified on-chain* badge.

---

## Quick start

```bash
cd lista-react-native
npm install          # or: yarn

# Align native deps to the installed Expo SDK (recommended):
npx expo install     # fixes versions of react-native, expo-camera, svg, etc.

npm start            # opens Expo Dev Tools
# press i (iOS simulator) · a (Android) · or scan the QR with Expo Go
```

Requires **Node 18+** and the **Expo Go** app (or a dev build) on your device.
The barcode scanner needs a real device or a simulator with camera support.

---

## Screens & flow

```
Onboarding  ──►  Home (dashboard)  ──►  TabViewer (a suki's running balance)
                      │                       │
                      ├─► Scanner ─► AddItem ──┤   (utang)
                      │                        │
                      └─────────────► Bayad ───┘   (payment)
                                              │
                                         Receipt (Stellar resibo)

Home ─► Customer  ── the connected, read-only SUKI view of the same ledger
```

| File | Purpose |
|------|---------|
| `src/screens/OnboardingScreen.js` | Store creation + Stellar wallet funding (Friendbot) |
| `src/screens/HomeScreen.js` | Dashboard: total receivable + suki list + bottom nav |
| `src/screens/TabViewerScreen.js` | A suki's balance, reconstructed from tx history |
| `src/screens/ScannerScreen.js` | Camera barcode scan → Open Food Facts lookup |
| `src/screens/AddItemScreen.js` | Confirm item, price, qty, memo preview → record utang |
| `src/screens/BayadScreen.js` | Record a payment with a numeric keypad |
| `src/screens/ReceiptScreen.js` | Tamper-evident Stellar receipt (memo, hash, ledger) |
| `src/screens/CustomerScreen.js` | The suki's shared view of their own tab |

---

## Architecture

- **Navigation** — `@react-navigation/native-stack` (`App.js`).
- **State** — a single `AppContext` (`src/context/AppContext.js`) holds the
  perspective (tindera/suki), the active suki, and the ledger map. `addUtang` /
  `addBayad` prepend entries optimistically so the UI updates instantly.
- **Design tokens** — `src/theme.js` (colors, fonts, radii, shadows). All
  carried over 1:1 from the approved prototype.
- **Fonts** — `Space Grotesk` (amounts/wordmark) + `Plus Jakarta Sans` (UI),
  via `@expo-google-fonts/*`, loaded in `App.js`.

## Stellar integration (`src/services/stellar.js`)

Every utang/bayad is a timestamped Stellar payment carrying a structured
`MEMO_TEXT`:

```
LISTA:utang:pancit_canton:60
LISTA:bayad:bayad:100
```

- `createFundedAccount()` — generates a keypair and funds it via **Friendbot**
  (testnet faucet).
- `recordEntry()` — submits a 1-stroop payment with the structured memo (the
  peso amount lives in the memo; the XLM transfer is symbolic).
- `fetchLedger()` — reconstructs a suki's balance by reading payment history
  from the **Horizon** REST API and parsing Lista memos. **No local DB of truth.**

> **MEMO_TEXT is capped at 28 bytes** — `buildMemo()` trims the item slug so the
> memo always fits. For long/ambiguous item names, switch to `MEMO_HASH` and
> store the detail off-chain (keyed by the hash).

### Wiring it live

The screens currently seed local demo data (`src/data.js`) so the app is fully
interactive offline. To go real:

1. In `OnboardingScreen`, `createFundedAccount()` is already called and stored
   on `account` in context.
2. In `AddItemScreen.confirm()` / `BayadScreen.confirm()`, `await
   recordEntry({ sourceSecret: account.secret, destination: suki.publicKey, … })`
   **before** navigating, then refetch.
3. In `TabViewerScreen`, replace the seeded `activeLedger` with
   `await fetchLedger(suki.publicKey)` in a `useEffect`.

> ⚠️ **Key custody.** This demo keeps the secret key in memory only. For
> production, store secrets in `expo-secure-store` (never AsyncStorage/plaintext),
> and consider a custodial or multisig model so a lost phone ≠ lost ledger.

### Required polyfill

`@stellar/stellar-sdk` needs a CSPRNG in React Native. `index.js` already imports
`react-native-get-random-values` **first**. If you see "crypto.getRandomValues
not supported", verify that import is at the very top.

## Open Food Facts (`src/services/openFoodFacts.js`)

`lookupBarcode(code)` hits the Open Food Facts v2 API and maps the result to
`{ name, brand, image, barcode }`. Returns `null` on a miss so the UI can fall
back to manual entry (local goods often aren't in the DB).

---

## Notes / next steps

- Screen transitions use native-stack animations (`slide_from_right`, plus
  `slide_from_bottom` for the scanner).
- The Bayad keypad and price field are interactive but use simple controlled
  state — swap in a masked currency input if you want decimals/centavos.
- Not yet built: Suki/Profile tabs, push reminders ("paalala"), CSV/print
  export, and multi-store support.
