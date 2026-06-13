import { useState } from "react";
import TabHistory from "../components/TabHistory.jsx";
import TxStatus from "../components/TxStatus.jsx";
import { submitBayad, computeBalance } from "../lib/lista.js";

export default function CustomerView({ customer, ownerKey, tab, refreshTab, readOnly = false }) {
  const [payAmount, setPayAmount] = useState("");
  const [txStatus, setTxStatus] = useState(null);

  const { totalUtang, totalBayad, outstanding } = computeBalance(tab);
  const short = (key) => `${key.slice(0, 6)}…${key.slice(-4)}`;

  function shareTab() {
    const url = new URL(window.location.href);
    url.searchParams.set("customer", customer.publicKey);
    url.searchParams.set("owner", ownerKey);
    navigator.clipboard.writeText(url.toString());
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!payAmount || readOnly) return;
    const result = await submitBayad({
      customerSecret: customer.secretKey,
      ownerPublicKey: ownerKey,
      amountPhp: parseFloat(payAmount),
    });
    setTxStatus(result);
    setPayAmount("");
    if (result.success) await refreshTab();
  }

  return (
    <div className="view customer-view">
      <header className="view-header">
        <div>
          <h2>Your Tab at {short(ownerKey)}</h2>
          <span className="address">{short(customer.publicKey)}</span>
        </div>
        <button className="btn-share" onClick={shareTab}>Share Tab 🔗</button>
      </header>

      {readOnly && (
        <div className="readonly-banner">
          Read-only view — reconstructed from Stellar Horizon
        </div>
      )}

      <TxStatus status={txStatus} onDismiss={() => setTxStatus(null)} />

      <TabHistory entries={tab} />

      <div className="balance-row">
        <span>Total Utang: ₱{totalUtang.toFixed(2)}</span>
        <span>Total Bayad: ₱{totalBayad.toFixed(2)}</span>
        <strong>Outstanding: ₱{outstanding.toFixed(2)}</strong>
      </div>

      {!readOnly && (
        <section className="payment-section">
          <h3>💸 Bayad / Pay</h3>
          <form onSubmit={handlePay} className="pay-form">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="₱ amount"
              min="0.01"
              step="0.01"
            />
            <button type="submit">Pay Now</button>
          </form>
        </section>
      )}
    </div>
  );
}
