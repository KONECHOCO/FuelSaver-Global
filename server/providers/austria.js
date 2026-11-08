// 🇦🇹 AUSTRIA — E-Control Spritpreisrechner (autorità di regolazione, obbligo di comunicazione prezzi per legge).
// API pubblica senza chiave. Per legge (Preistransparenzverordnung) la ricerca restituisce i 10 distributori
// più vicini a un punto, ma con prezzo solo i più economici: interroghiamo più punti e uniamo i risultati.

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout } from '../geo.js';

const API = 'https://api.e-control.at/sprit/1.0/search/gas-stations/by-address';
const FUELS = { DIE: 'diesel', SUP: 'petrol', GAS: 'methane' };
const CACHE_MS = 5 * 60 * 1000;
const cache = new Map();
// Ultimi prezzi letti per impianto: intorno alle 12:00 (unico orario in cui per legge si possono alzare i prezzi)
// l'API restituisce per qualche minuto distributori senza prezzi. In quel caso riusiamo l'ultima lettura
// (max 3 ore) mantenendo l'ora in cui era stata letta.
const lastSeen = new Map();
const LAST_SEEN_MS = 3 * 60 * 60 * 1000;

export const austria = {
  country: 'AT',
  source: 'E-Control Spritpreisrechner',
  license: 'Daten: E-Control',
  bbox: [46.3, 49.1, 9.5, 17.2],
  init: async () => {},
  query,
  status: () => ({ cachedQueries: cache.size, lastSeen: lastSeen.size })
};

// Centro + 4 punti cardinali a metà raggio (max 8 km) per coprire l'area richiesta
function samplePoints(lat, lng, radiusKm) {
  const pts = [[lat, lng]];
  if (radiusKm <= 3) return pts;
  const dKm = Math.min(radiusKm / 2, 8);
  const dLat = dKm / 111.32;
  const dLng = dKm / (111.32 * Math.cos(lat * Math.PI / 180));
  pts.push([lat + dLat, lng], [lat - dLat, lng], [lat, lng + dLng], [lat, lng - dLng]);
  return pts;
}

async function fetchPoint(lat, lng, code) {
  const url = `${API}?latitude=${lat.toFixed(5)}&longitude=${lng.toFixed(5)}&fuelType=${code}&includeClosed=true`;
  const data = await (await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 10000)).json();
  return Array.isArray(data) ? data : [];
}

async function query(lat, lng, radiusKm) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stations;

  const jobs = [];
  for (const [pLat, pLng] of samplePoints(lat, lng, radiusKm)) {
    for (const code of Object.keys(FUELS)) jobs.push(fetchPoint(pLat, pLng, code));
  }
  const settled = await Promise.allSettled(jobs);
  if (settled.every(r => r.status === 'rejected')) throw settled[0].reason;

  // E-Control non fornisce l'ora di comunicazione del prezzo: usiamo l'ora della lettura
  const now = new Date().toISOString();
  const byId = new Map();
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue;
    for (const s of r.value) {
      const loc = s.location || {};
      if (!isFinite(loc.latitude) || !isFinite(loc.longitude)) continue;
      const d = haversineKm(lat, lng, loc.latitude, loc.longitude);
      if (d > radiusKm) continue;
      let st = byId.get(s.id);
      if (!st) {
        st = {
          id: `at-${s.id}`,
          sourceId: String(s.id),
          name: (s.name || 'Tankstelle').trim(),
          brand: '',
          country: 'AT',
          city: loc.city || '',
          address: `${loc.address || ''}, ${loc.postalCode || ''} ${loc.city || ''}`.replace(/\s+/g, ' ').trim(),
          lat: loc.latitude,
          lng: loc.longitude,
          isOpen: s.open,
          prices: {},
          extras: [],
          distanceKm: round1(d)
        };
        byId.set(s.id, st);
      }
      for (const p of s.prices || []) {
        const fuel = FUELS[p.fuelType];
        if (fuel) setPrice(st.prices, fuel, s.offerInformation?.service && !s.offerInformation?.selfService ? 'served' : 'self', p.amount, now);
      }
    }
  }

  for (const st of byId.values()) {
    if (Object.keys(st.prices).length) {
      lastSeen.set(st.id, { at: Date.now(), prices: st.prices });
    } else {
      const prev = lastSeen.get(st.id);
      if (prev && Date.now() - prev.at < LAST_SEEN_MS) st.prices = prev.prices;
    }
  }
  if (lastSeen.size > 5000) lastSeen.delete(lastSeen.keys().next().value);
  const stations = [...byId.values()].filter(s => Object.keys(s.prices).length > 0);
  for (const s of stations) s.updatedAt = latestUpdate(s.prices);

  cache.set(key, { at: Date.now(), stations });
  if (cache.size > 2000) cache.delete(cache.keys().next().value);
  return stations;
}
