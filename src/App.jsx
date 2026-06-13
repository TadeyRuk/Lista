import { useState, useEffect, useCallback, useMemo } from "react";
import {
  isFreighterAvailable,
  connectWallet,
  getConnectedKey,
  fetchBalance,
} from "./lib/wallet.js";
import { initCustomer } from "./lib/customerKeypair.js";
import { fetchTab, computeBalance } from "./lib/lista.js";
import OwnerView from "./views/OwnerView.jsx";
import CustomerView from "./views/CustomerView.jsx";
import SunMark from "./components/SunMark.jsx";

const CUSTOMERS = [
  { id: 'tonyo',   initial: 'T', name: 'Mang Tonyo',   sub: 'Tricycle driver · Active', avatarBg: '#20306E', walletShort: 'G…9B1C', real: true },
  { id: 'vangie',  initial: 'V', name: 'Ate Vangie',   sub: 'Kapitbahay · Kahapon',          avatarBg: '#C2603F', walletShort: 'G…7D03' },
  { id: 'charing', initial: 'C', name: 'Lola Charing', sub: 'Suki · Jun 11',                  avatarBg: '#1F9D6B', walletShort: 'G…2E88' },
  { id: 'boyet',   initial: 'B', name: 'Boyet',        sub: 'Kanto store · Jun 12',           avatarBg: '#7A4FB0', walletShort: 'G…5A41' },
  { id: 'jun',     initial: 'J', name: 'Kuya Jun',     sub: 'Construction · Jun 9',           avatarBg: '#9A8FA8', walletShort: 'G…0FC7' },
];

export default function App() {
  const [ownerKey, setOwnerKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [tonyoLedger, setTonyoLedger] = useState([]);
  const [activeView, setActiveView] = useState("owner"); // "owner" | "customer"
  const [freighterOk, setFreighterOk] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Mock ledgers state
  const [ledgers, setLedgers] = useState({
    tonyo: [],
    vangie:  [{ id: 'v1', type: 'utang', item: 'Groceries', amount: 512, timestamp: '2026-06-12T16:10:00Z', hash: '11aa22bb' }],
    charing: [{ id: 'c1', type: 'utang', item: 'Gamot + suka', amount: 128, timestamp: '2026-06-11T08:00:00Z', hash: '33cc44dd' }],
    boyet:   [{ id: 'b1', type: 'utang', item: 'Yosi + kape', amount: 85, timestamp: '2026-06-12T06:30:00Z', hash: '55ee66ff' }],
    jun: [
      { id: 'j2', type: 'bayad', item: 'Bayad', amount: 200, timestamp: '2026-06-09T17:00:00Z', hash: '77gg88hh' },
      { id: 'j1', type: 'utang', item: 'Materyales', amount: 200, timestamp: '2026-06-05T07:15:00Z', hash: '99ii00jj' }
    ],
  });

  // Shared-link mode: ?customer=G...&owner=G...
  const params = new URLSearchParams(window.location.search);
  const sharedCustomer = params.get("customer");
  const sharedOwner = params.get("owner");
  const isSharedView = !!(sharedCustomer && sharedOwner);

  useEffect(() => {
    isFreighterAvailable().then(setFreighterOk);

    if (isSharedView) {
      const fakeCustomer = { publicKey: sharedCustomer, secretKey: null };
      setCustomer(fakeCustomer);
      fetchTab(sharedCustomer, sharedOwner)
        .then(setTonyoLedger)
        .catch((e) => setError(e.message));
      return;
    }

    initCustomer()
      .then(setCustomer)
      .catch((e) => setError(`Customer init failed: ${e.message}`));

    getConnectedKey().then((key) => {
      if (key) setOwnerKey(key);
    });
  }, []);

  useEffect(() => {
    if (!ownerKey) return;
    fetchBalance(ownerKey)
      .then(setBalance)
      .catch(() => setBalance(null));
  }, [ownerKey]);

  const refreshTab = useCallback(async () => {
    if (!customer || !ownerKey) return;
    const entries = await fetchTab(customer.publicKey, ownerKey);
    setTonyoLedger(entries);
  }, [customer, ownerKey]);

  useEffect(() => {
    if (ownerKey && customer) refreshTab();
  }, [ownerKey, customer]);

  const shortKey = (key) => key ? `${key.slice(0, 6)}…${key.slice(-4)}` : '…';

  // Compute suki list dynamically incorporating Tonyo's real ledger
  const customers = useMemo(() => {
    return CUSTOMERS.map(c => {
      if (c.id === 'tonyo' && customer) {
        const { outstanding } = computeBalance(tonyoLedger);
        return {
          ...c,
          walletShort: shortKey(customer.publicKey),
          balance: outstanding
        };
      }
      const list = ledgers[c.id] || [];
      const balance = list.reduce((sum, e) => sum + (e.type === 'utang' ? e.amount : -e.amount), 0);
      return { ...c, balance };
    });
  }, [customer, tonyoLedger, ledgers]);

  // Compute total receivable across all customers
  const totalReceivable = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.balance, 0);
  }, [customers]);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const key = await connectWallet();
      setOwnerKey(key);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  }

  if (isSharedView && customer) {
    return (
      <main className="app">
        <CustomerView
          customer={customer}
          ownerKey={sharedOwner}
          tab={tonyoLedger}
          refreshTab={() => fetchTab(sharedCustomer, sharedOwner).then(setTonyoLedger)}
          readOnly
          onBackToOwner={null}
        />
      </main>
    );
  }

  if (!ownerKey) {
    return (
      <main className="app connect-screen">
        <div className="connect-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SunMark size={70} ray="var(--gold)" core="var(--navy)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Lista</h1>
          <p>On-chain sari-sari store credit on Stellar</p>

          {freighterOk === false && (
            <p className="error">
              Freighter wallet not installed.{" "}
              <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">
                Install it here.
              </a>
            </p>
          )}

          {error && <p className="error">{error}</p>}

          <button
            className="btn-connect"
            onClick={handleConnect}
            disabled={connecting || freighterOk === false}
          >
            {connecting ? "Connecting…" : "Connect Freighter Wallet"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      {activeView === "owner" ? (
        <OwnerView
          ownerKey={ownerKey}
          setOwnerKey={setOwnerKey}
          customer={customer}
          customers={customers}
          totalReceivable={totalReceivable}
          tonyoLedger={tonyoLedger}
          refreshTab={refreshTab}
          ledgers={ledgers}
          setLedgers={setLedgers}
          onSwitchPerspective={() => setActiveView("customer")}
        />
      ) : (
        customer && (
          <CustomerView
            customer={customer}
            ownerKey={ownerKey}
            tab={tonyoLedger}
            refreshTab={refreshTab}
            onBackToOwner={() => setActiveView("owner")}
          />
        )
      )}
    </main>
  );
}
