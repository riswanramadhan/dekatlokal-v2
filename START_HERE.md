# START HERE — DekatLokal V3 UI Execution Kit

## Tujuan

Paket ini digunakan setelah flow dasar Prompt 1–4 tersedia.

Paket mengubah platform menjadi:

- UI compact dan minimal,
- onboarding satu layar satu fokus,
- landing page publik app.dekatlokal.com,
- demo claim token lengkap,
- delapan modul riil,
- lesson sampai tes,
- sound effects,
- floating adaptive mobile navigation,
- progress sampai reward.

## Isi

```text
docs/
├── UI_REFERENCE_ANALYSIS.md
├── CURRICULUM_8_MODULES.md
├── CODEX_XHIGH_PLAN_PROMPT.md
├── CODEX_XHIGH_EXECUTION_PROMPT.md
└── references/
```

## Cara menggunakan

1. Salin folder `docs` ke repository.
2. Pastikan seluruh file reference tersedia.
3. Commit dokumen terlebih dahulu.
4. Buka Codex dengan model terbaik yang memiliki XHigh/highest reasoning.
5. Aktifkan Plan mode.
6. Jalankan `CODEX_XHIGH_PLAN_PROMPT.md`.
7. Review file plan yang dibuat.
8. Keluar dari Plan mode.
9. Jalankan `CODEX_XHIGH_EXECUTION_PROMPT.md`.
10. Review perubahan, tests, dan build.

## Commit awal

```bash
git add docs
git commit -m "docs: add DekatLokal V3 UI execution specification"
git push
```

## Demo token utama

```text
/mulai?claim=demo-warung-rina
```

## Catatan penting

Jangan menjalankan prompt lama yang bertentangan setelah paket V3 ini disetujui.

Paket ini menjadi sumber perubahan UI dan konten terbaru.
