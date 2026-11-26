const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
for (const page of ['index.html', 'moscow.html', 'spb.html', 'kazan.html', 'ufa.html', 'upcoming-events.html', 'shop.html', 'past-events.html', 'offer.html', 'refund.html', 'rules.html', 'privacy-policy.html', 'cookie-policy.html']) {
  const content = fs.readFileSync(page, 'utf8');
  assert.ok(content.includes('https://telegram.org/js/telegram-web-app.js'), `${page} must load Telegram SDK`);
  assert.ok(content.includes('telegram-fullscreen.js?v=20261126-3'), `${page} must initialize Telegram on navigation`);
}
const source = fs.readFileSync('telegram-fullscreen.js', 'utf8');
function run(app, hash = '#tgWebAppData=auth&tgWebAppVersion=8.0') {
  const context = {window: {Telegram: {WebApp: app, WebView: {initParams: hash.includes('tgWebAppVersion') ? {tgWebAppVersion:'8.0'} : {}}}, location: {hash}}, URLSearchParams};
  vm.runInNewContext(source, context);
}
function runWithStoredParameters(app) {
  const context = {window: {Telegram: {WebApp: app, WebView: {initParams: {tgWebAppVersion:'8.0', tgWebAppData:'saved'}}}, location: {hash:''}}, URLSearchParams};
  vm.runInNewContext(source, context);
}
let calls = [];
run({isVersionAtLeast: () => true, ready: () => calls.push('ready'), disableVerticalSwipes: () => calls.push('disable-swipes'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'disable-swipes', 'fullscreen']);
calls = [];
run({isVersionAtLeast: () => true, isFullscreen: true, ready: () => calls.push('ready'), disableVerticalSwipes: () => calls.push('disable-swipes'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'disable-swipes']);
calls = [];
run({isVersionAtLeast: v => v === '7.7', ready: () => calls.push('ready'), disableVerticalSwipes: () => calls.push('disable-swipes'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'disable-swipes', 'expand']);
calls = [];
run({isVersionAtLeast: () => false, ready: () => calls.push('ready'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'expand']);
calls = [];
let failure;
run({isVersionAtLeast: () => true, ready: () => calls.push('ready'), requestFullscreen: () => { throw Error('unsupported'); }, expand: () => calls.push('expand'), onEvent: (event, fn) => { if (event === 'fullscreenFailed') failure = fn; }});
assert.deepEqual(calls, ['ready', 'expand']);
calls = [];
run({isVersionAtLeast: () => true, ready: () => calls.push('ready'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: (event, fn) => { if (event === 'fullscreenFailed') failure = fn; }});
failure({error:'UNSUPPORTED'});
assert.deepEqual(calls, ['ready', 'fullscreen', 'expand']);
calls = [];
runWithStoredParameters({isVersionAtLeast: () => true, ready: () => calls.push('ready'), disableVerticalSwipes: () => calls.push('disable-swipes'), requestFullscreen: () => calls.push('fullscreen'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'disable-swipes', 'fullscreen']);
calls = [];
run({ready: () => calls.push('ready'), expand: () => calls.push('expand')}, '');
assert.deepEqual(calls, []);
console.log('Fullscreen initialization: all checks passed');
