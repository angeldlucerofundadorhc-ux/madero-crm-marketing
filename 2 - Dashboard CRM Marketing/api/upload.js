/**
 * Madero Automotores · Subida de Archivos Adjuntos a Supabase Storage
 * Sube archivos (hasta 3 MB en base64) al bucket público 'crm-archivos'.
 */

const BUCKET_NAME = 'crm-archivos';

function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        reject(new Error('Archivo demasiado grande para upload directo'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Método no permitido' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    return sendJson(res, 503, { ok: false, configured: false, error: 'Supabase no configurado' });
  }

  try {
    const body = await readJsonBody(req);
    const originalName = String((body && body.filename) || 'archivo').trim();
    const contentType = String((body && body.contentType) || 'application/octet-stream').trim();
    const rawBase64 = String((body && body.base64) || '').trim();

    if (!rawBase64) {
      return sendJson(res, 400, { ok: false, error: 'Falta contenido base64' });
    }

    const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/i, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length === 0 || buffer.length > 3.5 * 1024 * 1024) {
      return sendJson(res, 400, { ok: false, error: 'Tamaño de archivo inválido (máximo 3 MB)' });
    }

    const safeName = originalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 80) || 'archivo';

    const objectPath = `avances/${Date.now()}-${safeName}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${objectPath}`;

    const resp = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!resp.ok) {
      const text = await resp.text();
      return sendJson(res, 502, { ok: false, error: `Storage ${resp.status}: ${text}` });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${objectPath}`;
    return sendJson(res, 200, {
      ok: true,
      name: originalName,
      url: publicUrl
    });
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err && err.message ? err.message : 'Error subiendo archivo' });
  }
};
