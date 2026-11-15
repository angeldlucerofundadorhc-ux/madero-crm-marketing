/**
 * Madero Automotores · Rastreador de Aperturas (Vercel Serverless Function)
 * Registra fecha/hora exacta (ART), geolocalización por headers de Vercel
 * (ciudad, provincia, país, IP) y dispositivo/navegador en los Runtime Logs.
 */

function safeDecode(val) {
  if (!val) return '';
  try {
    return decodeURIComponent(String(val));
  } catch (_) {
    return String(val);
  }
}

function parseUserAgent(ua) {
  const s = String(ua || '');
  const isMobile = /Mobile|Android|iPhone|iPod/i.test(s);
  const isTablet = /iPad|Tablet/i.test(s);
  const dispositivo = isTablet ? 'Tablet' : isMobile ? 'Móvil' : 'Desktop';

  let os = 'Otro OS';
  if (/Windows/i.test(s)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(s)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(s)) os = 'macOS';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/Linux/i.test(s)) os = 'Linux';

  let browser = 'Otro Nav';
  if (/Edg\//i.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(s)) browser = 'Opera';
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = 'Chrome';
  else if (/Safari\//i.test(s) && !/Chrome\//i.test(s)) browser = 'Safari';
  else if (/Firefox\//i.test(s)) browser = 'Firefox';

  return { dispositivo, os, browser };
}

function formatArgentinaTime(date) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } catch (_) {
    return date.toISOString();
  }
}

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const now = new Date();
  const timestampAr = formatArgentinaTime(now);

  const ciudad = safeDecode(req.headers['x-vercel-ip-city']) || 'Desconocida';
  const region = safeDecode(req.headers['x-vercel-ip-country-region']) || '-';
  const pais = safeDecode(req.headers['x-vercel-ip-country']) || '-';
  const lat = req.headers['x-vercel-ip-latitude'] || null;
  const lon = req.headers['x-vercel-ip-longitude'] || null;

  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? String(forwarded).split(',')[0].trim()
    : (req.headers['x-real-ip'] || 'desconocida');

  const uaRaw = req.headers['user-agent'] || '';
  const ua = parseUserAgent(uaRaw);

  let body = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else if (typeof req.body === 'string' && req.body.trim()) {
    try {
      body = JSON.parse(req.body);
    } catch (_) {
      body = {};
    }
  }

  const evento = body.event || (req.query && req.query.event) || 'page_open';
  const nivel = body.nivel || (req.query && req.query.nivel) || 'operativo';
  const modulo = body.modulo || (req.query && req.query.modulo) || '-';
  const pantalla = body.screen || '-';
  const referrer = body.referrer || req.headers['referer'] || 'directo';

  const record = {
    tag: 'MADERO_TRACK',
    fecha_hora_ar: timestampAr,
    iso_utc: now.toISOString(),
    evento,
    nivel,
    modulo,
    ubicacion: {
      ciudad,
      region,
      pais,
      lat,
      lon
    },
    dispositivo: `${ua.dispositivo} · ${ua.os} · ${ua.browser}`,
    pantalla,
    ip,
    referrer
  };

  console.log(
    `[MADERO-TRACK] ${timestampAr} (ART) | ${ciudad}, ${region}, ${pais} | ${record.dispositivo} | ${evento} (${nivel}/${modulo}) | IP: ${ip}`
  );
  console.log(JSON.stringify(record));

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      fecha_hora_ar: timestampAr,
      ubicacion: { ciudad, region, pais },
      dispositivo: record.dispositivo
    })
  );
};
