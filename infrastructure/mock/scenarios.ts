import type { DashboardView, ScenarioKey } from "@/domain/entities";
import { dashboardViewSchema } from "@/domain/schemas";

const baseNotifications = [
  {
    id: "notif-progress",
    title: "Draft tersimpan",
    body: "Perubahan terakhir sudah tersimpan.",
    href: "/app/progres",
    read: false,
  },
];

const culinaryNewUser: DashboardView = dashboardViewSchema.parse({
  scenario: "culinary-new-user",
  user: {
    id: "user-rina",
    name: "Bu Rina",
    phone: "+6281211122233",
  },
  business: {
    id: "business-warung-rina",
    ownerUserId: "user-rina",
    name: "Warung Rina",
    slug: "warung-rina",
    category: "Kuliner",
    stage: "operating",
    city: "Makassar",
    logoUrl: "/brand/dekat-lokal-icon.png",
    profileCompleteness: 58,
  },
  learningPreference: {
    userId: "user-rina",
    dailyMinutes: 5,
    digitalComfort: "guided",
    preferredFormats: ["mixed"],
    preferredDaypart: "morning",
    fontScale: "large",
    remindersEnabled: true,
  },
  notifications: baseNotifications,
  isOffline: false,
  checkup: {
    id: "checkup-rina-001",
    businessId: "business-warung-rina",
    totalScore: 51,
    level: "Fondasi mulai terbentuk",
    completedAt: "2026-07-01T08:00:00.000Z",
    source: "main_site",
    summary:
      "Warung Rina sudah memiliki produk yang jelas. Prioritas berikutnya adalah membuat usaha lebih mudah ditemukan dan lebih mudah menerima pesanan.",
    strengths: ["Produk utama jelas", "Nomor WhatsApp aktif"],
    priorities: ["Kehadiran digital", "Katalog produk", "Profil usaha"],
    pillarScores: [
      {
        pillarKey: "digital_presence",
        label: "Kehadiran Digital",
        score: 38,
        band: "high_priority",
        explanation:
          "Pelanggan belum punya tempat ringkas untuk melihat menu, jam buka, dan cara pesan.",
      },
      {
        pillarKey: "operations",
        label: "Operasional",
        score: 57,
        band: "medium_priority",
        explanation:
          "Alur pemesanan sudah berjalan, tetapi masih banyak tanya jawab berulang.",
      },
    ],
  },
  activePlan: {
    id: "plan-rina-basic",
    businessId: "business-warung-rina",
    headline: "Jalur Naik Kelas Warung Rina",
    summary:
      "Mulai dari fondasi digital, pesan brand yang konsisten, lalu promosi ringan selama tujuh hari.",
    rationale:
      "Skor Kehadiran Digital masih menjadi prioritas, lalu brand dan promosi membantu Warung Rina tampil lebih jelas di kanal pelanggan.",
    estimatedMinutes: 92,
    nextBestAction: {
      id: "nba-digitalisasi-rina",
      title: "Rapikan Fondasi Digital Warung Rina",
      description:
        "Lengkapi data usaha yang paling sering dicari pelanggan sebelum memesan.",
      rationale:
        "Kehadiran Digital Warung Rina masih 38/100. Profil digital yang rapi membuat pelanggan lebih cepat menemukan menu, jam buka, dan kontak.",
      estimatedMinutes: 8,
      href: "/app/modul/digitalisasi-umkm",
      ctaLabel: "Mulai 8 Menit",
      progressLabel: "Fokus 1 dari 3",
    },
    steps: [
      {
        id: "step-digitalisasi-rina",
        title: "Digitalisasi UMKM",
        summary: "Rapikan informasi usaha, WhatsApp Business, dan profil digital utama.",
        moduleSlug: "digitalisasi-umkm",
        position: 1,
        state: "active",
        required: true,
        estimatedMinutes: 32,
        reason: "Pelanggan belum punya tempat ringkas untuk melihat menu, jam buka, lokasi, dan cara pesan.",
        outcome: "Warung Rina memiliki checklist profil digital dan data usaha yang siap dipakai.",
        assetCreated: "Digital Profile Checklist",
      },
      {
        id: "step-branding-rina",
        title: "Branding UMKM",
        summary: "Tentukan nilai unik, target pelanggan, tagline, dan tone sederhana.",
        moduleSlug: "branding-umkm",
        position: 2,
        state: "locked",
        required: true,
        estimatedMinutes: 30,
        reason: "Pesan usaha yang konsisten membantu pelanggan mengingat Warung Rina.",
        prerequisite:
          "Selesaikan Digitalisasi UMKM terlebih dahulu agar identitas dan kontak usaha sudah rapi.",
        outcome: "Warung Rina memiliki mini brand kit sederhana untuk konten dan profil.",
        assetCreated: "Mini Brand Kit",
      },
      {
        id: "step-promosi-rina",
        title: "Konsistensi Promosi",
        summary: "Buat kalender konten 7 hari dan tiga draft caption yang jelas.",
        moduleSlug: "konsistensi-promosi",
        position: 3,
        state: "locked",
        required: true,
        estimatedMinutes: 30,
        reason: "Promosi ringan yang konsisten membantu pelanggan melihat menu dan penawaran tanpa harus diingatkan satu per satu.",
        prerequisite:
          "Selesaikan Branding UMKM terlebih dahulu agar promosi memakai pesan dan tone yang konsisten.",
        outcome: "Warung Rina memiliki kalender konten 7 hari dan CTA yang siap dipakai.",
        assetCreated: "Kalender Konten 7 Hari",
      },
    ],
    rewardPreview: {
      title: "Reward landing page",
      description:
        "Lengkapi aset dasar agar Warung Rina siap masuk antrean landing page.",
      isEligible: false,
    },
  },
  progress: {
    learningPercent: 24,
    actionPercent: 16,
    points: 120,
    activeDays: 2,
    syncState: "synced",
    insight:
      "Satu aset usaha sudah siap. Lanjutkan katalog agar pelanggan lebih cepat memilih menu.",
  },
  assets: [
    {
      id: "asset-digital-profile",
      businessId: "business-warung-rina",
      assetType: "digital_profile",
      label: "Digital Profile Checklist",
      value:
        "Nama usaha, WhatsApp, jam buka, lokasi, dan deskripsi Warung Rina sudah dirapikan untuk profil digital.",
      status: "ready",
      source: "Digitalisasi UMKM",
      sourceModuleId: "module-digitalisasi-umkm",
      updatedAt: "2026-07-05T09:15:00.000Z",
    },
  ],
});

