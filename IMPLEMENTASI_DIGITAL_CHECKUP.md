# Implementasi Digital Checkup

## Status dan batas aktivasi

Halaman `/mulai` bukan lagi placeholder maintenance. Tersedia wizard UMKM, ruang ahli `/ahli`, dashboard penelitian `/admin`, login Supabase dan engine keputusan server-side. Tidak ada bobot ahli, jawaban UMKM atau hasil penelitian rekaan yang di-seed.

**Belum boleh dianggap aktif di domain produksi sebelum konfigurasi Supabase pengembangan, migration, seed admin dan verifikasi autentikasi live selesai.** Pada pemeriksaan lingkungan awal, `.env.local` belum memiliki variabel Supabase dan Docker daemon tidak berjalan. Form menjelaskan bila penyimpanan belum terhubung; tidak berpura-pura berhasil. Tidak ada deployment atau perubahan data produksi dalam pekerjaan ini.

## Arsitektur dan adaptasi

- Existing: Next.js 16.2.10 App Router, React 19, TypeScript strict, npm, CSS DekatLokal, Drizzle/Neon untuk kerangka pembelajaran dan auth mock. Tidak ada Supabase existing.
- Penelitian memakai Supabase terpisah dengan prefix `dc_`, bukan mengubah tabel Neon yang digunakan fitur pembelajaran. Semua 23 tabel memiliki RLS. Schema/pipeline Neon lama tetap utuh.
- `lib/decision-engine/`: instrumen terpusat dan fungsi murni. FAHP geometric mean tiga ahli, CR power iteration, TOPSIS benefit dengan **q = w*g/H**, tie minimum-rank, 32 sensitivitas, Spearman midranks.
- `lib/digital-checkup/`: Zod, canonical hash, session dan orchestration server-only. `lib/supabase/server.ts` dan `proxy.ts`: verified Auth user, role server, cookie refresh. Service-role tidak masuk browser.
- Respons UMKM memakai whitelist publik: skor kondisi, prioritas, alasan yang dihitung server, dan versi. Matriks/bobot/koefisien lengkap hanya untuk researcher. Akun expert juga ditolak pada API asesmen UMKM; ini menutup akses model melalui sesi UMKM saat validasi buta. Identitas anonim tetap membatasi kemampuan platform mencegah seseorang memakai browser/akun lain di luar protokol penelitian.
- `app/api/digital-checkup/`: assessment, auth, expert, research. Mutasi same-origin, payload dibatasi, role dicek setiap request. Client tidak boleh mengirim hasil/bobot sebagai input keputusan.
- `components/digital-checkup/` + `app/digital-checkup.css`: wizard, hasil, form ahli, dashboard. PWA existing tidak menyimpan respons akun/API dalam cache. Pengiriman tetap memerlukan internet; tidak ada janji autosave offline.
- Kode instrumen 1.1 dan urutan ID dikunci sesuai prompt. Admin dapat membaca instrumen, membuat versi model baru, mengundang ahli dan membekukan model. **Perubahan teks/opsi instrumen perlu migration versi baru yang ditinjau serta penyesuaian versi aktif di aplikasi**; editor instrumen bebas tidak disediakan agar makna/skala tidak berubah tanpa keputusan pemilik.
- Submit mengunci jawaban dalam satu RPC. Compute kemudian menyimpan run + delapan hasil dimensi + tujuh hasil intervensi + audit secara atomik dalam RPC kedua. Jika compute gagal, jawaban tetap aman dengan status menunggu; admin dapat mencoba lagi. Unique `(assessment_id, model_input_id)` menjamin idempotensi. Tidak ada transaksi database yang dibiarkan terbuka selama komputasi JavaScript.
- Nilai angka antara tidak dibulatkan. Run menyimpan input mentah, versi, hash SHA-256 canonical, trace penuh, waktu dan build ID. Versi model baru/revisi asesmen menghasilkan run baru.
- UMKM anonim: token acak 256-bit dalam cookie HttpOnly/SameSite=Lax, Secure saat production, masa berlaku 30 hari, database hanya menyimpan hash. Akun UMKM yang sedang login juga ditautkan melalui owner_id. Kehilangan cookie anonim berarti tidak bisa membuka ulang sesi anonim tersebut; tidak ada recovery via kode UMKM saja.

