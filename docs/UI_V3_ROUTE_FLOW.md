# DekatLokal V3 Route Flow

## Public Entry

- `/` shows the public app landing page for `app.dekatlokal.com`.
- Primary CTA opens `NEXT_PUBLIC_MAIN_SITE_URL/digital-checkup`.
- Demo CTA opens `/mulai?claim=demo-warung-rina`.

## Claim Demo Tokens

- `demo-warung-rina`: valid, Warung Rina, assigned `Digitalisasi UMKM`, `Branding UMKM`, `Konsistensi Promosi`.
- `demo-saji-studio`: valid, Saji Studio, assigned `Branding UMKM`, `Produk dan Kemasan`, `Marketplace dan Kanal Penjualan`.
- `demo-bersihpro`: valid, BersihPro Makassar, assigned `Digitalisasi UMKM`, `Operasional dan Keuangan Dasar`, `Komitmen dan Growth Mindset`.
- `demo-expired` and `expired`: expired.
- `demo-claimed`, `claimed`, and `already-claimed`: already claimed.
- `invalid`, `bad-token`: invalid.
- Missing token: no-checkup prompt.

## Pre-auth Flow

`/mulai?claim=TOKEN`
-> claim validation
-> result ready
-> recall exactly three modules from six options
-> supportive feedback or reveal help
-> three-module path preview
-> signup wall
-> `/daftar`, `/masuk`, or provider mock
-> `/verifikasi`
-> claim association
-> `/app/beranda`

Recall choices reinforce memory only. Authoritative assignments always come from the claim preview.

## Signed-in Flow

`/app/beranda`
-> next best action
-> `/app/modul/[moduleSlug]`
-> `/app/belajar/[lessonId]`
-> `/app/kuis/[assessmentId]`
-> `/app/tugas/[taskId]`
-> `/app/hasil-modul/[moduleId]`
-> repeat until three modules complete
-> `/app/ujian-akhir`
-> `/app/checkup-ulang`
-> `/app/sertifikat/[certificateId]`
-> `/app/reward/landing-page`

## Navigation

Mobile floating navigation:

- `Beranda` -> `/app/beranda`
- `Jalur` -> `/app/jalur`
- raised `Lanjut` -> active next action href
- `Progres` -> `/app/progres`
- `Akun` -> `/app/akun`

Labels collapse on downward scroll and restore on upward scroll, top position, focus, and route changes.