const fastFashion: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "fast-fashion",
  user: { id: "user-saji", name: "Nadia", phone: "+6281299988877" },
  business: {
    id: "business-saji",
    ownerUserId: "user-saji",
    name: "Saji Studio",
    slug: "saji-studio",
    category: "Fashion",
    stage: "growing",
    city: "Bandung",
    logoUrl: "/brand/dekat-lokal-icon.png",
    profileCompleteness: 74,
  },
  learningPreference: {
    userId: "user-saji",
    dailyMinutes: 10,
    digitalComfort: "fast",
    preferredFormats: ["text", "mixed"],
    preferredDaypart: "evening",
    fontScale: "standard",
    remindersEnabled: false,
  },
  checkup: {
    ...(culinaryNewUser.checkup!),
    id: "checkup-saji-001",
    businessId: "business-saji",
    totalScore: 68,
    level: "Siap diperkuat",
    summary:
      "Saji Studio sudah aktif di media sosial. Prioritas berikutnya adalah merapikan operasional agar order tidak tercecer.",
    strengths: ["Konten sosial aktif", "Foto produk konsisten"],
    priorities: ["Alur order", "Data pelanggan", "Template balasan"],
    pillarScores: [
      {
        pillarKey: "operations",
        label: "Operasional Order",
        score: 42,
        band: "high_priority",
        explanation:
          "Pesanan dari beberapa kanal perlu dirapikan agar mudah dipantau.",
      },
      {
        pillarKey: "branding",
        label: "Branding",
        score: 78,
        band: "reinforcement",
        explanation: "Visual sudah konsisten dan tinggal diperkuat pada katalog.",
      },
    ],
  },
  activePlan: {
    ...(culinaryNewUser.activePlan!),
    id: "plan-saji-ops",
    businessId: "business-saji",
    headline: "Jalur Produk Fashion Lebih Siap Jual",
    summary:
      "Perkuat brand, rapikan product sheet, lalu siapkan kanal penjualan yang paling cocok.",
    rationale:
      "Saji Studio sudah aktif di media sosial. Fokus berikutnya adalah membuat identitas, produk, dan listing jual lebih konsisten.",
    nextBestAction: {
      id: "nba-branding-saji",
      title: "Perkuat Mini Brand Kit Saji Studio",
      description:
        "Tentukan pesan, tone, dan gaya visual agar katalog dan konten terasa konsisten.",
      rationale:
        "Branding sudah punya fondasi visual, tetapi pesan dan target pelanggan perlu dibuat lebih eksplisit sebelum listing diperluas.",
      estimatedMinutes: 10,
      href: "/app/modul/branding-umkm",
      ctaLabel: "Mulai Brand Kit",
      progressLabel: "Fokus 1 dari 3",
    },
    steps: [
      {
        id: "step-branding-saji",
        title: "Branding UMKM",
        summary: "Tentukan target pelanggan, nilai unik, tagline, dan tone visual.",
        moduleSlug: "branding-umkm",
        position: 1,
        state: "active",
        required: true,
        estimatedMinutes: 30,
        reason: "Visual Saji Studio sudah aktif, tetapi pesan brand perlu dibuat konsisten agar mudah diingat.",
        outcome: "Saji Studio punya mini brand kit untuk katalog dan konten.",
        assetCreated: "Mini Brand Kit",
      },
      {
        id: "step-produk-saji",
        title: "Produk dan Kemasan",
        summary: "Rapikan manfaat, varian, harga, foto, dan deskripsi produk.",
        moduleSlug: "produk-dan-kemasan",
        position: 2,
        state: "locked",
        required: true,
        estimatedMinutes: 34,
        reason: "Produk fashion perlu informasi varian, ukuran, dan foto yang konsisten agar pelanggan cepat memilih.",
        prerequisite:
          "Selesaikan Branding UMKM terlebih dahulu agar product sheet mengikuti gaya dan pesan yang sama.",
        outcome: "Saji Studio memiliki product sheet yang siap dipakai untuk katalog.",
        assetCreated: "Product Sheet",
      },
      {
        id: "step-marketplace-saji",
        title: "Marketplace dan Kanal Penjualan",
        summary: "Pilih kanal prioritas dan susun draft listing yang siap dipindahkan.",
        moduleSlug: "marketplace-dan-kanal-penjualan",
        position: 3,
        state: "locked",
        required: true,
        estimatedMinutes: 35,
        reason: "Setelah produk rapi, kanal penjualan bisa dipilih sesuai kebiasaan pelanggan.",
        prerequisite:
          "Selesaikan Produk dan Kemasan terlebih dahulu agar listing memiliki foto, harga, dan deskripsi siap pakai.",
        outcome: "Saji Studio memiliki channel priority plan dan draft listing.",
        assetCreated: "Channel Priority Plan",
      },
    ],
  },
  progress: {
    learningPercent: 46,
    actionPercent: 30,
    points: 240,
    activeDays: 5,
    syncState: "synced",
    insight:
      "Konten Saji Studio sudah kuat. Berikutnya rapikan alur order agar pertumbuhan lebih mudah dikelola.",
  },
});

