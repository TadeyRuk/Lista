import React, { useState } from 'react';

export default function UtangForm({ initialName = "", initialPrice = "", onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSubmitting(true);
    await onSubmit({ name: name.trim(), price: parseFloat(price) });
    setSubmitting(false);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: 16 }}>Bagong Utang</h3>
      
      <div className="form-group">
        <label className="form-label">Item / Produkto</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lucky Me Pancit Canton"
          maxLength={15}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Halaga (₱)</label>
        <input
          type="number"
          className="form-input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="18.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: 20 }}>
        <button 
          type="submit" 
          disabled={submitting} 
          className="btn-connect" 
          style={{ flex: 1, padding: 12 }}
        >
          {submitting ? "Submitting…" : "I-lista"}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={submitting} 
            className="btn-action-ghost"
            style={{ flex: 1 }}
          >
            I-cancel
          </button>
        )}
      </div>
    </form>
  );
}
