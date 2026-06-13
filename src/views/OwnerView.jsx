import { useState } from "react";
import TabHistory from "../components/TabHistory.jsx";
import UtangForm from "../components/UtangForm.jsx";
import TxStatus from "../components/TxStatus.jsx";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
import ReceiptModal from "../components/ReceiptModal.jsx";
import SunMark from "../components/SunMark.jsx";
import { ShieldIcon, VerifiedBadge } from "../components/Shield.jsx";
import { submitUtang, submitBayad } from "../lib/lista.js";
import { disconnectWallet } from "../lib/wallet.js";

export default function OwnerView({
  ownerKey,
  setOwnerKey,
  customer,
  customers,
  totalReceivable,
  tonyoLedger,
  refreshTab,
  ledgers,
  setLedgers,
  onSwitchPerspective,
}) {
  const [screen, setScreen] = useState("dashboard"); // "dashboard" | "tab-viewer" | "utang-form" | "bayad-form"
  const [activeCustId, setActiveCustId] = useState("tonyo");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Keypad state
  const [payAmount, setPayAmount] = useState(0);

  const activeCustomer = customers.find((c) => c.id === activeCustId) || customers[0];

  // Get active ledger (real for tonyo, mock for others)
  const activeLedger = activeCustId === "tonyo" ? tonyoLedger : (ledgers[activeCustId] || []);

  const short = (key) => key ? `${key.slice(0, 6)}…${key.slice(-4)}` : "…";
  const pesoFormat = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Share link generator
  function shareTab() {
    const url = new URL(window.location.href);
    url.searchParams.set("customer", activeCustId === "tonyo" ? customer.publicKey : activeCustomer.walletShort);
    url.searchParams.set("owner", ownerKey);
    navigator.clipboard.writeText(url.toString());
    alert("Nai-copy na ang link ng tab sa clipboard!");
  }

  // Handle adding an utang (credit) entry
  async function handleUtang({ name, price }) {
    setTxStatus(null);
    if (activeCustId === "tonyo") {
      const result = await submitUtang({
        ownerPublicKey: ownerKey,
        customerPublicKey: customer.publicKey,
        itemName: name,
        amountPhp: price,
      });
      setTxStatus(result);
      if (result.success) await refreshTab();
    } else {
      // Mock local update
      const newEntry = {
        hash: "mock_" + Math.random().toString(36).substring(2, 10),
        type: "utang",
        item: name,
        amount: parseFloat(price),
        timestamp: new Date().toISOString()
      };
      setLedgers(prev => ({
        ...prev,
        [activeCustId]: [newEntry, ...(prev[activeCustId] || [])]
      }));
      setTxStatus({ success: true, hash: newEntry.hash });
    }
    setScreen("tab-viewer");
    setScannedItem(null);
  }

  // Handle marking a payment (bayad)
  async function handleMarkPayment() {
    setTxStatus(null);
    if (payAmount <= 0) return;

    if (activeCustId === "tonyo") {
      const result = await submitBayad({
        customerSecret: customer.secretKey,
        ownerPublicKey: ownerKey,
        amountPhp: payAmount,
      });
      setTxStatus(result);
      if (result.success) await refreshTab();
    } else {
      // Mock local update
      const newEntry = {
        hash: "mock_" + Math.random().toString(36).substring(2, 10),
        type: "bayad",
        item: null,
        amount: payAmount,
        timestamp: new Date().toISOString()
      };
      setLedgers(prev => ({
        ...prev,
        [activeCustId]: [newEntry, ...(prev[activeCustId] || [])]
      }));
      setTxStatus({ success: true, hash: newEntry.hash });
    }
    setScreen("tab-viewer");
    setPayAmount(0);
  }

  // Barcode scanned result
  function onScanResult({ name, price }) {
    setShowScanner(false);
    setScannedItem({ name, price });
    setScreen("utang-form");
  }

  function openCustomerTab(id) {
    setActiveCustId(id);
    setScreen("tab-viewer");
  }

  return (
    <div className="view">
      {/* TRANSACTION STATE NOTIFICATION */}
      <TxStatus status={txStatus} onDismiss={() => setTxStatus(null)} />

      {/* DASHBOARD VIEW */}
      {screen === "dashboard" && (
        <>
          {/* Greeting Header */}
          <div className="greet-row">
            <div className="greet-text">
              <span className="greet-small">Magandang umaga,</span>
              <span className="store-name">Aling Nena's Store</span>
            </div>
            <div className="logo-circle">
              <SunMark size={22} ray="var(--gold)" core="var(--navy)" />
            </div>
          </div>

          {/* Hero Banner */}
          <div className="hero">
            <div className="hero-watermark">
              <SunMark size={140} ray="rgba(244, 181, 60, 0.13)" core="rgba(244, 181, 60, 0.13)" />
            </div>
            <div className="hero-label">Makukolekta lahat</div>
            <div className="hero-amount">{pesoFormat(totalReceivable)}</div>
            <div className="hero-meta-row">
              <span>{customers.length} suki · {activeLedger.length + 8} transaksyon · </span>
              <ShieldIcon size={12} color="#8FE3C0" />
              <span style={{ color: "#8FE3C0", marginLeft: 4 }}>on-chain</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-bar">
            <div className="action-btn action-btn--scan" onClick={() => setShowScanner(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.1" strokeLinecap="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                <path d="M3 12h18" />
              </svg>
              <span>I-scan</span>
            </div>
            <div className="action-btn" onClick={() => setScreen("utang-form")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.1" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Bagong utang</span>
            </div>
            <div className="action-btn" onClick={() => openCustomerTab("tonyo")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.1" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              <span>Mga lista</span>
            </div>
          </div>

          {/* Suki Customer List */}
          <div className="section-row">
            <span className="section-title">Mga suki</span>
            <span className="section-link">Tingnan lahat</span>
          </div>

          <div className="suki-list">
            {customers.map((c) => (
              <div key={c.id} className="suki-row" onClick={() => openCustomerTab(c.id)}>
                <div className="avatar" style={{ backgroundColor: c.avatarBg }}>
                  {c.initial}
                </div>
                <div className="suki-info">
                  <div className="suki-name">{c.name}</div>
                  <div className="suki-sub">{c.sub}</div>
                </div>
                <div className={`suki-bal ${c.balance === 0 ? "suki-bal--zero" : ""}`} style={{ color: c.balance === 0 ? "var(--bayad)" : "var(--utang)" }}>
                  {c.balance === 0 ? "Bayad na" : pesoFormat(c.balance)}
                </div>
              </div>
            ))}
          </div>

          {/* Switch perspective row */}
          <div className="switch-row" onClick={onSwitchPerspective}>
            <span className="switch-text">👤 Tingnan bilang suki (Mang Tonyo) →</span>
          </div>
        </>
      )}

      {/* CUSTOMER TAB DETAILS (TAB VIEWER) */}
      {screen === "tab-viewer" && (
        <>
          {/* Header */}
          <div className="detail-header">
            <button className="btn-back" onClick={() => setScreen("dashboard")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div className="header-title-container">
              <span className="header-title">{activeCustomer.name}</span>
              <VerifiedBadge />
            </div>
            <button className="btn-disconnect" onClick={() => disconnectWallet(setOwnerKey)}>
              Disconnect
            </button>
          </div>

          {/* Balance Hero block */}
          <div className="balance-wrap">
            <span className="balance-label">Utang ngayon</span>
            <span className={`balance-amount ${activeCustomer.balance === 0 ? "balance-amount--zero" : ""}`} style={{ color: activeCustomer.balance === 0 ? "var(--bayad)" : "var(--utang)" }}>
              {pesoFormat(activeCustomer.balance)}
            </span>
          </div>

          {/* Actions */}
          <div className="tab-actions">
            <button className="btn-tab btn-tab--bayad" onClick={() => { setScreen("bayad-form"); setPayAmount(100); }}>
              Bayad
            </button>
            <button className="btn-tab btn-tab--utang" onClick={() => setScreen("utang-form")}>
              Dagdag utang
            </button>
          </div>

          {/* Trust Strip */}
          <div className="trust-strip">
            <ShieldIcon size={14} color="var(--navy)" />
            <p className="trust-text">
              Na-rebuild ang balanse mula sa <strong>{activeLedger.length} Stellar transactions</strong>. Walang local database.
            </p>
          </div>

          {/* Timeline */}
          <div className="section-row" style={{ marginBottom: 12 }}>
            <span className="section-title">Timeline ng Tab</span>
            <span className="section-link" onClick={shareTab}>I-share ang Tab 🔗</span>
          </div>

          <TabHistory 
            entries={activeLedger} 
            onSelectEntry={(entry) => setSelectedReceipt(entry)}
          />
        </>
      )}

      {/* UTANG FORM VIEW */}
      {screen === "utang-form" && (
        <>
          <div className="detail-header">
            <button className="btn-back" onClick={() => setScreen("tab-viewer")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="header-title">Dagdag utang</span>
          </div>

          <UtangForm
            initialName={scannedItem?.name ?? ""}
            initialPrice={scannedItem?.price ?? ""}
            onSubmit={handleUtang}
            onCancel={() => { setScreen("tab-viewer"); setScannedItem(null); }}
          />
        </>
      )}

      {/* BAYAD KEYPAD FORM VIEW */}
      {screen === "bayad-form" && (
        <>
          <div className="detail-header">
            <button className="btn-back" onClick={() => setScreen("tab-viewer")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="header-title">Tanggapin ang bayad</span>
          </div>

          {/* Suki display */}
          <div style={{ display: 'flex', gap: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <div className="avatar" style={{ backgroundColor: activeCustomer.avatarBg, width: 34, height: 34, fontSize: '0.95rem' }}>
              {activeCustomer.initial}
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {activeCustomer.name} · utang {pesoFormat(activeCustomer.balance)}
            </span>
          </div>

          {/* Amount Display */}
          <div className="balance-wrap" style={{ paddingTop: 10 }}>
            <span className="balance-label">Halaga ng bayad</span>
            <span className="balance-amount" style={{ color: "var(--bayad)", fontSize: "3.2rem" }}>
              {pesoFormat(payAmount)}
            </span>
          </div>

          {/* Shortcut Chips */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: 16 }}>
            <button 
              className="btn-action-ghost" 
              onClick={() => setPayAmount(50)}
              style={{ background: payAmount === 50 ? "var(--tint-navy)" : "#fff", borderColor: payAmount === 50 ? "var(--navy)" : "var(--border-warm)" }}
            >
              ₱50
            </button>
            <button 
              className="btn-action-ghost" 
              onClick={() => setPayAmount(100)}
              style={{ background: payAmount === 100 ? "var(--tint-navy)" : "#fff", borderColor: payAmount === 100 ? "var(--navy)" : "var(--border-warm)" }}
            >
              ₱100
            </button>
            <button 
              className="btn-action-ghost" 
              onClick={() => setPayAmount(activeCustomer.balance)}
              style={{ background: payAmount === activeCustomer.balance ? "var(--tint-navy)" : "#fff", borderColor: payAmount === activeCustomer.balance ? "var(--navy)" : "var(--border-warm)" }}
            >
              Buong utang
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted-soft)", marginBottom: 16 }}>
            I-type ang halagang binayad ng suki
          </div>

          {/* Keypad Grid */}
          <div className="keypad-grid">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((val) => (
              <div 
                key={val} 
                className="keypad-btn" 
                onClick={() => {
                  if (val === "C") {
                    setPayAmount(0);
                  } else if (val === "⌫") {
                    setPayAmount(cur => Math.floor(cur / 10));
                  } else {
                    setPayAmount(cur => Math.min(cur * 10 + Number(val), 99999));
                  }
                }}
              >
                {val}
              </div>
            ))}
          </div>

          {/* Action Footer Button */}
          <button 
            className="btn-connect" 
            style={{ marginTop: 24, background: "var(--bayad)", color: "#fff" }}
            onClick={handleMarkPayment}
            disabled={payAmount <= 0}
          >
            Tanggapin ang bayad · {pesoFormat(payAmount)}
          </button>
        </>
      )}

      {/* CAMERA BARCODE SCANNER OVERLAY */}
      {showScanner && (
        <BarcodeScanner
          onResult={onScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* RESIBO RECEIPT MODAL */}
      {selectedReceipt && (
        <ReceiptModal
          entry={selectedReceipt}
          customer={activeCustomer.id === "tonyo" ? customer : { publicKey: activeCustomer.walletShort }}
          ownerKey={ownerKey}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
