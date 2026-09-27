// 🇩🇪 GERMANIA — Tankerkönig (dati della Markttransparenzstelle für Kraftstoffe, MTS-K / Bundeskartellamt).
// Prezzi in tempo reale, licenza CC BY 4.0 (attribuzione obbligatoria: "Tankerkönig / MTS-K").
// Richiede una API key gratuita: https://onboarding.tankerkoenig.de -> variabile TANKERKOENIG_API_KEY

import { round1, setPrice, fetchWithTimeout } from '../geo.js';

const API = 'https://creativecommons.tankerkoenig.de/json/list.php';
const CACHE_MS = 5 * 60 * 1000; // richiesto dai termini d'uso: niente polling aggressivo
const cache = new Map();

export const germany = {
  country: 'DE',
  source: 'Tankerkönig / MTS-K',
  license: 'CC BY 4.0',
  bbox: [47.2, 55.1, 5.8, 15.1],
  init: async () => {
    if (!process.env.TANKERKOENIG_API_KEY) {
      console.warn('⚠️ [DE] TANKERKOENIG_API_KEY non impostata: Germania disattivata');
    }
  },
  query,
  status: () => ({ enabled: !!process.env.TANKERKOENIG_API_KEY })
};

function titleCase(s) {
  return (s || '').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}

async function query(lat, lng, radiusKm) {
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  if (!apiKey) return [];
  const rad = Math.min(radiusKm, 25); // limite dell'API
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${rad}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stations;

  const url = `${API}?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${apiKey}`;
  const data = await (await fetchWithTimeout(url, {}, 10000)).json();
  if (!data.ok) throw new Error(data.message || 'Errore Tankerkönig');
  const now = new Date().toISOString();

  const stations = (data.stations || []).map(s => {
    const prices = {};
    setPrice(prices, 'petrol', 'self', s.e5, now);
    setPrice(prices, 'diesel', 'self', s.diesel, now);
    const extras = s.e10 ? [{ label: 'Super E10', price: s.e10, self: true }] : [];
    return {
      id: `de-${s.id}`,
      sourceId: s.id,
      name: titleCase(s.name),
      brand: s.brand || '',
      country: 'DE',
      city: titleCase(s.place),
      address: `${titleCase(s.street)} ${s.houseNumber || ''}, ${s.postCode || ''} ${titleCase(s.place)}`.replace(/\s+/g, ' ').trim(),
      lat: s.lat,
      lng: s.lng,
      isOpen: s.isOpen,
      prices,
      extras,
      distanceKm: round1(s.dist),
      updatedAt: now
    };
  }).filter(s => Object.keys(s.prices).length > 0);

  cache.set(key, { at: Date.now(), stations });
  if (cache.size > 2000) cache.delete(cache.keys().next().value);
  return stations;
}
