// GET /api/export?key=...  — tüm oturumları JSON olarak verir (yalnız ADMIN_KEY ile)
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key') || request.headers.get('x-admin-key') || '';
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ ok: false, error: 'unauthorized' }, 401);
  const { results } = await env.DB.prepare('SELECT sid,name,started_at,updated_at,data FROM sessions ORDER BY updated_at DESC').all();
  return json({ ok: true, count: results.length, sessions: results.map(r => ({ ...r, data: JSON.parse(r.data) })) });
}
