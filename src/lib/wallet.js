import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

import {
  Horizon,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new Horizon.Server(HORIZON_URL);

export async function isFreighterAvailable() {
  const { isConnected: connected } = await isConnected();
  return connected;
}

export async function connectWallet() {
  const { address, error } = await requestAccess();
  if (error) throw new Error(error.message ?? "Freighter access denied");
  return address;
}

export async function getConnectedKey() {
  const { address } = await getAddress();
  return address || null;
}

export function disconnectWallet(setOwnerKey) {
  setOwnerKey(null);
}

export async function fetchBalance(publicKey) {
  const account = await server.loadAccount(publicKey);
  const xlmBalance = account.balances.find((b) => b.asset_type === "native");
  return { xlm: xlmBalance ? xlmBalance.balance : "0" };
}

export async function sendPayment({ from, to, amount, memo }) {
  try {
    const account = await server.loadAccount(from);
    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      Operation.payment({
        destination: to,
        asset: Asset.native(),
        amount: String(amount),
      })
    );

    if (memo) txBuilder.addMemo(Memo.text(memo));
    const tx = txBuilder.setTimeout(30).build();

    const { signedTxXdr, error } = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (error) {
      return { success: false, error: error.message ?? "Signing rejected" };
    }

    const signed = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(signed);
    return { hash: result.hash, success: true };
  } catch (err) {
    const codes = err?.response?.data?.extras?.result_codes;
    const errorMsg = codes
      ? `${codes.transaction} / ${(codes.operations ?? []).join(", ")}`
      : err.message;
    return { success: false, error: errorMsg };
  }
}

export { server, NETWORK_PASSPHRASE };
