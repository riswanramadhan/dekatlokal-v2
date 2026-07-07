import type {
  AppView,
  Assessment,
  AssessmentResult,
  BusinessAsset,
  BusinessTask,
  Certificate,
  CheckupClaimPreview,
  CheckupResult,
  ClaimAssociation,
  DashboardView,
  EvidenceDraft,
  FinalTest,
  FinalTestAttempt,
  FoundationalModule,
  InterventionPlan,
  Lesson,
  LessonProgress,
  LearningModule,
  ModuleCompletion,
  PremiumRecommendation,
  RecheckupComparison,
  RewardClaim,
  RewardEligibility,
  ScenarioKey,
  ThreeFocusProgress,
} from "@/domain/entities";

export type ClaimCheckupInput = {
  token: string;
};

export type ClaimFailureStatus =
  | "missing"
  | "invalid"
  | "expired"
  | "already_claimed"
  | "offline"
  | "network_error";

export type ClaimPreviewResult =
  | {
      status: "valid";
      preview: CheckupClaimPreview;
    }
  | {
      status: ClaimFailureStatus;
      message: string;
    };

export type AssociateClaimInput = {
  token: string;
  userId: string;
};

export type ClaimAssociationResult =
  | { status: "success"; association: ClaimAssociation }
  | { status: ClaimFailureStatus; message: string };

export interface AppRepository {
  getAppView(userId: string): Promise<AppView>;
  listScenarios(): Promise<ScenarioKey[]>;
}

export interface DashboardRepository {
  getDashboard(userId: string): Promise<DashboardView>;
}

export interface CheckupRepository {
  previewClaim(input: ClaimCheckupInput): Promise<ClaimPreviewResult>;
  associateClaim(input: AssociateClaimInput): Promise<ClaimAssociationResult>;
  getLatest(businessId: string): Promise<CheckupResult | null>;
}

export interface LearningRepository {
  getActivePlan(userId: string): Promise<InterventionPlan | null>;
  getPlan(planId: string): Promise<InterventionPlan | null>;
  listFoundationalModules(): Promise<FoundationalModule[]>;
  getFoundationalModule(moduleSlug: string): Promise<FoundationalModule | null>;
  getModuleBySlug(moduleSlug: string): Promise<LearningModule | null>;
  getModuleById(moduleId: string): Promise<LearningModule | null>;
  getLesson(lessonId: string): Promise<Lesson | null>;
  getLessonProgress(lessonId: string): Promise<LessonProgress | null>;
  saveLessonProgress(progress: LessonProgress): Promise<LessonProgress>;
  getModuleCompletion(moduleId: string): Promise<ModuleCompletion | null>;
}

export interface AssessmentRepository {
  getAssessment(assessmentId: string): Promise<Assessment | null>;
  getLatestResult(assessmentId: string): Promise<AssessmentResult | null>;
  saveResult(result: AssessmentResult): Promise<AssessmentResult>;
}

export interface EvidenceRepository {
  getTask(taskId: string): Promise<BusinessTask | null>;
  getDraft(taskId: string): Promise<EvidenceDraft | null>;
  saveDraft(draft: EvidenceDraft): Promise<EvidenceDraft>;
  submit(draft: EvidenceDraft): Promise<EvidenceDraft>;
}

export interface AssetRepository {
  listBusinessAssets(businessId: string): Promise<BusinessAsset[]>;
}

export interface ProgressRepository {
  getThreeFocusProgress(userId: string): Promise<ThreeFocusProgress>;
}

export interface FinalTestRepository {
  getFinalTest(userId: string): Promise<FinalTest | null>;
  getLatestAttempt(finalTestId: string): Promise<FinalTestAttempt | null>;
  saveAttempt(attempt: FinalTestAttempt): Promise<FinalTestAttempt>;
}

export interface RecheckupRepository {
  getComparison(businessId: string): Promise<RecheckupComparison | null>;
  saveComparison(comparison: RecheckupComparison): Promise<RecheckupComparison>;
}

export interface CertificateRepository {
  getCertificate(certificateId: string): Promise<Certificate | null>;
}

export type RewardClaimInput = {
  rewardId: string;
  businessId: string;
  selectedStyle: RewardClaim["selectedStyle"];
};

export interface RewardRepository {
  getEligibility(userId: string): Promise<RewardEligibility>;
  getClaim(rewardId: string): Promise<RewardClaim | null>;
  saveClaim(input: RewardClaimInput): Promise<RewardClaim>;
}

export interface PremiumRepository {
  listRecommendations(userId: string): Promise<PremiumRecommendation[]>;
}

export type Repositories = {
  app: AppRepository;
  dashboard: DashboardRepository;
  checkup: CheckupRepository;
  learning: LearningRepository;
  assessments: AssessmentRepository;
  evidence: EvidenceRepository;
  assets: AssetRepository;
  progress: ProgressRepository;
  finalTest: FinalTestRepository;
  recheckup: RecheckupRepository;
  certificates: CertificateRepository;
  rewards: RewardRepository;
  premium: PremiumRepository;
};
