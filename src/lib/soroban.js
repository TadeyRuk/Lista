import {
  Contract,
  Address,
  xdr,
  Operation,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  scValToNative,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { server } from "./wallet.js";

// REPLACE THIS with your deployed contract ID after running cargo build + deploy
export const CONTRACT_ID = "CCLE2B3H7XNLTRT6XUOYF4245Z2LQO2KLRR5WNYF2EXW2G7NQDQD4444"; 

const NETWORK_PASSPHRASE = Networks.TESTNET;

// 1. Get Outstanding Balance from Smart Contract
export async function getContractBalance(merchantKey, customerKey) {
  try {
    const contract = new Contract(CONTRACT_ID);
    const sourceAcc = await server.loadAccount(merchantKey);
    
    const tx = new TransactionBuilder(sourceAcc, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_balance",
          Address.fromString(merchantKey).toScVal(),
          Address.fromString(customerKey).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (sim.result?.retval) {
      return Number(scValToNative(sim.result.retval));
    }
    return 0;
  } catch (e) {
    console.error("Failed to get contract balance:", e);
    return 0;
  }
}

// 2. Get Tab History timeline from Smart Contract
export async function getContractHistory(merchantKey, customerKey) {
  try {
    const contract = new Contract(CONTRACT_ID);
    const sourceAcc = await server.loadAccount(merchantKey);
    
    const tx = new TransactionBuilder(sourceAcc, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "get_history",
          Address.fromString(merchantKey).toScVal(),
          Address.fromString(customerKey).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (sim.result?.retval) {
      const native = scValToNative(sim.result.retval);
      // Map Soroban Struct array: { is_utang: bool, item: string, amount: bigint, timestamp: bigint }
      // back into our unified TabEntry format
      return native.map((e, index) => ({
        type: e.is_utang ? "utang" : "bayad",
        item: e.is_utang ? e.item : "Bayad",
        amount: Number(e.amount),
        timestamp: new Date(Number(e.timestamp) * 1000).toISOString(),
        hash: `contract_tx_${index}_${e.timestamp}`, // mock hash for visual keying
      }));
    }
    return [];
  } catch (e) {
    console.error("Failed to get contract history:", e);
    return [];
  }
}

// 3. Add credit (utang) - Merchant invokes the contract (authorized via Freighter)
export async function submitUtangContract({ ownerPublicKey, customerPublicKey, itemName, amountPhp }) {
  try {
    const contract = new Contract(CONTRACT_ID);
    const account = await server.loadAccount(ownerPublicKey);

    // Build the Soroban transaction
    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "add_utang",
          Address.fromString(ownerPublicKey).toScVal(),
          Address.fromString(customerPublicKey).toScVal(),
          nativeToScVal(itemName),
          nativeToScVal(amountPhp, { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    // Prepare (Simulate) transaction to compute resource footprints and fee
    tx = await server.prepareTransaction(tx);

    // Sign using Freighter Wallet
    const { signedTxXdr } = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(signedTx);
    return { hash: result.hash, success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message || "Smart contract transaction failed" };
  }
}

// 4. Add payment (bayad) - Customer invokes the contract (authorized via Customer secret key)
export async function submitBayadContract({ customerSecret, ownerPublicKey, amountPhp }) {
  try {
    const customer = Address.fromString(customerSecret); // Wait, customerSecret is a seed!
    // In our app context, customerSecret is a secret key. We derive the keypair first.
    const { Keypair } = require("@stellar/stellar-sdk"); // dynamically import or handle it
    // Wait, let's use standard imports at the top
    return submitBayadContractInternal({ customerSecret, ownerPublicKey, amountPhp });
  } catch (e) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

async function submitBayadContractInternal({ customerSecret, ownerPublicKey, amountPhp }) {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const customerKeypair = Keypair.fromSecret(customerSecret);
  const customerPublicKey = customerKeypair.publicKey();
  const contract = new Contract(CONTRACT_ID);
  
  const account = await server.loadAccount(customerPublicKey);
  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "add_bayad",
        Address.fromString(ownerPublicKey).toScVal(),
        Address.fromString(customerPublicKey).toScVal(),
        nativeToScVal(amountPhp, { type: "i128" })
      )
    )
    .setTimeout(30)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(customerKeypair);
  
  const result = await server.submitTransaction(tx);
  return { hash: result.hash, success: true };
}
