// ---------------------------------------------------------------------------
// Stellar integration (Testnet)
//
// Lista records every "utang" and "bayad" as a timestamped Stellar payment
// carrying a structured MEMO_TEXT field. The running balance is reconstructed
// by reading transaction history from Horizon — no local database of truth.
//
// Requires the polyfill in index.js:  import 'react-native-get-random-values';
// ---------------------------------------------------------------------------
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  Memo,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export const server = new Horizon.Server(HORIZON_URL);

// MEMO_TEXT is capped at 28 bytes. Build "LISTA:<type>:<slug>:<amount>"
// and trim the slug if needed so the whole memo always fits.
export function buildMemo(type, slug, amount) {
  const cleanSlug = String(slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const tail = `:${amount}`;
  const head = `LISTA:${type}:`;
  const budget = 28 - head.length - tail.length;
  const trimmed = cleanSlug.slice(0, Math.max(1, budget));
  return `${head}${trimmed}${tail}`;
}

// Parse a memo back into structured fields. Returns null if it isn't a Lista memo.
export function parseMemo(memo) {
  if (!memo || !memo.startsWith('LISTA:')) return null;
  const [, type, slug, amount] = memo.split(':');
  return { type, slug, amount: Number(amount) };
}

// Create a fresh keypair and fund it via Friendbot (testnet faucet).
export async function createFundedAccount() {
  const kp = Keypair.random();
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(kp.publicKey())}`);
  if (!res.ok) throw new Error('Friendbot funding failed');
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

// Record an utang/bayad entry as a 1-stroop payment with a structured memo.
// The peso amount lives in the memo; the XLM transfer is symbolic.
export async function recordEntry({ sourceSecret, destination, type, slug, amount }) {
  const source = Keypair.fromSecret(sourceSecret);
  const account = await server.loadAccount(source.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: '0.0000001', // 1 stroop — symbolic
      })
    )
    .addMemo(Memo.text(buildMemo(type, slug, amount)))
    .setTimeout(60)
    .build();

  tx.sign(source);
  return server.submitTransaction(tx);
}

// Reconstruct a suki's ledger from on-chain history. Reads payments to/from
// the customer account, pulls each parent transaction for its memo, and keeps
// only Lista-tagged entries.
export async function fetchLedger(customerPublicKey) {
  const page = await server
    .payments()
    .forAccount(customerPublicKey)
    .order('desc')
    .limit(100)
    .call();

  const entries = [];
  for (const record of page.records) {
    if (record.type !== 'payment') continue;
    let tx;
    try {
      tx = await record.transaction();
    } catch {
      continue;
    }
    const parsed = parseMemo(tx.memo);
    if (!parsed) continue;
    const when = new Date(record.created_at);
    entries.push({
      id: record.id,
      item: parsed.slug.replace(/_/g, ' '),
      amount: parsed.amount,
      utang: parsed.type === 'utang',
      date: when.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      time: when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
      txHash: tx.hash.slice(0, 4) + '…' + tx.hash.slice(-4),
      ledger: tx.ledger_attr ?? tx.ledger,
    });
  }
  return entries;
}

export function shortKey(pub) {
  if (!pub) return 'G…';
  return 'G…' + pub.slice(-4);
}
