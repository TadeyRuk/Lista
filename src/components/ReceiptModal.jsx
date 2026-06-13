import React from 'react';
import { ShieldIcon } from './Shield';

export default function ReceiptModal({ entry, customer, ownerKey, onClose }) {
  if (!entry) return null;

  const isUtang = entry.type === 'utang';
  const slug = (entry.item || 'bayad').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 16);
  
  // Build expected LISTA memo string
  const memoString = isUtang 
    ? `LISTA:u:${slug}:${entry.amount}` 
    : `LISTA:b:${entry.amount}`;

  const short = (key) => key ? `${key.slice(0, 6)}…${key.slice(-4)}` : '…';
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${entry.hash}`;

  return (
    <div className="receipt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="receipt-modal">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px 0', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>Resibo</span>
          <button className="btn-action-ghost" onClick={onClose} style={{ border: 'none', padding: '4px', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="receipt-card">
          {/* Verified Header */}
          <div className="verify-head">
            <div className="shield-circle">
              <ShieldIcon size={24} color="var(--bayad)" />
            </div>
            <div className="verify-title">Verified on Stellar Testnet</div>
            <div className="verify-sub">Tamper-evident · hindi na mababago</div>
          </div>

          <div className="receipt-divider"></div>

          {/* Details */}
          <div className="receipt-rows">
            <div className="receipt-row">
              <span className="receipt-k">Uri</span>
              <span className={`receipt-v ${isUtang ? 'receipt-v--utang' : 'receipt-v--bayad'}`}>
                {isUtang ? 'Utang' : 'Bayad'}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Item</span>
              <span className="receipt-v">{entry.item || 'Bayad'}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Halaga</span>
              <span className="receipt-v receipt-v--mono" style={{ fontSize: '1.15rem', color: isUtang ? 'var(--utang)' : 'var(--bayad)' }}>
                ₱{entry.amount.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
              <span className="receipt-k">Memo (Stellar Text Memo)</span>
              <div className="receipt-memo">{memoString}</div>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Mula (tindera)</span>
              <span className="receipt-v receipt-v--mono">{short(ownerKey)}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Para kay (suki)</span>
              <span className="receipt-v receipt-v--mono">{short(customer.publicKey)}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Tx hash</span>
              <span className="receipt-v receipt-v--mono" style={{ fontSize: '0.8rem' }}>
                {short(entry.hash)}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Petsa</span>
              <span className="receipt-v">{new Date(entry.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-k">Network fee</span>
              <span className="receipt-v receipt-v--mono">0.00001 XLM</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* External Link */}
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="btn-explorer">
            Buksan sa Stellar Expert ↗
          </a>
        </div>
      </div>
    </div>
  );
}
