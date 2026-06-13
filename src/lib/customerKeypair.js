import { Keypair } from "@stellar/stellar-sdk";

const SESSION_KEY = "lista_customer_keypair";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

export async function initCustomer() {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return JSON.parse(stored);

  const keypair = Keypair.random();
  const res = await fetch(`${FRIENDBOT_URL}?addr=${keypair.publicKey()}`);
  if (!res.ok) throw new Error("Friendbot funding failed");

  const data = { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function clearCustomer() {
  sessionStorage.removeItem(SESSION_KEY);
}
