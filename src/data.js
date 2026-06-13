// ---------------------------------------------------------------------------
// Demo data — sari-sari store (Aling Nena's) + suki ledgers.
// In production these are reconstructed from the Stellar Horizon API
// (see src/services/stellar.js -> fetchLedger). Here we seed local state so
// the prototype is fully interactive offline.
// ---------------------------------------------------------------------------

export const STORE = {
  name: "Aling Nena's Sari-Sari",
  // Truncated for display; the real keypair is generated/funded at onboarding.
  walletShort: 'G…A4F2',
};

export const CUSTOMERS = [
  { id: 'tonyo',   initial: 'T', name: 'Mang Tonyo',   sub: 'Tricycle driver \u00B7 2 oras ago', avatarBg: '#20306E', walletShort: 'G\u20269B1C', phone: '+639123456789' },
  { id: 'vangie',  initial: 'V', name: 'Ate Vangie',   sub: 'Kapitbahay \u00B7 Kahapon',          avatarBg: '#C2603F', walletShort: 'G\u20267D03', phone: '+639234567890' },
  { id: 'charing', initial: 'C', name: 'Lola Charing', sub: 'Suki \u00B7 Jun 11',                  avatarBg: '#1F9D6B', walletShort: 'G\u20262E88', phone: '+639345678901' },
  { id: 'boyet',   initial: 'B', name: 'Boyet',        sub: 'Kanto store \u00B7 Jun 12',           avatarBg: '#7A4FB0', walletShort: 'G\u20265A41', phone: '+639456789012' },
  { id: 'jun',     initial: 'J', name: 'Kuya Jun',     sub: 'Construction \u00B7 Jun 9',           avatarBg: '#9A8FA8', walletShort: 'G\u20260FC7', phone: '+639567890123' },
];

// Each entry: { id, item, amount, utang, date, time, txHash, ledger }
// utang:true  -> credit taken (balance up)
// utang:false -> payment / bayad (balance down)
export const INITIAL_LEDGER = {
  tonyo: [
    { id: 't8', item: 'Surf Powder Sachet',        amount: 92,  utang: true,  date: 'Jun 13', time: '7:42 AM',  txHash: 'a1c4…77ef', ledger: 2481640 },
    { id: 't7', item: 'Nescafé Original 3-in-1',   amount: 60,  utang: true,  date: 'Jun 12', time: '5:18 PM',  txHash: 'd9b2…11aa', ledger: 2481520 },
    { id: 't6', item: 'Coca-Cola Sakto ×6',        amount: 78,  utang: true,  date: 'Jun 11', time: '1:05 PM',  txHash: 'f3e8…90c1', ledger: 2481410 },
    { id: 't5', item: 'Kopiko Brown ×2',           amount: 24,  utang: true,  date: 'Jun 9',  time: '9:30 AM',  txHash: 'c7a1…3b5d', ledger: 2481290 },
    { id: 't4', item: 'Lucky Me Pancit Canton ×4', amount: 60,  utang: true,  date: 'Jun 8',  time: '6:12 PM',  txHash: 'b3f7…91ac', ledger: 2481093 },
    { id: 't3', item: 'Bayad',                     amount: 100, utang: false, date: 'Jun 6',  time: '11:20 AM', txHash: 'e2d5…44f0', ledger: 2480870 },
    { id: 't2', item: 'Argentina Corned Beef',     amount: 38,  utang: true,  date: 'Jun 4',  time: '4:45 PM',  txHash: 'a8c0…2e19', ledger: 2480640 },
    { id: 't1', item: 'Bear Brand Powder',         amount: 88,  utang: true,  date: 'Jun 2',  time: '8:03 AM',  txHash: '90fa…7c63', ledger: 2480410 },
  ],
  vangie:  [{ id: 'v1', item: 'Groceries', amount: 512, utang: true, date: 'Jun 12', time: '4:10 PM', txHash: '11aa…22bb', ledger: 2481500 }],
  charing: [{ id: 'c1', item: 'Gamot + suka', amount: 128, utang: true, date: 'Jun 11', time: '8:00 AM', txHash: '33cc…44dd', ledger: 2481380 }],
  boyet:   [{ id: 'b1', item: 'Yosi + kape', amount: 85, utang: true, date: 'Jun 12', time: '6:30 AM', txHash: '55ee…66ff', ledger: 2481490 }],
  jun: [
    { id: 'j2', item: 'Bayad', amount: 200, utang: false, date: 'Jun 9', time: '5:00 PM', txHash: '77gg…88hh', ledger: 2481270 },
    { id: 'j1', item: 'Materyales', amount: 200, utang: true, date: 'Jun 5', time: '7:15 AM', txHash: '99ii…00jj', ledger: 2480700 },
  ],
};

// Demo product returned when the Open Food Facts lookup is mocked / offline.
export const DEMO_PRODUCT = {
  name: 'Lucky Me Pancit Canton',
  brand: 'Lucky Me! · 60g',
  barcode: '4800016641503',
  price: 15,
  slug: 'pancit_canton',
};

// Running balance for a newest-first ledger: sum of signed amounts from the
// given index down to the oldest entry. Used to print "Bal ₱X" per row.
export function runningBalances(entries) {
  const out = new Array(entries.length);
  let acc = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    acc += e.utang ? e.amount : -e.amount;
    out[i] = acc;
  }
  return out;
}

export function balanceOf(entries) {
  return entries.reduce((b, e) => b + (e.utang ? e.amount : -e.amount), 0);
}
