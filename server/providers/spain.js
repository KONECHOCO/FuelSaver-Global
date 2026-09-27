// 🇪🇸 SPAGNA — Geoportal Gasolineras, Ministerio para la Transición Ecológica (MITECO).
// Servizio REST ufficiale con tutti gli impianti (~12.000), aggiornato ogni 30 minuti. Nessuna chiave.

import { haversineKm, round1, setPrice, fetchWithTimeout, localDateToIso } from '../geo.js';

const URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
const REFRESH_MS = 30 * 60 * 1000;

export const spain = {
  country: 'ES',
  source: 'Geoportal Gasolineras – MITECO',
  license: 'Datos abiertos Gobierno de España',
  bbox: [27.6, 43.9, -18.2, 4.4],
  init,
  query,
  status: () => ({ stations: stations.length, fetchedAt })
};

let stations = [];
let fetchedAt = null;

async function init() {
  await sync();
  setInterval(sync, REFRESH_MS);
}

// Le chiavi contengono accenti (Rótulo, Dirección...): le normalizziamo in ASCII
const norm = k => k.normalize('NFD').replace(/[^\x20-\x7E]/g, '').toLowerCase();
const num = v => (v ? parseFloat(String(v).replace(',', '.')) : NaN);

async function sync() {
  try {
    console.log('🔄 [ES] Download Geoportal Gasolineras...');
    const data = await (await fetchWithTimeout(URL, { headers: { Accept: 'application/json' } }, 120000)).json();
    const at = localDateToIso(data.Fecha, 'Europe/Madrid');
    const next = [];
    for (const raw of data.ListaEESSPrecio || []) {
      const r = {};
      for (const [k, v] of Object.entries(raw)) r[norm(k)] = v;
      const lat = num(r['latitud']);
      const lng = num(r['longitud (wgs84)']);
      if (!isFinite(lat) || !isFinite(lng)) continue;
      const prices = {};
      setPrice(prices, 'petrol', 'self', num(r['precio gasolina 95 e5']), at);
      setPrice(prices, 'diesel', 'self', num(r['precio gasoleo a']), at);
      setPrice(prices, 'lpg', 'self', num(r['precio gases licuados del petroleo']), at);
      setPrice(prices, 'methane', 'self', num(r['precio gas natural comprimido']), at);
      if (!Object.keys(prices).length) continue;
      const extras = [
        ['Gasolina 98 E5', r['precio gasolina 98 e5']],
        ['Gasoleo Premium', r['precio gasoleo premium']]
      ].filter(([, v]) => num(v) > 0).map(([label, v]) => ({ label, price: num(v), self: true }));
      const brand = (r['rotulo'] || '').trim();
      next.push({
        id: `es-${r['ideess']}`,
        sourceId: r['ideess'],
        name: `${brand || 'Gasolinera'} – ${r['localidad'] || ''}`,
        brand,
        country: 'ES',
        city: r['municipio'] || '',
        address: `${r['direccion'] || ''}, ${r['c.p.'] || ''} ${r['municipio'] || ''}`.trim(),
        lat,
        lng,
        openingHours: r['horario'] || null,
        open24: /L-D: 24H/i.test(r['horario'] || ''),
        prices,
        extras,
        updatedAt: at
      });
    }
    if (next.length > 1000) {
      stations = next;
      fetchedAt = new Date().toISOString();
      console.log(`✅ [ES] ${next.length} gasolineras caricate (dati del ${data.Fecha})`);
    }
  } catch (err) {
    console.error('❌ [ES] Sincronizzazione fallita:', err.message);
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
