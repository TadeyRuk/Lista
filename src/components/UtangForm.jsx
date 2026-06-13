import { useState } from "react";

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
    <form className="utang-form" onSubmit={handleSubmit}>
      <label>
        Item
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lucky Me Pancit Canton"
          maxLength={15}
          required
        />
      </label>
      <label>
        Price (₱)
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="18"
          min="0.01"
          step="0.01"
          required
        />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Add to Tab"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
