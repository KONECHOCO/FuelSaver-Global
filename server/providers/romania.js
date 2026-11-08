// 🇷🇴 ROMANIA — "Monitorul Prețurilor" del Consiliul Concurenței (autorità garante della concorrenza).
// I distributori comunicano i prezzi per legge; servizio pubblico senza chiave.
// Prezzi in RON (lei): i distributori rumeni vengono inviati SOLO ai client che dichiarano di gestire
// la valuta (vedi `currency` in index.js), perché l'app 1.0.1 mostra sempre "€".
// Limite della fonte: raggio massimo 5 km per ricerca e un solo tipo di carburante per chiamata,
// quindi copriamo l'area con una piccola griglia di punti.

import https from 'node:https';
import tls from 'node:tls';
import fs from 'node:fs';
import { haversineKm, round1, setPrice, latestUpdate, localDateToIso } from '../geo.js';

// Il server della fonte invia un certificato intermedio sbagliato: aggiungiamo quello corretto
// (Sectigo Public Server Authentication CA DV R36, scaricato da crt.sectigo.com) ai root di Node.
const CA = [...tls.rootCertificates, fs.readFileSync(new URL('../certs/sectigo-public-server-auth-ca-dv-r36.pem', import.meta.url), 'utf8')];

function getJson(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { ca: CA, headers: { Accept: 'application/json' }, timeout: timeoutMs }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} per ${url}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('Timeout')));
    req.on('error', reject);
  });
}

const API = 'https://monitorulpreturilor.info/pmonsvc/Gas/GetGasItemsByLatLon';
const PRODUCTS = { 11: 'petrol', 21: 'diesel', 31: 'lpg' };
const BUFFER_M = 5000;
const STEP_KM = 8;
const MAX_POINTS = 9;
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();

export const romania = {
  country: 'RO',
  currency: 'RON',
  source: 'Monitorul Prețurilor – Consiliul Concurenței',
  license: 'Date publice Consiliul Concurenței',
  bbox: [43.6, 48.3, 20.2, 29.8],
  init: async () => {},
  query,
  status: () => ({ cachedQueries: cache.size })
};

// Punti di una griglia (passo 8 km) dentro il raggio, i più vicini al centro per primi
function gridPoints(lat, lng, radiusKm) {
  const pts = [];
  const n = Math.ceil(radiusKm / STEP_KM);
  const kmLat = 1 / 111.32;
  const kmLng = 1 / (111.32 * Math.cos(lat * Math.PI / 180));
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const d = Math.hypot(i, j) * STEP_KM;
      if (d <= Math.max(radiusKm - 2, 0)) pts.push({ d, lat: lat + i * STEP_KM * kmLat, lng: lng + j * STEP_KM * kmLng });
    }
  }
  return pts.sort((a, b) => a.d - b.d).slice(0, MAX_POINTS);
}

async function fetchPoint(lat, lng, productId) {
  const url = `${API}?lon=${lng.toFixed(5)}&lat=${lat.toFixed(5)}&buffer=${BUFFER_M}&CSVGasCatalogProductIds=${productId}&OrderBy=dist`;
  const data = await getJson(url);
  return { productId, stations: data.Stations || [], products: data.Products || [] };
}

async function query(lat, lng, radiusKm) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stations;

  const jobs = [];
  for (const p of gridPoints(lat, lng, radiusKm)) {
    for (const id of Object.keys(PRODUCTS)) jobs.push(() => fetchPoint(p.lat, p.lng, id));
  }
  const results = [];
  for (let i = 0; i < jobs.length; i += 6) {
    results.push(...await Promise.allSettled(jobs.slice(i, i + 6).map(f => f())));
  }
  if (results.length && results.every(r => r.status === 'rejected')) throw results[0].reason;

  const byId = new Map();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { productId, stations, products } = r.value;
    const info = new Map(stations.map(s => [s.id, s]));
    for (const p of products) {
      const s = info.get(p.stationid);
      const loc = s?.addr?.location;
      if (!loc || !isFinite(loc.Lat) || !isFinite(loc.Lon)) continue;
      const d = haversineKm(lat, lng, loc.Lat, loc.Lon);
      if (d > radiusKm) continue;
      let st = byId.get(s.id);
      if (!st) {
        // "LUKOIL România S.R.L.", "MOL România Petroleum Products" -> "LUKOIL", "MOL"
        const brand = (s.network?.name || '').replace(/\b(Rom[aâ]nia|S\.?R\.?L\.?|S\.?A\.?|Petroleum Products)\b\.?/gi, '').replace(/\s+/g, ' ').trim();
        st = {
          id: `ro-${s.id}`,
          sourceId: s.id,
          name: `${brand} ${s.name || ''}`.trim(),
          brand,
          country: 'RO',
          currency: 'RON',
          city: '',
          address: (s.addr?.addrstring || '').trim(),
          lat: loc.Lat,
          lng: loc.Lon,
          prices: {},
          extras: [],
          distanceKm: round1(d)
        };
        byId.set(s.id, st);
      }
      // "05/11/2026 18:38" ora di Bucarest
      const at = localDateToIso(`${(s.updatedate || '').trim()}:00`, 'Europe/Bucharest');
      setPrice(st.prices, PRODUCTS[productId], 'self', p.price, at, [1, 25]);
    }
  }

  const stations = [...byId.values()].filter(s => Object.keys(s.prices).length > 0);
  for (const s of stations) s.updatedAt = latestUpdate(s.prices);
  cache.set(key, { at: Date.now(), stations });
  if (cache.size > 2000) cache.delete(cache.keys().next().value);
  return stations;
}

