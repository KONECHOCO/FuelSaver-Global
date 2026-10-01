/**
 * Posizione del dispositivo.
 * Nell'app nativa usa il plugin Capacitor: il popup è quello di sistema con il nome "FuelSaver"
 * e il testo di NSLocationWhenInUseUsageDescription (la geolocalizzazione della WebView
 * mostrerebbe invece "localhost vorrebbe utilizzare la tua posizione").
 */
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const OPTIONS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };

export async function getDevicePosition() {
  if (Capacitor.isNativePlatform()) {
    let perm = await Geolocation.checkPermissions();
    if (perm.location === 'prompt' || perm.location === 'prompt-with-rationale') {
      perm = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
    }
    if (perm.location === 'denied' && perm.coarseLocation !== 'granted') {
      throw new Error('Location permission denied');
    }
    const pos = await Geolocation.getCurrentPosition(OPTIONS);
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }

  if (!navigator.geolocation) throw new Error('Geolocation not supported');
  const pos = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, OPTIONS));
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
