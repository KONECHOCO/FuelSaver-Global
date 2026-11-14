/**
 * Programma ambasciatori Ikonet (partner.ikonetsolutions.com).
 *
 * Privacy: NIENTE viene inviato se l'utente non è arrivato da un invito (link di un ambasciatore
 * letto dal Play Install Referrer, oppure codice inserito a mano). In quel caso inviamo solo un ID
 * casuale dell'installazione, contatori di utilizzo (aperture, annunci visti, acquisto Pro),
 * piattaforma, lingua e — su Android — un hash dell'ID del dispositivo per non contare due volte
 * una reinstallazione. Nessun ID pubblicitario, nessun dato personale.
 *
 * Gli ambasciatori sono pagati per utenti reali che usano l'app su più giorni, MAI per i clic
 * sugli annunci: i "clic" servono solo al server per riconoscere comportamenti anomali.
 */
import { useSyncExternalStore } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { APP_VERSION } from './appInfo';

const API = (import.meta.env.VITE_REFERRAL_API || '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_REFERRAL_KEY || '';
const APP_ID = 'fuelsaver';
const ENABLED = Boolean(API && KEY);

// Il codice si può inserire solo nei primi giorni: chi usa l'app da mesi non è un utente "invitato"
const CODE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const FLUSH_EVERY_MS = 5 * 60 * 1000;
const NEW_SESSION_AFTER_MS = 30 * 60 * 1000;
const LIMITS = { impressions: 500, clicks: 500, revenue_micros: 5_000_000, iap: 3 };

const Native = registerPlugin('Referral'); // implementato solo su Android (ReferralPlugin.java)
const platform = Capacitor.getPlatform();
const isNative = Capacitor.isNativePlatform();

const K = name => `fuelsaver.ref.${name}`;
const read = k => { try { return localStorage.getItem(K(k)); } catch { return null; } };
const write = (k, v) => {
  try {
    if (v == null) localStorage.removeItem(K(k));
    else localStorage.setItem(K(k), v);
  } catch { /* storage non disponibile */ }
};

const ZERO = { impressions: 0, clicks: 0, revenue_micros: 0, iap: 0 };
let counters = { ...ZERO };
try { counters = { ...ZERO, ...JSON.parse(read('counters') || '{}') }; } catch { /* dati vecchi */ }

let state = {
  enabled: ENABLED,
  code: read('code'),
  registered: read('registered') === '1',
  firstSeen: Number(read('firstSeen')) || 0
};
const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}
export function useReferral() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => state);
}

/** True se l'utente può ancora inserire un codice (primi 7 giorni, nessun codice già usato). */
export function canEnterCode(s = state) {
  return s.enabled && !s.code && Date.now() - (s.firstSeen || Date.now()) < CODE_WINDOW_MS;
}

async function request(path, body) {
  const res = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'X-App-Key': KEY },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = new Error(String(res.status));
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function installId() {
  let id = read('installId');
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ||
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    write('installId', id);
  }
  return id;
}

async function deviceId() {
  if (platform !== 'android') return '';
  try {
    const { id } = await Native.getDeviceId();
    return id || '';
  } catch {
    return '';
  }
}

async function register() {
  if (!state.code || state.registered) return;
  const locale = navigator.language || '';
  try {
    await request('/v1/install', {
      app_id: APP_ID,
      install_id: installId(),
      code: state.code,
      platform: isNative ? platform : 'web',
      country: (locale.split('-')[1] || '').slice(0, 2).toUpperCase(),
      locale: locale.slice(0, 10),
      app_version: APP_VERSION,
      device_id: await deviceId(),
      is_emulator: false
    });
    write('registered', '1');
    setState({ registered: true });
  } catch (err) {
    // 404 = codice non più valido (ambasciatore sospeso): lo togliamo e smettiamo di inviare
    if (err.status === 404) {
      write('code', null);
      setState({ code: null });
    }
    // rete assente: riproviamo alla prossima apertura
  }
}

function persist() {
  if (state.code) write('counters', JSON.stringify(counters));
}

/** Invia i contatori accumulati. sessions = 1 a ogni apertura dell'app, 0 per gli invii periodici. */
async function flush(sessions = 0) {
  if (!state.code || !state.registered) return;
  const c = { ...counters };
  if (!sessions && !c.impressions && !c.clicks && !c.iap && !c.revenue_micros) return;
  const sent = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, Math.min(c[k], max)]));
  try {
    await request('/v1/ping', { app_id: APP_ID, install_id: installId(), sessions, ...sent });
    for (const k of Object.keys(LIMITS)) counters[k] = Math.max(0, counters[k] - sent[k]);
    persist();
  } catch {
    // offline: teniamo i contatori e riproviamo più tardi
  }
}

let started = false;
let backgroundedAt = 0;

async function onAppOpen() {
  if (!state.code) return;
  await register();
  await flush(1);
}

/** Da chiamare una volta all'avvio. Non blocca mai l'app. */
export async function initReferral() {
  if (!ENABLED || started) return;
  started = true;
  if (!state.firstSeen) {
    const now = Date.now();
    write('firstSeen', String(now));
    setState({ firstSeen: now });
  }

  // Android: chi arriva da un link di invito viene attribuito senza dover scrivere il codice
  if (!state.code && platform === 'android' && canEnterCode()) {
    try {
      const { referrer } = await Native.getInstallReferrer();
      await applyInstallReferrer(referrer);
    } catch {
      // Play Store non disponibile o referrer scaduto
    }
  }

  await onAppOpen();
  setInterval(() => { flush(0); }, FLUSH_EVERY_MS);
  if (isNative) {
    CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        backgroundedAt = Date.now();
        flush(0);
        return;
      }
      if (backgroundedAt && Date.now() - backgroundedAt >= NEW_SESSION_AFTER_MS) onAppOpen();
    });
  }
}

/** Legge "utm_campaign=CODE&ref=CODE" dal referrer di Google Play. */
export async function applyInstallReferrer(raw) {
  if (!raw || state.code) return false;
  let text = raw;
  try { text = decodeURIComponent(raw); } catch { /* già decodificato */ }
  const m = /(?:^|&)ref=([A-Za-z0-9]{3,20})(?:&|$)/.exec(text);
  return m ? (await setCode(m[1])) === 'ok' : false;
}

/**
 * Applica un codice invito. Ritorna 'ok' | 'invalid' | 'expired' | 'network'.
 */
export async function setCode(raw) {
  const code = String(raw || '').trim().toUpperCase();
  if (!ENABLED) return 'network';
  if (!canEnterCode()) return 'expired';
  if (!/^[A-Z0-9]{3,20}$/.test(code)) return 'invalid';
  try {
    const { valid } = await request(`/v1/code/${encodeURIComponent(code)}`);
    if (!valid) return 'invalid';
  } catch {
    return 'network';
  }
  write('code', code);
  setState({ code });
  await onAppOpen();
  return 'ok';
}

export function trackImpression(valueMicros = 0) {
  if (!state.code) return;
  counters.impressions += 1;
  counters.revenue_micros += Math.max(0, Math.round(Number(valueMicros) || 0));
  persist();
}

/** Valore di un'impression già contata (evento "paid" del banner). */
export function trackRevenue(valueMicros) {
  if (!state.code) return;
  counters.revenue_micros += Math.max(0, Math.round(Number(valueMicros) || 0));
  persist();
}

/** Solo per il controllo anti-frode lato server: i clic non generano premi. */
export function trackClick() {
  if (!state.code) return;
  counters.clicks += 1;
  persist();
}

export function trackPurchase() {
  if (!state.code) return;
  counters.iap += 1;
  persist();
  flush(0);
}
