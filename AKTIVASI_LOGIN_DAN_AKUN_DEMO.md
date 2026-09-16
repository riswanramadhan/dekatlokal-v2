# Aktivasi Login Produksi dan Akun Demo UMKM

Domain resmi: **https://digitalcheckup.dekatlokal.com**

Dokumen ini dipakai setelah kode terbaru sudah terdeploy. Jangan memasukkan Client Secret Google, kredensial SMTP, service-role key, OTP, atau token sesi ke Git, screenshot, URL, maupun chat.

## Status yang sudah terbukti dari pemeriksaan read-only

Pemeriksaan produksi pada 16 September 2026 menunjukkan:

- domain aplikasi dan Supabase produksi sudah cocok;
- tiga penugasan ahli tersedia dan ketiganya sudah final;
- model ahli final sudah tersedia;
- migration instrumen, model, progres, akses tujuh hari, dan antrean rekomendasi tersedia;
- Email provider dan pendaftaran user aktif;
- Google provider belum aktif;
- `CRON_SECRET` belum tersedia pada environment yang diperiksa.

Jalankan ulang `npm run check:production` setelah aktivasi. Pemeriksaan ini read-only dan tidak menampilkan secret.

## 1. Aktifkan login Google

### Google Auth Platform

1. Buka Google Cloud Console, pilih atau buat project DekatLokal.
2. Pada Google Auth Platform, lengkapi **Branding** dengan nama aplikasi, logo, homepage, tautan kebijakan privasi, tautan syarat layanan, dan domain `dekatlokal.com`.
3. Pada **Audience**, pilih External dan atur status Testing atau Production sesuai tahap rilis. Saat Testing, tambahkan akun penguji yang akan dipakai.
4. Pada **Data Access**, gunakan scope minimum: `openid`, email, dan profile. Jangan menambah scope sensitif yang tidak diperlukan.
5. Buat OAuth Client dengan tipe **Web application**.
6. Authorized JavaScript origin:
   - `https://digitalcheckup.dekatlokal.com`
7. Authorized redirect URI harus memakai callback milik proyek Supabase, bukan callback Next.js. Salin nilai **Callback URL** dari Supabase Authentication → Sign In / Providers → Google. Bentuknya:
   - `https://PROJECT_REF.supabase.co/auth/v1/callback`
8. Simpan Client ID dan Client Secret. Pastikan scheme, host, path, dan trailing slash sama persis.

### Supabase

1. Authentication → URL Configuration:
   - Site URL: `https://digitalcheckup.dekatlokal.com`
   - Redirect URL: `https://digitalcheckup.dekatlokal.com/auth/callback`
2. Authentication → Sign In / Providers → Google.
3. Masukkan Client ID dan Client Secret dari Google, lalu aktifkan provider.
4. Jangan memasukkan Google Client Secret ke environment browser atau variabel berawalan `NEXT_PUBLIC_`.
5. Jalankan `npm run check:production`; baris **Google provider** harus berubah menjadi `OK`.
6. Uji dari jendela incognito: `/masuk` → **Lanjut dengan Google** → consent → kembali ke `/dashboard` pada domain resmi.

