# Digital Checkup DekatLokal

Aplikasi web **Digital Checkup** di platform DekatLokal: UMKM menjawab 32 pertanyaan, melihat kondisi delapan dimensi usahanya, lalu mendapat urutan rekomendasi modul pendampingan yang dipersonalisasi.

Aplikasi ini sekaligus artefak skripsi:

> *Sistem Pendukung Keputusan Penentuan Intervensi dan Rekomendasi Modul Pendampingan UMKM Menggunakan Pendekatan Integrasi Fuzzy AHP dan TOPSIS pada Platform DekatLokal.*

Semua angka penelitian di aplikasi berasal dari data yang benar-benar masuk. Tidak ada jawaban UMKM, penilaian ahli, ranking validasi, atau respons SUS rekaan; data uji di `tests/` diberi label **SIMULASI** dan hanya hidup di memori.

## Metode (ringkas)

Instrumen tetap `DC-INSTRUMEN-1.1` (`lib/decision-engine/instrument.json`): 8 dimensi **C1–C8**, 32 pertanyaan (4 per dimensi, skor 0–4), 7 alternatif modul **A1–A7**.

**Tahap model — Fuzzy AHP (tiga ahli)**

1. Tiap ahli mengisi 28 perbandingan berpasangan skala Saaty 1–9 → matriks resiprokal 8 × 8.
2. Konsistensi tiap ahli: λmax dengan *power iteration*, `CI = (λmax − 8)/7`, `CR = CI / 1,41`; hanya `CR ≤ 0,10` yang diterima.
3. Nilai crisp `k` → TFN `(max(1,k−1), k, min(9,k+1))`; resiprokal membalik urutan komponen.
4. Agregasi tiga ahli dengan *geometric mean*, *fuzzy geometric mean* per baris, bobot fuzzy, centroid, lalu normalisasi → bobot umum `w` (positif, Σ = 1).
5. Relevansi modul–dimensi `R` (7 × 8) = rata-rata nilai 0–4 dari tiga ahli.

**Tahap keputusan — TOPSIS personal (per UMKM)**

1. Skor kondisi `S_j = Σ empat jawaban / 16 × 100`; gap `g_j = 1 − S_j/100`.
2. `H = Σ w_j g_j`; bobot kebutuhan `q_j = w_j g_j / H` (Σ = 1).
3. `R` dinormalisasi vektor → `N`, dibobot `q` → `V`; solusi ideal `A+`/`A−`, jarak `D+`/`D−`, `C = D− / (D+ + D−)`; ranking memakai *minimum rank* untuk nilai setara.
4. Status khusus tanpa pemenang palsu: `NO_IDENTIFIED_GAP`, `UNCOVERED_DIMENSION`, `ALTERNATIVES_NOT_DISTINGUISHABLE`.
5. Setiap run menyimpan input canonical, hash SHA-256, trace lengkap, build ID, dan 32 skenario sensitivitas (±10%/±20% bobot).

Mesin hitung adalah fungsi murni di `lib/decision-engine/index.ts`, diuji terhadap oracle Python independen (`scripts/decision-oracle.py`) dan notebook Colab (`notebooks/validasi_fahp_topsis_colab.ipynb`).

## Arsitektur

| Bagian | Isi |
| --- | --- |
| `app/` | Next.js 16 App Router. Rute hidup: `/` (landing), `/mulai` (checkup), `/masuk`, `/dashboard` (belajar UMKM), `/ahli` (ruang ahli), `/admin` (ruang penelitian), `app/api/digital-checkup/*`. Rute prototipe lama (`/app/*`, `/daftar`, `/verifikasi`, `/onboarding`, `/hubungkan-checkup`) dialihkan lewat `next.config.ts`. |
| `lib/decision-engine/` | Instrumen dan perhitungan FAHP + TOPSIS (murni, tanpa I/O). |
| `lib/digital-checkup/` | Modul server-only: validasi zod, sesi, akses ahli, orkestrasi run, ekspor; `research-metrics.ts` berisi kode UMKM stabil, agregat validasi tahap 2, dan skor SUS (murni, dipakai dashboard dan ekspor). |
| `components/digital-checkup/` | Wizard checkup, hasil, ruang ahli, dashboard penelitian. |
| `supabase/migrations/` | Tabel `dc_*` dengan RLS, RPC `security definer` sebagai satu-satunya jalur tulis, trigger immutable untuk data final. |
| `notebooks/` | Notebook validasi independen untuk Google Colab. |

