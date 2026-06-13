import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { CUSTOMERS, INITIAL_LEDGER, balanceOf } from '../data';
import { fetchLedger, recordEntry, createFundedAccount } from '../services/stellar';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [perspective, setPerspective] = useState('store'); // 'store' | 'customer'
  const [activeId, setActiveId] = useState('tonyo');
  const [ledgers, setLedgers] = useState(INITIAL_LEDGER);
  const [account, setAccount] = useState(null); // { publicKey, secret } after onboarding
  const [customerKeys, setCustomerKeys] = useState({}); // id -> { publicKey, secret }
  
  const [initializingCustomer, setInitializingCustomer] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Map customers dynamically, adding real on-chain key info if generated
  const customers = useMemo(() => {
    return CUSTOMERS.map((c) => {
      const keys = customerKeys[c.id];
      const ledger = ledgers[c.id] || [];
      const balance = balanceOf(ledger);
      return {
        ...c,
        publicKey: keys?.publicKey || null,
        secret: keys?.secret || null,
        walletShort: keys?.publicKey ? 'G…' + keys.publicKey.slice(-4) : c.walletShort,
        balance,
      };
    });
  }, [customerKeys, ledgers]);

  const totalReceivable = useMemo(
    () => customers.reduce((a, c) => a + c.balance, 0),
    [customers]
  );

  const activeCustomer = customers.find((c) => c.id === activeId) || customers[0];
  const activeLedger = ledgers[activeId] || [];

  // Initialize a customer's on-chain account using Friendbot faucet
  async function initCustomerAccount(id) {
    if (customerKeys[id]) return customerKeys[id];
    setInitializingCustomer(true);
    try {
      const keys = await createFundedAccount();
      setCustomerKeys((prev) => ({ ...prev, [id]: keys }));
      await loadActiveLedger(id, keys.publicKey);
      return keys;
    } catch (e) {
      console.error("Failed to fund customer account:", e);
      // Fallback keypair generation so app functions offline
      const fallbackKeys = { 
        publicKey: 'GDEMO' + id.toUpperCase().padEnd(51, 'X'), 
        secret: 'SDEMO' + id.toUpperCase().padEnd(51, 'X') 
      };
      setCustomerKeys((prev) => ({ ...prev, [id]: fallbackKeys }));
      return fallbackKeys;
    } finally {
      setInitializingCustomer(false);
    }
  }

  // Load active ledger from Stellar Horizon
  async function loadActiveLedger(id, pubKey) {
    if (!pubKey) return;
    setLoadingLedger(true);
    try {
      const ledger = await fetchLedger(pubKey);
      setLedgers((prev) => ({ ...prev, [id]: ledger }));
    } catch (e) {
      console.error("Failed to fetch ledger from Horizon:", e);
    } finally {
      setLoadingLedger(false);
    }
  }

  async function refreshActiveLedger() {
    const keys = customerKeys[activeId];
    if (keys?.publicKey) {
      await loadActiveLedger(activeId, keys.publicKey);
    }
  }

  async function addUtang(id, item, amount) {
    const keys = customerKeys[id] || await initCustomerAccount(id);
    const slug = item.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 16);
    
    if (account?.secret && keys?.publicKey) {
      // Record transaction live on Stellar network
      await recordEntry({
        sourceSecret: account.secret,
        destination: keys.publicKey,
        type: 'utang',
        slug,
        amount: Number(amount)
      });
      await loadActiveLedger(id, keys.publicKey);
    } else {
      // Offline fallback state update
      const d = new Date();
      const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
      const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      const entry = {
        id: 'u' + Date.now(),
        item,
        amount: Number(amount),
        utang: true,
        date,
        time,
        txHash: 'pending…',
        ledger: null,
      };
      setLedgers((prev) => {
        const list = prev[id] ? [...prev[id]] : [];
        list.unshift(entry);
        return { ...prev, [id]: list };
      });
    }
  }

  async function addBayad(id, amount) {
    const keys = customerKeys[id] || await initCustomerAccount(id);
    
    if (account?.publicKey && keys?.secret) {
      // Record transaction live on Stellar network
      await recordEntry({
        sourceSecret: keys.secret,
        destination: account.publicKey,
        type: 'bayad',
        slug: 'bayad',
        amount: Number(amount)
      });
      await loadActiveLedger(id, keys.publicKey);
    } else {
      // Offline fallback state update
      const d = new Date();
      const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
      const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      const entry = {
        id: 'b' + Date.now(),
        item: 'Bayad',
        amount: Number(amount),
        utang: false,
        date,
        time,
        txHash: 'pending…',
        ledger: null,
      };
      setLedgers((prev) => {
        const list = prev[id] ? [...prev[id]] : [];
        list.unshift(entry);
        return { ...prev, [id]: list };
      });
    }
  }

  const value = {
    perspective,
    setPerspective,
    activeId,
    setActiveId,
    customers,
    totalReceivable,
    ledgers,
    activeCustomer,
    activeLedger,
    addUtang,
    addBayad,
    account,
    setAccount,
    initializingCustomer,
    loadingLedger,
    initCustomerAccount,
    refreshActiveLedger,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
