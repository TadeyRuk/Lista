import React, { createContext, useContext, useMemo, useState } from 'react';
import { CUSTOMERS, INITIAL_LEDGER, balanceOf } from '../data';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ---------------------------------------------------------------------------
// Central store: perspective (tindera/suki), user role, user name, the active
// suki, and the local ledger map. addUtang / addBayad optimistically prepend
// an entry and also trigger a notification for the suki.
// ---------------------------------------------------------------------------

const INITIAL_NOTIFICATIONS = {
  tonyo: [
    { id: 'n1', title: 'Bagong Utang: Surf Powder Sachet', body: 'Idinagdag ni Aling Nena ang Surf Powder Sachet (\u20B192) sa iyong listahan.', date: 'Jun 13', time: '7:42 AM', read: false, type: 'utang', amount: 92 },
    { id: 'n2', title: 'Bagong Utang: Nescafé Original 3-in-1', body: 'Idinagdag ni Aling Nena ang Nescafé Original 3-in-1 (\u20B160) sa iyong listahan.', date: 'Jun 12', time: '5:18 PM', read: true, type: 'utang', amount: 60 },
    { id: 'n3', title: 'Bayad Confirmed', body: 'Natanggap ni Aling Nena ang iyong bayad na \u20B1100.', date: 'Jun 6', time: '11:20 AM', read: true, type: 'bayad', amount: 100 },
  ],
  vangie: [
    { id: 'n_v1', title: 'Bagong Utang: Groceries', body: 'Idinagdag ni Aling Nena ang Groceries (\u20B1512) sa iyong listahan.', date: 'Jun 12', time: '4:10 PM', read: false, type: 'utang', amount: 512 }
  ],
  charing: [
    { id: 'n_c1', title: 'Bagong Utang: Gamot + suka', body: 'Idinagdag ni Aling Nena ang Gamot + suka (\u20B1128) sa iyong listahan.', date: 'Jun 11', time: '8:00 AM', read: false, type: 'utang', amount: 128 }
  ],
  boyet: [
    { id: 'n_b1', title: 'Bagong Utang: Yosi + kape', body: 'Idinagdag ni Aling Nena ang Yosi + kape (\u20B185) sa iyong listahan.', date: 'Jun 12', time: '6:30 AM', read: false, type: 'utang', amount: 85 }
  ],
  jun: [
    { id: 'n_j1', title: 'Bayad Confirmed', body: 'Natanggap ni Aling Nena ang iyong bayad na \u20B1200.', date: 'Jun 9', time: '5:00 PM', read: false, type: 'bayad', amount: 200 },
    { id: 'n_j2', title: 'Bagong Utang: Materyales', body: 'Idinagdag ni Aling Nena ang Materyales (\u20B1200) sa iyong listahan.', date: 'Jun 5', time: '7:15 AM', read: true, type: 'utang', amount: 200 }
  ]
};

export function AppProvider({ children }) {
  const [role, setRole] = useState('store'); // 'store' | 'buyer'
  const [userName, setUserName] = useState("Aling Nena's Sari-Sari");
  const [perspective, setPerspective] = useState('store'); // 'store' | 'customer'
  const [activeId, setActiveId] = useState('tonyo');
  const [ledgers, setLedgers] = useState(INITIAL_LEDGER);
  const [account, setAccount] = useState(null); // { publicKey, secret } after onboarding
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

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
      txHash: 'pending\u2026',
      ledger: null,
    });

    // Notify the customer
    setNotifications((prev) => {
      const list = prev[id] ? [...prev[id]] : [];
      list.unshift({
        id: 'n_' + Date.now(),
        title: `Bagong Utang: ${item}`,
        body: `Idinagdag ni Aling Nena ang ${item} (\u20B1${amount}) sa iyong listahan.`,
        date,
        time,
        read: false,
        type: 'utang',
        amount: Number(amount),
      });
      return { ...prev, [id]: list };
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
      txHash: 'pending\u2026',
      ledger: null,
    });

    // Notify the customer
    setNotifications((prev) => {
      const list = prev[id] ? [...prev[id]] : [];
      list.unshift({
        id: 'n_' + Date.now(),
        title: 'Bayad Confirmed',
        body: `Natanggap ni Aling Nena ang iyong bayad na \u20B1${amount}. Nabawasan ang iyong kabuuang utang.`,
        date,
        time,
        read: false,
        type: 'bayad',
        amount: Number(amount),
      });
      return { ...prev, [id]: list };
    });
  }

  function markNotificationsAsRead(id) {
    setNotifications((prev) => {
      const list = prev[id] ? prev[id].map((n) => ({ ...n, read: true })) : [];
      return { ...prev, [id]: list };
    });
  }

  function sendSmsReminder(id) {
    const { date, time } = nowStamp();
    setNotifications((prev) => {
      const list = prev[id] ? [...prev[id]] : [];
      list.unshift({
        id: 'n_' + Date.now(),
        title: 'Paalala sa Utang (SMS Sent)',
        body: `Nagpadala si Aling Nena ng paalala sa iyong SMS tungkol sa utang mo na nagkakahalaga ng \u20B1${balanceOf(ledgers[id] || [])}.`,
        date,
        time,
        read: false,
        type: 'utang',
        amount: balanceOf(ledgers[id] || []),
      });
      return { ...prev, [id]: list };
    });
  }

  const value = {
    role,
    setRole,
    userName,
    setUserName,
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
    notifications,
    setNotifications,
    markNotificationsAsRead,
    sendSmsReminder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
