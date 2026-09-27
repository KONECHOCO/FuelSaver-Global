/**
 * Service per la comunicazione con il Backend MIMIT Sync Service
 * 
 * 🇮🇹 ITALIA: Ministero delle Imprese e del Made in Italy (MIMIT)
 * 🌐 BACKEND: Server Node.js / Express con Cron Job ogni 15 minuti su http://localhost:3001
 */

const BACKEND_API_URL = "http://localhost:3001/api/stations";

/**
 * Tenta di recuperare i distributori ed i listini prezzi reali dal Backend MIMIT
 */
export async function fetchLiveBackendStations(lat, lng, radiusKm = 25) {
  try {
    const url = `${BACKEND_API_URL}?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.stations)) {
        console.log(`📡 [MIMIT API Client] Ricevute ${data.stations.length} stazioni reali dal backend MIMIT!`);
        return data.stations;
      }
    }
  } catch (err) {
    console.warn("[MIMIT API Client] Backend locale (port 3001) in fase di avvio o offline. Utilizzo della modalità locale con Open Data MIMIT.", err.message);
  }
  return null;
}
