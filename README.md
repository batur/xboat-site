# X-Boat testi — batur.io üzerinde yayın

Yapı: statik site (`index.html`, `audio/`) + iki küçük Cloudflare Pages Function (`functions/api/`) + D1 veritabanı.
Oturum kayıtları oyundan otomatik olarak `/api/session` ucuna gider; JSON kopyalama yok.

## Kurulum (yaklaşık 15 dk)

1. **GitHub'a yükle**: bu klasörü yeni bir repo yap (ör. `xboat-test`) ve push'la.
2. **Cloudflare hesabı** aç (ücretsiz) → Workers & Pages → Create → Pages → Connect to Git → repoyu seç.
   Framework: None. Build command: boş. Build output directory: boş ya da `/`.
3. **D1 veritabanı oluştur**: Storage & Databases → D1 → Create → ad: `xboat`.
   Console sekmesinde `schema.sql` içeriğini çalıştır.
4. **Bağlantıları ekle**: Pages projesi → Settings → Bindings:
   - D1 database → değişken adı `DB` → `xboat`.
   - Settings → Variables and Secrets → `ADMIN_KEY` = uzun rastgele bir metin (Secret).
   - Deployments → son dağıtımı yeniden dağıt (Retry).
5. **Alt alan adı**: Pages projesi → Custom domains → `xboat.batur.io` ekle. Cloudflare sana bir CNAME hedefi verir (`<proje>.pages.dev`).
6. **Squarespace DNS**: Squarespace → Domains → batur.io → DNS Settings → Add Record:
   Type: CNAME · Host: `xboat` · Data: Cloudflare'in verdiği hedef.
   Yayılması birkaç dakikadan birkaç saate kadar sürebilir; SSL'i Cloudflare verir.

## Veriyi okuma

`https://xboat.batur.io/api/export?key=ADMIN_KEY` → tüm oturumlar JSON.
Anahtarı paylaşma. İstersen anahtarı adres yerine `x-admin-key` başlığıyla gönder.

## Notlar

- `wrangler.toml` içindeki `database_id` yer tutucudur; panelden bağlama yapıyorsan dosyayı silebilirsin.
- Uç noktalar herkese açıktır: oturum kimliği biçimi ve boyut (200 KB) doğrulanır.
- Ses dosyaları 7 gün önbelleğe alınır (`_headers`).
