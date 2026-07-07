# START HERE — DekatLokal Platform V2

## Keputusan final

- Website publik dan Digital Checkup tetap berada di `https://dekatlokal.com`.
- Platform login, dashboard, modul, progres, sertifikat, dan reward berada di `https://app.dekatlokal.com`.
- Website penerima manfaat tetap dapat menggunakan `{nama-usaha}.dekatlokal.com`.
- Project V2 dibuat di repository terpisah dari website utama.
- Demo frontend menggunakan mock repository dan mock API.
- Struktur database Neon, kontrak data, dan adapter disiapkan dari awal, tetapi demo tidak bergantung pada koneksi database.
- UI harus terasa satu keluarga dengan `dekatlokal.com`: logo, warna biru DekatLokal, tipografi modern, copy yang ramah, ruang putih, serta visual yang clean.
- “Gila-gilaan” diterapkan pada personalisasi, learning journey, gamifikasi sehat, outcome usaha, dan reward—not visual clutter.

---

## Arsitektur domain

```text
dekatlokal.com
├── Homepage
├── Digital Checkup
├── Hasil awal Digital Checkup
├── Tentang program
├── Partner
├── Galeri/website UMKM
└── Artikel/SEO

app.dekatlokal.com
├── Masuk dan daftar
├── Claim hasil Digital Checkup
├── Onboarding personal
├── Ruang Tumbuh
├── Jalur Naik Kelas
├── Modul, lesson, quiz, dan tugas
├── Jejak Tumbuh
├── Sertifikat
├── Digital Checkup ulang
├── Reward landing page
└── Modul lanjutan/premium

{slug-usaha}.dekatlokal.com
└── Website/landing page UMKM penerima manfaat
```

## Alur integrasi

```text
Pengguna mengisi Digital Checkup di dekatlokal.com
    ↓
Situs utama membuat resultId dan claim token sementara
    ↓
Redirect ke app.dekatlokal.com/daftar?claim=TOKEN
    ↓
Pengguna mendaftar atau masuk
    ↓
Hasil checkup diklaim oleh akun
    ↓
Dashboard langsung dipersonalisasi
```

Pada demo frontend, token dan hasil checkup disimulasikan melalui mock repository. Pada produksi, token harus opaque, memiliki masa berlaku, hanya dapat diklaim satu kali, dan diproses server-side.

---

# A. Yang harus dilakukan sekarang

## 1. Buat repository baru

Letakkan repo V2 sejajar dengan repo website utama, bukan di dalamnya.

### PowerShell

```powershell
cd ..
npx create-next-app@latest dekatlokal-platform-v2
cd dekatlokal-platform-v2
git checkout -b feature/platform-v2-demo
New-Item -ItemType Directory -Force docs
```

### Git Bash / macOS / Linux

```bash
cd ..
npx create-next-app@latest dekatlokal-platform-v2
cd dekatlokal-platform-v2
git checkout -b feature/platform-v2-demo
mkdir -p docs
```

