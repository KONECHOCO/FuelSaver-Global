import express from 'express';
import cors from 'cors';
import { inBox } from './geo.js';
import { italy } from './providers/italy.js';
import { france } from './providers/france.js';
import { spain } from './providers/spain.js';
import { germany } from './providers/germany.js';

// Solo fonti ufficiali/governative: nessun prezzo inventato o stimato
const PROVIDERS = [italy, france, spain, germany];
const MAX_RESULTS = 250;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoint: distributori reali vicini alle coordinate GPS dell'utente
app.get('/api/stations', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = Math.min(Math.max(parseFloat(req.query.radius) || 10, 1), 50);

  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'Parametri lat e lng obbligatori.' });
  }

  // Vicino ai confini (es. Ventimiglia/Mentone) interroghiamo più paesi e uniamo i risultati
  const active = PROVIDERS.filter(p => inBox(lat, lng, p.bbox));
  const settled = await Promise.allSettled(active.map(p => p.query(lat, lng, radius)));

  const stations = [];
  const sources = [];
  settled.forEach((r, i) => {
    const p = active[i];
    if (r.status === 'fulfilled') {
      stations.push(...r.value.map(s => ({ ...s, source: p.source })));
      sources.push({ country: p.country, source: p.source, license: p.license, count: r.value.length });
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
