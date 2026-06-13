import React from 'react';

export default function TabHistory({ entries, onSelectEntry }) {
  if (!entries.length) {
    return <p className="empty-tab">Walang lista pa.</p>;
  }

  // Calculate running balances (newest-first)
  const balances = [];
  let acc = 0;
  // sum up from oldest (end of array) to newest (start of array)
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    acc += e.type === 'utang' ? e.amount : -e.amount;
    balances[i] = acc;
  }

  const pesoFormat = (amount) => '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="tx-timeline">
      {entries.map((e, index) => {
        const isUtang = e.type === 'utang';
        const colorClass = isUtang ? 'tx-amount--utang' : 'tx-amount--bayad';
        const iconClass = isUtang ? 'tx-icon--utang' : 'tx-icon--bayad';

        return (
          <div 
            key={e.hash} 
            className="tx-row" 
            onClick={() => onSelectEntry && onSelectEntry(e)}
          >
            <div className={`tx-icon ${iconClass}`}>
              {isUtang ? '↑' : '↓'}
            </div>

            <div className="tx-details">
              <div className="tx-item">{isUtang ? e.item : 'Bayad'}</div>
              <div className="tx-meta">
                {new Date(e.timestamp).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                {" · "}
                {new Date(e.timestamp).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>

            <div className="tx-values">
              <div className={`tx-amount ${colorClass}`}>
                {isUtang ? '+' : '−'}{pesoFormat(e.amount)}
              </div>
              <div className="tx-bal">
                Bal {pesoFormat(balances[index])}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
