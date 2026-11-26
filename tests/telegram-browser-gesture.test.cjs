const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('telegram-browser-gesture.js', 'utf8');

function setup({platform = 'iPhone', native = true, miniApp = false} = {}) {
  const listeners = {};
  const events = [];
  const win = {
    navigator: {platform, userAgent: platform},
    location: {hash: miniApp ? '#tgWebAppVersion=8.0' : ''},
    Telegram: {WebView: {initParams: miniApp ? {tgWebAppVersion: '8.0'} : {}}},
    addEventListener: (type, callback, options) => { listeners[type] = {callback, options}; },
  };
  if (native) win.TelegramWebviewProxy = {postEvent: (...args) => events.push(args)};
  vm.runInNewContext(source, {window: win});
  return {listeners, events};
}

let {listeners, events} = setup();
assert.ok(listeners.touchmove, 'iOS webview must register the gesture guard');
assert.equal(listeners.touchmove.options.passive, true, 'normal scrolling must not be prevented');
listeners.touchmove.callback({touches:[{clientY:200}]});
assert.deepEqual(events, [['cancellingTouch', '{}']]);
assert.equal(Object.keys(setup({platform:'Linux armv8'}).listeners).length, 0, 'do not change Android behavior');
assert.equal(Object.keys(setup({native:false}).listeners).length, 0, 'normal Safari has no native bridge');
assert.equal(Object.keys(setup({miniApp:true}).listeners).length, 0, 'do not alter the bot Mini App');
for (const page of ['index.html','moscow.html','spb.html']) {
  assert.ok(fs.readFileSync(page,'utf8').includes('telegram-browser-gesture.js?v=20261126-5'), `${page} missing browser gesture guard`);
}
console.log('Telegram iOS browser gesture guard: all checks passed');
