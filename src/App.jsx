import { useState, useEffect, useCallback } from "react";
import {
  isFreighterAvailable,
  connectWallet,
  getConnectedKey,
  fetchBalance,
} from "./lib/wallet.js";
import { initCustomer } from "./lib/customerKeypair.js";
import { fetchTab } from "./lib/lista.js";
import OwnerView from "./views/OwnerView.jsx";
import CustomerView from "./views/CustomerView.jsx";

export default function App() {
  const [ownerKey, setOwnerKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [tab, setTab] = useState([]);
  const [activeView, setActiveView] = useState("owner");
  const [freighterOk, setFreighterOk] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

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
        .then(setTab)
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
    setTab(entries);
  }, [customer, ownerKey]);

  useEffect(() => {
    if (ownerKey && customer) refreshTab();
  }, [ownerKey, customer]);

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
          tab={tab}
          refreshTab={() => fetchTab(sharedCustomer, sharedOwner).then(setTab)}
          readOnly
        />
      </main>
    );
  }

  if (!ownerKey) {
    return (
      <main className="app connect-screen">
        <div className="connect-card">
          <h1>📒 Lista</h1>
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
      <nav className="view-tabs">
        <button
          className={activeView === "owner" ? "active" : ""}
          onClick={() => setActiveView("owner")}
        >
          Owner View
        </button>
        <button
          className={activeView === "customer" ? "active" : ""}
          onClick={() => setActiveView("customer")}
        >
          Customer View
        </button>
        {balance && (
          <span className="balance-chip">
            XLM {parseFloat(balance.xlm).toFixed(2)}
          </span>
        )}
      </nav>

      {activeView === "owner" && customer ? (
        <OwnerView
          ownerKey={ownerKey}
          setOwnerKey={setOwnerKey}
          customer={customer}
          tab={tab}
          refreshTab={refreshTab}
        />
      ) : (
        customer && (
          <CustomerView
            customer={customer}
            ownerKey={ownerKey}
            tab={tab}
            refreshTab={refreshTab}
          />
        )
      )}
    </main>
  );
}
