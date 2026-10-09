# Panduan: supaya semua bisa diakses setelah Digital Checkup selesai

Panduan ini ditulis untuk pengelola DekatLokal, tanpa istilah teknis yang tidak perlu. Ikuti dari atas ke bawah. Setiap bagian diakhiri dengan cara mengeceknya.

Alur yang kita tuju:

1. Pengguna mengisi Digital Checkup di `https://digitalcheckup.dekatlokal.com/mulai` (tanpa akun).
2. Hasil tampil langsung. Tombol **Daftar & buka modul gratis** membawa ke halaman masuk.
3. Pengguna masuk dengan **kode email** atau **Google**. Akun dibuat otomatis.
4. Hasil checkup tersambung ke akun, lalu dashboard terbuka dengan **akses modul gratis 7 hari**.

Supaya alur itu benar-benar jalan, ada 5 hal yang harus aktif di Supabase (layanan penyimpanan dan login yang dipakai aplikasi ini).

---

## 1. Alamat situs dan alamat balik (wajib)

Ini memberi tahu Supabase ke mana pengguna dikembalikan setelah masuk.

1. Buka **Supabase** → proyek DekatLokal → menu **Authentication** → **URL Configuration**.
2. Isi **Site URL**: `https://digitalcheckup.dekatlokal.com`
3. Pada **Redirect URLs**, tambahkan: `https://digitalcheckup.dekatlokal.com/auth/callback`
4. Simpan.

**Cek:** nilai `NEXT_PUBLIC_APP_URL` di hosting (Vercel → Project → Settings → Environment Variables) juga harus `https://digitalcheckup.dekatlokal.com`.

## 2. Masuk dengan kode email (wajib)

Ini jalur utama. Pengguna memasukkan email, menerima kode 6 digit, lalu memasukkannya di halaman masuk.

1. **Authentication → Sign In / Providers → Email**:
   - **Enable Email provider**: aktif.
   - **Allow new users to sign up**: aktif (akun dibuat saat kode pertama kali diverifikasi).
   - **Confirm email**: boleh aktif; alur kode tetap berfungsi.
   - **OTP expiration**: sekitar 600 detik (10 menit).
2. **Authentication → Emails → Templates**:
   - Buka template **Magic Link** dan **Confirm signup**. Isi email **harus memuat** teks `{{ .Token }}` agar kode angkanya ikut terkirim. Contoh template siap pakai ada di folder `supabase/templates/otp.html` di repo ini (salin isinya ke kedua template).
   - Jangan hanya mengandalkan tautan; pengguna di aplikasi mengetik kode.
3. **Authentication → Emails → SMTP Settings** (pengirim email):
   - Aktifkan **Custom SMTP** dengan layanan email milik DekatLokal (misalnya Resend, Brevo, atau SMTP domain sendiri).
   - Alamat pengirim harus dari domain yang sudah punya SPF/DKIM (biasanya penyedia email yang mengaturnya).
   - Tanpa SMTP sendiri, Supabase hanya mengirim ke beberapa alamat uji dan membatasi jumlah email per jam.

**Cek:** buka `https://digitalcheckup.dekatlokal.com/masuk` dari jendela penyamaran, masukkan email asli, tekan **Kirim kode masuk**. Kode harus tiba (cek spam). Masukkan kode → harus mendarat di `/dashboard`.

## 3. Masuk dengan Google (disarankan)

Saat ini provider Google **belum aktif**, jadi tombol "Lanjut dengan Google" menampilkan pesan untuk memakai kode email. Untuk mengaktifkan:

1. Buka **Google Cloud Console** → buat/pilih project DekatLokal → **APIs & Services → Credentials**.
2. **OAuth consent screen**: isi nama aplikasi, logo, alamat situs, kebijakan privasi, syarat layanan, dan domain `dekatlokal.com`. Pilih **External**. Jika masih **Testing**, tambahkan email penguji.
3. **Create Credentials → OAuth client ID → Web application**:
   - **Authorized JavaScript origins**: `https://digitalcheckup.dekatlokal.com`
   - **Authorized redirect URIs**: salin **Callback URL** dari Supabase (**Authentication → Sign In / Providers → Google**). Bentuknya `https://PROJECT_REF.supabase.co/auth/v1/callback`.
