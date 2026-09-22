/* ==================================================================
   Installing the app on a phone or laptop.

   Chrome and Edge fire `beforeinstallprompt`, which we hold on to so the
   owner can install from a button instead of hunting through a menu.
   Safari on iPhone has no such event, so there we show the two steps by
   hand. Everything degrades to "not available" rather than breaking.
   ================================================================== */
let deferred = null;
let installed = false;
const listeners = new Set();

export const onInstallChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const announce = () => listeners.forEach(fn => fn());

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** 'installed' | 'ready' | 'ios' | 'unavailable' */
export function installState(){
  if (installed || isStandalone()) return 'installed';
  if (deferred) return 'ready';
  if (isIOS()) return 'ios';
  return 'unavailable';
}

/** Returns 'accepted', 'dismissed' or 'unavailable'. */
export async function promptInstall(){
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null;                     // a prompt can only be used once
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

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();                  // keep the browser's own banner away
  deferred = e;
  announce();
});
window.addEventListener('appinstalled', () => {
  installed = true; deferred = null; announce();
});

/* Register the service worker. Without it the browser will not offer to
   install, and the app will not open offline. */
export function registerServiceWorker(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' })
      .catch(err => console.info('Service worker not registered:', err.message));
  });
}
