const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

export default function TabHistory({ entries }) {
  if (!entries.length) {
    return <p className="empty-tab">No transactions yet.</p>;
  }

  return (
    <ul className="tab-history">
      {entries.map((e) => (
        <li key={e.hash} className={`tab-entry tab-entry--${e.type}`}>
          <span className="entry-label">
            {e.type === "utang" ? `📦 ${e.item}` : "💸 Bayad"}
          </span>
          <span className="entry-amount">
            {e.type === "utang" ? `+₱${e.amount}` : `-₱${e.amount}`}
          </span>
          <span className="entry-meta">
            <time>{new Date(e.timestamp).toLocaleString("en-PH")}</time>
            {" · "}
            <a
              href={`${EXPLORER_BASE}/${e.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              {e.hash.slice(0, 8)}…
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}
