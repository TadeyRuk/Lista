import { useState } from "react";
import TabHistory from "../components/TabHistory.jsx";
import TxStatus from "../components/TxStatus.jsx";
import ReceiptModal from "../components/ReceiptModal.jsx";
import { ShieldIcon, VerifiedBadge } from "../components/Shield.jsx";
import { submitBayad, computeBalance } from "../lib/lista.js";

export default function CustomerView({ 
  customer, 
  ownerKey, 
  tab, 
  refreshTab, 
  readOnly = false,
  onBackToOwner 
}) {
  const [payAmount, setPayAmount] = useState(0);
  const [txStatus, setTxStatus] = useState(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { outstanding } = computeBalance(tab);
  const short = (key) => key ? `${key.slice(0, 6)}…${key.slice(-4)}` : "…";
  const pesoFormat = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Share link generator
  function shareTab() {
    const url = new URL(window.location.href);
    url.searchParams.set("customer", customer.publicKey);
    url.searchParams.set("owner", ownerKey);
    navigator.clipboard.writeText(url.toString());
    alert("Nai-copy na ang link ng tab sa clipboard!");
  }

  // Handle direct suki payment
  async function handlePay() {
    setTxStatus(null);
    if (payAmount <= 0 || readOnly) return;
    
    const result = await submitBayad({
      customerSecret: customer.secretKey,
      ownerPublicKey: ownerKey,
      amountPhp: payAmount,
    });
    setTxStatus(result);
    setPayAmount(0);
    setShowPayForm(false);
    if (result.success) await refreshTab();
  }

  return (
    <div className="view">
      {/* Transaction status notifications */}
      <TxStatus status={txStatus} onDismiss={() => setTxStatus(null)} />

      {/* READ ONLY BANNER IN SHARE LINK MODE */}
      {readOnly && (
        <div className="readonly-banner">
          👁️ Naka-view mode (Shared Tab) · Rebuilt from Stellar Horizon
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="detail-header">
        {onBackToOwner && (
          <button className="btn-back" onClick={onBackToOwner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        <div className="header-title-container">
          <span className="header-title">Tindahan ni Aling Nena</span>
          <VerifiedBadge />
        </div>
        <span className="address" style={{ alignSelf: 'center' }}>
          Suki: {short(customer.publicKey)}
        </span>
      </div>

      {/* SCREEN FLOW: STANDARD TIMELINE OR KEYPAD FORM */}
      {!showPayForm ? (
        <>
          {/* Balance Hero block */}
          <div className="balance-wrap">
            <span className="balance-label">Utang ngayon</span>
            <span className={`balance-amount ${outstanding === 0 ? "balance-amount--zero" : ""}`} style={{ color: outstanding === 0 ? "var(--bayad)" : "var(--utang)" }}>
              {pesoFormat(outstanding)}
            </span>
          </div>

          {/* Suki self-payment actions */}
          {!readOnly && (
            <div className="tab-actions">
              <button 
                className="btn-tab btn-tab--bayad" 
                onClick={() => { setShowPayForm(true); setPayAmount(50); }}
                style={{ width: "100%" }}
              >
                Magbayad (Pay Now)
              </button>
            </div>
          )}

          {/* Trust Strip */}
          <div className="trust-strip">
            <ShieldIcon size={14} color="var(--navy)" />
            <p className="trust-text">
              Na-rebuild ang balanse mula sa <strong>{tab.length} Stellar transactions</strong>. Walang local database.
            </p>
          </div>

          {/* Timeline */}
          <div className="section-row" style={{ marginBottom: 12 }}>
            <span className="section-title">Timeline ng Aking Tab</span>
            <span className="section-link" onClick={shareTab}>I-share ang Tab 🔗</span>
          </div>

          <TabHistory 
            entries={tab} 
            onSelectEntry={(entry) => setSelectedReceipt(entry)}
          />
        </>
      ) : (
        /* SUKI PAYMENT FORM */
        <>
          {/* Suki info block */}
          <div style={{ display: 'flex', gap: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Magbayad kay Aling Nena · utang {pesoFormat(outstanding)}
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
              onClick={() => setPayAmount(outstanding)}
              style={{ background: payAmount === outstanding ? "var(--tint-navy)" : "#fff", borderColor: payAmount === outstanding ? "var(--navy)" : "var(--border-warm)" }}
            >
              Buong utang
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted-soft)", marginBottom: 16 }}>
            I-type ang halagang ibabayad mo
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

          {/* Action Button */}
          <button 
            className="btn-connect" 
            style={{ marginTop: 24, background: "var(--bayad)", color: "#fff" }}
            onClick={handlePay}
            disabled={payAmount <= 0}
          >
            I-submit ang bayad · {pesoFormat(payAmount)}
          </button>

          <button 
            className="btn-action-ghost" 
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => setShowPayForm(false)}
          >
            Bumalik sa Timeline
          </button>
        </>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <ReceiptModal
          entry={selectedReceipt}
          customer={customer}
          ownerKey={ownerKey}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