4. Salin **Client ID** dan **Client Secret** ke Supabase → **Providers → Google**, lalu aktifkan.
5. Jangan menaruh Client Secret di file `.env` yang berawalan `NEXT_PUBLIC_`.

**Cek:** `/masuk` → **Lanjut dengan Google** → layar persetujuan Google → kembali ke `/dashboard`.

## 4. Pekerja latar untuk rekomendasi (wajib untuk produksi)

Setelah checkup dikirim, aplikasi langsung menghitung rekomendasi. Jika pengguna menutup browser lebih cepat, pekerja latar yang mengulang perhitungan.

1. Buat kata sandi acak minimal 32 karakter (misalnya dari pengelola kata sandi).
2. Simpan di hosting sebagai variabel `CRON_SECRET`.
3. Simpan nilai yang **sama** di Supabase → **Project Settings → Vault** dengan nama `dc_worker_secret`.
4. Aktifkan jadwal Cron satu menit sekali sesuai contoh SQL di `AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md`.

**Cek:** jalankan di komputer pengelola:

```bash
npm run check:production
```

Baris **Secret scheduler tersedia** harus `OK`.

## 5. Panel ahli dan model (sudah final, cukup dicek)

Rekomendasi hanya bisa dihitung jika tiga penilaian ahli sudah final dan model terkunci.

1. Buka `https://digitalcheckup.dekatlokal.com/admin` → masuk dengan akun admin.
2. Menu **Panel ahli**: ketiga ahli harus berstatus **Final · Dipakai model** dan model berstatus **terkunci**.
3. Menu **Cara hitung & verifikasi**: semua baris harus **Cocok**.

Jika belum ada model, pilih tiga ahli final, centang konfirmasi, lalu **Aktifkan dan kunci model**.

---

## Uji penerimaan akhir (5 menit)

1. Jendela penyamaran → `/mulai` → isi sampai 32 jawaban → hasil tampil.
2. Klik **Daftar & buka modul gratis** → masukkan email → kode diterima → verifikasi.
3. Dashboard terbuka, badge **Akses gratis · 7 hari tersisa** tampil, urutan modul mengikuti **Prioritas #1–#7**.
4. Buka satu modul, isi catatan praktik, kerjakan kuis. Keluar lalu masuk lagi: progres masih ada.
5. Di `/admin` → **Data checkup**: usaha tadi muncul dengan nomor U-xxx dan detail hitungannya.

## Kalau ada masalah

| Yang terjadi | Penyebab umum | Yang dilakukan |
|---|---|---|
| Kode tidak pernah sampai | SMTP belum diatur, atau template tidak memuat `{{ .Token }}` | Periksa bagian 2; cek folder spam; coba "Kirim ulang kode" setelah 60 detik |
| "Tautan sudah tidak berlaku" | Kode/tautan kedaluwarsa atau sudah dipakai | Minta kode baru di `/masuk` |
| Tombol Google menampilkan pesan pakai kode email | Provider Google belum aktif | Ikuti bagian 3 |
| Setelah masuk, muncul "checkup belum berhasil ditautkan" | Checkup dibuat di perangkat/browser lain | Buka `/mulai` di perangkat yang sama, atau tekan **Hubungkan lagi** di dashboard |
| Modul terkunci | Akun belum punya checkup final, atau masa 7 hari sudah lewat | Selesaikan checkup; masa akses tidak diulang, progres tetap tersimpan |
| Hasil bertuliskan "rekomendasi sedang dirangkai" lebih dari 5 menit | Model ahli belum terkunci atau pekerja latar belum aktif | Periksa bagian 4 dan 5 |
| Admin tidak bisa masuk | Akun belum punya peran admin/peneliti | Tambahkan baris di tabel `dc_profiles` dengan `role = 'admin'` untuk user tersebut, atau jalankan `npm run db:seed:research` |

Catatan: `npm run check:production` bersifat baca saja dan tidak menampilkan kunci rahasia. Jalankan setiap kali ada perubahan pengaturan.
