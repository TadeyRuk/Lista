import React from 'react';

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

export default function TxStatus({ status, onDismiss }) {
  if (!status) return null;

  return (
    <div className={`status-alert ${status.success ? "" : "status-alert--error"}`}>
      <span>
        {status.success ? (
          <>
            ✓ Naisumite na! {" "}
            <a 
              href={`${EXPLORER_BASE}/${status.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "inherit", fontWeight: 700 }}
            >
              Tingnan ang Stellar Tx ↗
            </a>
          </>
        ) : (
          <>✗ Nagka-error: {status.error}</>
        )}
      </span>
      <button className="status-alert-dismiss" onClick={onDismiss}>✕</button>
    </div>
  );
}
