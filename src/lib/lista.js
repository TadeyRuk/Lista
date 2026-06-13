import {
  Keypair,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { sendPayment, server, NETWORK_PASSPHRASE } from "./wallet.js";

const UTANG_PREFIX = "LISTA:u:";
const BAYAD_PREFIX = "LISTA:b:";
const MEMO_MAX = 28;
const MIN_XLM = "0.0000001";

// Truncate item name to fit memo ≤ 28 bytes: "LISTA:u:<name>:<price>"
function truncateName(name, price) {
  const priceStr = String(Math.round(price));
  const fixed = UTANG_PREFIX.length + 1 + priceStr.length; // prefix + colon + price
  const budget = MEMO_MAX - fixed;
  return name.slice(0, budget).trimEnd();
}

export function buildUtangMemo(itemName, amountPhp) {
  const name = truncateName(itemName, amountPhp);
  const memo = `${UTANG_PREFIX}${name}:${Math.round(amountPhp)}`;
  if (memo.length > MEMO_MAX) throw new Error(`Memo too long: ${memo}`);
  return memo;
}

export function buildBayadMemo(amountPhp) {
  return `${BAYAD_PREFIX}${Math.round(amountPhp)}`;
}

// Owner (Freighter) sends 1 stroop to customer with LISTA:u: memo
export async function submitUtang({ ownerPublicKey, customerPublicKey, itemName, amountPhp }) {
  const memo = buildUtangMemo(itemName, amountPhp);
  return sendPayment({ from: ownerPublicKey, to: customerPublicKey, amount: MIN_XLM, memo });
}

// Customer session keypair signs and sends 1 stroop to owner with LISTA:b: memo
export async function submitBayad({ customerSecret, ownerPublicKey, amountPhp }) {
  try {
    const keypair = Keypair.fromSecret(customerSecret);
    const account = await server.loadAccount(keypair.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: ownerPublicKey,
          asset: Asset.native(),
          amount: MIN_XLM,
        })
      )
      .addMemo(Memo.text(buildBayadMemo(amountPhp)))
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    const result = await server.submitTransaction(tx);
    return { hash: result.hash, success: true };
  } catch (err) {
    const codes = err?.response?.data?.extras?.result_codes;
    const errorMsg = codes
      ? `${codes.transaction} / ${(codes.operations ?? []).join(", ")}`
      : err.message;
    return { success: false, error: errorMsg };
  }
}

function parseMemo(tx) {
  const memo = tx.memo ?? "";
  const ts = tx.created_at;
  const hash = tx.hash;

  if (memo.startsWith(UTANG_PREFIX)) {
    const body = memo.slice(UTANG_PREFIX.length);
    const lastColon = body.lastIndexOf(":");
    const item = body.slice(0, lastColon) || "Item";
    const amount = parseFloat(body.slice(lastColon + 1)) || 0;
    return { type: "utang", item, amount, timestamp: ts, hash };
  }

  if (memo.startsWith(BAYAD_PREFIX)) {
    const amount = parseFloat(memo.slice(BAYAD_PREFIX.length)) || 0;
    return { type: "bayad", item: null, amount, timestamp: ts, hash };
  }

  return null;
}

export async function fetchTab(customerPublicKey, ownerPublicKey) {
  const entries = [];
  let page = await server
    .transactions()
    .forAccount(customerPublicKey)
    .order("asc")
    .limit(200)
    .call();

  while (true) {
    for (const tx of page.records) {
      const memo = tx.memo ?? "";
      if (!memo.startsWith("LISTA:")) continue;
      // only include txns between this owner ↔ customer pair
      if (
        tx.source_account !== ownerPublicKey &&
        tx.source_account !== customerPublicKey
      )
        continue;
      const entry = parseMemo(tx);
      if (entry) entries.push(entry);
    }
    if (page.records.length < 200) break;
    page = await page.next();
  }

  return entries;
}

export function computeBalance(entries) {
  const totalUtang = entries
    .filter((e) => e.type === "utang")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBayad = entries
    .filter((e) => e.type === "bayad")
    .reduce((sum, e) => sum + e.amount, 0);
  return { totalUtang, totalBayad, outstanding: totalUtang - totalBayad };
}