Saat `create-next-app` bertanya, pilih:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
Use src directory: Yes
Use App Router: Yes
Use Turbopack: Yes
Import alias: @/*
```

## 2. Masukkan paket dokumen

Struktur repository:

```text
dekatlokal-platform-v2/
├── AGENTS.md
├── docs/
│   ├── PRD_DEKATLOKAL_PLATFORM_V2.md
│   ├── BRAND_AND_UI_GUIDE.md
│   ├── TECHNICAL_ARCHITECTURE_NEON_READY.md
│   └── CODEX_EXECUTION_PROMPTS.md
├── .env.example
├── src/
├── public/
└── package.json
```

## 3. Salin aset brand resmi

Dari repo utama, salin hanya aset yang dibutuhkan:

- Logo horizontal.
- Logo icon.
- Favicon.
- Font bila lisensinya mengizinkan digunakan di project.
- Ilustrasi resmi yang memang boleh dipakai.
- Ikon partner bila diperlukan.
- OG image bila relevan.

Simpan pada:

```text
public/brand/
```

Jangan menyalin komponen website utama secara massal. Ambil identitas visualnya, lalu bangun komponen aplikasi secara khusus.

## 4. Isi `.env.local`

Untuk demo awal:

```env
NEXT_PUBLIC_MAIN_SITE_URL=https://dekatlokal.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATA_SOURCE=mock
NEXT_PUBLIC_DEMO_SCENARIO=culinary-new-user

# Belum wajib diisi saat demo
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
```

Jangan commit `.env.local`.

## 5. Buka repo di Codex

Buka root `dekatlokal-platform-v2`, pastikan Codex membaca:

1. `AGENTS.md`
2. `docs/PRD_DEKATLOKAL_PLATFORM_V2.md`
3. `docs/BRAND_AND_UI_GUIDE.md`
4. `docs/TECHNICAL_ARCHITECTURE_NEON_READY.md`
5. `docs/CODEX_EXECUTION_PROMPTS.md`

Mulai dengan **Prompt 0** dalam dokumen prompt. Jangan meminta seluruh platform dibuat dalam satu task.

---

# B. Urutan kerja Codex

```text
Prompt 0 — Audit, brand alignment, dan implementation plan
Prompt 1 — Foundation, design system, mock architecture, app shell
Prompt 2 — Login, signup, claim checkup, onboarding
Prompt 3 — Dashboard personal, hasil checkup, Jalur Naik Kelas
Prompt 4 — Lesson player, quiz, corrective path, tugas usaha
Prompt 5 — Progres, final test, recheckup, sertifikat, reward
Prompt 6 — Neon-ready schema dan adapter tanpa mengaktifkan database
Prompt 7 — QA, accessibility, responsive, dan final audit
```

Setelah setiap milestone:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git status
git diff
```

Kemudian commit:

```bash
git add .
git commit -m "feat: implement DekatLokal V2 milestone P0.x"
git push -u origin feature/platform-v2-demo
```

---

# C. Preview demo

Deploy branch ke Vercel sebagai preview. Jangan langsung memasang `app.dekatlokal.com`.

Uji lebih dahulu dengan:

- Founder.
- Satu developer.
- Satu pendamping UMKM.
- Minimal dua pemilik UMKM dengan tingkat kenyamanan digital berbeda.

Uji pada:

```text
360 × 800
390 × 844
430 × 932
Tablet
Desktop
```

## Pertanyaan usability utama

1. Apakah pengguna langsung mengetahui apa yang harus dilakukan?
2. Apakah pengguna memahami mengapa modul diberikan?
3. Apakah pengguna dapat melanjutkan lesson dengan satu tap?
4. Apakah pengguna memahami modul yang terkunci?
5. Apakah tugas terasa relevan dengan usahanya?
6. Apakah pengguna dapat melihat hasil nyata dari pembelajaran?
7. Apakah teks dan tombol nyaman pada HP?

---

# D. Mengaktifkan subdomain setelah demo disetujui

1. Tambahkan custom domain `app.dekatlokal.com` pada project Vercel V2.
2. Ikuti target DNS yang diberikan Vercel.
3. Tambahkan record `app` pada Cloudflare DNS.
4. Ubah environment:

```env
NEXT_PUBLIC_APP_URL=https://app.dekatlokal.com
NEXT_PUBLIC_MAIN_SITE_URL=https://dekatlokal.com
```

5. Tambahkan link masuk pada situs utama:

```text
Masuk ke Ruang Tumbuh
```

6. Ubah CTA hasil Digital Checkup menjadi:

```text
Buka Jalur Perbaikan Saya
```

yang mengarah ke:

```text
https://app.dekatlokal.com/daftar?claim={token}
```

7. Pastikan redirect, canonical, cookie, CSP, CORS, analytics, dan privacy policy diperiksa sebelum production.

---

# E. Kapan Neon digunakan?

Database disiapkan sekarang melalui:

- Domain model.
- Zod schema.
- Repository interface.
- Drizzle/Postgres schema blueprint.
- Migration structure.
- `.env.example`.
- Adapter `mock` dan `neon`.

Namun `DATA_SOURCE=mock` tetap menjadi default sampai:

- Flow P0 stabil.
- UI disetujui.
- Data model tidak sering berubah.
- Auth strategy dipilih.
- Digital Checkup utama siap menghasilkan claim token produksi.
- Security review selesai.

Urutan aktivasi backend:

1. Neon project dan branch.
2. Migration.
3. Authentication/session.
4. Claim hasil Digital Checkup.
5. Personalized plan persistence.
6. Learning progress.
7. Assessment.
8. Evidence storage.
9. Certificate dan reward.
10. Admin/CMS.
11. Analytics dan audit logs.

---

# F. Definisi demo berhasil

Demo dianggap siap stakeholder testing apabila:

- Seluruh flow dapat berjalan tanpa database.
- Minimal tiga skenario UMKM tersedia.
- Dashboard berbeda berdasarkan hasil checkup.
- Modul terkunci tidak dapat dibuka paksa.
- Lesson dapat dilanjutkan setelah refresh.
- Quiz gagal mengarah ke materi koreksi.
- Tugas menghasilkan Business Asset.
- Recheckup menampilkan before/after.
- Reward landing page memiliki eligibility flow.
- UI tidak pecah pada 360px.
- Lint, typecheck, test, dan build berhasil.
