// 🇭🇷 CROAZIA — Ministarstvo gospodarstva (Ministero dell'Economia), portale "Cijene goriva" mzoe-gor.hr.
// I distributori sono obbligati per legge a comunicare i prezzi al Ministero. Nessuna chiave API.
// - Elenco impianti (anagrafica + coordinate): https://mzoe-gor.hr/data.json — NB il file statico non è
//   aggiornato ogni giorno, quindi lo usiamo SOLO per l'anagrafica.
// - Prezzi in vigore per impianto, con data di inizio validità: webservis.mzoe-gor.hr/api/cjenici-postaja/{id}

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout, localDateToIso } from '../geo.js';

const LIST_URL = 'https://mzoe-gor.hr/data.json';
const PRICES_URL = 'https://webservis.mzoe-gor.hr/api/cjenici-postaja/';
const LIST_REFRESH_MS = 12 * 60 * 60 * 1000;
const PRICE_CACHE_MS = 60 * 60 * 1000; // i prezzi cambiano al massimo una volta al giorno
const MAX_STATIONS_PER_QUERY = 60;

// vrsta_goriva_id -> carburante base dell'app (gli altri vanno in extras)
const BASE = { 1: 'petrol', 2: 'petrol', 7: 'diesel', 8: 'diesel', 9: 'lpg', 26: 'methane' };
const ROAD_TYPES = new Set([1, 2, 3]); // benzine, diesel, autoplin (esclusi gasolio da riscaldamento, bombole, ricarica)

export const croatia = {
  country: 'HR',
  source: 'Ministarstvo gospodarstva – mzoe-gor.hr',
  license: 'Javni podaci Ministarstva gospodarstva',
  bbox: [42.3, 46.6, 13.4, 19.5],
  init,
  query,
  // Senza anagrafica (es. fonte irraggiungibile dal server) il Paese risulta non coperto invece che vuoto
  enabled: () => stations.length > 0,
  status: () => ({ stations: stations.length, fetchedAt, cachedPrices: priceCache.size })
};

let stations = [];
let fuels = new Map(); // gorivo_id -> { name, vrsta, tip }
let fetchedAt = null;
const priceCache = new Map(); // station id -> { at, prices, extras }

async function init() {
  await syncList();
  setInterval(syncList, LIST_REFRESH_MS);
  // Finché l'anagrafica manca riprova ogni ora
  setInterval(() => { if (!stations.length) syncList(); }, 60 * 60 * 1000);
}

// Nel file statico "lat" e "long" sono invertiti per molti impianti: li riconosciamo dall'intervallo
function coords(p) {
  const a = parseFloat(p.lat), b = parseFloat(p.long);
  if (!isFinite(a) || !isFinite(b)) return null;
  const isLat = v => v > 42 && v < 46.7;
  if (isLat(a) && !isLat(b)) return { lat: a, lng: b };
  if (isLat(b) && !isLat(a)) return { lat: b, lng: a };
  return null;
}

async function syncList() {
  try {
    console.log('🔄 [HR] Download anagrafica mzoe-gor.hr...');
    const data = await (await fetchWithTimeout(LIST_URL, { headers: { Accept: 'application/json' } }, 60000)).json();
    const vrsta = Object.fromEntries((data.vrsta_gorivas || []).map(v => [v.id, v]));
    fuels = new Map((data.gorivos || []).map(g => [g.id, {
      name: (g.naziv || '').trim(),
      vrsta: g.vrsta_goriva_id,
      tip: vrsta[g.vrsta_goriva_id]?.tip_goriva_id
    }]));
    const brands = Object.fromEntries((data.obvezniks || []).map(o => [o.id, (o.naziv || '').replace(/\s+d\.?\s?o\.?\s?o\.?$/i, '').trim()]));
    const next = [];
    for (const p of data.postajas || []) {
      const c = coords(p);
      if (!c) continue;
      const brand = brands[p.obveznik_id] && brands[p.obveznik_id] !== '-' ? brands[p.obveznik_id] : '';
      next.push({
        id: `hr-${p.id}`,
        sourceId: String(p.id),
        name: (p.naziv || brand || 'Benzinska postaja').trim(),
        brand,
        country: 'HR',
        city: p.mjesto || '',
        address: `${p.adresa || ''}, ${p.mjesto || ''}`.replace(/\s+/g, ' ').trim(),
        lat: c.lat,
        lng: c.lng
      });
    }
    if (next.length > 300) {
      stations = next;
      fetchedAt = new Date().toISOString();
      console.log(`✅ [HR] ${next.length} postaje caricate`);
    }
  } catch (err) {
    console.error('❌ [HR] Sincronizzazione anagrafica fallita:', err.message);
  }
}

