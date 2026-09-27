// 🇫🇷 FRANCIA — prix-carburants.gouv.fr (Ministère de l'Économie), flux instantané v2.
// Ogni distributore è obbligato per legge a dichiarare i prezzi; il flusso è aggiornato ogni ~10 minuti.
// Licenza Ouverte / Etalab 2.0. Nessuna chiave API richiesta.

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout } from '../geo.js';

const API = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
const CACHE_MS = 5 * 60 * 1000;
const cache = new Map();

export const france = {
  country: 'FR',
  source: 'prix-carburants.gouv.fr',
  license: 'Licence Ouverte 2.0',
  bbox: [41.3, 51.2, -5.2, 9.6],
  init: async () => {},
  query,
  status: () => ({ cachedQueries: cache.size })
};

const EXTRA_LABELS = { sp95: 'SP95 (E5)', sp98: 'SP98', e85: 'E85' };

async function query(lat, lng, radiusKm) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stations;

  const where = `within_distance(geom, geom'POINT(${lng} ${lat})', ${radiusKm}km)`;
  const records = [];
  for (let offset = 0; offset < 300; offset += 100) {
    const url = `${API}?limit=100&offset=${offset}&where=${encodeURIComponent(where)}`;
    const data = await (await fetchWithTimeout(url, {}, 15000)).json();
    records.push(...(data.results || []));
    if (records.length >= (data.total_count || 0)) break;
  }

  const stations = records.filter(r => r.geom).map(r => {
    const prices = {};
    // In Francia è quasi tutto self-service: i prezzi vanno in "self"
    setPrice(prices, 'diesel', 'self', r.gazole_prix, r.gazole_maj && new Date(r.gazole_maj).toISOString());
    setPrice(prices, 'petrol', 'self', r.e10_prix ?? r.sp95_prix, (r.e10_prix ? r.e10_maj : r.sp95_maj) && new Date(r.e10_prix ? r.e10_maj : r.sp95_maj).toISOString());
    setPrice(prices, 'lpg', 'self', r.gplc_prix, r.gplc_maj && new Date(r.gplc_maj).toISOString());
    const extras = Object.entries(EXTRA_LABELS)
      .filter(([k]) => r[`${k}_prix`] && !(k === 'sp95' && !r.e10_prix))
      .map(([k, label]) => ({ label, price: r[`${k}_prix`], self: true }));
    const d = haversineKm(lat, lng, r.geom.lat, r.geom.lon);
    return {
      id: `fr-${r.id}`,
      sourceId: String(r.id),
      name: `Station-service – ${r.ville || ''}`.trim(),
      brand: '',
      country: 'FR',
      city: r.ville || '',
      address: `${r.adresse || ''}, ${r.cp || ''} ${r.ville || ''}`.trim(),
      lat: r.geom.lat,
      lng: r.geom.lon,
      highway: r.pop === 'A',
      open24: r.horaires_automate_24_24 === 'Oui',
      prices,
      extras,
      distanceKm: round1(d),
      updatedAt: latestUpdate(prices)
    };
  }).filter(s => Object.keys(s.prices).length > 0);

  cache.set(key, { at: Date.now(), stations });
  if (cache.size > 2000) cache.delete(cache.keys().next().value);
  return stations;
}

