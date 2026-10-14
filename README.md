# X-Boat testi

Cloudflare Worker + statik dosyalar (`public/`) + D1. Oturum kayıtları oyundan otomatik olarak `/api/session` ucuna gider.

## Dağıtım
`git push` → Cloudflare Workers Builds `npx wrangler deploy` çalıştırır. D1 veritabanı ilk dağıtımda otomatik oluşturulur, tablo ilk istekte kurulur.

## Bir kerelik ayar
- Cloudflare → Workers & Pages → `xboat` → Settings → Variables and Secrets → `ADMIN_KEY` (Secret).
- Settings → Domains & Routes → Add → Custom domain → `xboat.batur.io`.
- Squarespace DNS: CNAME · Host `xboat` · Data: Cloudflare'in gösterdiği hedef.

## Veriyi okuma
`https://xboat.batur.io/api/export?key=ADMIN_KEY` (ya da `x-admin-key` başlığı) → tüm oturumlar JSON.