// Prezzi in vigore: per ogni carburante l'ultima voce per data di inizio validità
async function stationPrices(sourceId) {
  const hit = priceCache.get(sourceId);
  if (hit && Date.now() - hit.at < PRICE_CACHE_MS) return hit;
  const rows = await (await fetchWithTimeout(PRICES_URL + sourceId, { headers: { Accept: 'application/json' } }, 10000)).json();
  const latest = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    const prev = latest.get(r.gorivo_id);
    if (!prev || r.dat_poc >= prev.dat_poc) latest.set(r.gorivo_id, r);
  }
  // Prodotti dismessi: la fonte li tiene con l'ultimo prezzo (a volte un segnaposto, es. 9,33 "nije u portfelju").
  // Teniamo solo le voci aggiornate entro 21 giorni dalla più recente dell'impianto.
  const newest = [...latest.values()].reduce((m, r) => (r.dat_poc > m ? r.dat_poc : m), '');
  const cutoff = newest ? new Date(Date.parse(newest) - 21 * 86400000).toISOString().slice(0, 10) : '';
  for (const [id, r] of latest) {
    const name = fuels.get(r.gorivo_id)?.name || '';
    if (r.dat_poc < cutoff || /nije u portfelju/i.test(name)) latest.delete(id);
  }
  // Più prodotti dello stesso tipo (es. "Eurosuper 95" e "Eurosuper 95 Class"): il base è il più economico
  const byFuel = {};
  const extras = [];
  for (const r of latest.values()) {
    const f = fuels.get(r.gorivo_id);
    if (!f || !(r.cijena > 0.2 && r.cijena < 5) || (!ROAD_TYPES.has(f.tip) && f.vrsta !== 26)) continue;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(r.dat_poc || '');
    const item = { label: f.name, price: r.cijena, at: m ? localDateToIso(`${m[3]}/${m[2]}/${m[1]} 00:00:00`, 'Europe/Zagreb') : null };
    const fuel = BASE[f.vrsta];
    if (fuel) (byFuel[fuel] ||= []).push(item);
    else extras.push({ label: item.label, price: item.price, self: true });
  }
  const prices = {};
  for (const [fuel, items] of Object.entries(byFuel)) {
    items.sort((a, b) => a.price - b.price);
    setPrice(prices, fuel, 'self', items[0].price, items[0].at);
    for (const x of items.slice(1)) extras.push({ label: x.label, price: x.price, self: true });
  }
  const entry = { at: Date.now(), prices, extras };
  priceCache.set(sourceId, entry);
  if (priceCache.size > 3000) priceCache.delete(priceCache.keys().next().value);
  return entry;
}

async function query(lat, lng, radiusKm) {
  const near = [];
  for (const st of stations) {
    const d = haversineKm(lat, lng, st.lat, st.lng);
    if (d <= radiusKm) near.push({ st, d });
  }
  near.sort((a, b) => a.d - b.d);
  const picked = near.slice(0, MAX_STATIONS_PER_QUERY);

  // Richieste in piccoli lotti per non sovraccaricare il servizio del Ministero
  const out = [];
  for (let i = 0; i < picked.length; i += 8) {
    const batch = picked.slice(i, i + 8);
    const res = await Promise.allSettled(batch.map(x => stationPrices(x.st.sourceId)));
    res.forEach((r, j) => {
      if (r.status !== 'fulfilled' || !Object.keys(r.value.prices).length) return;
      const { st, d } = batch[j];
      out.push({ ...st, prices: r.value.prices, extras: r.value.extras, distanceKm: round1(d), updatedAt: latestUpdate(r.value.prices) });
    });
  }
  if (picked.length && !out.length) throw new Error('Nessun prezzo ricevuto da webservis.mzoe-gor.hr');
  return out;
}