const returningService: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "returning-service",
  user: { id: "user-bersih", name: "Pak Arman", phone: "+6281355544433" },
  business: {
    id: "business-bersihpro",
    ownerUserId: "user-bersih",
    name: "BersihPro Makassar",
    slug: "bersihpro-makassar",
    category: "Jasa",
    stage: "growing",
    city: "Makassar",
    logoUrl: "/brand/dekat-lokal-icon.png",
    profileCompleteness: 86,
  },
  checkup: {
    ...(culinaryNewUser.checkup!),
    id: "checkup-bersih-001",
    businessId: "business-bersihpro",
    totalScore: 74,
    level: "Fondasi kuat",
    summary:
      "BersihPro sudah memiliki fondasi digital yang baik. Prioritasnya adalah menyelesaikan bukti layanan agar checkup ulang terbuka.",
    strengths: ["Profil Google aktif", "Testimoni terkumpul"],
    priorities: ["Bukti layanan", "Checkup ulang"],
  },
  activePlan: {
    ...(culinaryNewUser.activePlan!),
    id: "plan-bersihpro-proof",
    businessId: "business-bersihpro",
    headline: "Jalur Layanan Lebih Terukur",
    summary:
      "Rapikan profil digital, operasional, dan kebiasaan evaluasi agar layanan lebih mudah diukur.",
    rationale:
      "BersihPro sudah punya fondasi digital. Fokus berikutnya adalah membuktikan operasional dan kebiasaan review agar Checkup ulang lebih kuat.",
    nextBestAction: {
      id: "nba-operasional-bersihpro",
      title: "Rapikan SOP Order Layanan",
      description:
        "Lengkapi alur pesanan dan catatan pekerjaan agar layanan lebih mudah dipantau.",
      rationale:
        "BersihPro sudah hampir siap Checkup ulang, tetapi operasional perlu satu bukti alur layanan yang lebih rapi.",
      estimatedMinutes: 6,
      href: "/app/modul/operasional-dan-keuangan-dasar",
      ctaLabel: "Rapikan SOP",
      progressLabel: "Fokus 2 dari 3",
    },
    steps: [
      {
        id: "step-digitalisasi-bersihpro",
        title: "Digitalisasi UMKM",
        summary: "Pastikan profil digital layanan, kontak, dan channel utama sudah rapi.",
        moduleSlug: "digitalisasi-umkm",
        position: 1,
        state: "completed",
        required: true,
        estimatedMinutes: 32,
        reason: "Profil digital yang jelas membantu calon pelanggan memahami layanan dan cara menghubungi BersihPro.",
        outcome: "BersihPro memiliki data profil digital layanan yang siap dipakai.",
        assetCreated: "Digital Profile Checklist",
      },
      {
        id: "step-operasional-bersihpro",
        title: "Operasional dan Keuangan Dasar",
        summary: "Susun SOP order layanan, catatan pekerjaan, dan arus uang sederhana.",
        moduleSlug: "operasional-dan-keuangan-dasar",
        position: 2,
        state: "awaiting_evidence",
        required: true,
        estimatedMinutes: 36,
        reason: "SOP order membantu tim layanan menjaga kualitas dan memudahkan evaluasi.",
        prerequisite:
          "Selesaikan Digitalisasi UMKM terlebih dahulu agar data layanan dan kontak utama sudah rapi.",
        outcome: "BersihPro memiliki SOP order dan cashbook sederhana.",
        assetCreated: "SOP Order dan Cashbook",
      },
      {
        id: "step-growth-bersihpro",
        title: "Komitmen dan Growth Mindset",
        summary: "Buat rencana 30 hari, kebiasaan review, dan eksperimen mingguan.",
        moduleSlug: "komitmen-dan-growth-mindset",
        position: 3,
        state: "locked",
        required: true,
        estimatedMinutes: 26,
        reason: "Review mingguan membantu BersihPro membuktikan perkembangan layanan setelah operasional rapi.",
        prerequisite:
          "Selesaikan Operasional dan Keuangan Dasar terlebih dahulu agar target 30 hari punya dasar yang jelas.",
        outcome: "BersihPro memiliki Growth Plan 30 Hari.",
        assetCreated: "Growth Plan 30 Hari",
      },
    ],
  },
  progress: {
    learningPercent: 82,
    actionPercent: 68,
    points: 640,
    activeDays: 12,
    syncState: "pending",
    insight:
      "Checkup ulang hampir terbuka. Satu bukti layanan lagi akan memperkuat cerita perkembangan.",
  },
});

