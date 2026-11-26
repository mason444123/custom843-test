const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /https:\/\/telegram\.org\/js\/telegram-web-app\.js/);
const source = fs.readFileSync('telegram-fullscreen.js', 'utf8');
function run(app, hash = '#tgWebAppData=auth&tgWebAppVersion=8.0') {
  const context = {window: {Telegram: {WebApp: app}, location: {hash}}, URLSearchParams};
  vm.runInNewContext(source, context);
}
let calls = [];
run({isVersionAtLeast: () => true, ready: () => calls.push('ready'), requestFullscreen: () => calls.push('fullscreen'), expand: () => calls.push('expand'), onEvent: () => {}});
assert.deepEqual(calls, ['ready', 'fullscreen']);
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
run({ready: () => calls.push('ready'), expand: () => calls.push('expand')}, '');
assert.deepEqual(calls, []);
console.log('Fullscreen initialization: all checks passed');
