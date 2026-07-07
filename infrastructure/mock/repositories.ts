import "server-only";

import type {
  AppRepository,
  AssetRepository,
  CheckupRepository,
  ClaimCheckupInput,
  DashboardRepository,
  LearningRepository,
  Repositories,
  RewardClaimInput,
} from "@/domain/repositories";
import type { ClaimDistractorModule, ScenarioKey } from "@/domain/entities";
import {
  assessmentResultSchema,
  businessAssetSchema,
  certificateSchema,
  checkupClaimPreviewSchema,
  claimAssociationSchema,
  evidenceDraftSchema,
  finalTestAttemptSchema,
  lessonProgressSchema,
  moduleCompletionSchema,
} from "@/domain/schemas";
import { createAssetFromTask, evaluateModuleCompletion } from "@/features/evidence/completion";
import { createFinalTest } from "@/features/final-test/evaluate";
import { applySequentialThreeFocusState } from "@/features/learning-path/three-focus";
import { buildPremiumRecommendations } from "@/features/premium/recommendations";
import { buildThreeFocusProgress } from "@/features/progress/three-focus-progress";
import { createMockRecheckupComparison } from "@/features/recheckup/compare";
import {
  buildRewardEligibility,
  createRewardClaim,
} from "@/features/rewards/eligibility";
import {
  createLearningContent,
  createReferenceModule,
} from "@/infrastructure/mock/modules";
import {
  getFoundationalModule,
  listFoundationalModules,
} from "@/infrastructure/mock/foundational-modules";
import {
  mockScenarios,
  scenarioForClaimToken,
} from "@/infrastructure/mock/scenarios";
import {
  getMockGrowthSession,
  persistFinalTestAttempt,
  persistRecheckupComparison,
  persistRewardClaim,
} from "@/infrastructure/storage/mock-growth-session";
import {
  getMockLearningSession,
  persistAssessmentResult,
  persistLessonProgress,
  persistTaskAndAsset,
  persistTaskDraft,
} from "@/infrastructure/storage/mock-learning-session";

const distractorsByFamily = {
  culinary: [
    {
      id: "module-produk-dan-kemasan",
      title: "Produk dan Kemasan",
      shortOutcome: "Produk lebih jelas, menarik, aman, dan mudah dipahami pelanggan.",
    },
    {
      id: "module-marketplace-dan-kanal-penjualan",
      title: "Marketplace dan Kanal Penjualan",
      shortOutcome: "Kanal penjualan dipilih sesuai kebiasaan pelanggan.",
    },
    {
      id: "module-operasional-dan-keuangan-dasar",
      title: "Operasional dan Keuangan Dasar",
      shortOutcome: "Order dan pencatatan uang lebih rapi.",
    },
  ],
  fashion: [
    {
      id: "module-digitalisasi-umkm",
      title: "Digitalisasi UMKM",
      shortOutcome: "Fondasi digital usaha dirapikan agar mudah ditemukan.",
    },
    {
      id: "module-konsistensi-promosi",
      title: "Konsistensi Promosi",
      shortOutcome: "Promosi 7 hari tersusun dengan CTA yang jelas.",
    },
    {
      id: "module-operasional-dan-keuangan-dasar",
      title: "Operasional dan Keuangan Dasar",
      shortOutcome: "Alur order dan pencatatan dasar dibuat lebih rapi.",
    },
  ],
  service: [
    {
      id: "module-branding-umkm",
      title: "Branding UMKM",
      shortOutcome: "Identitas dan pesan brand menjadi lebih konsisten.",
    },
    {
      id: "module-legalitas-usaha",
      title: "Legalitas Usaha",
      shortOutcome: "Kesiapan dokumen usaha dipetakan dengan jelas.",
    },
    {
      id: "module-marketplace-dan-kanal-penjualan",
      title: "Marketplace dan Kanal Penjualan",
      shortOutcome: "Kanal penjualan dan draft listing disiapkan.",
    },
  ],
} satisfies Record<string, ClaimDistractorModule[]>;

function getDistractors(scenario: ScenarioKey) {
  if (scenario === "fast-fashion") {
    return distractorsByFamily.fashion;
  }
  if (
    scenario === "returning-service" ||
    scenario === "upload-failure" ||
    scenario === "reward-eligible"
  ) {
    return distractorsByFamily.service;
  }
  return distractorsByFamily.culinary;
}

