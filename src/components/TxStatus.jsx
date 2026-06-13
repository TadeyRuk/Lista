const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

export default function TxStatus({ status, onDismiss }) {
  if (!status) return null;

  return (
    <div className={`tx-status tx-status--${status.success ? "ok" : "err"}`}>
      {status.success ? (
        <>
          ✓ Submitted:{" "}
          <a href={`${EXPLORER_BASE}/${status.hash}`} target="_blank" rel="noopener noreferrer">
            {status.hash.slice(0, 12)}…
          </a>
        </>
      ) : (
        <>✗ Failed: {status.error}</>
      )}
      <button className="dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}
