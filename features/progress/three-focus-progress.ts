import type {
  BusinessAsset,
  FinalTestAttempt,
  InterventionPlan,
  ModuleCompletion,
  ProgressSummary,
  RecheckupComparison,
  RewardEligibility,
  ThreeFocusProgress,
} from "@/domain/entities";
import { threeFocusProgressSchema } from "@/domain/schemas";

export function buildThreeFocusProgress(input: {
  plan: InterventionPlan;
  moduleCompletions: ModuleCompletion[];
  assets: BusinessAsset[];
  progress: ProgressSummary;
  finalTestAttempt: FinalTestAttempt | null;
  recheckupComparison: RecheckupComparison | null;
  rewardEligibility: RewardEligibility;
}): ThreeFocusProgress {
  if (input.plan.steps.length !== 3 || input.moduleCompletions.length !== 3) {
    throw new Error("Progress requires exactly three focus modules.");
  }

  const completedModules = input.moduleCompletions.filter(
    (completion) => completion.completed,
  ).length;
  const finalTestPassed = input.finalTestAttempt?.passed ?? false;
  const recheckupCompleted = Boolean(input.recheckupComparison);
  const currentFocus =
    input.plan.steps.find(
      (step) =>
        !input.moduleCompletions.some(
          (completion) =>
            completion.moduleSlug === step.moduleSlug && completion.completed,
        ),
    ) ?? undefined;
  const focusTimeline = input.plan.steps.map((step, index) => {
    const completion = input.moduleCompletions.find(
      (item) => item.moduleSlug === step.moduleSlug,
    );
    const status: "done" | "current" | "locked" = completion?.completed
      ? "done"
      : currentFocus?.id === step.id
        ? "current"
        : "locked";

    return {
      id: step.id,
      title: `${index + 1}. ${step.title}`,
      description: completion?.completed
        ? `${step.assetCreated ?? "Aset Usaha"} sudah siap dipakai.`
        : step.reason,
      status,
    };
  });

  const timeline: ThreeFocusProgress["timeline"] = [
    ...focusTimeline,
    {
      id: "final-test",
      title: "Ujian akhir",
      description: finalTestPassed
        ? "Penguasaan tiga fokus sudah terbukti."
        : "Terbuka setelah ketiga modul memenuhi syarat belajar, penguasaan, dan aksi usaha.",
      status: (finalTestPassed
        ? "done"
        : completedModules === 3
          ? "current"
          : "locked") as "done" | "current" | "locked",
    },
    {
      id: "recheckup",
      title: "Digital Checkup ulang",
      description: recheckupCompleted
        ? "Perubahan sebelum dan sesudah sudah tercatat."
        : "Terbuka setelah ujian akhir lulus.",
      status: (recheckupCompleted
        ? "done"
        : finalTestPassed
          ? "current"
          : "locked") as "done" | "current" | "locked",
    },
    {
      id: "reward",
      title: "Reward landing page",
      description: input.rewardEligibility.eligible
        ? "Syarat utama terpenuhi dan siap diklaim."
        : "Checklist reward menunggu data dan aset lengkap.",
      status: (input.rewardEligibility.eligible
        ? "current"
        : "locked") as "done" | "current" | "locked",
    },
  ];

  return threeFocusProgressSchema.parse({
    completedModules,
    totalModules: 3,
    currentFocus,
    completedFocuses: input.plan.steps.filter((step) =>
      input.moduleCompletions.some(
        (completion) =>
          completion.moduleSlug === step.moduleSlug && completion.completed,
      ),
    ),
    moduleCompletions: input.moduleCompletions,
    postTestMastery: input.plan.steps.map((step) => {
      const completion = input.moduleCompletions.find(
        (item) => item.moduleSlug === step.moduleSlug,
      );
      return {
        moduleTitle: step.title,
        passed: completion?.assessmentPassed ?? false,
        detail: completion?.assessmentPassed
          ? "Cek pemahaman modul dikuasai."
          : "Cek pemahaman modul belum selesai.",
      };
    }),
    actionTasks: input.plan.steps.map((step) => {
      const completion = input.moduleCompletions.find(
        (item) => item.moduleSlug === step.moduleSlug,
      );
      return {
        moduleTitle: step.title,
        status: completion?.taskStatus ?? "not_started",
        assetLabel: step.assetCreated ?? "Aset Usaha",
        complete: Boolean(completion?.completed),
      };
    }),
    assets: input.assets,
    finalTestReady: completedModules === 3,
    finalTestPassed,
    recheckupReady: finalTestPassed,
    recheckupCompleted,
    rewardReady: input.rewardEligibility.eligible,
    timeline,
    points: input.progress.points,
    activeDays: input.progress.activeDays,
    insight: input.progress.insight,
    syncState: input.progress.syncState,
  });
}
