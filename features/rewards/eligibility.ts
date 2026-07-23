import type {
  Business,
  BusinessAsset,
  FinalTestAttempt,
  InterventionPlan,
  ModuleCompletion,
  RecheckupComparison,
  RewardClaim,
  RewardEligibility,
  RewardTrackingStatus,
} from "@/domain/entities";
import { rewardClaimSchema, rewardEligibilitySchema } from "@/domain/schemas";

const trackingLabels: Record<RewardTrackingStatus, string> = {
  waiting_for_data: "Menunggu data",
  data_complete: "Data lengkap",
  in_progress: "Dalam pengerjaan",
  owner_review: "Review pemilik",
  live: "Live",
};

const trackingOrder: RewardTrackingStatus[] = [
  "waiting_for_data",
  "data_complete",
  "in_progress",
  "owner_review",
  "live",
];

export function createRewardTracking(status: RewardTrackingStatus) {
  const currentIndex = trackingOrder.indexOf(status);
  return trackingOrder.map((item, index) => ({
    status: item,
    label: trackingLabels[item],
    complete: index < currentIndex || item === "live" && status === "live",
    current: index === currentIndex,
  }));
}

export function buildRewardEligibility(input: {
  business: Business;
  plan: InterventionPlan;
  moduleCompletions: ModuleCompletion[];
  assets: BusinessAsset[];
  finalTestAttempt: FinalTestAttempt | null;
  recheckupComparison: RecheckupComparison | null;
  termsAccepted: boolean;
  programCapacity: RewardEligibility["programCapacity"];
}): RewardEligibility {
  const completedModules =
    input.moduleCompletions.length === 3 &&
    input.moduleCompletions.every((completion) => completion.completed);
  const finalTestPassed = input.finalTestAttempt?.passed ?? false;
  const recheckupCompleted = Boolean(input.recheckupComparison);
  const requiredAssetLabels = input.plan.steps.map(
    (step) => step.assetCreated ?? step.title,
  );
  const availableAssetLabels = new Set(input.assets.map((asset) => asset.label));
  const availableAssetModuleIds = new Set(
    input.assets
      .map((asset) => asset.sourceModuleId)
      .filter((moduleId): moduleId is string => Boolean(moduleId)),
  );
  const assetsComplete = input.plan.steps.every((step) => {
    const moduleId = `module-${step.moduleSlug}`;
    return (
      availableAssetModuleIds.has(moduleId) ||
      availableAssetLabels.has(step.assetCreated ?? step.title)
    );
  });
  const profileComplete = input.business.profileCompleteness >= 80;
  const capacityAvailable = input.programCapacity === "available";

  const checklist = [
    {
      id: "three-modules",
      label: "Tiga fokus dasar selesai",
      complete: completedModules,
      detail: completedModules
        ? "Semua modul memenuhi syarat belajar, penguasaan, dan aksi usaha."
        : "Selesaikan ketiga modul wajib terlebih dahulu.",
      actionHref: "/app/jalur",
    },
    {
      id: "final-test",
      label: "Ujian akhir lulus",
      complete: finalTestPassed,
      detail: finalTestPassed
        ? "Ujian akhir mengonfirmasi penguasaan tiga fokus."
        : "Ujian akhir terbuka setelah 3 dari 3 modul selesai.",
      actionHref: "/app/ujian-akhir",
    },
    {
      id: "recheckup",
      label: "Checkup ulang selesai",
      complete: recheckupCompleted,
      detail: recheckupCompleted
        ? "Perubahan sebelum dan sesudah sudah tercatat."
        : "Lakukan Checkup ulang setelah ujian akhir lulus.",
      actionHref: "/app/checkup-ulang",
    },
    {
      id: "assets",
      label: "Aset Usaha wajib tersedia",
      complete: assetsComplete,
      detail: assetsComplete
        ? "Aset dari tiga fokus siap dipakai untuk landing page."
        : `Lengkapi: ${requiredAssetLabels.filter((label) => !availableAssetLabels.has(label)).join(", ") || "aset dari modul wajib"}.`,
      actionHref: "/app/aset-usaha",
    },
    {
      id: "profile",
      label: "Profil usaha cukup lengkap",
      complete: profileComplete,
      detail: `${input.business.profileCompleteness}% lengkap. Minimum kelengkapan: 80%.`,
      actionHref: "/app/akun",
    },
    {
      id: "terms",
      label: "Syarat program disetujui",
      complete: input.termsAccepted,
      detail: input.termsAccepted
        ? "Syarat program sudah diterima."
        : "Baca dan setujui syarat program sebelum klaim.",
    },
    {
      id: "capacity",
      label: "Kapasitas program tersedia",
      complete: capacityAvailable,
      detail:
        input.programCapacity === "available"
          ? "Kuota program tersedia."
          : "Program sedang antre atau penuh.",
    },
  ];
  const missingRequirements = checklist
    .filter((item) => !item.complete)
    .map((item) => item.label);

  return rewardEligibilitySchema.parse({
    rewardId: `landing-page-${input.business.id}`,
    title: "Reward landing page",
    eligible: missingRequirements.length === 0,
    checklist,
    missingRequirements,
    requiredAssetLabels: [...requiredAssetLabels],
    businessProfileCompleteness: input.business.profileCompleteness,
    termsAccepted: input.termsAccepted,
    programCapacity: input.programCapacity,
  });
}

export function createRewardClaim(input: {
  rewardId: string;
  businessId: string;
  selectedStyle: RewardClaim["selectedStyle"];
}): RewardClaim {
  const now = new Date().toISOString();
  return rewardClaimSchema.parse({
    id: `claim-${input.rewardId}`,
    rewardId: input.rewardId,
    businessId: input.businessId,
    selectedStyle: input.selectedStyle,
    status: "data_complete",
    tracking: createRewardTracking("data_complete"),
    submittedAt: now,
    updatedAt: now,
  });
}

export function countRequiredAssets(input: {
  plan: InterventionPlan;
  assets: BusinessAsset[];
}) {
  const requiredModuleIds = new Set(
    input.plan.steps.map((step) => `module-${step.moduleSlug}`),
  );
  return input.assets.filter(
    (asset) => asset.sourceModuleId && requiredModuleIds.has(asset.sourceModuleId),
  ).length;
}
