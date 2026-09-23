/* ==================================================================
   Installing the app on a phone, tablet or computer.
   Supports Chrome, Safari (iOS/Mac), Edge, Android browsers, Samsung Internet, Firefox.
   ================================================================== */
let deferred = null;
let installed = false;
const listeners = new Set();

export const onInstallChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const announce = () => listeners.forEach(fn => fn());

export const isStandalone = () =>
  (typeof window !== 'undefined') && (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );

export const isIOS = () =>
  (typeof navigator !== 'undefined') && (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

export const isAndroid = () =>
  (typeof navigator !== 'undefined') && /android/i.test(navigator.userAgent);

export function getDeviceCategory(){
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
}

/** 'installed' | 'ready' | 'generic' */
export function installState(){
  if (installed || isStandalone()) return 'installed';
  if (deferred) return 'ready';
  return 'generic';
}

/** Returns 'accepted', 'dismissed' or 'unavailable'. */
export async function promptInstall(){
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null;
  announce();
  try {
    event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted'){ installed = true; announce(); }
    return outcome;
  } catch {
    return 'dismissed';
  }
}

if (typeof window !== 'undefined'){
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    announce();
  });
  window.addEventListener('appinstalled', () => {
    installed = true; deferred = null; announce();
  });
}

/* Register the service worker for offline support */
export function registerServiceWorker(){
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' })
      .catch(err => console.info('Service worker not registered:', err.message));
  });
}
