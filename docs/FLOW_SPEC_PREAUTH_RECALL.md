# FLOW SPECIFICATION — Pre-auth Module Recall and Deferred Signup

## Product decision

Pengguna tidak perlu login sebelum Digital Checkup.

Digital Checkup diselesaikan di `dekatlokal.com`. Hasilnya menampilkan tiga intervensi utama. CTA mengarah ke `app.dekatlokal.com/mulai?claim={opaqueToken}`.

Flow aplikasi sebelum login berfungsi sebagai:
- penguatan memori,
- validasi pemahaman pengguna,
- preview manfaat,
- dan alasan yang jelas untuk membuat akun.

## Prinsip utama

1. Tiga modul resmi tetap berasal dari hasil Digital Checkup.
2. Recall challenge bukan sumber personalisasi.
3. Login baru diminta setelah pengguna melihat nilai produk.
4. Dashboard hanya menampilkan tiga fokus utama.
5. Modul dibuka bertahap.
6. Pengguna tanpa checkup tidak boleh membuat jalur personal secara acak.

## End-to-end flow

Digital Checkup → hasil 3 intervensi → CTA → `/mulai?claim=TOKEN` → claim validation → result-ready → recall challenge → feedback → preview 3 modul → signup/login → associate claim → dashboard Fokus 1 dari 3.

## Routes

- `/mulai`
- `/daftar`
- `/masuk`
- `/verifikasi`
- `/hubungkan-checkup`
- `/app/beranda`

Pre-auth dapat memakai state machine pada `/mulai`, tetapi refresh dan browser back harus aman.

## Screen 1 — Claim validation

States:
- loading
- valid
- missing
- expired
- already claimed
- invalid
- network error

### Missing claim

Title: **Buat jalur yang sesuai untuk usahamu**

Body: Digital Checkup membantu DekatLokal menemukan tiga fokus yang paling dibutuhkan usahamu.

Primary CTA: **Mulai Digital Checkup**

Secondary: **Saya sudah punya akun**

## Screen 2 — Result ready

Title: **Hasil usahamu sudah siap!**

Body: Digital Checkup menemukan tiga fokus utama yang dapat membantu usaha berkembang lebih terarah.

CTA: **Lihat Fokus Usaha Saya**

## Screen 3 — Recall challenge

Title: **Masih ingat tiga fokus usahamu?**

Body: Pilih tiga rekomendasi yang muncul pada hasil Digital Checkup tadi.

Rules:
- tampilkan enam pilihan,
- tepat tiga pilihan aktif,
- tiga rekomendasi benar dari claim,
- tiga distractor relevan,
- counter pilihan,
- CTA aktif setelah tiga dipilih,
- accessible.

CTA: **Periksa Pilihan**

## Feedback

Fully correct:
**Pas! Kamu mengingat ketiga fokus usahamu.**

Partially correct:
**Hampir tepat!**

Beritahu jumlah pilihan yang sesuai dan beri satu hint kontekstual. Jangan tampilkan skor teknis.

Setelah percobaan berulang, tampilkan:
**Tampilkan bantuan**

Pengguna tidak boleh terjebak.

## Screen 4 — Path preview

Title: **Ini Jalur Naik Kelas usahamu**

Tampilkan tepat tiga modul, masing-masing berisi:
- outcome,
- estimasi,
- alasan,
- aset yang dihasilkan,
- state urutan/lock.

Body: Kamu tidak perlu menyelesaikannya sekaligus. Progres akan tersimpan setelah membuat akun.

CTA: **Simpan Jalur Saya**

## Screen 5 — Signup wall

Title: **Simpan perjalanan usahamu**

Body: Buat akun agar hasil Digital Checkup, tiga fokus usaha, dan progres belajarmu tidak hilang.

Options:
- Daftar dengan WhatsApp
- Lanjutkan dengan Google
- Saya sudah punya akun

## Data contract

```ts
type CheckupClaimPreview = {
  claimToken: string;
  resultId: string;
  businessHint?: {
    name?: string;
    category?: string;
  };
  recommendedModules: Array<{
    id: string;
    title: string;
    shortOutcome: string;
    estimatedMinutes: number;
    reason: string;
    assetType?: string;
  }>;
  distractorModules: Array<{
    id: string;
    title: string;
    shortOutcome: string;
  }>;
  expiresAt: string;
  status: "valid" | "expired" | "claimed" | "invalid";
};
```

Jangan menaruh module IDs, skor, atau data pribadi pada URL.

## Pre-auth state

```ts
type PreAuthJourney = {
  claimToken: string;
  stage: "result_ready" | "recall" | "path_preview" | "signup";
  selectedModuleIds: string[];
  attemptCount: number;
  completedRecall: boolean;
};
```

Gunakan storage adapter yang sudah ada. Jangan akses `localStorage` langsung dari page component.

## Post-auth association

Claim token → authenticated user → business → checkup result → authoritative 3-module plan → assignments.

## Dashboard revision

Tampilkan:
- Fokus 1 dari 3,
- satu Langkah Terbaik Hari Ini,
- current module,
- alasan,
- dua modul tersisa,
- progress final test,
- progress recheckup,
- reward preview.

Tidak ada katalog modul umum pada dashboard utama.

## Completion path

3 modul wajib → final test → Digital Checkup ulang → before-after → certificate → reward.

## Accessibility

- 360px dan 390px,
- body 16px minimum,
- controls 44px,
- keyboard,
- focus visible,
- reduced motion,
- large text,
- correctness tidak hanya mengandalkan warna.
