import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { priceTable } from "../lib/priceTable.js";

const OFF_API = "https://world.openfoodfacts.org/api/v2/product";
const CACHE_PREFIX = "lista_off_";

async function lookupBarcode(barcode) {
  const cached = sessionStorage.getItem(CACHE_PREFIX + barcode);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(`${OFF_API}/${barcode}.json`);
    const data = await res.json();
    const p = data.product;
    if (!p) return null;

    const nameParts = [p.product_name, p.quantity].filter(Boolean);
    const name = nameParts.join(" ").slice(0, 15).trimEnd();
    const result = { name: name || null };
    sessionStorage.setItem(CACHE_PREFIX + barcode, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

export default function BarcodeScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [status, setStatus] = useState("Starting camera…");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
        if (!result) return;

        reader.reset();
        const barcode = result.getText();
        setStatus(`Barcode: ${barcode} — looking up…`);

        const product = await lookupBarcode(barcode);
        const price = priceTable[barcode] ?? "";

        onResult({
          name: product?.name ?? "",
          price: price !== "" ? String(price) : "",
        });
      })
      .catch(() => {
        setStatus("Camera unavailable — use manual entry.");
      });

    setStatus("Itapat ang barcode sa camera…");

    return () => {
      readerRef.current?.reset();
    };
  }, []);

  return (
    <div className="scanner-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="scanner-box">
        <h3 style={{ textAlign: "center", marginBottom: 16 }}>I-scan ang Produkto</h3>
        <video ref={videoRef} className="scanner-video" />
        <p className="scanner-status-text">{status}</p>
        <button 
          onClick={onClose} 
          className="btn-connect"
          style={{ marginTop: 18, width: "100%", background: "var(--navy-deep)" }}
        >
          I-cancel / Ilagay Manwal
        </button>
      </div>
    </div>
  );
}
