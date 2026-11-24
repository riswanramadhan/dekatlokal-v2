# Aktivasi Digital Checkup — produksi

> Pembaruan 13 September: lihat [form nasional dan akses ahli tanpa email](PEMBARUAN_FORM_DAN_AHLI.md) untuk migration tambahan, tiga nama ahli, dan pemrosesan panel otomatis. Konfigurasi login UMKM Google/OTP di dokumen ini tetap berlaku.

Domain aplikasi: **https://digitalcheckup.dekatlokal.com**.
Dokumen ini menggantikan petunjuk login magic-link dan proses rekomendasi manual dalam panduan lama. Perubahan kode bukan bukti aplikasi sudah terdeploy.

Untuk langkah Google, SMTP/OTP, worker, dan akun demo terbaru, gunakan [AKTIVASI_LOGIN_DAN_AKUN_DEMO.md](AKTIVASI_LOGIN_DAN_AKUN_DEMO.md).

## 1. Pasang database dan environment

Cadangkan database, pastikan proyek Supabase yang dipilih benar, lalu tinjau dan jalankan migration berurutan melalui pipeline Supabase atau SQL Editor:

1. `202609100001_digital_checkup.sql`
2. `202609100002_instrument.sql`
3. `202609100003_snapshot_guards.sql`
4. `202609120001_free_learning.sql`
5. `202609130001_email_free_experts.sql`
6. `202609140001_results_and_learning_access.sql`
7. `202611240010_usability_sus.sql` — kolom SUS opsional pada `dc_usability_tests` (skor dihitung database).

Jangan menjalankan ulang migration lama jika sudah terpasang. Migration baru menambahkan klaim checkup, antrean rekomendasi, dan progres belajar tanpa menghapus jawaban lama. Tidak ada seed jawaban UMKM/penilaian ahli rekaan. Ada 25 tabel `dc_*` dengan RLS.

Di environment **production hosting** (bukan hanya file komputer), isi:

- `NEXT_PUBLIC_APP_URL=https://digitalcheckup.dekatlokal.com`
- `NEXT_PUBLIC_SUPABASE_URL`: URL proyek produksi.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY`: key publik dari proyek yang sama.
- `SUPABASE_SERVICE_ROLE_KEY`: secret server saja; jangan pakai awalan NEXT_PUBLIC.
- `CRON_SECRET`: secret acak minimal 32 karakter, khusus scheduler.
- `DC_BUILD_ID`: commit/release yang benar, untuk jejak perhitungan.

Redeploy setelah environment berubah. Aplikasi memerlukan Next.js server, bukan static export. Jangan memasukkan secret ke Git, screenshot, URL, log, maupun chat. API key tidak memberi akses menjalankan DDL; gunakan SQL Editor atau koneksi database yang sesuai.

**Perhatian keamanan:** `.env.local` sudah tercatat sebagai file tracked dalam repository ini. Aturan ignore sudah diperbaiki, tetapi tidak menghapus file yang telanjur tracked atau riwayat Git. Operator perlu menjalankan `git rm --cached .env.local` (file lokal tetap ada), memeriksa riwayat dan merotasi secret jika pernah tercommit/terbagikan. Jangan memasukkan secret baru sampai risiko ini dibereskan.

## 2. Email OTP (akun baru maupun akun lama)

Di Supabase Authentication:

1. URL Configuration → Site URL: `https://digitalcheckup.dekatlokal.com`.
2. Redirect URLs: hanya `https://digitalcheckup.dekatlokal.com/auth/callback` untuk produksi. Hindari wildcard.
3. Aktifkan Email provider dan **Allow new users to sign up**, tetap aktifkan konfirmasi email.
4. Konfigurasikan **custom SMTP** beserta domain pengirim/SPF/DKIM. Pengirim bawaan Supabase tidak memadai untuk pengiriman publik produksi.
5. Pada **Magic Link** dan **Confirm signup**, salin isi `supabase/templates/otp.html`. Keduanya harus memakai `{{ .Token }}`, bukan hanya tautan, supaya akun baru juga mendapat kode.
6. Atur masa berlaku OTP sesuai kebijakan, misalnya 10 menit; terapkan rate limit Supabase. Form menerima 6–10 digit dan memberi jeda kirim ulang 60 detik. Jeda UI bukan pengganti rate limit server.
7. Uji menggunakan email nyata milik penguji: kirim kode → salah kode ditolak → kode benar masuk → kode terpakai ditolak. Uji akun baru dan akun lama.

Kode tidak disimpan di localStorage. Session Supabase dikelola melalui cookie. Email dinormalisasi oleh layanan Auth; peran admin/ahli tidak diambil dari metadata pengguna.

