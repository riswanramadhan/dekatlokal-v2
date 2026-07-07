# START HERE — Lanjutan Eksekusi DekatLokal Platform V2.1

## Status saat ini

Sudah selesai:
- Prompt 1 — Foundation dan app shell
- Prompt 2 — Auth, claim, dan onboarding versi lama
- Prompt 3 — Dashboard personal dan Jalur Naik Kelas
- Prompt 4 — Lesson, assessment, tugas, dan Aset Usaha

Belum dijalankan:
- Prompt 5 lama
- Prompt 6
- Prompt 7

## Keputusan flow baru

Digital Checkup tetap dilakukan tanpa login di `dekatlokal.com`.

Setelah hasil menampilkan tiga intervensi, CTA mengarah ke:

`https://app.dekatlokal.com/mulai?claim={opaqueToken}`

Pengguna kemudian:
1. Melihat pesan hasil siap.
2. Memilih ulang tiga fokus yang diingat.
3. Mendapat feedback.
4. Melihat preview tiga modul.
5. Baru diminta daftar atau masuk.
6. Setelah autentikasi, claim token dihubungkan ke akun.
7. Dashboard hanya berfokus pada tiga modul tersebut.

Pilihan pengguna pada recall challenge bukan sumber data utama. Tiga modul resmi tetap berasal dari hasil Digital Checkup yang tersimpan dalam claim token.

## Urutan prompt yang benar sekarang

Jangan menjalankan Prompt 5 versi lama.

Gunakan urutan:

1. Prompt 4.5 — Revisi pre-auth recall dan deferred signup
2. Prompt 5.1 — Progress, final test, recheckup, certificate, reward
3. Prompt 6.1 — Neon-ready preparation
4. Prompt 7.1 — Final audit

Semua prompt tersedia di:

`docs/CODEX_PROMPTS_CONTINUATION_AFTER_P0_4.md`

## Sebelum mulai

Pastikan hasil Prompt 4 sudah di-commit:

```bash
git status
npm run build
git add .
git commit -m "feat: complete DekatLokal V2 learning flow"
git push
```

## Setelah Prompt 4.5

Periksa:
- `/mulai?claim=...`
- valid/missing/expired/already-claimed claim
- recall challenge
- path preview
- signup wall
- claim association
- dashboard hanya tiga modul
- refresh persistence
- manual locked route

Commit:

```bash
git add .
git commit -m "feat: add pre-auth recall and deferred signup flow"
git push
```

## Setelah Prompt 5.1

Periksa final test, recheckup, before-after, certificate, reward, dan premium timing.

## Setelah Prompt 6.1

Pastikan aplikasi tetap berjalan dengan:

```env
NEXT_PUBLIC_DATA_SOURCE=mock
DATABASE_URL=
DIRECT_URL=
```

## Setelah Prompt 7.1

Jalankan lint, typecheck, tests, build, lalu deploy ke Vercel Preview untuk UAT.