Keamanan: service-role key hanya di server; mutasi wajib same-origin; data final (asesmen, penilaian ahli, run, observasi uji) tidak dapat diubah; ekspor anonim tanpa email/WhatsApp/token/catatan bebas; ahli mendapat kasus buta tanpa ranking sistem.

## Menjalankan secara lokal

```bash
npm ci
cp .env.supabase.example .env.local   # isi dengan proyek Supabase pengembangan, bukan produksi
npm run dev                           # http://localhost:3000
```

Terapkan migration `supabase/migrations/*.sql` berurutan ke proyek **pengembangan** (Supabase CLI atau SQL Editor). Admin pengembangan: `npm run db:seed:research` (membaca `DC_ADMIN_*` dari `.env.local`). Panduan produksi: [AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md](AKTIVASI_PRODUKSI_DIGITAL_CHECKUP.md) dan [AKTIVASI_LOGIN_DAN_AKUN_DEMO.md](AKTIVASI_LOGIN_DAN_AKUN_DEMO.md).

### Variabel lingkungan

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `…_PUBLISHABLE_KEY` | Koneksi Supabase publik. |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya server; jalur tulis lewat RPC. |
| `NEXT_PUBLIC_APP_URL` | Origin aplikasi (cek same-origin, tautan). |
| `CRON_SECRET` | Bearer untuk worker `/api/digital-checkup/jobs`. |
| `DC_BUILD_ID` | Dicatat di setiap run untuk jejak audit. |
| `DC_EXPERT_ACCESS_CODES` | **Kode akses pribadi tiap ahli** (JSON `{"<assignmentId>":"<kode>"}`; format lengkap di `env.example`). Tanpa kode, `/ahli` tertutup. |
| `DC_EXPERT_ROSTER` | Alternatif: roster lengkap `[{"name","assignmentId","accessCode"}]` yang menggantikan direktori. |
| `DC_EXPERT_SESSION_SECRET` | Secret HMAC cookie sesi ahli (≥ 32 karakter). |
| `DC_EXPERT_ALLOW_PUBLIC_ENTRY` | `true` hanya untuk demo lokal: pilih nama tanpa kode. |
| `DC_AUTO_MODEL_VERSION`, `DC_AUTO_MODEL_APPROVER` | Opsional: versi model dan penyetuju untuk pembekuan otomatis. |
| `DC_SEED_ENV`, `DC_ADMIN_EMAIL`, `DC_ADMIN_PASSWORD` | Seed admin pengembangan saja; hapus password setelah seed. |

Jangan pernah memberi awalan `NEXT_PUBLIC_` pada secret atau kode ahli.

### Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js. |
| `npm run lint` / `typecheck` | ESLint, `tsc --noEmit`. |
| `npm test` | Vitest: mesin hitung vs oracle Python (`python3`, atau set `PYTHON`), migrasi di PGlite, rute, ekspor → notebook, UI. |
| `npm run test:e2e` | Playwright. |
| `npm run check` | lint + typecheck + test + build. |
| `npm run check:production` | Pemeriksaan konfigurasi produksi. |
| `npm run db:seed:research`, `npm run db:provision:demo-user` | Seed admin / akun demo pengembangan. |

## Prosedur validasi

### Tahap 1 — panel ahli dan model

1. Isi `DC_EXPERT_ACCESS_CODES` (kode acak berbeda untuk Ayu Anisela, Asluddin, Rizky Amelia) di hosting, lalu kirim kode secara pribadi ke tiap ahli.
2. Ahli membuka `/ahli`, memilih nama, memasukkan kode, lalu mengisi telaah 32 butir, 28 pairwise (CR ≤ 0,10), dan 56 nilai relevansi.
3. Setelah ketiganya final, model dibekukan otomatis (atau lewat `/admin` → *Instrumen & ahli*). Model beku tidak dapat diubah; perubahan panel = versi model baru.

### Tahap 2 — ranking ahli vs sistem (target ≥ 10 UMKM × 3 ahli)