export function createMockRepositories(
  scenario: ScenarioKey,
): Repositories {
  const view = mockScenarios[scenario];
  const content = createLearningContent(view.activePlan?.steps ?? []);
  const activeStep = view.activePlan?.steps.find((step) =>
    ["active", "in_progress", "needs_retry", "awaiting_evidence"].includes(
      step.state,
    ),
  );
  const activeModule = content.modules.find(
    (item) => item.slug === activeStep?.moduleSlug,
  );

  function defaultLessonProgress(lessonId: string) {
    const lesson = content.lessons.find((item) => item.id === lessonId);
    const precompletedScenarios: ScenarioKey[] = [
      "quiz-failure",
      "upload-failure",
      "fast-fashion",
      "returning-service",
      "reward-eligible",
    ];
    if (
      !lesson ||
      lesson.isCorrective ||
      lesson.moduleId !== activeModule?.id ||
      !precompletedScenarios.includes(scenario)
    ) {
      return null;
    }
    return lessonProgressSchema.parse({
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      currentScreen: lesson.screens.length - 1,
      completedScreenIds: lesson.screens.map((screen) => screen.id),
      responses: {},
      status: "completed",
      syncState: "synced",
      updatedAt: "2026-07-06T08:00:00.000Z",
    });
  }

  function defaultAssessmentResult(assessmentId: string) {
    const assessment = content.assessments.find((item) => item.id === assessmentId);
    if (!assessment || assessment.moduleId !== activeModule?.id) return null;
    if (!["quiz-failure", "upload-failure", "fast-fashion", "returning-service", "reward-eligible"].includes(scenario)) {
      return null;
    }
    const passed = scenario !== "quiz-failure";
    const weakQuestions = passed ? [] : assessment.questions.slice(0, 2);
    return assessmentResultSchema.parse({
      assessmentId: assessment.id,
      moduleId: assessment.moduleId,
      score: passed ? 100 : 33,
      passed,
      attemptNumber: 1,
      answers: assessment.questions.map((question, index) => ({
        questionId: question.id,
        optionId: index === 2 || passed ? question.correctOptionId : "mock-wrong",
        correct: passed || index === 2,
      })),
      strongTopics: passed
        ? assessment.questions.map((question) => question.topic)
        : assessment.questions.slice(2).map((question) => question.topic),
      weakTopics: weakQuestions.map((question) => question.topic),
      correctiveLessonIds: weakQuestions.map((question) => question.correctiveLessonId),
      submittedAt: "2026-07-06T08:00:00.000Z",
    });
  }

  function defaultTaskDraft(taskId: string) {
    const task = content.tasks.find((item) => item.id === taskId);
    if (!task || task.moduleId !== activeModule?.id) return null;
    if (scenario === "returning-service") {
      return evidenceDraftSchema.parse({
        taskId,
        text: "Bukti layanan sudah ditambahkan, tetapi keterangannya masih singkat.",
        link: "",
        imageName: "before-after-layanan.jpg",
        checklist: task.checklistOptions.slice(0, 2),
        status: "needs_revision",
        syncState: "synced",
        reviewerFeedback: "Tambahkan lokasi dan hasil yang terlihat pada foto.",
        updatedAt: "2026-07-06T08:00:00.000Z",
      });
    }
    if (scenario === "reward-eligible") {
      return evidenceDraftSchema.parse({
        taskId,
        text: "Bukti usaha lengkap dan siap digunakan.",
        link: "",
        imageName: "bukti-usaha-disetujui.jpg",
        checklist: task.checklistOptions,
        status: "approved",
        syncState: "synced",
        reviewerFeedback: "Bukti sudah disetujui.",
        updatedAt: "2026-07-06T08:00:00.000Z",
      });
    }
    return null;
  }

  function planStepForModule(moduleId: string) {
    return view.activePlan?.steps.find(
      (step) => `module-${step.moduleSlug}` === moduleId,
    );
  }

  function defaultCompletedAsset(moduleId: string) {
    const step = planStepForModule(moduleId);
    if (!step || step.state !== "completed") return null;

    return businessAssetSchema.parse({
      id: `asset-${moduleId}`,
      businessId: view.business.id,
      assetType: step.moduleSlug.replaceAll("-", "_"),
      label: step.assetCreated ?? step.title,
      value: `${step.assetCreated ?? step.title} ${view.business.name} siap digunakan untuk profil, Jejak Tumbuh, dan landing page.`,
      status: "ready",
      source: step.title,
      sourceModuleId: moduleId,
      futureUse: "Dapat dipakai untuk landing page reward dan rekomendasi lanjutan.",
      updatedAt: "2026-07-07T08:00:00.000Z",
    });
  }

  function defaultCompletedModuleCompletion(moduleId: string) {
    const learningModule = content.modules.find((item) => item.id === moduleId);
    const step = planStepForModule(moduleId);
    if (!learningModule || step?.state !== "completed") return null;

    return moduleCompletionSchema.parse({
      moduleId,
      moduleSlug: learningModule.slug,
      lessonsCompleted: learningModule.lessons.length,
      lessonsTotal: learningModule.lessons.length,
      assessmentPassed: true,
      taskStatus: "auto_approved",
      assetId: defaultCompletedAsset(moduleId)?.id,
      completed: true,
      missingRequirements: [],
    });
  }

  function defaultFinalTestAttempt() {
    if (scenario !== "reward-eligible" || !view.activePlan) return null;

    const test = createFinalTest(view.activePlan);
    return finalTestAttemptSchema.parse({
      finalTestId: test.id,
      score: 100,
      passed: true,
      attemptNumber: 1,
      answers: test.questions.map((question) => ({
        questionId: question.id,
        optionId: question.correctOptionId,
        correct: true,
        focusModuleId: question.focusModuleId,
      })),
      strongFocuses: test.questions.map((question) => question.focusTitle),
      weakFocuses: [],
      reviewItems: [],
      submittedAt: "2026-07-07T08:00:00.000Z",
    });
  }

  const app: AppRepository = {
    async getAppView() {
      return {
        scenario: view.scenario,
        user: view.user,
        business: view.business,
        learningPreference: view.learningPreference,
        notifications: view.notifications,
        isOffline: view.isOffline,
      };
    },
    async listScenarios() {
      return Object.keys(mockScenarios) as ScenarioKey[];
    },
  };

  const dashboard: DashboardRepository = {
    async getDashboard() {
      return view;
    },
  };

  const checkup: CheckupRepository = {
    async previewClaim(input: ClaimCheckupInput) {
      const tokenScenario = scenarioForClaimToken(input.token);
      const claimView = tokenScenario ? mockScenarios[tokenScenario] : view;
      const claimPlan = claimView.activePlan;

      if (view.isOffline) {
        return {
          status: "offline",
          message:
            "Koneksi sedang tidak stabil. Coba lagi saat internet kembali.",
        };
      }

      if (scenario === "expired-claim" || input.token === "expired" || input.token === "demo-expired") {
        return {
          status: "expired",
          message:
            "Token klaim sudah kedaluwarsa. Minta tautan baru dari hasil Digital Checkup.",
        };
      }

      if (
        input.token === "claimed" ||
        input.token === "already-claimed" ||
        input.token === "demo-claimed"
      ) {
        return {
          status: "already_claimed",
          message:
            "Hasil Digital Checkup ini sudah pernah dihubungkan ke akun lain. Masuk dengan akun yang benar atau minta bantuan tim DekatLokal.",
        };
      }

      if (input.token === "network-error") {
        return {
          status: "network_error",
          message:
            "Hasil belum dapat dimuat karena koneksi ke layanan terputus. Coba lagi tanpa mengulang Digital Checkup.",
        };
      }

      if (!input.token || input.token === "missing") {
        return {
          status: "missing",
          message:
            "Token klaim tidak ditemukan. Pastikan tautan berasal dari hasil Digital Checkup.",
        };
      }

      if (!claimView.checkup) {
        return {
          status: "missing",
          message:
            "Belum ada hasil Digital Checkup yang dapat dihubungkan untuk akun ini.",
        };
      }

      if (input.token === "invalid" || input.token === "bad-token") {
        return {
          status: "invalid",
          message:
            "Tautan hasil Digital Checkup tidak dikenali. Buka kembali tautan dari halaman hasil.",
        };
      }

      if (!claimPlan || claimPlan.steps.length !== 3) {
        return {
          status: "invalid",
          message:
            "Jalur tiga fokus belum tersedia untuk hasil ini. Silakan ulangi dari halaman Digital Checkup.",
        };
      }

      return {
        status: "valid",
        preview: checkupClaimPreviewSchema.parse({
          claimToken: input.token,
          resultId: claimView.checkup.id,
          expiresAt: "2026-07-07T08:00:00.000Z",
          businessHint: {
            name: claimView.business.name,
            category: claimView.business.category,
          },
          recommendedModules: claimPlan.steps.map((step) => ({
            id: `module-${step.moduleSlug}`,
            title: step.title,
            shortOutcome: step.outcome ?? step.summary,
            estimatedMinutes: step.estimatedMinutes,
            reason: step.reason,
            assetType: step.assetCreated ?? "Aset Usaha",
          })),
          distractorModules: getDistractors(tokenScenario ?? scenario),
          status: "valid",
        }),
      };
    },
    async associateClaim(input) {
      const previewResult = await checkup.previewClaim({ token: input.token });
      if (previewResult.status !== "valid") {
        return previewResult;
      }

      const tokenScenario = scenarioForClaimToken(input.token);
      const claimView = tokenScenario ? mockScenarios[tokenScenario] : view;
      const plan = claimView.activePlan;
      if (!plan) {
        return {
          status: "invalid",
          message: "Jalur tiga fokus tidak ditemukan.",
        };
      }

      return {
        status: "success",
        association: claimAssociationSchema.parse({
          claimToken: input.token,
          userId: input.userId,
          businessId: claimView.business.id,
          resultId: previewResult.preview.resultId,
          planId: plan.id,
          moduleAssignments: previewResult.preview.recommendedModules.map(
            (module, index) => ({
              moduleId: module.id,
              position: index + 1,
              state: plan.steps[index]?.state ?? "locked",
            }),
          ),
          associatedAt: new Date().toISOString(),
        }),
      };
    },
    async getLatest() {
      return view.checkup;
    },
  };

  const learning: LearningRepository = {
    async getActivePlan() {
      return view.activePlan;
    },
    async getPlan(planId: string) {
      if (view.activePlan?.id === planId) {
        return view.activePlan;
      }

      return null;
    },
    async listFoundationalModules() {
      return listFoundationalModules();
    },
    async getFoundationalModule(moduleSlug: string) {
      return getFoundationalModule(moduleSlug);
    },
    async getModuleBySlug(moduleSlug: string) {
      return (
        content.modules.find((module) => module.slug === moduleSlug) ??
        (getFoundationalModule(moduleSlug)
          ? createReferenceModule(getFoundationalModule(moduleSlug)!)
          : null)
      );
    },
    async getModuleById(moduleId: string) {
      const fromContent = content.modules.find((module) => module.id === moduleId);
      if (fromContent) return fromContent;
      const slug = moduleId.replace(/^module-/, "");
      const foundational = getFoundationalModule(slug);
      return foundational ? createReferenceModule(foundational) : null;
    },
    async getLesson(lessonId: string) {
      return content.lessons.find((lesson) => lesson.id === lessonId) ?? null;
    },
    async getLessonProgress(lessonId: string) {
      const session = await getMockLearningSession();
      return session.lessonProgress[lessonId] ?? defaultLessonProgress(lessonId);
    },
    async saveLessonProgress(progress) {
      return persistLessonProgress(progress);
    },
    async getModuleCompletion(moduleId: string) {
      const learningModule = content.modules.find((item) => item.id === moduleId);
      if (!learningModule) {
        return null;
      }

      const session = await getMockLearningSession();
      const assessment = content.assessments.find(
        (item) => item.moduleId === moduleId,
      );
      const task = content.tasks.find((item) => item.moduleId === moduleId);
      const assessmentResults = assessment
        ? session.assessmentResults[assessment.id] ?? []
        : [];
      const taskDraft = task
        ? session.taskDrafts[task.id] ?? defaultTaskDraft(task.id)
        : null;
      const asset =
        session.assets.find((item) => item.sourceModuleId === moduleId) ??
        defaultCompletedAsset(moduleId);

      const completedDefault = defaultCompletedModuleCompletion(moduleId);
      if (
        completedDefault &&
        !session.lessonProgress[learningModule.lessons[0]?.id ?? ""] &&
        !assessmentResults.at(-1) &&
        !taskDraft
      ) {
        return completedDefault;
      }

      return evaluateModuleCompletion({
        module: learningModule,
        lessonProgress: learningModule.lessons
          .map((lesson) => session.lessonProgress[lesson.id] ?? defaultLessonProgress(lesson.id))
          .filter((item) => item !== null),
        assessmentResult:
          assessmentResults.at(-1) ??
          (assessment ? defaultAssessmentResult(assessment.id) : null),
        taskDraft,
        assetId: asset?.id,
      });
    },
  };

  const assessments = {
    async getAssessment(assessmentId: string) {
      return content.assessments.find((item) => item.id === assessmentId) ?? null;
    },
    async getLatestResult(assessmentId: string) {
      const session = await getMockLearningSession();
      return (
        session.assessmentResults[assessmentId]?.at(-1) ??
        defaultAssessmentResult(assessmentId)
      );
    },
    async saveResult(result: Parameters<typeof persistAssessmentResult>[0]) {
      return persistAssessmentResult(result);
    },
  };

  const evidence = {
    async getTask(taskId: string) {
      return content.tasks.find((item) => item.id === taskId) ?? null;
    },
    async getDraft(taskId: string) {
      const session = await getMockLearningSession();
      return session.taskDrafts[taskId] ?? defaultTaskDraft(taskId);
    },
    async saveDraft(draft: Parameters<typeof persistTaskDraft>[0]) {
      return persistTaskDraft(draft);
    },
    async submit(draft: Parameters<typeof persistTaskDraft>[0]) {
      const task = content.tasks.find((item) => item.id === draft.taskId);
      const learningModule = task
        ? content.modules.find((item) => item.id === task.moduleId)
        : null;

      if (!task || !learningModule) {
        return persistTaskDraft(draft);
      }

      const session = await getMockLearningSession();
      const attempt = (session.uploadAttempts[task.id] ?? 0) + 1;
      if (scenario === "upload-failure" && draft.imageName && attempt === 1) {
        return persistTaskDraft(
          evidenceDraftSchema.parse({
            ...draft,
            status: "draft",
            syncState: "failed",
            reviewerFeedback:
              "Foto belum berhasil diunggah. Pilihan Anda tetap tersimpan dan bisa dicoba lagi.",
            updatedAt: new Date().toISOString(),
          }),
          { taskId: task.id, attempts: attempt },
        );
      }

      if (scenario === "fast-fashion") {
        return persistTaskDraft(
          evidenceDraftSchema.parse({
            ...draft,
            status: "submitted",
            syncState: "synced",
            reviewerFeedback:
              "Tugas sudah dikirim dan menunggu review mock. Draft tetap aman.",
            updatedAt: new Date().toISOString(),
          }),
        );
      }

      const approvedDraft = evidenceDraftSchema.parse({
        ...draft,
        status: "auto_approved",
        syncState: "synced",
        reviewerFeedback:
          "Bukti demo memenuhi kelengkapan dasar dan disetujui otomatis.",
        updatedAt: new Date().toISOString(),
      });
      const asset = createAssetFromTask({
        task,
        draft: approvedDraft,
        businessId: view.business.id,
        moduleTitle: learningModule.title,
      });
      await persistTaskAndAsset(approvedDraft, asset);
      return approvedDraft;
    },
  };

  const assets: AssetRepository = {
    async listBusinessAssets() {
      const session = await getMockLearningSession();
      const completedAssets = content.modules
        .map((module) => defaultCompletedAsset(module.id))
        .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
      return [
        ...view.assets.filter(
          (asset) => !session.assets.some((item) => item.id === asset.id),
        ),
        ...completedAssets.filter(
          (asset) =>
            !view.assets.some((item) => item.id === asset.id) &&
            !session.assets.some((item) => item.id === asset.id),
        ),
        ...session.assets,
      ];
    },
  };

  async function getCurrentPlanAndCompletions() {
    if (!view.activePlan) {
      return null;
    }

    const completions = await Promise.all(
      view.activePlan.steps.map(async (step) => {
        const moduleId = `module-${step.moduleSlug}`;
        return learning.getModuleCompletion(moduleId);
      }),
    );
    const moduleCompletions = completions.filter(
      (completion): completion is NonNullable<typeof completion> =>
        Boolean(completion),
    );

    if (moduleCompletions.length !== 3) {
      return null;
    }

    return {
      plan: applySequentialThreeFocusState({
        plan: view.activePlan,
        completions: new Map(
          moduleCompletions.map((completion) => [
            completion.moduleId,
            completion,
          ]),
        ),
      }),
      moduleCompletions,
    };
  }

  const finalTest = {
    async getFinalTest() {
      if (!view.activePlan) return null;
      return createFinalTest(view.activePlan);
    },
    async getLatestAttempt(finalTestId: string) {
      const session = await getMockGrowthSession();
      return (
        session.finalTestAttempts[finalTestId]?.at(-1) ??
        defaultFinalTestAttempt()
      );
    },
    async saveAttempt(attempt: Parameters<typeof persistFinalTestAttempt>[0]) {
      return persistFinalTestAttempt(attempt);
    },
  };

  const recheckup = {
    async getComparison(businessId: string) {
      const session = await getMockGrowthSession();
      const stored = session.recheckupComparisons[businessId];
      if (stored) return stored;
      if (scenario !== "reward-eligible" || !view.checkup || !view.activePlan) {
        return null;
      }

      return createMockRecheckupComparison({
        originalResult: view.checkup,
        plan: view.activePlan,
        assets: await assets.listBusinessAssets(view.business.id),
      });
    },
    async saveComparison(
      comparison: Parameters<typeof persistRecheckupComparison>[0],
    ) {
      return persistRecheckupComparison(comparison);
    },
  };

  const rewards = {
    async getEligibility() {
      const growth = await getCurrentPlanAndCompletions();
      const latestFinalTest = view.activePlan
        ? await finalTest.getLatestAttempt(`final-test-${view.activePlan.id}`)
        : null;
      const comparison = await recheckup.getComparison(view.business.id);
      const rewardClaim = await rewards.getClaim(`landing-page-${view.business.id}`);
      if (!growth) {
        throw new Error("Reward eligibility requires an active three-focus plan.");
      }

      return buildRewardEligibility({
        business: view.business,
        plan: growth.plan,
        moduleCompletions: growth.moduleCompletions,
        assets: await assets.listBusinessAssets(view.business.id),
        finalTestAttempt: latestFinalTest,
        recheckupComparison: comparison,
        termsAccepted: scenario === "reward-eligible" || Boolean(rewardClaim),
        programCapacity: "available",
      });
    },
    async getClaim(rewardId: string) {
      const session = await getMockGrowthSession();
      return session.rewardClaims[rewardId] ?? null;
    },
    async saveClaim(input: RewardClaimInput) {
      const claim = createRewardClaim(input);
      return persistRewardClaim(claim);
    },
  };

  const progress = {
    async getThreeFocusProgress() {
      const growth = await getCurrentPlanAndCompletions();
      if (!growth) {
        throw new Error("Progress requires an active three-focus plan.");
      }

      const final = await finalTest.getLatestAttempt(
        `final-test-${growth.plan.id}`,
      );
      const comparison = await recheckup.getComparison(view.business.id);
      const eligibility = await rewards.getEligibility();

      return buildThreeFocusProgress({
        plan: growth.plan,
        moduleCompletions: growth.moduleCompletions,
        assets: await assets.listBusinessAssets(view.business.id),
        progress: view.progress,
        finalTestAttempt: final,
        recheckupComparison: comparison,
        rewardEligibility: eligibility,
      });
    },
  };

  const certificates = {
    async getCertificate(certificateId: string) {
      if (!view.activePlan) return null;
      const expectedId = `cert-${view.business.slug}-basic`;
      if (certificateId !== expectedId) return null;

      return certificateSchema.parse({
        id: expectedId,
        learnerName: view.user.name,
        businessName: view.business.name,
        pathTitle: view.activePlan.headline,
        moduleTitles: view.activePlan.steps.map((step) => step.title),
        issueDate: "2026-07-07",
        mockCertificateId: `DL-${view.business.slug.toUpperCase()}-P051`,
        disclaimer:
          "Sertifikat ini adalah bukti penyelesaian Jalur Naik Kelas, bukan sertifikasi kompetensi resmi.",
        verificationPlaceholder:
          "Verifikasi publik akan tersedia pada fase produksi berikutnya.",
      });
    },
  };

  const premium = {
    async listRecommendations() {
      const growth = await getCurrentPlanAndCompletions();
      if (!growth) {
        return [];
      }
      const eligibility = await rewards.getEligibility();
      const threeFocusProgress = await buildThreeFocusProgress({
        plan: growth.plan,
        moduleCompletions: growth.moduleCompletions,
        assets: await assets.listBusinessAssets(view.business.id),
        progress: view.progress,
        finalTestAttempt: view.activePlan
          ? await finalTest.getLatestAttempt(`final-test-${view.activePlan.id}`)
          : null,
        recheckupComparison: await recheckup.getComparison(view.business.id),
        rewardEligibility: eligibility,
      });

      return buildPremiumRecommendations({
        business: view.business,
        checkup: view.checkup,
        progress: threeFocusProgress,
      });
    },
  };

  return {
    app,
    dashboard,
    checkup,
    learning,
    assessments,
    evidence,
    assets,
    progress,
    finalTest,
    recheckup,
    certificates,
    rewards,
    premium,
  };
}
