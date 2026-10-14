// POST /api/session  — oturum verisini sid ile kaydeder (varsa günceller)
const MAX_BYTES = 200 * 1024;
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'db_missing' }, 500);
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BYTES) return json({ ok: false, error: 'too_large' }, 413);
  let text;
  try { text = await request.text(); } catch { return json({ ok: false, error: 'bad_body' }, 400); }
  if (text.length > MAX_BYTES) return json({ ok: false, error: 'too_large' }, 413);
  let d;
  try { d = JSON.parse(text); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (!d || typeof d !== 'object' || typeof d.sid !== 'string' || !/^[A-Za-z0-9]{6,32}$/.test(d.sid))
    return json({ ok: false, error: 'bad_sid' }, 400);
  const name = typeof d.name === 'string' ? d.name.slice(0, 60) : '';
  const started = typeof d.startedAt === 'string' ? d.startedAt.slice(0, 40) : '';
  await env.DB.prepare(
    `INSERT INTO sessions (sid,name,started_at,updated_at,data) VALUES (?1,?2,?3,?4,?5)
     ON CONFLICT(sid) DO UPDATE SET name=?2, started_at=?3, updated_at=?4, data=?5`
  ).bind(d.sid, name, started, new Date().toISOString(), text).run();
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'method_not_allowed' }, 405);
