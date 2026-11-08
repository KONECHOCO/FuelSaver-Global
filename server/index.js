import express from 'express';
import cors from 'cors';
import { inBox } from './geo.js';
import { italy } from './providers/italy.js';
import { france } from './providers/france.js';
import { spain } from './providers/spain.js';
import { germany } from './providers/germany.js';
import { austria } from './providers/austria.js';
import { portugal } from './providers/portugal.js';
import { croatia } from './providers/croatia.js';
import { romania } from './providers/romania.js';
import { slovenia } from './providers/slovenia.js';

// Solo fonti ufficiali/governative: nessun prezzo inventato o stimato
const PROVIDERS = [italy, france, spain, germany, austria, portugal, croatia, romania, slovenia];
const MAX_RESULTS = 250;

const app = express();
const PORT = process.env.PORT || 3001;

// Dietro nginx (host) e la rete Docker: l'IP reale è l'ultimo aggiunto in X-Forwarded-For
app.set('trust proxy', 'loopback, uniquelocal');
app.use(cors());
app.use(express.json());

// Limite di richieste per IP: un utente dell'app fa poche ricerche al minuto, mentre chi volesse
// scaricare in massa i prezzi (vietato dalle condizioni di Tankerkönig/MTS-K) ne farebbe centinaia.
// Soglie larghe per non penalizzare più utenti dietro lo stesso IP (reti mobili con NAT).
const LIMITS = [
  { windowMs: 60 * 1000, max: 30 },
  { windowMs: 60 * 60 * 1000, max: 300 },
  { windowMs: 24 * 60 * 60 * 1000, max: 1500 }
];
const hits = new Map(); // ip -> timestamps delle richieste nelle ultime 24 ore

function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const list = (hits.get(ip) || []).filter(t => now - t < LIMITS[LIMITS.length - 1].windowMs);
  for (const { windowMs, max } of LIMITS) {
    const inWindow = list.filter(t => now - t < windowMs);
    if (inWindow.length >= max) {
      hits.set(ip, list);
      res.set('Retry-After', String(Math.ceil((inWindow[0] + windowMs - now) / 1000)));
      return res.status(429).json({ error: 'Troppe richieste, riprova più tardi.' });
    }
  }
  list.push(now);
  hits.set(ip, list);
  next();
}

// Pulizia periodica degli IP inattivi
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) {
    if (!list.length || now - list[list.length - 1] > LIMITS[LIMITS.length - 1].windowMs) hits.delete(ip);
  }
}, 10 * 60 * 1000).unref();

// API Endpoint: distributori reali vicini alle coordinate GPS dell'utente
app.get('/api/stations', rateLimit, async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = Math.min(Math.max(parseFloat(req.query.radius) || 10, 1), 50);

  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'Parametri lat e lng obbligatori.' });
  }

  // Vicino ai confini (es. Ventimiglia/Mentone) interroghiamo più paesi e uniamo i risultati
  // I client fino alla 1.0.1 mostrano sempre "€": i Paesi con altra valuta arrivano solo a chi la dichiara
  // (es. ?currencies=EUR,RON). Senza parametro restano solo le fonti in euro.
  const currencies = new Set(String(req.query.currencies || 'EUR').toUpperCase().split(','));
  const active = PROVIDERS.filter(p => inBox(lat, lng, p.bbox) && currencies.has(p.currency || 'EUR') && (!p.enabled || p.enabled()));
  const settled = await Promise.allSettled(active.map(p => p.query(lat, lng, radius)));

  const stations = [];
  const sources = [];
  settled.forEach((r, i) => {
    const p = active[i];
    if (r.status === 'fulfilled') {
      stations.push(...r.value.map(s => ({ ...s, currency: p.currency || 'EUR', source: p.source })));
      sources.push({ country: p.country, currency: p.currency || 'EUR', source: p.source, license: p.license, count: r.value.length });
    } else {
      console.error(`❌ [${p.country}] Query fallita:`, r.reason?.message);
      sources.push({ country: p.country, source: p.source, error: true });
    }
  });

  stations.sort((a, b) => a.distanceKm - b.distanceKm);
  res.set('Cache-Control', 'public, max-age=120');
  res.json({
    status: 'ok',
    supported: active.length > 0,
    radiusKm: radius,
    totalCount: stations.length,
    sources,
    stations: stations.slice(0, MAX_RESULTS)
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FuelSaver Global API',
    providers: Object.fromEntries(PROVIDERS.map(p => [p.country, p.status()]))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [Backend FuelSaver] API in ascolto su http://localhost:${PORT}`);
  // Ogni provider gestisce il proprio calendario di aggiornamento in base alla frequenza della fonte
  for (const p of PROVIDERS) p.init().catch(err => console.error(`❌ [${p.country}] init:`, err.message));
});