Referensi resmi: [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google), [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), dan [Google OAuth web server](https://developers.google.com/identity/protocols/oauth2/web-server).

## 2. Aktifkan email OTP untuk produksi

Email provider saat ini aktif, tetapi pengiriman publik baru dianggap siap setelah custom SMTP dan inbox nyata berhasil diuji.

1. Supabase Authentication → Sign In / Providers → Email:
   - Enable Email provider;
   - Allow new users to sign up;
   - atur OTP expiration, disarankan sekitar 10 menit;
   - pertahankan batas kirim ulang minimal 60 detik dan atur rate limit sesuai kapasitas SMTP.
2. Authentication → Emails → SMTP Settings:
   - gunakan SMTP produksi milik DekatLokal;
   - gunakan alamat pengirim pada domain yang sudah memiliki SPF, DKIM, dan bila tersedia DMARC;
   - nonaktifkan link tracking pada penyedia email agar tautan autentikasi tidak ditulis ulang.
3. Authentication → Email Templates:
   - template **Magic Link / OTP** wajib menampilkan `{{ .Token }}`;
   - template **Confirm signup** juga harus menyediakan `{{ .Token }}` karena akun baru dibuat melalui alur OTP;
   - jangan hanya mengandalkan tautan magic link.
4. URL Configuration harus tetap memakai Site URL dan callback produksi yang disebutkan di atas.
5. Uji dengan dua inbox nyata, termasuk akun yang belum pernah terdaftar:
   - kode diterima;
   - kode salah ditolak;
   - kode benar masuk ke dashboard;
   - kode yang sudah dipakai ditolak;
   - kirim ulang mengikuti cooldown;
   - periksa folder spam dan tampilan email di mobile.

SMTP bawaan Supabase bukan untuk trafik produksi dan dapat membatasi alamat penerima. Referensi resmi: [passwordless email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), dan [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 3. Aktifkan worker rekomendasi

Set `CRON_SECRET` acak minimal 32 karakter pada hosting produksi dan secret bernama `dc_worker_secret` di Supabase Vault. Nilainya harus sama. Aktifkan Cron satu menit sekali sesuai contoh di `AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md`.

Worker menjadi jalur retry ketika browser sudah ditutup. Submit checkup dan dashboard tetap mencoba menghitung hasil langsung, tetapi scheduler wajib untuk ketahanan produksi.

## 4. Siapkan satu akun demo user

Akun demo menggunakan OTP, bukan password bersama. Gunakan inbox developer/penguji yang benar-benar dapat dibuka.

1. Di `.env.local` komputer operator, tambahkan:

```env
DC_DEMO_USER_EMAIL=inbox-demo-yang-aktif@domain-anda.com
DC_DEMO_USER_NAME=User Demo DekatLokal
```

2. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` menunjuk proyek produksi yang benar.
3. Jalankan sekali:

```bash
npm run db:provision:demo-user
```

4. Script bersifat idempotent dan hanya:
   - membuat atau memakai akun Auth dengan email tersebut;
   - menolak email yang sudah mempunyai role staf;
   - memberi role `umkm`;
   - membuat satu usaha yang jelas berlabel demo;
   - mengisi dan memfinalkan tepat 32 jawaban demo pada instrumen aktif;
   - membiarkan rekomendasi dihitung oleh model tiga ahli aktif.
5. Script tidak mencetak service key, OTP, token sesi, atau alamat email lengkap.
6. Masuk di `https://digitalcheckup.dekatlokal.com/masuk`, minta OTP ke inbox demo, lalu buka dashboard. Akses tujuh hari baru dimulai ketika dashboard pertama kali dibuka.

Jangan memakai email admin atau ahli sebagai akun demo. Jangan menjalankan script sebelum model ahli final tersedia.

## 5. Uji penerimaan akhir

1. Isi Digital Checkup tanpa login sampai 32 jawaban final.
2. Pastikan hasil langsung menampilkan kekuatan, bagian yang perlu dibenahi, delapan skor, tiga course prioritas, dan urutan tujuh modul.
3. Daftar dengan email OTP, lalu ulangi dengan Google.
4. Pastikan hasil sebelum login terhubung ke akun yang benar.
5. Pastikan dashboard mengurutkan course berdasarkan ranking TOPSIS, menampilkan **Prioritas #1–#7**, dan tombol langkah berikutnya membuka course prioritas tertinggi yang belum selesai.
6. Selesaikan materi, latihan, dan kuis; keluar lalu masuk lagi; progres harus tetap tersimpan.
7. Uji PWA pada 360 px dan desktop: install, buka standalone, navigasi dashboard, orientasi, keyboard, koneksi putus, dan kembali online.
8. Jalankan `npm run check` dan `npm run check:production`.

Tidak tepat menjanjikan “100% tanpa kemungkinan gagal” untuk layanan eksternal. Status siap produksi harus didasarkan pada hasil checklist, monitoring error, backup, dan uji akun nyata setelah deploy.
