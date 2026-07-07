# PRD REVISION V2.1 — Three-Focus Recall Flow

## Revision purpose

Dokumen ini memperbarui PRD DekatLokal Platform V2 setelah implementasi Prompt 1–4.

Perubahan utama:
- Signup dipindahkan setelah preview manfaat.
- Digital Checkup tetap tanpa login.
- Hasil checkup menghasilkan tiga modul fokus.
- Pengguna melakukan recall challenge sebelum signup.
- Pilihan recall tidak mengganti hasil resmi checkup.
- Dashboard difokuskan pada tiga modul.
- Progress dan reward mengikuti penyelesaian tiga modul.

## Revised product thesis

> DekatLokal membantu pelaku UMKM mengingat tiga kebutuhan terpenting usahanya, menyelesaikannya satu per satu, dan melihat perubahan nyata setelah belajar dan menerapkan tindakan.

## Revised user journey

### Public website

`dekatlokal.com/digital-checkup` → hasil → tiga intervensi → **Mulai Perbaiki Usaha Saya**

### App pre-auth

`app.dekatlokal.com/mulai?claim=TOKEN` → hasil siap → pilih ulang tiga fokus → feedback → preview jalur → signup/login

### App authenticated

Claim association → dashboard Fokus 1 dari 3 → modul 1 → modul 2 → modul 3 → final test → recheckup → certificate → reward

## Why this flow

### Less initial friction
Digital Checkup tidak terganggu form login.

### Better perceived value
Pengguna melihat hasil dan jalur sebelum diminta daftar.

### Memory reinforcement
Recall challenge membantu pengguna memahami hasil checkup.

### Data integrity
Claim token tetap menyimpan rekomendasi resmi.

### Stronger focus
Dashboard tidak menampilkan katalog yang membingungkan.

## Product rules

1. Tepat tiga primary modules pada basic active path.
2. Modul berasal dari hasil checkup.
3. Recall selection tidak authoritative.
4. Pengguna tidak dapat membuat jalur personal tanpa checkup.
5. Recall menyediakan hint dan reveal help.
6. Signup baru wajib untuk menyimpan dan melanjutkan.
7. Modul pertama tersedia setelah association.
8. Modul kedua dan ketiga mengikuti prerequisite.
9. Penyelesaian membutuhkan lesson, mastery, dan business task.
10. Recheckup terbuka setelah 3 modul dan final test selesai.

## Result page CTA

CTA: **Mulai Perbaiki Usaha Saya**

Supporting text: Tiga fokus ini akan menjadi Jalur Naik Kelas yang dapat kamu selesaikan bertahap.

Redirect:

`https://app.dekatlokal.com/mulai?claim={opaqueToken}`

## Pre-auth UX direction

Gunakan ritme guided mobile learning:
- full-screen,
- satu tugas per layar,
- progress bar,
- copy pendek,
- pilihan besar,
- fixed CTA,
- immediate feedback,
- supportive tone.

Jangan menyalin brand, maskot, shape, atau aset Duolingo.

Identitas tetap DekatLokal:
- official logo,
- biru `#0255F5`,
- white/soft-blue surfaces,
- tone dewasa dan profesional,
- Tekap sebagai helper,
- contoh UMKM lokal.

## Three-module path

### Module 1 — Immediate foundation
Quick win atau prerequisite.

### Module 2 — Capability building
Menggunakan hasil module 1.

### Module 3 — Market or operational application
Menggunakan output sebelumnya.

## Dashboard

### Above the fold
- business identity,
- Fokus 1 dari 3,
- current action,
- reason,
- duration,
- progress,
- CTA.

### Below
- three-step path,
- checkup insight,
- Asset Bank,
- recheckup progress,
- reward preview.

## Progress requirements

Tampilkan:
- 0/3, 1/3, 2/3, atau 3/3 modul,
- lesson mastery,
- tasks,
- assets,
- final-test readiness,
- recheckup readiness.

## Final test

Hanya menguji tiga focus areas yang diberikan.

## Recheckup

Bandingkan tiga intervensi awal serta pilar keseluruhan.

## Reward

Landing page eligibility:
- tiga modul selesai,
- final test lulus,
- recheckup selesai,
- required assets lengkap,
- terms diterima,
- program capacity tersedia.

## Premium

Premium hanya muncul setelah fondasi tiga modul selesai atau benar-benar relevan. Jangan mengganggu active path.

## Updated analytics

- preauth_claim_viewed
- recall_started
- recall_option_selected
- recall_submitted
- recall_partial
- recall_completed
- recall_help_used
- path_preview_viewed
- signup_wall_viewed
- preauth_to_signup
- claim_associated_after_auth

## Updated acceptance criteria

- valid token memuat tiga authoritative modules,
- exactly three selections,
- distractors relevan,
- partial feedback suportif,
- help mencegah dead end,
- refresh mempertahankan stage,
- signup setelah path preview,
- auth menghubungkan original recommendations,
- dashboard hanya tiga required modules,
- tidak ada private data di URL,
- no-checkup user diarahkan ke Digital Checkup,
- completion flow menggunakan tiga modul.

## P0.5.1 implementation note

P0.5.1 implements the post-foundation journey:

```text
tiga modul
â†’ ujian akhir
â†’ Digital Checkup ulang
â†’ before-after
â†’ sertifikat penyelesaian
â†’ reward landing page
â†’ rekomendasi premium personal
```

The active path remains exactly three required modules. Checkup ulang creates a new comparison and recommendation preview, but does not silently replace the completed historical path. Reward eligibility is checklist-based and capacity-aware. Premium is personalized and de-emphasized before foundation completion.