const noCheckup: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "no-checkup",
  checkup: null,
  activePlan: null,
  progress: {
    learningPercent: 0,
    actionPercent: 0,
    points: 0,
    activeDays: 0,
    syncState: "synced",
    insight:
      "Hubungkan hasil Digital Checkup agar Ruang Tumbuh dapat menyusun langkah pertama.",
  },
  assets: [],
});

const offline: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "offline",
  isOffline: true,
  progress: {
    ...culinaryNewUser.progress,
    syncState: "failed",
    insight:
      "Mode offline aktif. Draft tetap aman dan akan disinkronkan saat koneksi kembali.",
  },
});

const existingAccount: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "existing-account",
  user: {
    id: "user-rina-existing",
    name: "Bu Rina",
    phone: "+6281211122233",
    email: "rina@example.com",
  },
  progress: {
    ...culinaryNewUser.progress,
    learningPercent: 18,
    actionPercent: 8,
    insight:
      "Akun sudah ada. Masuk dengan WhatsApp untuk melanjutkan klaim hasil checkup terbaru.",
  },
});

const largeText: DashboardView = dashboardViewSchema.parse({
  ...culinaryNewUser,
  scenario: "large-text",
  learningPreference: {
    ...culinaryNewUser.learningPreference,
    fontScale: "large",
    digitalComfort: "guided",
  },
  progress: {
    ...culinaryNewUser.progress,
    insight:
      "Mode teks besar aktif agar instruksi lebih nyaman dibaca pada layar kecil.",
  },
});

