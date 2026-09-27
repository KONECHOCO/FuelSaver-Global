const STALE_AFTER_DAYS = 3;

// Prezzo mostrato per la modalità scelta. In modalità self, se l'impianto ha solo il servito
// (tipico per GPL e metano in Italia) mostriamo quello invece di nascondere il distributore.
export function getPrice(station, fuel, mode) {
  const p = station.prices?.[fuel];
  if (!p) return null;
  return mode === 'served' ? p.served ?? null : p.self ?? p.served ?? null;
}

export function formatPrice(value) {
  return value == null ? 'N/A' : `€${value.toFixed(3)}`;
}

export function ageDays(isoDate) {
  if (!isoDate) return null;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
}

export function isStale(isoDate) {
  const d = ageDays(isoDate);
  return d != null && d >= STALE_AFTER_DAYS;
}

// "12 min fa", "3 ore fa", "2 giorni fa" usando le stringhe della lingua corrente
export function formatAge(isoDate, t) {
  if (!isoDate) return '—';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  if (minutes < 2) return t.justNow;
  if (minutes < 60) return `${minutes} ${t.minutesAgo}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} ${t.hoursAgo}`;
  return `${Math.round(hours / 24)} ${t.data.daysAgo}`;
}
