/**
 * Madero Automotores · Persistencia Cloud en Supabase (Vercel Serverless)
 * Lee y guarda el estado completo del CRM en public.crm_state (id = 'madero_mkt_main').
 */

const STATE_ROW_ID = 'madero_mkt_main';

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
        reject(new Error('Payload demasiado grande'));
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

  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    return sendJson(res, 503, {
      ok: false,
      configured: false,
      error: 'Variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas'
    });
  }

  const authHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      const url = `${supabaseUrl}/rest/v1/crm_state?id=eq.${encodeURIComponent(STATE_ROW_ID)}&select=id,data,updated_at`;
      const resp = await fetch(url, { headers: authHeaders });
      if (!resp.ok) {
        const text = await resp.text();
        return sendJson(res, 502, { ok: false, configured: true, error: `Supabase GET ${resp.status}: ${text}` });
      }
      const rows = await resp.json();
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return sendJson(res, 200, {
        ok: true,
        configured: true,
        exists: Boolean(row && row.data),
        data: row ? row.data : null,
        updated_at: row ? row.updated_at : null
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readJsonBody(req);
      const stateData = body && body.data && typeof body.data === 'object' ? body.data : body;
      if (!stateData || typeof stateData !== 'object' || (!stateData.schema_version && !stateData.agenda_prioridades)) {
        return sendJson(res, 400, { ok: false, error: 'Payload de estado inválido' });
      }

      const nowIso = new Date().toISOString();
      const url = `${supabaseUrl}/rest/v1/crm_state`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: Object.assign({}, authHeaders, {
          Prefer: 'resolution=merge-duplicates,return=representation'
        }),
        body: JSON.stringify([
          {
            id: STATE_ROW_ID,
            data: stateData,
            updated_at: nowIso
          }
        ])
      });

      if (!resp.ok) {
        const text = await resp.text();
        return sendJson(res, 502, { ok: false, configured: true, error: `Supabase SAVE ${resp.status}: ${text}` });
      }

      const saved = await resp.json();
      const savedRow = Array.isArray(saved) && saved.length > 0 ? saved[0] : null;
      return sendJson(res, 200, {
        ok: true,
        configured: true,
        updated_at: (savedRow && savedRow.updated_at) || nowIso
      });
    }

    return sendJson(res, 405, { ok: false, error: 'Método no permitido' });
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err && err.message ? err.message : 'Error interno' });
  }
};
