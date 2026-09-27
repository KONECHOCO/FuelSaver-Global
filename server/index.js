import express from 'express';
import cors from 'cors';
import { syncMimitData, getNearbyMimitStations, getSyncStatus } from './mimitSync.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoint: Recupera distributori reali vicini alle coordinate GPS dell'utente
app.get('/api/stations', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 25;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Parametri lat e lng obbligatori." });
  }

  const stations = getNearbyMimitStations(lat, lng, radius);
  res.json({
    status: "ok",
    totalCount: stations.length,
    radiusKm: radius,
    stations: stations
  });
});

// API Endpoint: Stato sincronizzazione Ministero MIMIT
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    service: "FuelSaver Global MIMIT Backend Sync API",
    syncStatus: getSyncStatus()
  });
});

// Avvia il server Express
app.listen(PORT, () => {
  console.log(`🚀 [Backend FuelSaver] Server API in ascolto su http://localhost:${PORT}`);
  console.log(`📡 [Backend FuelSaver] Inizio prima sincronizzazione automatici prezzi dal Ministero...`);
  
  // 1. Prima sincronizzazione immediata all'avvio
  syncMimitData();

  // 2. Cron Job: Sincronizza automaticamente ogni 15 minuti dal Ministero italiano
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  setInterval(() => {
    console.log(`⏰ [Backend FuelSaver] Esecuzione Cron Job a tempo per aggiornamento prezzi MIMIT...`);
    syncMimitData();
  }, FIFTEEN_MINUTES);
});
