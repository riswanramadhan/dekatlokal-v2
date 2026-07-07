import "server-only";

import { cookies } from "next/headers";
import type { AppView, DashboardView, ScenarioKey } from "@/domain/entities";
import { scenarioKeySchema } from "@/domain/schemas";
import { applySequentialThreeFocusState } from "@/features/learning-path/three-focus";
import { personalizePlan } from "@/features/personalization/rules";
import { createRepositories } from "@/infrastructure/repositories";
import { getMockJourneySession } from "@/infrastructure/storage/mock-session";
import { env } from "@/lib/env";

const DEMO_USER_ID = "demo-user";
const SCENARIO_COOKIE = "dekatlokal_demo_scenario";

export async function getCurrentScenario(): Promise<ScenarioKey> {
  if (env.NODE_ENV === "production") {
    return env.NEXT_PUBLIC_DEMO_SCENARIO;
  }

  const cookieStore = await cookies();
  const cookieScenario = cookieStore.get(SCENARIO_COOKIE)?.value;
  const parsedCookie = scenarioKeySchema.safeParse(cookieScenario);

  if (parsedCookie.success) {
    return parsedCookie.data;
  }

  return env.NEXT_PUBLIC_DEMO_SCENARIO;
}

export async function getRepositoriesForRequest() {
  const scenario = await getCurrentScenario();
  return createRepositories(env.DATA_SOURCE, scenario);
}

export async function getAppView(): Promise<AppView> {
  const repositories = await getRepositoriesForRequest();
  const appView = await repositories.app.getAppView(DEMO_USER_ID);
  const session = await getMockJourneySession();

  return {
    ...appView,
    user: {
      ...appView.user,
      name: session.auth?.ownerName ?? appView.user.name,
      phone: session.auth?.phone ?? appView.user.phone,
      email: session.auth?.email ?? appView.user.email,
    },
    business: session.onboarding?.business
      ? {
          ...appView.business,
          name: session.onboarding.business.name,
          category: session.onboarding.business.category,
          city: session.onboarding.business.city,
        }
      : appView.business,
    learningPreference: session.onboarding?.learningPreference
      ? {
          ...appView.learningPreference,
          dailyMinutes: session.onboarding.learningPreference.dailyMinutes,
          digitalComfort:
            session.onboarding.learningPreference.digitalComfort,
          preferredFormats:
            session.onboarding.learningPreference.preferredFormats,
          fontScale: session.onboarding.learningPreference.fontScale,
          preferredDaypart:
            session.onboarding.rhythm?.preferredDaypart ??
            appView.learningPreference.preferredDaypart,
          remindersEnabled:
            session.onboarding.rhythm?.remindersEnabled ??
            appView.learningPreference.remindersEnabled,
        }
      : appView.learningPreference,
  };
}

export async function getDashboardView(): Promise<DashboardView> {
  const repositories = await getRepositoriesForRequest();
  const [dashboard, appView, session] = await Promise.all([
    repositories.dashboard.getDashboard(DEMO_USER_ID),
    getAppView(),
    getMockJourneySession(),
  ]);

  const dashboardWithSession = {
    ...dashboard,
    user: appView.user,
    business: appView.business,
    learningPreference: appView.learningPreference,
  };

  if (session.auth?.verified && !session.claimAssociation) {
    return {
      ...dashboardWithSession,
      checkup: null,
      activePlan: null,
    };
  }

  let activePlan = dashboardWithSession.activePlan;
  if (activePlan && session.claimAssociation?.planId === activePlan.id) {
    const authoritativeSteps = session.claimAssociation.moduleAssignments
      .sort((left, right) => left.position - right.position)
      .map((assignment) =>
        activePlan?.steps.find(
          (step) => `module-${step.moduleSlug}` === assignment.moduleId,
        ),
      )
      .filter((step): step is NonNullable<typeof step> => Boolean(step));

    if (authoritativeSteps.length === 3) {
      activePlan = { ...activePlan, steps: authoritativeSteps };
    }
  }

  if (activePlan) {
    const completions = await Promise.all(
      activePlan.steps.map(async (step) => {
        const moduleId = `module-${step.moduleSlug}`;
        return [
          moduleId,
          await repositories.learning.getModuleCompletion(moduleId),
        ] as const;
      }),
    );
    activePlan = applySequentialThreeFocusState({
      plan: activePlan,
      completions: new Map(completions),
    });
  }

  return {
    ...dashboardWithSession,
    activePlan: activePlan
      ? personalizePlan({
          plan: activePlan,
          checkup: dashboardWithSession.checkup,
          learningPreference: dashboardWithSession.learningPreference,
        })
      : null,
  };
}

