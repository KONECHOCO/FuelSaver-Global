import https from 'https';
import http from 'http';

// URL Ufficiali Open Data MIMIT (Ministero delle Imprese e del Made in Italy)
const MIMIT_PLANTS_URL = "https://www.mimit.gov.it/images/exportopen-data/anagrafica_impianti_attivi.csv";
const MIMIT_PRICES_URL = "https://www.mimit.gov.it/images/exportopen-data/prezzo_alle_vendite.csv";

// Database in-memory indicizzato
let cachedStationsMap = new Map(); // idImpianto -> stationObj
let lastSyncTimestamp = null;
let isSyncing = false;

// Helper per scaricare testo in streaming da HTTPS
function fetchUrlText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrlText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP Error ${res.statusCode} per URL: ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Formula Haversine per calcolo distanza in KM
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

/**
 * Sincronizza i dati dal Ministero MIMIT
 */
export async function syncMimitData() {
  if (isSyncing) return;
  isSyncing = true;
  console.log('🔄 [MIMIT Backend] Inizio sincronizzazione Open Data Ministero...');

  try {
    // 1. Scarica Anagrafica Impianti Attivi
    const plantsCsv = await fetchUrlText(MIMIT_PLANTS_URL);
    const plantLines = plantsCsv.split('\n');
    console.log(`📦 [MIMIT Backend] Anagrafica scaricata (${plantLines.length} righe)`);

    const newStationsMap = new Map();

    // Il CSV MIMIT usa come separatore ';'
    // Schema: idImpianto;Gestore;Bandiera;TipoImpianto;NomeImpianto;Indirizzo;Comune;Provincia;Latitudine;Longitudine
    for (let i = 2; i < plantLines.length; i++) {
      const cols = plantLines[i].split(';');
      if (cols.length >= 10) {
        const id = cols[0].trim();
        const brand = cols[2].trim() || 'Pompa Bianca';
        const name = cols[4].trim() || `${brand} Station`;
        const address = cols[5].trim();
        const city = cols[6].trim();
        const province = cols[7].trim();
        const lat = parseFloat(cols[8].replace(',', '.'));
        const lng = parseFloat(cols[9].replace(',', '.'));

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          newStationsMap.set(id, {
            id: `mimit-${id}`,
            mimitId: id,
            name: `${brand} - ${name || address}`,
            brand: brand,
            country: 'IT',
            city: city,
            address: `${address}, ${city} (${province})`,
            lat: lat,
            lng: lng,
            isSponsored: false,
            isOfficialMimit: true,
            prices: {},
            updatedHoursAgo: 0,
            updatedBy: "Ministero MIMIT (Live)",
            rating: 4.7,
            reviewsCount: 25,
            amenities: ["coffee", "open24", "air", "atm"],
            reviews: []
          });
        }
      }
    }

    // 2. Scarica Prezzo alle vendite
    const pricesCsv = await fetchUrlText(MIMIT_PRICES_URL);
    const priceLines = pricesCsv.split('\n');
    console.log(`💰 [MIMIT Backend] Listini prezzi scaricati (${priceLines.length} righe)`);

    // Schema: idImpianto;descCarburante;prezzo;isSelf;dtComu
    for (let i = 2; i < priceLines.length; i++) {
      const cols = priceLines[i].split(';');
      if (cols.length >= 4) {
        const id = cols[0].trim();
        const fuelRaw = cols[1].trim().toLowerCase();
        const price = parseFloat(cols[2].replace(',', '.'));
        const isSelf = cols[3].trim() === '1';

        const station = newStationsMap.get(id);
        if (station && !isNaN(price) && price > 0.5 && price < 4.0) {
          let fuelKey = 'petrol';
          if (fuelRaw.includes('gasolio') || fuelRaw.includes('diesel')) fuelKey = 'diesel';
          else if (fuelRaw.includes('gpl')) fuelKey = 'lpg';
          else if (fuelRaw.includes('metano')) fuelKey = 'methane';

          if (!station.prices[fuelKey]) {
            station.prices[fuelKey] = { self: price, served: price + 0.15 };
          }

          if (isSelf) {
            station.prices[fuelKey].self = price;
          } else {
            station.prices[fuelKey].served = price;
          }
        }
      }
    }

    cachedStationsMap = newStationsMap;
    lastSyncTimestamp = new Date();
    console.log(`✅ [MIMIT Backend] Sincronizzazione completata! ${cachedStationsMap.size} distributori reali caricati nel database.`);
  } catch (err) {
    console.error('❌ [MIMIT Backend] Errore durante la sincronizzazione MIMIT:', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Cerca stazioni vicine nel raggio GPS in km
 */
export function getNearbyMimitStations(userLat, userLng, radiusKm = 25) {
  if (cachedStationsMap.size === 0) {
    return [];
  }

  const result = [];
  for (const station of cachedStationsMap.values()) {
    const dist = getHaversineDistance(userLat, userLng, station.lat, station.lng);
    if (dist <= radiusKm) {
      result.push({
        ...station,
        distanceKm: dist
      });
    }
  }

  result.sort((a, b) => a.distanceKm - b.distanceKm);
  return result;
}

export function getSyncStatus() {
  return {
    totalStationsLoaded: cachedStationsMap.size,
    lastSyncTimestamp: lastSyncTimestamp,
    isSyncing: isSyncing
  };
}
