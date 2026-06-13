// ---------------------------------------------------------------------------
// Open Food Facts lookup — turns a scanned barcode into product metadata so we
// can pre-fill the item name + suggest a price (graceful fallback to manual).
// ---------------------------------------------------------------------------
import { DEMO_PRODUCT } from '../data';

const API = 'https://world.openfoodfacts.org/api/v2/product';

export async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`${API}/${barcode}.json`, {
      headers: { 'User-Agent': 'Lista/1.0 (sari-sari ledger)' },
    });
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const name = p.product_name || p.generic_name || 'Unknown product';
    return {
      name,
      brand: [p.brands, p.quantity].filter(Boolean).join(' · '),
      barcode,
      image: p.image_front_small_url || p.image_url || null,
      // Open Food Facts has no PH retail price; leave it for the tindera to set.
      price: null,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 16),
    };
  } catch (e) {
    return null;
  }
}

// Used by the prototype's "Simulate scan" button.
export function demoProduct() {
  return { ...DEMO_PRODUCT, image: null };
}