export async function getActivePlanView(planId?: string) {
  const repositories = await getRepositoriesForRequest();
  const dashboard = await getDashboardView();

  if (!dashboard.activePlan) {
    return null;
  }

  if (!planId || dashboard.activePlan.id === planId) {
    return dashboard.activePlan;
  }

  return repositories.learning.getPlan(planId);
}

export async function getFoundationalModuleCatalogView() {
  const repositories = await getRepositoriesForRequest();
  return repositories.learning.listFoundationalModules();
}

export async function getModuleView(moduleSlug: string) {
  const repositories = await getRepositoriesForRequest();
  const dashboard = await getDashboardView();
  const learningModule = await repositories.learning.getModuleBySlug(moduleSlug);
  const step = dashboard.activePlan?.steps.find(
    (planStep) => planStep.moduleSlug === moduleSlug,
  );

  if (!learningModule) {
    return null;
  }

  return {
    module: {
      ...learningModule,
      state: step?.state ?? "locked",
      reasonAssigned:
        step?.reason ??
        "Modul fondasi ini tersedia sebagai referensi. Jalur aktif tetap mengikuti tiga fokus dari Digital Checkup.",
      prerequisite:
        step?.prerequisite ??
        "Selesaikan tiga fokus aktif terlebih dahulu agar modul ini dapat dibuka pada tahap berikutnya.",
      entitlement: step?.entitlement ?? "free",
    },
    step,
    activePlan: dashboard.activePlan,
    checkup: dashboard.checkup,
  };
}

export async function getLessonView(lessonId: string) {
  const repositories = await getRepositoriesForRequest();
  const [dashboard, lesson] = await Promise.all([
    getDashboardView(),
    repositories.learning.getLesson(lessonId),
  ]);

  if (!lesson) {
    return null;
  }

  const learningModule = await repositories.learning.getModuleById(lesson.moduleId);
  const step = dashboard.activePlan?.steps.find(
    (item) => item.moduleSlug === lesson.moduleSlug,
  );
  if (!learningModule || !step) {
    return null;
  }

  let blockedReason: string | null = null;
  let completionHref = lesson.nextLessonId
    ? `/app/belajar/${lesson.nextLessonId}`
    : `/app/kuis/${lesson.assessmentId}`;
  if (step.state === "locked" || step.state === "awaiting_review") {
    blockedReason =
      step.prerequisite ??
      "Lesson ini belum dapat dibuka karena masih menunggu langkah sebelumnya.";
  }

  if (lesson.isCorrective) {
    const latestResult = await repositories.assessments.getLatestResult(
      lesson.assessmentId,
    );
    if (!latestResult?.correctiveLessonIds.includes(lesson.id)) {
      blockedReason =
        "Materi penguatan ini hanya dibuka setelah cek pemahaman menunjukkan topik yang perlu diperkuat.";
    }
    const correctiveIndex = latestResult?.correctiveLessonIds.indexOf(lesson.id) ?? -1;
    const nextCorrectiveId = latestResult?.correctiveLessonIds[correctiveIndex + 1];
    completionHref = nextCorrectiveId
      ? `/app/belajar/${nextCorrectiveId}`
      : `/app/kuis/${lesson.assessmentId}?retry=targeted`;
  }

  const progress = await repositories.learning.getLessonProgress(lesson.id);
  return {
    lesson,
    module: learningModule,
    step,
    progress,
    completionHref,
    blockedReason,
  };
}

export async function getAssessmentView(assessmentId: string) {
  const repositories = await getRepositoriesForRequest();
  const [assessment, dashboard] = await Promise.all([
    repositories.assessments.getAssessment(assessmentId),
    getDashboardView(),
  ]);
  if (!assessment) {
    return null;
  }

  const learningModule = await repositories.learning.getModuleById(assessment.moduleId);
  const step = dashboard.activePlan?.steps.find(
    (item) => item.moduleSlug === assessment.moduleSlug,
  );
  if (!learningModule || !step) {
    return null;
  }

  const [completion, latestResult] = await Promise.all([
    repositories.learning.getModuleCompletion(learningModule.id),
    repositories.assessments.getLatestResult(assessment.id),
  ]);
  const correctiveProgress = latestResult
    ? await Promise.all(
        latestResult.correctiveLessonIds.map((lessonId) =>
          repositories.learning.getLessonProgress(lessonId),
        ),
      )
    : [];
  const correctionReady =
    Boolean(latestResult && !latestResult.passed) &&
    correctiveProgress.length > 0 &&
    correctiveProgress.every((progress) => progress?.status === "completed");
  const pendingCorrectiveLessonId = latestResult?.correctiveLessonIds.find(
    (_, index) => correctiveProgress[index]?.status !== "completed",
  );
  const blockedReason =
    step.state === "locked" || step.state === "awaiting_review"
      ? step.prerequisite ?? "Modul ini belum dapat dimulai."
      : completion && completion.lessonsCompleted < completion.lessonsTotal
        ? `Selesaikan ${completion.lessonsTotal - completion.lessonsCompleted} lesson lagi sebelum cek pemahaman.`
        : null;

  return {
    assessment,
    module: learningModule,
    step,
    completion,
    latestResult,
    correctionReady,
    pendingCorrectiveLessonId,
    blockedReason,
  };
}

