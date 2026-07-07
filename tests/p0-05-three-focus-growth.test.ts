import { describe, expect, it } from "vitest";
import type {
  BusinessAsset,
  FinalTestAttempt,
  ModuleCompletion,
} from "@/domain/entities";
import {
  createFinalTest,
  evaluateFinalTest,
  targetedFinalQuestionIds,
} from "@/features/final-test/evaluate";
import { buildPremiumRecommendations } from "@/features/premium/recommendations";
import { buildThreeFocusProgress } from "@/features/progress/three-focus-progress";
import { createMockRecheckupComparison } from "@/features/recheckup/compare";
import { buildRewardEligibility } from "@/features/rewards/eligibility";
import { createMockRepositories } from "@/infrastructure/mock/repositories";
import { mockScenarios } from "@/infrastructure/mock/scenarios";

const completePlan = mockScenarios["reward-eligible"].activePlan!;
const incompletePlan = mockScenarios["culinary-new-user"].activePlan!;
const completeBusiness = mockScenarios["reward-eligible"].business;
const incompleteBusiness = mockScenarios["culinary-new-user"].business;
const checkup = mockScenarios["reward-eligible"].checkup!;

function moduleCompletion(
  moduleSlug: string,
  completed: boolean,
): ModuleCompletion {
  return {
    moduleId: `module-${moduleSlug}`,
    moduleSlug,
    lessonsCompleted: completed ? 3 : 1,
    lessonsTotal: 3,
    assessmentPassed: completed,
    taskStatus: completed ? "auto_approved" : "draft",
    assetId: completed ? `asset-module-${moduleSlug}` : undefined,
    completed,
    missingRequirements: completed
      ? []
      : ["Kuasai cek pemahaman", "Kirim dan setujui tugas usaha"],
  };
}

function assetsForPlan(): BusinessAsset[] {
  return completePlan.steps.map((step) => ({
    id: `asset-module-${step.moduleSlug}`,
    businessId: completeBusiness.id,
    assetType: step.moduleSlug.replaceAll("-", "_"),
    label: step.assetCreated ?? step.title,
    value: `${step.assetCreated ?? step.title} siap dipakai.`,
    status: "ready",
    source: step.title,
    sourceModuleId: `module-${step.moduleSlug}`,
    futureUse: "Landing page reward",
    updatedAt: "2026-07-07T08:00:00.000Z",
  }));
}

function passingFinalAttempt(): FinalTestAttempt {
  const finalTest = createFinalTest(completePlan);
  return evaluateFinalTest({
    finalTest,
    selectedAnswers: Object.fromEntries(
      finalTest.questions.map((question) => [
        question.id,
        question.correctOptionId,
      ]),
    ),
    attemptNumber: 1,
  });
}