## Migration dan RLS

### Berkas implementasi

- Halaman: `app/(public)/mulai/{page,loading}.tsx`, `app/admin/page.tsx`, `app/ahli/page.tsx`, `app/(auth)/masuk/page.tsx`, `app/auth/callback/route.ts`.
- UI: `components/digital-checkup/{checkup-wizard,results,expert-workspace,research-dashboard}.tsx`, `components/digital-checkup/api.ts`, `app/digital-checkup.css`, `components/auth/sign-in-form.tsx`, `app/(auth)/masuk/signin.css`.
- API: `app/api/digital-checkup/{assessment,auth,expert,research}/route.ts`.
- Domain: `lib/decision-engine/{index.ts,instrument.json}`, `lib/digital-checkup/{validation,canonical,http,service,public-result}.ts`.
- Infrastruktur: `lib/supabase/server.ts`, `proxy.ts`, `supabase/config.toml`, tiga migration SQL, `supabase/seed.sql`, dua template email, `scripts/seed-research-admin.mjs`, `.env.supabase.example`.
- Pengujian: `scripts/decision-oracle.py`, lima file `tests/*.test.ts`, `tests/e2e/digital-checkup.pw.ts`, `vitest.config.ts`, `playwright.config.ts`.
- Konfigurasi: `package.json`, `package-lock.json`, `.gitignore`, `eslint.config.mjs`. Instruksi pengguna `PROMPT_IMPLEMENTASI_NEXTJS_SUPABASE.md` tidak diubah.

1. `202609100001_digital_checkup.sql`: tabel, constraint, index, RLS, RPC finalisasi/freeze/run.
2. `202609100002_instrument.sql`: instrumen C1–C8/Q01–Q32/160 opsi, A1–A7, model 1.1; seed idempotent, tidak ada observasi palsu.
3. `202609100003_snapshot_guards.sql`: guard child snapshot, model beku, cloning versi model dengan audit.

Semua tabel mencabut write privileges anon/authenticated. Researcher/admin boleh SELECT melalui role di `dc_profiles`; expert hanya membaca assignment/case sendiri, tidak mendapat akses model/run/asesmen orang lain. UMKM terautentikasi dapat SELECT record miliknya. Mutasi hanya RPC/service server setelah authorization. Trigger melindungi parent dan child final dari perubahan maupun penghapusan. Semua query kasus ahli memakai whitelist respons: kode, metadata aman, jawaban dan skor saja.

## Menjalankan di pengembangan

1. `npm install` (atau `npm ci` dari lockfile).
2. Salin variabel `.env.supabase.example` ke `.env.local`; isi URL, anon/publishable key dan service-role **proyek pengembangan**. Jangan kirim secret lewat chat/commit.
3. Pilih salah satu:
   - Supabase lokal: aktifkan Docker Desktop, lalu `npx supabase start` dan `npx supabase migration up --local`.
   - Supabase hosted development: login CLI, `npx supabase link --project-ref <REF_DEV>`, tinjau `npx supabase db push --dry-run`, lalu `npx supabase db push` **hanya ke proyek dev yang telah diverifikasi**. Jangan memakai perintah reset pada database berisi data pengguna.
