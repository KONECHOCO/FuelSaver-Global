const STALE_AFTER_DAYS = 3;

// Prezzo mostrato per la modalità scelta. In modalità self, se l'impianto ha solo il servito
// (tipico per GPL e metano in Italia) mostriamo quello invece di nascondere il distributore.
export function getPrice(station, fuel, mode) {
  const p = station.prices?.[fuel];
  if (!p) return null;
  return mode === 'served' ? p.served ?? null : p.self ?? p.served ?? null;
}

// Valute delle fonti ufficiali: euro per la maggior parte, lei per la Romania
const CURRENCIES = {
  EUR: { prefix: '€', suffix: '', decimals: 3 },
  RON: { prefix: '', suffix: ' lei', decimals: 2 }
};

export function formatPrice(value, currency = 'EUR') {
  if (value == null) return 'N/A';
  const c = CURRENCIES[currency] || CURRENCIES.EUR;
  return `${c.prefix}${value.toFixed(c.decimals)}${c.suffix}`;
}

// Importo (es. costo viaggio, risparmio) con 2 decimali nella valuta indicata
export function formatAmount(value, currency = 'EUR') {
  const c = CURRENCIES[currency] || CURRENCIES.EUR;
  return `${c.prefix}${Number(value).toFixed(2)}${c.suffix}`;
}

// Valute che l'app sa mostrare: il server invia solo i Paesi con queste valute
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCIES);

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