export async function getTaskView(taskId: string) {
  const repositories = await getRepositoriesForRequest();
  const [task, dashboard] = await Promise.all([
    repositories.evidence.getTask(taskId),
    getDashboardView(),
  ]);
  if (!task) {
    return null;
  }

  const learningModule = await repositories.learning.getModuleById(task.moduleId);
  const step = dashboard.activePlan?.steps.find(
    (item) => item.moduleSlug === task.moduleSlug,
  );
  if (!learningModule || !step) {
    return null;
  }

  const assessmentId = `assessment-${task.moduleSlug}`;
  const [draft, assessmentResult] = await Promise.all([
    repositories.evidence.getDraft(task.id),
    repositories.assessments.getLatestResult(assessmentId),
  ]);
  const blockedReason =
    step.state === "locked" || step.state === "awaiting_review"
      ? step.prerequisite ?? "Modul ini belum dapat dimulai."
      : !assessmentResult?.passed
        ? "Kuasai cek pemahaman terlebih dahulu agar tugas ini dapat dikerjakan dengan mantap."
        : null;

  return {
    task,
    module: learningModule,
    step,
    draft,
    assessmentResult,
    blockedReason,
    business: dashboard.business,
  };
}

export async function getModuleResultView(moduleId: string) {
  const repositories = await getRepositoriesForRequest();
  const [learningModule, completion, dashboard] = await Promise.all([
    repositories.learning.getModuleById(moduleId),
    repositories.learning.getModuleCompletion(moduleId),
    getDashboardView(),
  ]);
  if (!learningModule || !completion) {
    return null;
  }

  const assessment = await repositories.assessments.getAssessment(
    `assessment-${learningModule.slug}`,
  );
  return {
    module: learningModule,
    completion,
    assessment,
    business: dashboard.business,
  };
}

export async function getAssetBankView() {
  const repositories = await getRepositoriesForRequest();
  const dashboard = await getDashboardView();
  const assets = await repositories.assets.listBusinessAssets(
    dashboard.business.id,
  );
  return { assets, business: dashboard.business, isOffline: dashboard.isOffline };
}

export async function getThreeFocusProgressView() {
  const repositories = await getRepositoriesForRequest();
  const dashboard = await getDashboardView();

  if (!dashboard.activePlan || !dashboard.checkup) {
    return { dashboard, progress: null };
  }

  return {
    dashboard,
    progress: await repositories.progress.getThreeFocusProgress(dashboard.user.id),
  };
}

export async function getFinalTestView() {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();

  if (!dashboard.activePlan || !progress) {
    return { dashboard, progress, finalTest: null, latestAttempt: null };
  }

  const finalTest = await repositories.finalTest.getFinalTest(dashboard.user.id);
  const latestAttempt = finalTest
    ? await repositories.finalTest.getLatestAttempt(finalTest.id)
    : null;

  return { dashboard, progress, finalTest, latestAttempt };
}

export async function getRecheckupView() {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();
  const comparison = progress
    ? await repositories.recheckup.getComparison(dashboard.business.id)
    : null;

  return {
    dashboard,
    progress,
    comparison,
    certificateId: `cert-${dashboard.business.slug}-basic`,
  };
}

export async function getCertificateView(certificateId: string) {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();
  const certificate = await repositories.certificates.getCertificate(certificateId);
  const earned = Boolean(
    certificate &&
      progress?.completedModules === 3 &&
      progress.finalTestPassed &&
      progress.recheckupCompleted,
  );

  return { dashboard, progress, certificate, earned };
}

export async function getRewardLandingPageView() {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();
  const [eligibility, claim, assets] =
    progress && dashboard.activePlan
      ? await Promise.all([
          repositories.rewards.getEligibility(dashboard.user.id),
          repositories.rewards.getClaim(`landing-page-${dashboard.business.id}`),
          repositories.assets.listBusinessAssets(dashboard.business.id),
        ])
      : [null, null, []];

  return { dashboard, progress, eligibility, claim, assets };
}

export async function getPremiumView() {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();
  const recommendations = progress
    ? await repositories.premium.listRecommendations(dashboard.user.id)
    : [];

  return { dashboard, progress, recommendations };
}

export async function getScenarioOptions() {
  const repositories = await getRepositoriesForRequest();
  return repositories.app.listScenarios();
}

export { SCENARIO_COOKIE };
