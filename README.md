# DekatLokal · Digital Checkup

Aplikasi web untuk pemilik UMKM: isi Digital Checkup (32 pertanyaan gaya kuis), lihat kondisi usaha dalam 8 bagian, dapatkan 3 modul belajar prioritas, lalu belajar gratis selama 7 hari. Rekomendasi dihitung dengan **Fuzzy AHP** (bobot dari 3 ahli) dan **TOPSIS** (urutan modul untuk setiap usaha). Admin dapat membaca setiap checkup yang masuk beserta langkah hitungnya.

## Menjalankan di komputer

```bash
npm install
cp .env.supabase.example .env.local   # isi nilai Supabase
npm run dev
```

Buka `http://localhost:3000`.

## Halaman utama

| Alamat | Untuk siapa | Isi |
|---|---|---|
| `/` | Umum | Landing page |
| `/mulai` | Pemilik usaha | Digital Checkup satu pertanyaan per layar, hasil langsung |
| `/masuk` | Pemilik usaha | Masuk dengan kode email atau Google; hasil checkup tersambung otomatis |
| `/dashboard` | Pemilik usaha | Ruang belajar: modul prioritas, latihan, kuis, akses 7 hari |
| `/ahli` | Panel ahli | Penilaian instrumen, perbandingan berpasangan, relevansi modul |
| `/admin` | Admin / peneliti | Daftar checkup, detail hitungan, panel ahli, verifikasi metode, ekspor |

## Struktur kode

- `app/` — rute Next.js (App Router). CSS per area: `globals.css` (token desain), `landing.css`, `checkup.css`, `auth.css`, `dashboard.css`, `admin/admin.css`.
- `components/checkup/` — wizard checkup (layar sambutan, profil 3 langkah, pertanyaan, tinjauan).
- `components/landing/`, `components/auth/`, `components/admin/`, `components/digital-checkup/` — komponen per area.
- `components/system/` — tombol, animasi masuk (`Reveal`), penghitung angka.
- `lib/decision-engine/` — mesin Fuzzy AHP + TOPSIS (`index.ts`), instrumen (`instrument.json`), pemeriksa hitung ulang (`verify.ts`).
- `lib/digital-checkup/` — layanan server (Supabase), validasi, bahasa mudah (`plain-language.ts`), label awam (`labels.ts`), kode UMKM, kurikulum.
- `supabase/migrations/` — skema database (`dc_*`), RLS, fungsi.
- `tests/` — Vitest (unit + jsdom) dan Playwright (`tests/e2e`).

## Perintah

```bash
npm run check            # lint + typecheck + unit test + build
npm run test             # unit test saja
npm run test:e2e         # Playwright (butuh server di :3000 atau dijalankan otomatis)
npm run check:production # cek kesiapan produksi (baca saja)
```

## Dokumen

- `PANDUAN_AKTIVASI_AKSES.md` — langkah agar login dan akses 7 hari berjalan di produksi.
- `AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md`, `AKTIVASI_LOGIN_DAN_AKUN_DEMO.md` — rincian teknis aktivasi.
- `DEMO_SEMHAS_FAHP_TOPSIS.md`, `PROMPT_LAPORAN_VALIDASI_FAHP_TOPSIS.md` — bahan demo dan laporan validasi metode.
- `notebooks/validasi_fahp_topsis_colab.ipynb` — validasi independen di Google Colab.
