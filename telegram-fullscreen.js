(() => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const telegram = window.Telegram;
  const app = telegram && telegram.WebApp;
  const initParams = telegram && telegram.WebView && telegram.WebView.initParams;
  if (!app || !(params.has('tgWebAppVersion') || (initParams && initParams.tgWebAppVersion))) return;

  app.ready();
  if (typeof app.isVersionAtLeast === 'function' && app.isVersionAtLeast('7.7') && typeof app.disableVerticalSwipes === 'function') {
    try { app.disableVerticalSwipes(); } catch (_) { /* Older clients may ignore this option. */ }
  }
  const expand = () => { if (typeof app.expand === 'function') app.expand(); };
  if (typeof app.isVersionAtLeast !== 'function' || !app.isVersionAtLeast('8.0') || typeof app.requestFullscreen !== 'function') {
    expand();
    return;
  }
  if (typeof app.onEvent === 'function') {
    app.onEvent('fullscreenFailed', event => {
      if (event.error !== 'ALREADY_FULLSCREEN') expand();
    });
  }
  if (!app.isFullscreen) {
    try { app.requestFullscreen(); } catch (_) { expand(); }
  }
})();