Rujukan resmi: [OTP email](https://supabase.com/docs/guides/auth/auth-email-passwordless), [template email](https://supabase.com/docs/guides/auth/auth-email-templates).

## 3. Google

> Diperbarui: ikuti bagian **"Aktifkan login Google (pembaruan November 2026)"** di akhir dokumen ini.

1. Buat OAuth client **Web application** di Google Cloud. Lengkapi consent screen, domain terverifikasi, tautan privasi/syarat, dan status publik sesuai kebutuhan Google.
2. Authorized JavaScript origin: `https://digitalcheckup.dekatlokal.com`.
3. Authorized redirect URI: salin **Callback URL dari provider Google pada Supabase**, berbentuk `https://<project-ref>.supabase.co/auth/v1/callback`. Ini berbeda dari callback aplikasi.
4. Masukkan Client ID dan Client Secret ke Supabase → Authentication → Sign In / Providers → Google, lalu aktifkan.
5. Callback aplikasi tetap `https://digitalcheckup.dekatlokal.com/auth/callback`. Jangan memasukkan Client Secret ke browser.
6. Uji dengan akun Google nyata yang diizinkan consent screen; pastikan kembali ke domain resmi, bukan domain preview.

Rujukan: [Google Auth Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [redirect URL](https://supabase.com/docs/guides/auth/redirect-urls).

## 4. Rekomendasi otomatis

Saat user menekan **Kirim dan lihat hasil**, nilai delapan bagian langsung dihitung dari 32 jawaban. Jika model tiga ahli yang sah sudah dibekukan, rekomendasi langsung dihitung. Tanpa model, UI menampilkan nilai dan status menunggu; tidak mengarang ranking.

Transaksi pengiriman dan pembekuan model otomatis memasukkan pekerjaan ke `dc_recommendation_jobs`. Worker sesudah respons memproses antrean; job unik, lease 5 menit, dan retry berjeda mencegah kehilangan pekerjaan akibat restart. Halaman hasil/dashboard juga memeriksa hasil berkala. Scheduler diperlukan agar pemrosesan tetap berjalan ketika user sudah menutup browser.

Aktifkan Supabase Cron dan pg_net melalui Dashboard. Simpan secret yang sama dengan `CRON_SECRET` di Supabase Vault dengan nama `dc_worker_secret`. Jangan menulis nilainya langsung di SQL job. Jalankan SQL berikut sekali setelah domain produksi aktif:

```sql
select cron.schedule(
  'digital-checkup-recommendations',
  '* * * * *',
  $job$
    select net.http_get(
      url := 'https://digitalcheckup.dekatlokal.com/api/digital-checkup/jobs',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'dc_worker_secret' limit 1
        )
      ),
      timeout_milliseconds := 60000
    );
  $job$
);
```

Batasi akses Vault dan Cron pada operator. Pantau **respons HTTP** di `net._http_response` (bukan hanya keberhasilan SQL Cron), status job, attempts, dan pekerjaan tertua. Worker mengembalikan 401 tanpa bearer yang benar, 503 jika secret belum disiapkan, 200 dengan jumlah selesai saat berhasil. Hosting harus memberi durasi request minimal 60 detik. Secret boleh dirotasi pada hosting dan Vault bersamaan.

Perhitungan memakai versi instrumen/model yang tersimpan. Hasil lama immutable. Setelah tiga penugasan roster berstatus final dan lolos validasi, worker membekukan model dengan identitas satu admin/peneliti yang sudah ada sebagai jejak persetujuan. Admin masih dapat membekukan model lewat panel sebagai jalur audit/cadangan. Tidak ada kebutuhan menjalankan rekomendasi per UMKM secara manual.

Rujukan: [Supabase Cron](https://supabase.com/docs/guides/cron), [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net).

## 5. Akun admin dan ahli

Admin pertama dibuat melalui Supabase Dashboard Auth, atau gunakan akun milik operator yang sudah diverifikasi. Catat UUID yang benar, lalu SQL Editor: `insert into public.dc_profiles(user_id,role,display_name) values ('UUID_OPERATOR','admin','Admin DekatLokal') on conflict(user_id) do update set role='admin';`

Jangan berikan role admin berdasarkan email dari form publik. Script seed development lama **bukan** alat provisioning produksi.

Admin masuk langsung melalui `https://digitalcheckup.dekatlokal.com/admin` memakai email dan kata sandi akun Supabase yang sudah memiliki role `admin` atau `researcher`. Halaman masuk UMKM tetap hanya menyediakan Google dan OTP email serta tidak menampilkan tautan staf. Form admin tidak membuat akun maupun memberikan role berdasarkan email. Ahli tetap masuk langsung melalui `/ahli` dengan memilih penugasan yang tersedia. Uji akses silang: UMKM tidak boleh membuka admin/ahli, dan ahli tidak boleh membaca ranking kasus yang sedang dinilai.

## 6. Checkup → akun → belajar

- Draf di browser disimpan maksimal 7 hari setelah persetujuan; cookie rahasia checkup berlaku 30 hari. Jangan gunakan perangkat bersama.
- Setelah login, server menautkan hasil menggunakan hash secret cookie, **bukan ID hasil dalam URL**. Hanya akun UMKM boleh mengklaim; hasil milik akun lain tidak bisa diambil.
- Draf browser dihapus setelah hasil terkonfirmasi terhubung. Kegagalan klaim tidak menghapus draf; dashboard menyediakan percobaan ulang.
- Cookie yang dihapus/kedaluwarsa tidak dapat digantikan dengan ID dari localStorage. Draf lokal bisa dipulihkan untuk mengisi checkup baru di `/mulai`; tidak boleh mengambil hasil server tanpa bukti kepemilikan.
- `/dashboard` adalah dashboard Supabase produksi. Setelah hasil final terhubung, satu masa akses gratis tujuh hari dimulai. Tersedia tujuh modul, 21 materi, latihan tertulis, kuis per modul, dan unduhan catatan/rencana aksi. Checkup atau login ulang tidak mereset masa akses; progres tetap tersimpan setelah akses berakhir.
- Nilai kuis dihitung server; materi dibuka berurutan. Dua dari tiga jawaban benar menuntaskan modul. Skor terbaik dan status tuntas tidak turun saat mencoba lagi.
- Materi gratis merupakan belajar mandiri, bukan janji pendampingan one-on-one, sertifikasi, atau jaminan hasil usaha. Tanpa ranking ahli, perpustakaan ditampilkan sebagai daftar umum.

## 7. Checklist rilis

Jalankan lint, typecheck, unit/database tests, build, lalu browser tests secara berurutan. Tes terisolasi memakai alamat loopback agar tidak menciptakan pengguna/jawaban palsu di produksi; callback produk selalu domain resmi.

Jalankan `npm run check:production` untuk memeriksa environment, keberadaan tabel, model final, dan provider Auth secara read-only. Kode keluar 1 berarti masih ada aktivasi yang belum lengkap. Pemeriksaan ini tidak menampilkan secret dan bukan pengganti uji SMTP/login nyata.

Sesudah deploy, gunakan akun penguji nyata dengan izin: isi checkup → hasil → Google/OTP → dashboard → praktik materi → kuis → keluar/masuk → progres tetap ada. Uji 360px dan desktop, keyboard, OTP salah/kedaluwarsa, koneksi putus, retry kirim final, dua tab, akun lain, dan rekomendasi setelah model dibekukan. Jangan menyebut alur produksi terverifikasi sebelum pengujian ini dilakukan.

Pemeriksaan read-only pada 12 September 2026: instrumen tersedia; model final berjumlah 0; Google belum aktif; email dan signup aktif; tabel learning/jobs belum tersedia; konfigurasi koneksi database dan CRON_SECRET belum ditemukan di environment kerja. Tidak ada data penelitian atau akun baru yang dibuat oleh pemeriksaan ini.
# Pembaruan terbaru

Lihat [profil usaha dan panel tiga ahli](UPDATE_PROFIL_DAN_PANEL_AHLI.md) untuk nama panel, form kontak, dan perubahan login terbaru.

## Aktifkan login Google (pembaruan November 2026 — menggantikan bagian 3 di atas)

Kode sudah siap: tombol "Lanjut dengan Google" otomatis muncul begitu provider Google aktif di Supabase
(dicek lewat `/auth/v1/settings`, cache 5 menit), dan pembatalan di layar Google kembali ke `/masuk` dengan pesan yang jelas.
Yang perlu dilakukan pemilik akun (sekali saja):

1. **Google Cloud Console** (console.cloud.google.com) → buat/pilih project "DekatLokal".
   - *APIs & Services → OAuth consent screen*: tipe **External**, nama aplikasi "DekatLokal Digital Checkup",
     email dukungan, logo, domain resmi `dekatlokal.com`, tautan kebijakan privasi `https://dekatlokal.com/privacy-policy`.
     Scope cukup `email`, `profile`, `openid`. Setelah lengkap klik **Publish app** (kalau masih "Testing", hanya akun penguji yang bisa masuk).
   - *Credentials → Create credentials → OAuth client ID → Web application*:
     - Authorized JavaScript origins: `https://digitalcheckup.dekatlokal.com`
     - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
       (`<project-ref>` = subdomain URL Supabase produksi).
   - Salin **Client ID** dan **Client secret**.
2. **Supabase** → project produksi → *Authentication → Sign In / Providers → Google*: aktifkan, tempel Client ID
   dan Client secret, simpan. Client secret hanya diisi di dashboard Supabase, tidak di repo atau Vercel.
3. **Supabase** → *Authentication → URL Configuration*:
   - Site URL: `https://digitalcheckup.dekatlokal.com`
   - Redirect URLs: tambahkan `https://digitalcheckup.dekatlokal.com/auth/callback**`
     (tanda `**` perlu karena callback membawa `?next=…` untuk kembali ke halaman asal).
4. Uji: buka `/masuk` → "Lanjut dengan Google" → pilih akun → harus mendarat di `/dashboard` (atau halaman `next`).
   Akun baru otomatis berperan UMKM dan hasil Checkup tamu ikut tersambung.

### Status konfigurasi (24 November 2026)

Sudah dikerjakan bersama pemilik akun:

| Tempat | Pengaturan | Nilai |
| --- | --- | --- |
| Google Cloud | Project | **DekatLokal Digital Checkup** (`dekatlokal-digital-checkup`), terpisah dari project Gemini |
| Google Auth Platform → Branding | Nama aplikasi | DekatLokal Digital Checkup (tanpa logo, supaya tidak perlu verifikasi) |
| | Beranda / privasi / syarat | `https://digitalcheckup.dekatlokal.com`, `https://dekatlokal.com/privacy-policy`, `https://dekatlokal.com/terms-of-service` |
| | Authorized domains | `dekatlokal.com`, `jpiddlrzrbnkvftbsoob.supabase.co` |
| Google Auth Platform → Audience | Status | External, **In production** (semua akun Google bisa masuk) |
| Google Auth Platform → Clients | OAuth client | "Digital Checkup (Supabase Auth)", Web application; origin `https://digitalcheckup.dekatlokal.com`; redirect `https://jpiddlrzrbnkvftbsoob.supabase.co/auth/v1/callback` |
| Supabase (project `jpiddlrzrbnkvftbsoob`) → Providers → Google | Aktif | Client ID + Client secret (secret hanya di dashboard Supabase) |
| Supabase → URL Configuration | Site URL | `https://digitalcheckup.dekatlokal.com` (sebelumnya masih `http://localhost:3000`) |
| | Redirect URLs | `https://digitalcheckup.dekatlokal.com/auth/callback**` |

Diuji end-to-end di produksi: `/masuk` → "Lanjut dengan Google" → pilih akun → izinkan → kembali ke
`/auth/callback` dan sesi terbentuk. Tujuan akhir mengikuti peran akun (`finishSignIn`): UMKM → `/dashboard`,
ahli → `/ahli`, admin/peneliti → `/admin`. Akun penguji yang dipakai sudah berperan ahli, jadi mendarat di `/ahli`;
uji alur UMKM dengan akun Google lain.

Catatan penting:

- **Project Supabase gratis bisa di-pause** setelah lama tidak aktif. Saat itu domain `*.supabase.co` tidak bisa
  diakses sama sekali, sehingga login Google, OTP, dan penyimpanan data di produksi berhenti. Buka dashboard
  Supabase → *Restore project*, atau naikkan ke paket berbayar agar tidak di-pause.
- **Client secret Google hanya ditampilkan sekali.** Kalau hilang atau perlu diganti: Google Cloud → Clients →
  "Digital Checkup (Supabase Auth)" → *Add secret* → tempel ke Supabase → simpan → nonaktifkan secret lama.
  Bila Supabase membalas `missing OAuth secret`, artinya kolom secret di Supabase masih kosong.
- Layar Google saat ini menulis "Lanjutkan ke jpiddlrzrbnkvftbsoob.supabase.co". Agar tertulis nama/domain
  DekatLokal: (a) ajukan *brand verification* di Google Auth Platform → Verification Center (gratis untuk scope
  email/profile), dan/atau (b) pasang custom domain Supabase (mis. `auth.dekatlokal.com`, add-on berbayar),
  lalu ganti redirect URI di OAuth client ke domain tersebut.
- Callback aplikasi dikunci ke domain produksi (`lib/digital-checkup/site.ts`), jadi uji login Google dilakukan
  di `https://digitalcheckup.dekatlokal.com`, bukan di localhost atau preview Vercel.
