/* ==========================================================================
   Madero Automotores · Control Integral de Marketing
   Rastreador Silencioso de Aperturas y Vistas (Vercel Logs + Web Analytics)
   ========================================================================== */

window.MaderoTracker = (function () {
  let initialSent = false;
  let lastViewKey = '';

  function canTrack() {
    return typeof window !== 'undefined' && /^https?:/i.test(window.location.protocol);
  }

  function sendEvent(payload) {
    if (!canTrack()) return;

    const data = Object.assign(
      {
        event: 'page_open',
        nivel: 'operativo',
        modulo: 'inicio',
        screen: `${window.innerWidth}x${window.innerHeight}`,
        tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'unknown',
        referrer: document.referrer || 'directo'
      },
      payload || {}
    );

    try {
      const json = JSON.stringify(data);
      if (navigator.sendBeacon) {
        const blob = new Blob([json], { type: 'application/json' });
        const ok = navigator.sendBeacon('/api/track', blob);
        if (ok) return;
      }
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true
      }).catch(() => {});
    } catch (_) {
      // Silencioso: nunca interrumpe la operación del CRM
    }
  }

  function trackOpen() {
    if (initialSent) return;
    initialSent = true;
    sendEvent({ event: 'page_open', nivel: 'operativo', modulo: 'm1-agenda' });
  }

  function trackView(nivel, modulo) {
    const key = `${nivel}:${modulo}`;
    if (!initialSent) {
      initialSent = true;
      lastViewKey = key;
      sendEvent({ event: 'page_open', nivel, modulo });
      return;
    }
    if (key === lastViewKey) return;
    lastViewKey = key;
    sendEvent({ event: 'view_change', nivel, modulo });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(trackOpen, 250);
  });

  return {
    trackOpen,
    trackView
  };
})();
