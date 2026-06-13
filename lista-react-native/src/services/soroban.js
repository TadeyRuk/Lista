import {
  Contract,
  Address,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  scValToNative,
  nativeToScVal,
  Keypair,
} from '@stellar/stellar-sdk';
import { server } from './stellar';

// REPLACE THIS with your deployed contract ID after running cargo build + deploy
export const CONTRACT_ID = 'CCLE2B3H7XNLTRT6XUOYF4245Z2LQO2KLRR5WNYF2EXW2G7NQDQD4444';

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
          'get_balance',
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
    console.error('Failed to get contract balance:', e);
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
          'get_history',
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
        id: `contract_tx_${index}_${e.timestamp}`,
        item: e.is_utang ? e.item : 'Bayad',
        amount: Number(e.amount),
        utang: e.is_utang,
        date: new Date(Number(e.timestamp) * 1000).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        time: new Date(Number(e.timestamp) * 1000).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
        txHash: `contract_${index}`,
        ledger: 0,
      }));
    }
    return [];
  } catch (e) {
    console.error('Failed to get contract history:', e);
    return [];
  }
}

// 3. Add credit (utang) - Merchant signs directly using store secret key
export async function submitUtangContract({ merchantSecret, customerPublicKey, itemName, amountPhp }) {
  const merchantKeypair = Keypair.fromSecret(merchantSecret);
  const merchantPublicKey = merchantKeypair.publicKey();
  const contract = new Contract(CONTRACT_ID);

  const account = await server.loadAccount(merchantPublicKey);
  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'add_utang',
        Address.fromString(merchantPublicKey).toScVal(),
        Address.fromString(customerPublicKey).toScVal(),
        nativeToScVal(itemName),
        nativeToScVal(amountPhp, { type: 'i128' })
      )
    )
    .setTimeout(60)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(merchantKeypair);

  return server.submitTransaction(tx);
}

// 4. Add payment (bayad) - Customer signs directly using customer secret key
export async function submitBayadContract({ customerSecret, merchantPublicKey, amountPhp }) {
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
        'add_bayad',
        Address.fromString(merchantPublicKey).toScVal(),
        Address.fromString(customerPublicKey).toScVal(),
        nativeToScVal(amountPhp, { type: 'i128' })
      )
    )
    .setTimeout(60)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(customerKeypair);

  return server.submitTransaction(tx);
}