1. Kumpulkan ≥ 10 UMKM nyata yang mengirim checkup di `/mulai`. Hanya asesmen final yang mendapat kode **U001, U002, …** (urut waktu kirim, tidak bergeser saat draf baru masuk).
2. Di `/admin` → *Data UMKM*, pada kartu UMKM berstatus RANKED klik **Buka validasi 3 ahli** (memprioritaskan tiga ahli yang dipakai model).
3. Ahli membuka `/ahli`, melihat kasus buta (profil nonkontak, jawaban, skor kondisi — tanpa ranking sistem), lalu mengurutkan A1–A7 (unik 1–7) dengan alasan, atau memilih *Tidak dapat menilai* (abstain).
4. Pantau tab *Validasi & sensitivitas*: indikator **UMKM dengan 3 ranking ahli sah x/10** dan **pasangan sah y/30**.

**Cara membaca metrik** (dihitung per pasangan UMKM × ahli yang sah, yaitu ranking final terhadap run RANKED terbaru):

- **Top-set hit rate** — proporsi pasangan di mana modul peringkat 1 versi ahli termasuk top set sistem (modul ber-rank 1, termasuk seri).
- **Rata-rata overlap top-3** — rata-rata jumlah modul yang sama di tiga teratas ahli dan sistem (0–3).
- **Rata-rata Spearman** — korelasi peringkat (midrank untuk seri) antara urutan sistem dan ahli, −1 s.d. 1. Ditampilkan bersama jumlah pasangan yang terdefinisi; Spearman tidak terdefinisi bila semua ranking sistem setara dan tidak dihitung sebagai 0.
- **Abstain** dan penilaian pada run non-RANKED dilaporkan terpisah, tidak masuk pasangan sah.
- Rincian per ahli menunjukkan konsistensi tiap anggota panel.

Ringkasan dan rincian per ahli ikut diekspor di *Ekspor → JSON lengkap / CSV* (`summary.validation`, `validationByExpert`).

### Validasi independen di Colab

1. `/admin` → *Ekspor* → *Ekspor teknis untuk validasi metode* → **JSON siap Google Colab** (semua UMKM; draf hanya dicantumkan di `skippedRecords`), atau **Ekspor input U00x untuk Colab** di kartu satu UMKM.
2. Buka `notebooks/validasi_fahp_topsis_colab.ipynb` di Colab → *Run all* → unggah JSON.
3. Notebook menghitung ulang FAHP + TOPSIS tanpa kode web, mencetak tabel CR ahli, `w`, dan `R`, memvalidasi **setiap record RANKED** (selisih mutlak ≤ 1e-10 untuk w, R, S, g, H, q, N, V, A±, D±, C; rank, top set, urutan ranking, dan hash input sama persis), menghitung ulang metrik tahap 2, lalu mencetak tabel ringkasan dan **VALIDASI LULUS** atau daftar record yang gagal.
4. Di luar Colab: `DL_COLAB_JSON=/path/file.json` lalu jalankan sel-selnya (dipakai `tests/research-validation.test.ts`).

### Uji kegunaan (SUS)

Tab *Uji aplikasi* mencatat observasi nyata (tanggal aktual, status tugas, waktu, kemudahan) dan, opsional, 10 butir **System Usability Scale** (1–5). Skor 0–100 dihitung database dengan rumus standar (butir ganjil `x − 1`, genap `5 − x`, jumlah × 2,5); dashboard menampilkan rata-rata dan rentang. Jika skripsi memakai terjemahan SUS baku tertentu, samakan redaksi `SUS_ITEMS` di `lib/digital-checkup/research-metrics.ts`.

## Demo seminar

Ikuti [DEMO_SEMHAS_FAHP_TOPSIS.md](DEMO_SEMHAS_FAHP_TOPSIS.md) untuk urutan demo 10 langkah (U001 → skor → gap/q → rekomendasi → ekspor → Colab).

## Dokumen lain

- [IMPLEMENTASI_DIGITAL_CHECKUP.md](IMPLEMENTASI_DIGITAL_CHECKUP.md) — keputusan arsitektur dan RLS.
- [PEMBARUAN_FORM_DAN_AHLI.md](PEMBARUAN_FORM_DAN_AHLI.md), [UPDATE_PROFIL_DAN_PANEL_AHLI.md](UPDATE_PROFIL_DAN_PANEL_AHLI.md) — panel ahli dan akses.
- [PROMPT_LAPORAN_VALIDASI_FAHP_TOPSIS.md](PROMPT_LAPORAN_VALIDASI_FAHP_TOPSIS.md) — kerangka laporan validasi.
