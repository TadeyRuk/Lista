import { useState } from "react";
import TabHistory from "../components/TabHistory.jsx";
import UtangForm from "../components/UtangForm.jsx";
import TxStatus from "../components/TxStatus.jsx";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
import { submitUtang, submitBayad, computeBalance } from "../lib/lista.js";
import { disconnectWallet } from "../lib/wallet.js";

export default function OwnerView({
  ownerKey,
  setOwnerKey,
  customer,
  tab,
  refreshTab,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const { totalUtang, totalBayad, outstanding } = computeBalance(tab);
  const short = (key) => `${key.slice(0, 6)}…${key.slice(-4)}`;

  function shareTab() {
    const url = new URL(window.location.href);
    url.searchParams.set("customer", customer.publicKey);
    url.searchParams.set("owner", ownerKey);
    navigator.clipboard.writeText(url.toString());
  }

  async function handleUtang({ name, price }) {
    const result = await submitUtang({
      ownerPublicKey: ownerKey,
      customerPublicKey: customer.publicKey,
      itemName: name,
      amountPhp: price,
    });
    setTxStatus(result);
    setShowForm(false);
    setScannedItem(null);
    if (result.success) await refreshTab();
  }

  async function handleMarkPayment(e) {
    e.preventDefault();
    if (!payAmount) return;
    const result = await submitBayad({
      customerSecret: customer.secretKey,
      ownerPublicKey: ownerKey,
      amountPhp: parseFloat(payAmount),
    });
    setTxStatus(result);
    setPayAmount("");
    if (result.success) await refreshTab();
  }

  function onScanResult({ name, price }) {
    setShowScanner(false);
    setScannedItem({ name, price });
    setShowForm(true);
  }

  return (
    <div className="view owner-view">
      <header className="view-header">
        <div>
          <h2>Aling Nena's Store</h2>
          <span className="address">{short(ownerKey)}</span>
        </div>
        <div className="header-actions">
          <button className="btn-share" onClick={shareTab}>Share Tab 🔗</button>
          <button className="btn-disconnect" onClick={() => disconnectWallet(setOwnerKey)}>
            Disconnect
          </button>
        </div>
      </header>

      <TxStatus status={txStatus} onDismiss={() => setTxStatus(null)} />

      <div className="action-bar">
        <button onClick={() => { setShowScanner(true); setShowForm(false); }}>
          📷 Scan Item
        </button>
        <button onClick={() => { setShowForm(!showForm); setScannedItem(null); setShowScanner(false); }}>
          + Manual Entry
        </button>
      </div>

      {showScanner && (
        <BarcodeScanner
          onResult={onScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showForm && (
        <UtangForm
          initialName={scannedItem?.name ?? ""}
          initialPrice={scannedItem?.price ?? ""}
          onSubmit={handleUtang}
          onCancel={() => { setShowForm(false); setScannedItem(null); }}
        />
      )}

      <section className="tab-section">
        <h3>Tab — {short(customer.publicKey)}</h3>
        <TabHistory entries={tab} />
        <div className="balance-row">
          <span>Total Utang: ₱{totalUtang.toFixed(2)}</span>
          <span>Total Bayad: ₱{totalBayad.toFixed(2)}</span>
          <strong>Outstanding: ₱{outstanding.toFixed(2)}</strong>
        </div>
      </section>

      <section className="payment-section">
        <h3>Mark Payment</h3>
        <form onSubmit={handleMarkPayment} className="pay-form">
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="₱ amount"
            min="0.01"
            step="0.01"
          />
          <button type="submit">Mark Bayad</button>
        </form>
      </section>
    </div>
  );
}