4. Isi `DC_SEED_ENV=development`, `DC_ADMIN_EMAIL=admin@dekatlokal.com`, `DC_ADMIN_PASSWORD` dengan password yang diminta pemilik, lalu `npm run db:seed:research`. Script tidak mencetak password dan tidak mengubah password user existing. Hapus variabel password setelah seed; ganti password sebelum peluncuran produksi.
5. `NEXT_PUBLIC_APP_URL=http://localhost:3000` untuk lokal. Atur Auth Site URL dan redirect allow-list `/auth/callback` di Supabase. Konfigurasi domain publik dilakukan terpisah ketika deployment disetujui.
6. Untuk hosted Supabase, salin template `supabase/templates/invite.html` dan `magic-link.html` ke Auth Email Templates. Tautan menggunakan TokenHash dan diverifikasi di server, bukan mengandalkan fragment URL undangan. Ikuti [dokumentasi resmi template Supabase](https://supabase.com/docs/guides/auth/auth-email-templates). Konfigurasikan SMTP untuk pengiriman yang dapat diandalkan.
7. Aktifkan Google provider dengan OAuth client milik proyek bila Google login akan dipakai. Tanpa provider tersebut, gunakan email/password atau magic link; aplikasi menampilkan error yang jelas.
8. `npm run dev`, buka `/masuk`, login admin → `/admin`. Undang tiga ahli nyata → `/ahli` → final penilaian → bekukan model. Isi `/mulai`, jalankan rekomendasi menunggu dari dashboard, lalu buka kasus untuk ahli.

Dependency baru: `@supabase/ssr` + `@supabase/supabase-js` untuk Auth/database; dev-only `@electric-sql/pglite` untuk menjalankan SQL PostgreSQL dan menguji RLS tanpa Docker. Tidak ada dependency numerik/animasi tambahan yang tidak diperlukan.

## Verifikasi dan reproduksibilitas

```sh
npm run lint
npm run typecheck
npm test
npx playwright test tests/e2e/digital-checkup.pw.ts --workers=1
npm run build
npm run check:client-bundle
```

Pada komputer dengan RAM terbatas, jalankan pemeriksaan bergantian. Untuk E2E memakai build produksi setelah `npm run build`, jalankan di PowerShell: `$env:PLAYWRIGHT_USE_PRODUCTION='1'` lalu `npx playwright test tests/e2e/digital-checkup.pw.ts --workers=1`. Ini menghindari compiler development dan browser memakai banyak memori bersamaan.

- `tests/decision-engine.test.ts`: kontrak instrumen, rumus, null vs 0, CR tinggi/rendah, personalisasi, seri, semua status khusus, 32 sensitivitas, lima cross-check Python independen.
- `scripts/decision-oracle.py`: implementasi Python stdlib terpisah, tidak mengimpor hasil TypeScript. Membandingkan w/R/S/g/H/q/N/V/ideal/D+/D−/C/rank/status dengan toleransi ≤1e-10; tanpa Python pada request production.
- `tests/database.test.ts`: migration nyata dalam PostgreSQL WASM sementara; UMKM draft/final, tiga ahli draft/final, freeze, run, blinded ranking, idempotensi, immutability parent/child, role RLS. Role Auth minimal disimulasikan; ini **bukan bukti Google/SMTP Supabase live sudah bekerja**.
- `tests/server-routes.test.ts`: whitelist blinded response, authorization endpoint, ekspor tanpa identitas/token, cross-origin rejection.
- `tests/client-boundary.test.ts`: batas module server-only dan scan hasil bundle untuk credential server.
- `tests/e2e/digital-checkup.pw.ts`: browser mobile 360px/desktop, perjalanan UMKM 32 jawaban dengan API simulasi berlabel, validation/error, hasil menunggu dan UI login. Screenshot tersimpan di `.test-artifacts/` supaya Playwright tidak menghapus artefak lama yang sudah tracked di repository. Uji UI simulasi tidak menggantikan acceptance E2E Supabase live.
- `tests/validation.test.ts`: consent, konfirmasi final, 32 jawaban wajib, usulan perbaikan untuk review rendah, draft kasus dan abstain beralasan.
- Vitest sekarang hanya mengumpulkan `tests/**/*.test.ts`; folder referensi UI dikecualikan dari ESLint sebagaimana sudah dikecualikan TypeScript. Baseline sebelumnya gagal pada test alias milik folder referensi, bukan test aplikasi.

Dashboard → Ekspor menyediakan filter versi/run, JSON dan CSV. CSV memiliki kolom `dataset,data`; struktur matriks disimpan JSON dalam sel CSV agar tidak kehilangan presisi. Ekspor menggunakan kode, tidak memuat email, nama ahli, token, tujuan/catatan bebas. Catatan abstain dapat dilihat researcher dalam dashboard, tetapi tidak dimasukkan dalam unduhan anonim untuk mengurangi kebocoran identitas dari teks bebas.

Canonical satu run: `/api/digital-checkup/research?format=canonical&run=<UUID>` dengan sesi researcher. Simpan unduhan lalu jalankan `python scripts/decision-oracle.py < canonical-input.json` di shell yang mendukung redirection (di PowerShell: `Get-Content -Raw canonical-input.json | python scripts/decision-oracle.py`). Semua fixture pengujian berlabel SIMULASI dan hanya hidup di database sementara; tidak digunakan sebagai temuan penelitian.

## Pemeriksaan sebelum peluncuran

- Verifikasi env dev, apply migration dan seed admin, kemudian uji login password, undangan/magic link dan Google nyata; belum dapat diverifikasi tanpa konfigurasi proyek.
- Jalankan acceptance live satu UMKM, tiga ahli, freeze, run, ranking buta dan ekspor dengan akun pengembangan yang disetujui. Bersihkan hanya fixture dev yang memang disepakati, bukan data pengguna.
- Pastikan `DC_BUILD_ID`/`VERCEL_GIT_COMMIT_SHA` ditetapkan untuk trace produksi.
- Tinjau kebijakan retensi data/consent dan konfigurasi SMTP, rate limits/WAF, backup serta akses service-role sebelum go-live. Endpoint anon perlu proteksi abuse deployment; batas request dan same-origin bukan rate limiter terdistribusi.
- Pengelolaan revisi teks instrumen melalui migration tetap membutuhkan keputusan pemilik; formula, skala dan tujuh alternatif tidak diubah otomatis.

## Hasil pemeriksaan sesi implementasi

Hasil pada 11 September 2026:

| Pemeriksaan | Hasil |
| --- | --- |
| ESLint | Lulus tanpa error/warning pada pemeriksaan kode |
| TypeScript strict | Lulus; production build juga menyelesaikan pemeriksaan tipe |
| Vitest | **46 test lulus** dalam 5 file, termasuk migration/RLS/transaksi, validasi, keamanan endpoint dan bundle |
| Oracle Python | Lima kasus (normal personal, sempurna, dimensi tak tercakup, alternatif identik, seri) lulus toleransi 1e-10 |
| Production build | Lulus; `/mulai`, `/admin`, `/ahli` dan API berjalan dinamis |
| Playwright produksi | **2 test lulus**, 42,6 detik pada pengulangan terakhir; flow mobile 32 jawaban, desktop/login, unauthorized research |
| Supabase hosted/Auth/SMTP/Google live | **Belum diverifikasi**: konfigurasi proyek belum tersedia di `.env.local` |

Screenshot yang telah diperiksa secara visual:

- [Pembuka desktop](.test-artifacts/digital-checkup.pw.ts-chec-0d7a9-orized-research-is-rejected-chromium/checkup-desktop.png)
- [Login desktop, satu viewport](.test-artifacts/digital-checkup.pw.ts-chec-0d7a9-orized-research-is-rejected-chromium/signin-desktop.png)
- [Wizard ponsel 360 px](.test-artifacts/digital-checkup.pw.ts-mobi-7ce6f-ers-review-immutable-result-chromium/checkup-mobile.png)
- [Hasil ponsel — data simulasi pengujian](.test-artifacts/digital-checkup.pw.ts-mobi-7ce6f-ers-review-immutable-result-chromium/checkup-result-mobile.png)

Uji pertama sempat gagal karena selector `role=alert` juga menangkap route announcer Next.js; selector sudah dipersempit dan pengujian diulang sampai lulus. Development browser juga sempat terkendala memori rendah. Dua berkas tipe cache `.next/dev/types` yang tidak utuh dihapus dan digenerasi ulang lewat build; tidak ada kode aplikasi/data pengguna dihapus. Pengujian selanjutnya dijalankan bergantian memakai server produksi. Artefak lama yang tracked di `test-results` dikembalikan setelah output Playwright dipindahkan ke `.test-artifacts`.

Migration berhasil dijalankan pada database PostgreSQL pengujian sementara, **bukan** pada proyek Supabase pengguna. Akun admin belum diklaim tersedia sebelum script seed benar-benar dijalankan terhadap proyek pengembangan yang terkonfigurasi.
