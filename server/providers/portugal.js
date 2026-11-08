// 🇵🇹 PORTOGALLO — DGEG (Direção-Geral de Energia e Geologia), portale "Preços dos Combustíveis Online".
// I distributori sono obbligati per legge a comunicare i prezzi alla DGEG; una sola chiamata restituisce
// tutti gli impianti (~3.000) con coordinate. Nessuna chiave API richiesta.

import { haversineKm, round1, setPrice, latestUpdate, fetchWithTimeout, localDateToIso } from '../geo.js';

const API = 'https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb/PesquisarPostos';
const REFRESH_MS = 30 * 60 * 1000;

// Id DGEG -> carburante base dell'app; gli altri id finiscono in "extras"
const BASE = { 2101: 'diesel', 3201: 'petrol', 1120: 'lpg', 1143: 'methane' };
const EXTRA = { 2105: 'Gasóleo especial', 3205: 'Gasolina especial 95', 3400: 'Gasolina 98', 3405: 'Gasolina especial 98' };
const NAME_TO_ID = {
  'Gasóleo simples': 2101, 'Gasolina simples 95': 3201, 'GPL Auto': 1120,
  'GNC (gás natural comprimido) - €/kg': 1143, 'Gasóleo especial': 2105,
  'Gasolina especial 95': 3205, 'Gasolina 98': 3400, 'Gasolina especial 98': 3405
};

export const portugal = {
  country: 'PT',
  source: 'DGEG – precoscombustiveis.dgeg.gov.pt',
  license: 'Dados públicos DGEG',
  bbox: [36.8, 42.2, -9.6, -6.1], // solo continente: Madeira e Azzorre hanno prezzi regolati e non sono nel portale
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

// "2026-11-06 10:30" (ora di Lisbona) -> ISO UTC
function lisbonToIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})/.exec(s || '');
  return m ? localDateToIso(`${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}:00`, 'Europe/Lisbon') : null;
}

const num = v => parseFloat(String(v || '').replace(/[^\d,.]/g, '').replace(',', '.'));

async function sync() {
  try {
    console.log('🔄 [PT] Download DGEG...');
    const ids = [...Object.keys(BASE), ...Object.keys(EXTRA)].join(',');
    const url = `${API}?idsTiposComb=${ids}&idMarca=&idTipoPosto=&idDistrito=&idsMunicipios=&qtdPorPagina=50000&pagina=1`;
    const data = await (await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 60000)).json();
    if (!data.status || !Array.isArray(data.resultado)) throw new Error(data.mensagem || 'Risposta DGEG non valida');

    const byId = new Map();
    for (const r of data.resultado) {
      if (!isFinite(r.Latitude) || !isFinite(r.Longitude) || !r.Latitude || !r.Longitude) continue;
      let st = byId.get(r.Id);
      if (!st) {
        const brand = (r.Marca || '').trim();
        st = {
          id: `pt-${r.Id}`,
          sourceId: String(r.Id),
          name: (r.Nome || `${brand} – ${r.Localidade || ''}`).trim(),
          brand,
          country: 'PT',
          city: r.Municipio || r.Localidade || '',
          address: `${r.Morada || ''}, ${r.CodPostal || ''} ${(r.Localidade || '').split('|')[0]}`.replace(/\s+/g, ' ').trim(),
          lat: r.Latitude,
          lng: r.Longitude,
          highway: r.TipoPosto === 'Auto-estrada',
          prices: {},
          extras: []
        };
        byId.set(r.Id, st);
      }
      const fuelId = NAME_TO_ID[r.Combustivel];
      const price = num(r.Preco);
      if (!fuelId || !(price > 0)) continue;
      if (BASE[fuelId]) setPrice(st.prices, BASE[fuelId], 'self', price, lisbonToIso(r.DataAtualizacao));
      else st.extras.push({ label: EXTRA[fuelId], price, self: true });
    }

    const next = [...byId.values()].filter(s => Object.keys(s.prices).length > 0);
    for (const s of next) s.updatedAt = latestUpdate(s.prices);
    if (next.length > 500) {
      stations = next;
      fetchedAt = new Date().toISOString();
      console.log(`✅ [PT] ${next.length} postos caricati`);
    }
  } catch (err) {
    console.error('❌ [PT] Sincronizzazione fallita:', err.message);
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
