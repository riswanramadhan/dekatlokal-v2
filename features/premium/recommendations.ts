import type {
  Business,
  CheckupResult,
  PremiumRecommendation,
  ThreeFocusProgress,
} from "@/domain/entities";
import { premiumRecommendationSchema } from "@/domain/schemas";

export function buildPremiumRecommendations(input: {
  business: Business;
  checkup: CheckupResult | null;
  progress: ThreeFocusProgress;
}): PremiumRecommendation[] {
  if (input.progress.completedModules < 3) {
    return [
      premiumRecommendationSchema.parse({
        id: "premium-after-foundation",
        title: "Rekomendasi lanjutan disimpan dulu",
        outcome:
          "DekatLokal akan membuka saran lanjutan setelah tiga fokus dasar selesai.",
        reason:
          "Saat ini perhatian terbaik masih pada Jalur Naik Kelas dasar agar tidak memecah fokus.",
        prerequisite: `${3 - input.progress.completedModules} fokus dasar lagi perlu diselesaikan.`,
        expectedBusinessValue:
          "Saran premium menjadi lebih akurat setelah aksi dasar dan Checkup ulang terlihat.",
        status: "locked",
      }),
    ];
  }

  const category = input.business.category.toLowerCase();
  const localDiscovery =
    category.includes("kuliner") || category.includes("jasa")
      ? "Local SEO dan profil pencarian"
      : "Optimasi katalog dan kanal penjualan";
  const checkupReason = input.checkup
    ? `Checkup terakhir menunjukkan level "${input.checkup.level}".`
    : "Hasil Checkup akan membuat rekomendasi lebih presisi.";

  return [
    premiumRecommendationSchema.parse({
      id: "premium-local-discovery",
      title: localDiscovery,
      outcome:
        "Usaha lebih mudah ditemukan pelanggan yang sudah berniat membeli.",
      reason: `${checkupReason} Fondasi aset usaha sudah siap dipakai untuk kanal pencarian.`,
      prerequisite: "Tiga fokus dasar selesai dan Checkup ulang tercatat.",
      expectedBusinessValue:
        "Meningkatkan peluang pelanggan baru menemukan kontak, lokasi, dan penawaran utama.",
      status: "available",
    }),
    premiumRecommendationSchema.parse({
      id: "premium-retention",
      title: "Sistem tindak lanjut pelanggan",
      outcome:
        "Pelanggan lama lebih mudah dihubungi ulang dengan penawaran yang relevan.",
      reason:
        "Aset usaha dasar sudah membuat pesan dan penawaran lebih konsisten.",
      prerequisite: "Aset deskripsi, bukti, atau katalog sudah tersedia.",
      expectedBusinessValue:
        "Mengurangi chat berulang dan membantu pemilik menjaga hubungan pelanggan.",
      status: "available",
    }),
    premiumRecommendationSchema.parse({
      id: "premium-measurement",
      title: "Pengukuran hasil promosi sederhana",
      outcome:
        "Pemilik dapat melihat kanal mana yang paling membantu pesanan masuk.",
      reason:
        "Setelah sebelum-sesudah terlihat, langkah berikutnya adalah mengukur dampak aksi.",
      prerequisite: "Reward atau landing page mulai digunakan.",
      expectedBusinessValue:
        "Keputusan promosi menjadi lebih hemat karena berdasarkan catatan hasil.",
      status: "available",
    }),
  ];
}
