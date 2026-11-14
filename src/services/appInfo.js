/**
 * Valutazione dell'app, link legali e tutorial iniziale.
 * La valutazione usa la finestra ufficiale In-App Review (Google Play / StoreKit):
 * se lo store decide di non mostrarla, apriamo la scheda dello store.
 */
import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';

export const PRIVACY_URL = 'https://konechoco.github.io/fuelsaver/privacy-policy.html';
export const TERMS_URL = 'https://konechoco.github.io/fuelsaver/terms.html';
export const APP_VERSION = '1.0.3';

const STORE_URLS = {
  android: 'https://play.google.com/store/apps/details?id=com.ikonet.fuelsaver',
  ios: 'https://apps.apple.com/app/id6816716676?action=write-review'
};

const ONBOARDED_KEY = 'fuelsaver.onboarded';
const NAV_COUNT_KEY = 'fuelsaver.navCount';
const REVIEW_ASKED_KEY = 'fuelsaver.reviewAsked';
// Chiediamo la valutazione dopo che l'utente ha usato la funzione principale qualche volta
const NAVIGATIONS_BEFORE_REVIEW = 3;

const read = key => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* storage non disponibile */ }
};

export function openExternal(url) {
  window.open(url, '_blank');
}

export async function rateApp() {
  const platform = Capacitor.getPlatform();
  if (Capacitor.isNativePlatform()) {
    try {
      await InAppReview.requestReview();
      return;
    } catch (err) {
      console.warn('In-app review unavailable', err);
    }
  }
  openExternal(STORE_URLS[platform] || STORE_URLS.android);
}

// Dopo qualche navigazione verso un distributore chiediamo una sola volta la valutazione
export function trackNavigationForReview() {
  if (!Capacitor.isNativePlatform() || read(REVIEW_ASKED_KEY)) return;
  const count = Number(read(NAV_COUNT_KEY) || 0) + 1;
  write(NAV_COUNT_KEY, String(count));
  if (count >= NAVIGATIONS_BEFORE_REVIEW) {
    write(REVIEW_ASKED_KEY, '1');
    // Lasciamo partire prima la navigazione
    setTimeout(() => InAppReview.requestReview().catch(() => {}), 1500);
  }
}

export const isOnboarded = () => read(ONBOARDED_KEY) === '1';
export const setOnboarded = () => write(ONBOARDED_KEY, '1');
