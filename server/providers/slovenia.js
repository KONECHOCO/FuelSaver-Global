// 🇸🇮 SLOVENIA — goriva.si, portale del Ministero dell'Economia (Ministrstvo za gospodarstvo).
// I distributori devono comunicare al Ministero ogni variazione di prezzo almeno un'ora prima;
// il portale pubblica i prezzi per impianto. API JSON pubblica senza chiave (~550 impianti).

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout } from '../geo.js';

const API = 'https://goriva.si/api/v1';
const REFRESH_MS = 30 * 60 * 1000;

// Chiave goriva.si -> carburante base dell'app; gli altri carburanti per auto finiscono in "extras"
const BASE = { '95': 'petrol', 'dizel': 'diesel', 'avtoplin-lpg': 'lpg', 'cng': 'methane' };
const EXTRA = { '98': 'Bencin 98', '100': 'Bencin 100', 'dizel-premium': 'Dizel premium', 'hvo': 'HVO' };

export const slovenia = {
  country: 'SI',
  source: 'goriva.si – Ministrstvo za gospodarstvo',
  license: 'Javni podatki goriva.si',
  bbox: [45.4, 46.9, 13.3, 16.6],
  init,
  query,
  enabled: () => stations.length > 0,
  status: () => ({ stations: stations.length, fetchedAt })
};

let stations = [];
let fetchedAt = null;
// La fonte non indica quando è cambiato il prezzo: lo ricaviamo noi. Per ogni impianto/carburante
// teniamo l'ora in cui abbiamo visto quel prezzo per la prima volta (al primo avvio = ora del download).
const seen = new Map(); // `${pk}:${fuel}` -> { price, at }

async function init() {
  await sync();
  setInterval(sync, REFRESH_MS);
  // Se il primo download fallisce (errore di rete momentaneo) riprova ogni 5 minuti
  setInterval(() => { if (!stations.length) sync(); }, 5 * 60 * 1000);
}

async function getJson(url) {
  return (await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 30000)).json();
}

function since(pk, fuel, price, now) {
  const k = `${pk}:${fuel}`;
  const prev = seen.get(k);
  if (prev && prev.price === price) return prev.at;
  seen.set(k, { price, at: now });
  return now;
}

async function sync() {
  try {
    console.log('🔄 [SI] Download goriva.si...');
    const franchises = await getJson(`${API}/franchise/`);
    const brands = Object.fromEntries((Array.isArray(franchises) ? franchises : [])
      .map(f => [f.pk, (f.name || '').replace(/,?\s*(d\.\s?d\.|d\.\s?o\.\s?o\.).*$/i, '').trim()]));

    const rows = [];
    let url = `${API}/search/?position=46.1,14.8&radius=300000`;
    for (let page = 0; url && page < 50; page++) {
      const data = await getJson(url);
      rows.push(...(data.results || []));
      url = data.next;
    }

    const now = new Date().toISOString();
    const next = [];
    for (const r of rows) {
      if (!isFinite(r.lat) || !isFinite(r.lng)) continue;
      const brand = brands[r.franchise] || '';
      const st = {
        id: `si-${r.pk}`,
        sourceId: String(r.pk),
        name: (r.name || brand || 'Bencinski servis').trim(),
        brand,
        country: 'SI',
        city: '',
        address: `${r.address || ''}, ${r.zip_code || ''}`.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim(),
        lat: r.lat,
        lng: r.lng,
        prices: {},
        extras: []
      };
      for (const [key, value] of Object.entries(r.prices || {})) {
        const price = Number(value);
        if (!(price > 0)) continue;
        if (BASE[key]) setPrice(st.prices, BASE[key], 'self', price, since(r.pk, key, price, now));
        else if (EXTRA[key] && price > 0.2 && price < 5) st.extras.push({ label: EXTRA[key], price, self: true });
      }
      if (Object.keys(st.prices).length) {
        st.updatedAt = latestUpdate(st.prices);
        next.push(st);
      }
    }
    if (next.length > 200) {
      stations = next;
      fetchedAt = now;
      console.log(`✅ [SI] ${next.length} servisi caricati`);
    }
  } catch (err) {
    console.error('❌ [SI] Sincronizzazione fallita:', err.message, err.cause?.code || '');
  }
}

async function query(lat, lng, radiusKm) {
  const out = [];
  for (const st of stations) {
    const d = haversineKm(lat, lng, st.lat, st.lng);
    if (d <= radiusKm) out.push({ ...st, distanceKm: round1(d) });
  }
  return out;
}
