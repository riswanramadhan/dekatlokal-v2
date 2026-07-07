import type {
  BusinessAsset,
  CheckupResult,
  InterventionPlan,
  RecheckupComparison,
} from "@/domain/entities";
import { recheckupComparisonSchema } from "@/domain/schemas";

function improveScore(score: number, amount: number) {
  return Math.min(100, score + amount);
}

export function createMockRecheckupComparison(input: {
  originalResult: CheckupResult;
  plan: InterventionPlan;
  assets: BusinessAsset[];
}): RecheckupComparison {
  const completedAt = new Date().toISOString();
  const latestTotal = improveScore(input.originalResult.totalScore, 18);
  const latestResult: CheckupResult = {
    ...input.originalResult,
    id: `${input.originalResult.id}-ulang`,
    totalScore: latestTotal,
    level: latestTotal >= 80 ? "Siap naik kelas" : "Perkembangan terlihat",
    completedAt,
    source: "repeat_mock",
    summary:
      "Checkup ulang menunjukkan perubahan pada area yang dikerjakan melalui tiga fokus dasar.",
    strengths: [
      ...input.originalResult.strengths,
      "Aset usaha dasar sudah lebih siap dipakai",
    ],
    priorities: ["Pertahankan konsistensi", "Pilih langkah lanjutan yang relevan"],
    pillarScores: input.originalResult.pillarScores.map((pillar, index) => ({
      ...pillar,
      score: improveScore(pillar.score, index === 0 ? 24 : 14),
      band:
        improveScore(pillar.score, index === 0 ? 24 : 14) >= 85
          ? "strong"
          : "reinforcement",
      explanation: `Meningkat setelah aset dari Jalur Naik Kelas dipakai untuk memperjelas informasi usaha.`,
    })),
  };
  const planModuleIds = new Set(
    input.plan.steps.map((step) => `module-${step.moduleSlug}`),
  );
  const contributingAssets = input.assets.filter(
    (asset) =>
      (asset.sourceModuleId && planModuleIds.has(asset.sourceModuleId)) ||
      input.plan.steps.some((step) => step.assetCreated === asset.label),
  );

  return recheckupComparisonSchema.parse({
    id: `recheckup-${input.originalResult.businessId}`,
    businessId: input.originalResult.businessId,
    originalResult: input.originalResult,
    latestResult,
    completedAt,
    changedHighlights: [
      `Skor total bergerak dari ${input.originalResult.totalScore} menjadi ${latestResult.totalScore}.`,
      "Jawaban tentang informasi usaha diperbarui karena aset dasar sudah tersedia.",
      "Jalur tiga fokus yang sudah selesai tetap tersimpan sebagai riwayat, bukan diganti diam-diam.",
    ],
    contributingActions: input.plan.steps.map((step) => ({
      label: step.title,
      source:
        contributingAssets.find(
          (asset) =>
            asset.sourceModuleId === `module-${step.moduleSlug}` ||
            asset.label === step.assetCreated,
        )?.label ?? step.assetCreated ?? "Aset Usaha",
    })),
    updatedRecommendationPreview: [
      {
        title: "Optimasi kanal pesanan",
        reason: "Fondasi informasi usaha sudah lebih rapi.",
        expectedValue: "Pesanan lebih mudah dipantau dari kanal yang sudah aktif.",
        prerequisite: "Jalur tiga fokus dasar selesai dan checkup ulang tercatat.",
      },
      {
        title: "Konten bukti usaha",
        reason: "Aset before-after dan deskripsi usaha sudah bisa dipakai ulang.",
        expectedValue: "Calon pelanggan melihat alasan percaya yang lebih konkret.",
        prerequisite: "Aset Usaha dasar siap dan profil usaha cukup lengkap.",
      },
    ],
  });
}
