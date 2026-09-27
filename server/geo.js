// Formula Haversine per calcolo distanza in KM
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

// Bounding box grossolano per decidere quali provider interrogare (i confini si sovrappongono di proposito)
export function inBox(lat, lng, [minLat, maxLat, minLng, maxLng]) {
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

// Aggiunge/aggiorna un prezzo tenendo quello comunicato più di recente
export function setPrice(prices, fuel, mode, price, updatedAt) {
  if (!(price > 0.2 && price < 5)) return;
  const entry = prices[fuel] || (prices[fuel] = { self: null, served: null, updatedAt: null });
  const prevAt = entry[`${mode}At`];
  if (entry[mode] == null || !prevAt || (updatedAt && updatedAt > prevAt)) {
    entry[mode] = price;
    entry[`${mode}At`] = updatedAt || null;
  }
  if (updatedAt && (!entry.updatedAt || updatedAt > entry.updatedAt)) entry.updatedAt = updatedAt;
}

export function latestUpdate(prices) {
  let latest = null;
  for (const p of Object.values(prices)) {
    if (p.updatedAt && (!latest || p.updatedAt > latest)) latest = p.updatedAt;
  }
  return latest;
}

export async function fetchWithTimeout(url, opts = {}, timeoutMs = 20000) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status} per ${url}`);
  return res;
}

// "GG/MM/AAAA hh:mm:ss" nell'ora locale di un fuso (es. Europe/Rome) -> ISO UTC
export function localDateToIso(s, timeZone) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2})/.exec(s || '');
  if (!m) return null;
  const [, d, mo, y, h, mi, se] = m;
  const guess = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));
  const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(guess).find(p => p.type === 'timeZoneName').value.replace('GMT', '') || '+00:00';
  return new Date(`${y}-${mo}-${d}T${h.padStart(2, '0')}:${mi}:${se}${offset}`).toISOString();
}
