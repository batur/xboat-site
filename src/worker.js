// X-Boat testi: /api/session (kayıt) ve /api/export (okuma). Diğer her şey statik dosyadır.
const MAX_BYTES = 200 * 1024;
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

let ready = null;
function ensureTable(env) {
  if (!ready) {
    ready = env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY, name TEXT, started_at TEXT, updated_at TEXT NOT NULL, data TEXT NOT NULL)`
    ).run().catch(e => { ready = null; throw e; });
  }
  return ready;
}

async function saveSession(request, env) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BYTES) return json({ ok: false, error: 'too_large' }, 413);
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ ok: false, error: 'too_large' }, 413);
  let d;
  try { d = JSON.parse(text); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (!d || typeof d !== 'object' || typeof d.sid !== 'string' || !/^[A-Za-z0-9]{6,32}$/.test(d.sid))
    return json({ ok: false, error: 'bad_sid' }, 400);
  const name = typeof d.name === 'string' ? d.name.slice(0, 60) : '';
  const started = typeof d.startedAt === 'string' ? d.startedAt.slice(0, 40) : '';
  await ensureTable(env);
  await env.DB.prepare(
    `INSERT INTO sessions (sid,name,started_at,updated_at,data) VALUES (?1,?2,?3,?4,?5)
     ON CONFLICT(sid) DO UPDATE SET name=?2, started_at=?3, updated_at=?4, data=?5`
  ).bind(d.sid, name, started, new Date().toISOString(), text).run();
  return json({ ok: true });
}

async function exportAll(request, env) {
  const key = new URL(request.url).searchParams.get('key') || request.headers.get('x-admin-key') || '';
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    // GEÇİCİ TANILAMA: anahtarı açığa vurmaz; işi bitince kaldırılacak
    const dbg = new URL(request.url).searchParams.get('debug') ? { keySet: !!env.ADMIN_KEY, gotLen: key.length, expectedLen: env.ADMIN_KEY ? String(env.ADMIN_KEY).length : 0 } : {};
    return json({ ok: false, error: 'unauthorized', ...dbg }, 401);
  }
  await ensureTable(env);
  const { results } = await env.DB.prepare('SELECT sid,name,started_at,updated_at,data FROM sessions ORDER BY updated_at DESC').all();
  return json({ ok: true, count: results.length, sessions: results.map(r => ({ ...r, data: JSON.parse(r.data) })) });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/session') {
        return request.method === 'POST' ? await saveSession(request, env) : json({ ok: false, error: 'method_not_allowed' }, 405);
      }
      if (pathname === '/api/export') {
        return request.method === 'GET' ? await exportAll(request, env) : json({ ok: false, error: 'method_not_allowed' }, 405);
      }
    } catch (e) {
      return json({ ok: false, error: 'server_error' }, 500);
    }
    return env.ASSETS.fetch(request);
  },
};
