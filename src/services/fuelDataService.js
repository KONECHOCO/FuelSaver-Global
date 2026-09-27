/**
 * Client del backend FuelSaver: restituisce solo prezzi da fonti ufficiali
 * (MIMIT 🇮🇹, prix-carburants.gouv.fr 🇫🇷, MITECO 🇪🇸, Tankerkönig/MTS-K 🇩🇪).
 *
 * In sviluppo Vite inoltra /api a http://localhost:3001 (vedi vite.config.js).
 * Nell'app mobile (Capacitor) impostare VITE_API_URL con l'URL pubblico del backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchStations(lat, lng, radiusKm, signal) {
  const url = `${API_BASE}/api/stations?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    stations: data.stations || [],
    sources: data.sources || [],
    supported: data.supported !== false
  };
}
