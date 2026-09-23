import assert from 'node:assert/strict';

// Exercise browser install lifecycle without showing an OS install dialog.
const events = new EventTarget();
globalThis.window = events;
window.matchMedia = () => ({ matches: false });
window.navigator = {};
globalThis.document = { readyState: 'complete' };
let registrations = 0;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  userAgent: 'Android Chrome', platform: 'Linux', maxTouchPoints: 1,
  serviceWorker: { register: async (url, options) => {
    assert.equal(url, '/app/sw.js');
    assert.equal(options.scope, '/app/');
    registrations++;
  } },
} });
const install = await import('./js/app/install.js');
assert.equal(install.installState(), 'generic');
assert.equal(await install.promptInstall(), 'unavailable');
assert.equal(install.getDeviceCategory(), 'android');
install.registerServiceWorker();
assert.equal(registrations, 1, 'register even when page load already finished');
document.readyState = 'loading';
install.registerServiceWorker();
assert.equal(registrations, 1);
window.dispatchEvent(new Event('load'));
window.dispatchEvent(new Event('load'));
assert.equal(registrations, 2, 'load registration runs once');
let changes = 0;
const unsubscribe = install.onInstallChange(() => changes++);
let prompts = 0;
function offer(outcome, reject = false) {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  event.prompt = async () => { prompts++; if (reject) throw new Error('unavailable'); };
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(install.installState(), 'ready');
}
offer('dismissed');
assert.equal(await install.promptInstall(), 'dismissed');
assert.equal(install.installState(), 'generic');
assert.equal(await install.promptInstall(), 'unavailable');
assert.equal(prompts, 1, 'a prompt can only be consumed once');
offer('dismissed', true);
assert.equal(await install.promptInstall(), 'dismissed', 'asynchronous prompt failure handled');
assert.equal(install.installState(), 'generic');
offer('accepted');
assert.equal(await install.promptInstall(), 'accepted');
assert.equal(install.installState(), 'installed');
window.dispatchEvent(new Event('appinstalled'));
assert.equal(install.installState(), 'installed');
assert.ok(changes > 0);
unsubscribe();
const previous = changes;
window.dispatchEvent(new Event('appinstalled'));
assert.equal(changes, previous);
navigator.userAgent = 'iPhone';
assert.equal(install.getDeviceCategory(), 'ios');
navigator.userAgent = 'Macintosh';
navigator.platform = 'MacIntel';
navigator.maxTouchPoints = 5;
assert.equal(install.getDeviceCategory(), 'ios', 'iPad desktop user agent');
navigator.maxTouchPoints = 0;
assert.equal(install.getDeviceCategory(), 'desktop');
window.matchMedia = () => ({ matches: true });
assert.equal(install.isStandalone(), true);
console.log('PASS: install lifecycle, prompt failures, one-shot events, device guidance and late service-worker registration');
