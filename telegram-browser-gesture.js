// Test-only mitigation for Telegram's iOS in-app browser gesture conflict.
// Telegram iOS itself sends cancellingTouch for interactions it detects.
(() => {
  const nav = window.navigator || {};
  if (!/iPhone|iPad|iPod/i.test((nav.platform || '') + ' ' + (nav.userAgent || ''))) return;
  const bridge = window.TelegramWebviewProxy;
  if (!bridge || typeof bridge.postEvent !== 'function') return;
  const init = window.Telegram && window.Telegram.WebView && window.Telegram.WebView.initParams;
  if ((init && init.tgWebAppVersion) || /(?:^|[&#])tgWebAppVersion=/.test(window.location.hash)) return;
  window.addEventListener('touchmove', () => {
    try { bridge.postEvent('cancellingTouch', '{}'); } catch (_) { /* Other browser versions may not support this event. */ }
  }, {passive: true, capture: true});
})();