const rewardEligible: DashboardView = dashboardViewSchema.parse({
  ...returningService,
  scenario: "reward-eligible",
  progress: {
    learningPercent: 100,
    actionPercent: 100,
    points: 980,
    activeDays: 18,
    syncState: "synced",
    insight:
      "Jalur dasar selesai. Aset usaha siap diperiksa untuk reward landing page.",
  },
  activePlan: returningService.activePlan
    ? {
        ...returningService.activePlan,
        steps: returningService.activePlan.steps.map((step) => ({
          ...step,
          state: "completed" as const,
          prerequisite: undefined,
        })),
        rewardPreview: {
          title: "Reward landing page siap diklaim",
          description:
            "Aset dasar sudah lengkap. Produksi landing page belum tersedia.",
          isEligible: true,
        },
      }
    : null,
});

export const mockScenarios = {
  "culinary-new-user": culinaryNewUser,
  "existing-account": existingAccount,
  "fast-fashion": fastFashion,
  "returning-service": returningService,
  "expired-claim": culinaryNewUser,
  "no-checkup": noCheckup,
  "large-text": largeText,
  offline,
  "upload-failure": returningService,
  "quiz-failure": culinaryNewUser,
  "reward-eligible": rewardEligible,
} satisfies Record<ScenarioKey, DashboardView>;

export function scenarioForClaimToken(token: string): ScenarioKey | null {
  if (
    token === "clm_7N4k9Q2vY8pR5tX1" ||
    token === "demo-warung-rina" ||
    token === "mock-claim-token"
  ) {
    return "culinary-new-user";
  }
  if (token === "demo-saji-studio") {
    return "fast-fashion";
  }
  if (token === "demo-bersihpro") {
    return "returning-service";
  }
  if (token === "demo-expired") {
    return "expired-claim";
  }
  if (token === "demo-claimed") {
    return "existing-account";
  }
  return null;
}
