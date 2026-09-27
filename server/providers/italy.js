// 🇮🇹 ITALIA — Osservatorio Prezzi Carburanti del MIMIT (Ministero delle Imprese e del Made in Italy)
//
// Due fonti ufficiali, usate insieme:
//  1. API live di carburanti.mise.gov.it (la stessa usata dal sito ufficiale): prezzi aggiornati
//     in tempo reale appena il gestore li comunica. Raggio massimo 10 km.
//  2. Open Data CSV (licenza IODL 2.0), estrazione giornaliera delle 8:00: anagrafica completa
//     (indirizzi) + ultimo prezzo comunicato. Usato per raggi > 10 km e come fallback.
//
// Per legge (L. 99/2009, D.M. 2023) ogni gestore deve comunicare ogni variazione di prezzo al MIMIT,
// quindi è la fonte più completa e aggiornata esistente per l'Italia.

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout, localDateToIso } from '../geo.js';

const romeToIso = s => localDateToIso(s, 'Europe/Rome');

const REGISTRY_URL = 'https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv';
const PRICES_URL = 'https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv';
const LIVE_ZONE_URL = 'https://carburanti.mise.gov.it/ospzApi/search/zone';
const LIVE_MAX_RADIUS_KM = 10;
const CSV_REFRESH_MS = 3 * 60 * 60 * 1000; // l'estrazione è giornaliera: 3 ore bastano
const LIVE_CACHE_MS = 5 * 60 * 1000;

// Solo i carburanti "base": le varianti premium (Blue Super, HiQ, V-Power...) finiscono in extras
const FUEL_MAP = { 'Benzina': 'petrol', 'Gasolio': 'diesel', 'GPL': 'lpg', 'Metano': 'methane' };

export const italy = {
  country: 'IT',
  source: 'MIMIT – Osservaprezzi Carburanti',
  license: 'IODL 2.0',
  bbox: [35.4, 47.1, 6.6, 18.6],
  init,
  query,
  status: () => ({ csvStations: csvStations.size, csvExtractedAt, lastCsvSync })
};

let csvStations = new Map(); // idImpianto -> station
let csvExtractedAt = null;
let lastCsvSync = null;
const liveCache = new Map();

async function init() {
  await syncCsv();
  setInterval(syncCsv, CSV_REFRESH_MS);
}

function titleCase(s) {
  return s.toLowerCase().replace(/(^|[\s'(/-])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}

async function syncCsv() {
  try {
    console.log('🔄 [IT] Download Open Data MIMIT...');
    const [registryCsv, pricesCsv] = await Promise.all([
      fetchWithTimeout(REGISTRY_URL, {}, 120000).then(r => r.text()),
      fetchWithTimeout(PRICES_URL, {}, 120000).then(r => r.text())
    ]);

    const next = new Map();
    const regLines = registryCsv.split('\n');
    // Riga 0: "Estrazione del AAAA-MM-GG", riga 1: intestazione. Separatore '|'
    const extracted = /Estrazione del (\S+)/.exec(regLines[0])?.[1] || null;
    for (let i = 2; i < regLines.length; i++) {
      const c = regLines[i].split('|').map(x => x.replace(/\s+/g, ' ').trim());
      if (c.length < 10) continue;
      const lat = parseFloat(c[8]);
      const lng = parseFloat(c[9]);
      if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) continue;
      const brand = c[2] || 'Pompe Bianche';
      const city = titleCase(c[6]);
      next.set(c[0], {
        id: `it-${c[0]}`,
        sourceId: c[0],
        name: `${brand} – ${titleCase(c[4] || c[5])}`,
        brand,
        country: 'IT',
        city,
        address: `${titleCase(c[5])}, ${city} (${c[7]})`,
        lat,
        lng,
        highway: c[3] === 'Autostradale',
        prices: {}
      });
    }

    const priceLines = pricesCsv.split('\n');
    for (let i = 2; i < priceLines.length; i++) {
      const c = priceLines[i].split('|');
      if (c.length < 5) continue;
      const st = next.get(c[0].trim());
      const fuel = FUEL_MAP[c[1].trim()];
      if (!st || !fuel) continue;
      setPrice(st.prices, fuel, c[3].trim() === '1' ? 'self' : 'served', parseFloat(c[2]), romeToIso(c[4].trim()));
    }

    if (next.size > 1000) {
      csvStations = next;
      csvExtractedAt = extracted;
      lastCsvSync = new Date().toISOString();
      console.log(`✅ [IT] ${next.size} impianti MIMIT caricati (estrazione del ${extracted})`);
    } else {
      console.warn(`⚠️ [IT] CSV MIMIT sospetto (${next.size} impianti): mantengo i dati precedenti`);
    }
  } catch (err) {
    console.error('❌ [IT] Sincronizzazione CSV MIMIT fallita:', err.message);
  }
}

async function queryLive(lat, lng, radiusKm) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  const hit = liveCache.get(key);
  if (hit && Date.now() - hit.at < LIVE_CACHE_MS) return hit.stations;

  const res = await fetchWithTimeout(LIVE_ZONE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ points: [{ lat, lng }], radius: radiusKm })
  }, 10000);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.results)) throw new Error('Risposta API live MIMIT non valida');

  const stations = data.results.map(r => {
    const reg = csvStations.get(String(r.id));
    const prices = {};
    const extras = [];
    const at = r.insertDate ? new Date(r.insertDate).toISOString() : null;
    for (const f of r.fuels || []) {
      const fuel = FUEL_MAP[f.name];
      if (fuel) setPrice(prices, fuel, f.isSelf ? 'self' : 'served', f.price, at);
      else extras.push({ label: f.name, price: f.price, self: f.isSelf });
    }
    return {
      id: `it-${r.id}`,
      sourceId: String(r.id),
      name: reg?.name || `${r.brand || 'Pompe Bianche'} – ${titleCase(r.name || '')}`,
      brand: reg?.brand || r.brand || 'Pompe Bianche',
      country: 'IT',
      city: reg?.city || '',
      address: reg?.address || r.address || '',
      lat: r.location.lat,
      lng: r.location.lng,
      highway: reg?.highway || false,
      prices,
      extras,
      live: true
    };
  });

  liveCache.set(key, { at: Date.now(), stations });
  if (liveCache.size > 2000) liveCache.delete(liveCache.keys().next().value);
  return stations;
}

async function query(lat, lng, radiusKm) {
  let list = null;
  if (radiusKm <= LIVE_MAX_RADIUS_KM) {
    try {
      list = await queryLive(lat, lng, radiusKm);
    } catch (err) {
      console.warn('⚠️ [IT] API live MIMIT non disponibile, uso il CSV:', err.message);
    }
  }
  if (!list) list = [...csvStations.values()];

  const out = [];
  for (const st of list) {
    const d = haversineKm(lat, lng, st.lat, st.lng);
    if (d > radiusKm || Object.keys(st.prices).length === 0) continue;
    out.push({ ...st, distanceKm: round1(d), updatedAt: latestUpdate(st.prices) });
  }
  return out;
}
