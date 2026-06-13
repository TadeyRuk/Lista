import React, { createContext, useContext, useMemo, useState } from 'react';
import { CUSTOMERS, INITIAL_LEDGER, balanceOf } from '../data';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ---------------------------------------------------------------------------
// Central store: perspective (tindera/suki), the active suki, and the local
// ledger map. addUtang / addBayad optimistically prepend an entry so the UI
// updates instantly — in production you'd await stellar.recordEntry() first
// and then refetch from Horizon (see services/stellar.js).
// ---------------------------------------------------------------------------
export function AppProvider({ children }) {
  const [perspective, setPerspective] = useState('store'); // 'store' | 'customer'
  const [activeId, setActiveId] = useState('tonyo');
  const [ledgers, setLedgers] = useState(INITIAL_LEDGER);
  const [account, setAccount] = useState(null); // { publicKey, secret } after onboarding

  const customers = useMemo(
    () =>
      CUSTOMERS.map((c) => ({
        ...c,
        balance: balanceOf(ledgers[c.id] || []),
      })),
    [ledgers]
  );

  const totalReceivable = useMemo(
    () => customers.reduce((a, c) => a + c.balance, 0),
    [customers]
  );

  const activeCustomer = customers.find((c) => c.id === activeId) || customers[0];
  const activeLedger = ledgers[activeId] || [];

  function nowStamp() {
    const d = new Date();
    const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
    const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    return { date, time };
  }

  function prepend(id, entry) {
    setLedgers((prev) => {
      const list = prev[id] ? [...prev[id]] : [];
      list.unshift(entry);
      return { ...prev, [id]: list };
    });
  }

  function addUtang(id, item, amount) {
    const { date, time } = nowStamp();
    prepend(id, {
      id: 'u' + Date.now(),
      item,
      amount: Number(amount),
      utang: true,
      date,
      time,
      txHash: 'pending…',
      ledger: null,
    });
  }

  function addBayad(id, amount) {
    const { date, time } = nowStamp();
    prepend(id, {
      id: 'b' + Date.now(),
      item: 'Bayad',
      amount: Number(amount),
      utang: false,
      date,
      time,
      txHash: 'pending…',
      ledger: null,
    });
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
