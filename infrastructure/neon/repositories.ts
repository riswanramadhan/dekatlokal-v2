import "server-only";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import type {
  AppRepository,
  AssetRepository,
  AssessmentRepository,
  CertificateRepository,
  CheckupRepository,
  DashboardRepository,
  EvidenceRepository,
  FinalTestRepository,
  LearningRepository,
  PremiumRepository,
  ProgressRepository,
  RecheckupRepository,
  Repositories,
  RewardRepository,
} from "@/domain/repositories";

class NeonRepositoryNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `${method} is prepared for Neon but not implemented in P0.6.1. Keep DATA_SOURCE=mock for the frontend demo.`,
    );
    this.name = "NeonRepositoryNotImplementedError";
  }
}

function assertNeonConfiguration() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Cannot create Neon repositories because DATABASE_URL is empty. Keep DATA_SOURCE=mock until Neon is intentionally activated.",
    );
  }
}

function pending(method: string): never {
  throw new NeonRepositoryNotImplementedError(method);
}

export function createNeonRepositories(): Repositories {
  assertNeonConfiguration();
  const database = getDatabase();
  void database;

  const app: AppRepository = {
    async getAppView(userId) {
      void userId;
      return pending("AppRepository.getAppView");
    },
    async listScenarios() {
      return pending("AppRepository.listScenarios");
    },
  };

  const dashboard: DashboardRepository = {
    async getDashboard(userId) {
      void userId;
      return pending("DashboardRepository.getDashboard");
    },
  };

  const checkup: CheckupRepository = {
    async previewClaim(input) {
      void input;
      return pending("CheckupRepository.previewClaim");
    },
    async associateClaim(input) {
      void input;
      return pending("CheckupRepository.associateClaim");
    },
    async getLatest(businessId) {
      void businessId;
      return pending("CheckupRepository.getLatest");
    },
  };

  const learning: LearningRepository = {
    async getActivePlan(userId) {
      void userId;
      return pending("LearningRepository.getActivePlan");
    },
    async getPlan(planId) {
      void planId;
      return pending("LearningRepository.getPlan");
    },
    async listFoundationalModules() {
      return pending("LearningRepository.listFoundationalModules");
    },
    async getFoundationalModule(moduleSlug) {
      void moduleSlug;
      return pending("LearningRepository.getFoundationalModule");
    },
    async getModuleBySlug(moduleSlug) {
      void moduleSlug;
      return pending("LearningRepository.getModuleBySlug");
    },
    async getModuleById(moduleId) {
      void moduleId;
      return pending("LearningRepository.getModuleById");
    },
    async getLesson(lessonId) {
      void lessonId;
      return pending("LearningRepository.getLesson");
    },
    async getLessonProgress(lessonId) {
      void lessonId;
      return pending("LearningRepository.getLessonProgress");
    },
    async saveLessonProgress(progress) {
      void progress;
      return pending("LearningRepository.saveLessonProgress");
    },
    async getModuleCompletion(moduleId) {
      void moduleId;
      return pending("LearningRepository.getModuleCompletion");
    },
  };

  const assessments: AssessmentRepository = {
    async getAssessment(assessmentId) {
      void assessmentId;
      return pending("AssessmentRepository.getAssessment");
    },
    async getLatestResult(assessmentId) {
      void assessmentId;
      return pending("AssessmentRepository.getLatestResult");
    },
    async saveResult(result) {
      void result;
      return pending("AssessmentRepository.saveResult");
    },
  };

  const evidence: EvidenceRepository = {
    async getTask(taskId) {
      void taskId;
      return pending("EvidenceRepository.getTask");
    },
    async getDraft(taskId) {
      void taskId;
      return pending("EvidenceRepository.getDraft");
    },
    async saveDraft(draft) {
      void draft;
      return pending("EvidenceRepository.saveDraft");
    },
    async submit(draft) {
      void draft;
      return pending("EvidenceRepository.submit");
    },
  };

  const assets: AssetRepository = {
    async listBusinessAssets(businessId) {
      void businessId;
      return pending("AssetRepository.listBusinessAssets");
    },
  };

  const progress: ProgressRepository = {
    async getThreeFocusProgress(userId) {
      void userId;
      return pending("ProgressRepository.getThreeFocusProgress");
    },
  };

  const finalTest: FinalTestRepository = {
    async getFinalTest(userId) {
      void userId;
      return pending("FinalTestRepository.getFinalTest");
    },
    async getLatestAttempt(finalTestId) {
      void finalTestId;
      return pending("FinalTestRepository.getLatestAttempt");
    },
    async saveAttempt(attempt) {
      void attempt;
      return pending("FinalTestRepository.saveAttempt");
    },
  };

  const recheckup: RecheckupRepository = {
    async getComparison(businessId) {
      void businessId;
      return pending("RecheckupRepository.getComparison");
    },
    async saveComparison(comparison) {
      void comparison;
      return pending("RecheckupRepository.saveComparison");
    },
  };

  const certificates: CertificateRepository = {
    async getCertificate(certificateId) {
      void certificateId;
      return pending("CertificateRepository.getCertificate");
    },
  };

  const rewards: RewardRepository = {
    async getEligibility(userId) {
      void userId;
      return pending("RewardRepository.getEligibility");
    },
    async getClaim(rewardId) {
      void rewardId;
      return pending("RewardRepository.getClaim");
    },
    async saveClaim(input) {
      void input;
      return pending("RewardRepository.saveClaim");
    },
  };

  const premium: PremiumRepository = {
    async listRecommendations(userId) {
      void userId;
      return pending("PremiumRepository.listRecommendations");
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