describe("P0.5.1 three-focus growth flow", () => {
  it("locks final test before 3/3 and unlocks it at 3/3", () => {
    const notEligible = buildRewardEligibility({
      business: incompleteBusiness,
      plan: incompletePlan,
      moduleCompletions: incompletePlan.steps.map((step, index) =>
        moduleCompletion(step.moduleSlug, index === 0),
      ),
      assets: [],
      finalTestAttempt: null,
      recheckupComparison: null,
      termsAccepted: false,
      programCapacity: "available",
    });
    const before = buildThreeFocusProgress({
      plan: incompletePlan,
      moduleCompletions: incompletePlan.steps.map((step, index) =>
        moduleCompletion(step.moduleSlug, index === 0),
      ),
      assets: [],
      progress: mockScenarios["culinary-new-user"].progress,
      finalTestAttempt: null,
      recheckupComparison: null,
      rewardEligibility: notEligible,
    });

    const completeCompletions = completePlan.steps.map((step) =>
      moduleCompletion(step.moduleSlug, true),
    );
    const comparison = createMockRecheckupComparison({
      originalResult: checkup,
      plan: completePlan,
      assets: assetsForPlan(),
    });
    const eligible = buildRewardEligibility({
      business: completeBusiness,
      plan: completePlan,
      moduleCompletions: completeCompletions,
      assets: assetsForPlan(),
      finalTestAttempt: passingFinalAttempt(),
      recheckupComparison: comparison,
      termsAccepted: true,
      programCapacity: "available",
    });
    const after = buildThreeFocusProgress({
      plan: completePlan,
      moduleCompletions: completeCompletions,
      assets: assetsForPlan(),
      progress: mockScenarios["reward-eligible"].progress,
      finalTestAttempt: null,
      recheckupComparison: null,
      rewardEligibility: eligible,
    });

    expect(before.finalTestReady).toBe(false);
    expect(before.completedModules).toBe(1);
    expect(after.finalTestReady).toBe(true);
    expect(after.completedModules).toBe(3);
  });

  it("creates targeted review after final test failure", () => {
    const finalTest = createFinalTest(completePlan);
    const firstAttempt = evaluateFinalTest({
      finalTest,
      selectedAnswers: Object.fromEntries(
        finalTest.questions.map((question, index) => [
          question.id,
          index === 0 ? "generic-copy" : question.correctOptionId,
        ]),
      ),
      attemptNumber: 1,
    });

    expect(firstAttempt.passed).toBe(false);
    expect(firstAttempt.reviewItems).toHaveLength(1);
    expect(targetedFinalQuestionIds(finalTest, firstAttempt)).toEqual([
      finalTest.questions[0].id,
    ]);
  });

  it("unlocks recheckup after final test pass and builds before/after comparison", () => {
    const completions = completePlan.steps.map((step) =>
      moduleCompletion(step.moduleSlug, true),
    );
    const comparison = createMockRecheckupComparison({
      originalResult: checkup,
      plan: completePlan,
      assets: assetsForPlan(),
    });
    const eligibility = buildRewardEligibility({
      business: completeBusiness,
      plan: completePlan,
      moduleCompletions: completions,
      assets: assetsForPlan(),
      finalTestAttempt: passingFinalAttempt(),
      recheckupComparison: comparison,
      termsAccepted: true,
      programCapacity: "available",
    });
    const progress = buildThreeFocusProgress({
      plan: completePlan,
      moduleCompletions: completions,
      assets: assetsForPlan(),
      progress: mockScenarios["reward-eligible"].progress,
      finalTestAttempt: passingFinalAttempt(),
      recheckupComparison: comparison,
      rewardEligibility: eligibility,
    });

    expect(progress.recheckupReady).toBe(true);
    expect(comparison.latestResult.totalScore).toBeGreaterThan(
      comparison.originalResult.totalScore,
    );
    expect(comparison.changedHighlights.join(" ")).toContain("riwayat");
  });

  it("returns certificate data for the mock completion certificate", async () => {
    const repositories = createMockRepositories("reward-eligible");
    const certificate = await repositories.certificates.getCertificate(
      "cert-bersihpro-makassar-basic",
    );

    expect(certificate?.learnerName).toBe("Pak Arman");
    expect(certificate?.businessName).toBe("BersihPro Makassar");
    expect(certificate?.moduleTitles).toHaveLength(3);
    expect(certificate?.disclaimer).toContain("bukan sertifikasi");
  });

  it("evaluates reward eligible, not eligible, and missing Business Asset states", () => {
    const completions = completePlan.steps.map((step) =>
      moduleCompletion(step.moduleSlug, true),
    );
    const comparison = createMockRecheckupComparison({
      originalResult: checkup,
      plan: completePlan,
      assets: assetsForPlan(),
    });

    const eligible = buildRewardEligibility({
      business: completeBusiness,
      plan: completePlan,
      moduleCompletions: completions,
      assets: assetsForPlan(),
      finalTestAttempt: passingFinalAttempt(),
      recheckupComparison: comparison,
      termsAccepted: true,
      programCapacity: "available",
    });
    const notEligible = buildRewardEligibility({
      business: incompleteBusiness,
      plan: incompletePlan,
      moduleCompletions: incompletePlan.steps.map((step) =>
        moduleCompletion(step.moduleSlug, false),
      ),
      assets: [],
      finalTestAttempt: null,
      recheckupComparison: null,
      termsAccepted: false,
      programCapacity: "available",
    });
    const missingAsset = buildRewardEligibility({
      business: completeBusiness,
      plan: completePlan,
      moduleCompletions: completions,
      assets: assetsForPlan().slice(0, 2),
      finalTestAttempt: passingFinalAttempt(),
      recheckupComparison: comparison,
      termsAccepted: true,
      programCapacity: "available",
    });

    expect(eligible.eligible).toBe(true);
    expect(notEligible.eligible).toBe(false);
    expect(missingAsset.eligible).toBe(false);
    expect(missingAsset.missingRequirements).toContain(
      "Aset Usaha wajib tersedia",
    );
  });

  it("de-emphasizes premium before foundation completion", () => {
    const eligibility = buildRewardEligibility({
      business: incompleteBusiness,
      plan: incompletePlan,
      moduleCompletions: incompletePlan.steps.map((step) =>
        moduleCompletion(step.moduleSlug, false),
      ),
      assets: [],
      finalTestAttempt: null,
      recheckupComparison: null,
      termsAccepted: false,
      programCapacity: "available",
    });
    const progress = buildThreeFocusProgress({
      plan: incompletePlan,
      moduleCompletions: incompletePlan.steps.map((step) =>
        moduleCompletion(step.moduleSlug, false),
      ),
      assets: [],
      progress: mockScenarios["culinary-new-user"].progress,
      finalTestAttempt: null,
      recheckupComparison: null,
      rewardEligibility: eligibility,
    });

    const recommendations = buildPremiumRecommendations({
      business: incompleteBusiness,
      checkup: mockScenarios["culinary-new-user"].checkup,
      progress,
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].status).toBe("locked");
    expect(recommendations[0].reason).toContain("tidak memecah fokus");
  });
});
