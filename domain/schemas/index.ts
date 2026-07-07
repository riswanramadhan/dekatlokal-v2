import { z } from "zod";

export const scenarioKeySchema = z.enum([
  "culinary-new-user",
  "existing-account",
  "fast-fashion",
  "returning-service",
  "expired-claim",
  "no-checkup",
  "large-text",
  "offline",
  "upload-failure",
  "quiz-failure",
  "reward-eligible",
]);

export const syncStateSchema = z.enum(["synced", "pending", "failed"]);
export const digitalComfortSchema = z.enum(["guided", "standard", "fast"]);
export const businessStageSchema = z.enum([
  "starting",
  "operating",
  "growing",
]);
export const moduleStateSchema = z.enum([
  "locked",
  "available",
  "active",
  "in_progress",
  "needs_retry",
  "awaiting_evidence",
  "awaiting_review",
  "completed",
]);
export const taskStatusSchema = z.enum([
  "not_started",
  "draft",
  "submitted",
  "needs_revision",
  "approved",
  "auto_approved",
]);

export const lessonStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);

export const lessonScreenTypeSchema = z.enum([
  "story",
  "reading",
  "video",
  "audio",
  "choice",
  "checklist",
  "template",
]);

export const evidenceTypeSchema = z.enum(["text", "link", "image", "checklist"]);

export const soundEventNameSchema = z.enum([
  "ui-click",
  "option-select",
  "answer-correct",
  "answer-incorrect-soft",
  "module-unlock",
  "lesson-complete",
  "reward-complete",
]);

export const soundPreferenceSchema = z.object({
  enabled: z.boolean(),
  hasInteracted: z.boolean(),
  volume: z.number().min(0).max(1).default(0.24),
});

export const assetRegistryEntrySchema = z.object({
  key: z.string(),
  src: z.string(),
  alt: z.string(),
  type: z.enum(["brand", "illustration", "sound"]),
  usage: z.string(),
  license: z.string(),
  attribution: z.string().optional(),
});

export const adaptiveNavStateSchema = z.object({
  collapsed: z.boolean(),
  lastScrollY: z.number().min(0),
  direction: z.enum(["up", "down", "none"]),
});

export const foundationalModuleLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  focus: z.string(),
  type: z.enum(["story", "reading", "image", "choice", "checklist", "template"]),
  estimatedMinutes: z.number().int().positive(),
});

export const postTestQuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
  correctOptionId: z.string(),
  correctExplanation: z.string(),
  incorrectExplanation: z.string(),
});

export const correctiveReviewSchema = z.object({
  topic: z.string(),
  title: z.string(),
  body: z.string(),
});

export const foundationalModuleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortTitle: z.string(),
  outcome: z.string(),
  summary: z.string(),
  icon: z.string(),
  theme: z.enum(["blue", "mint", "coral", "yellow", "sky", "violet"]),
  estimatedMinutes: z.number().int().positive(),
  lessons: z.array(foundationalModuleLessonSchema).length(4),
  practicalTask: z.object({
    title: z.string(),
    instruction: z.string(),
    assetType: z.string(),
    assetLabel: z.string(),
    futureUse: z.string(),
  }),
  postTestQuestions: z.array(postTestQuestionSchema).min(8).max(10),
  correctiveReviews: z.array(correctiveReviewSchema).min(1),
  badge: z.string(),
  legalNote: z.string().optional(),
});

export const moduleCatalogSchema = z.array(foundationalModuleSchema).length(8);

export const moduleAssignmentSchema = z.object({
  moduleSlug: z.string(),
  position: z.number().int().min(1).max(3),
  state: moduleStateSchema,
  required: z.boolean(),
  reason: z.string(),
  prerequisite: z.string().optional(),
});

export const moduleContentSchema = z.object({
  module: foundationalModuleSchema,
  assignment: moduleAssignmentSchema.optional(),
  previewOnly: z.boolean(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export const businessSchema = z.object({
  id: z.string(),
  ownerUserId: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  stage: businessStageSchema,
  city: z.string().optional(),
  logoUrl: z.string().optional(),
  profileCompleteness: z.number().min(0).max(100),
});

export const learningPreferenceSchema = z.object({
  userId: z.string(),
  dailyMinutes: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  digitalComfort: digitalComfortSchema,
  preferredFormats: z.array(z.enum(["video", "audio", "text", "mixed"])),
  preferredDaypart: z.enum(["morning", "afternoon", "evening", "flexible"]),
  fontScale: z.enum(["standard", "large"]),
  remindersEnabled: z.boolean(),
});

export const authModeSchema = z.enum(["signup", "login"]);

export const phoneAuthInputSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp minimal 8 digit.")
    .max(20, "Nomor WhatsApp terlalu panjang."),
  claimToken: z.string().optional(),
  mode: authModeSchema,
});

export const signupInputSchema = phoneAuthInputSchema.extend({
  ownerName: z.string().trim().min(2, "Nama pemilik wajib diisi."),
  businessName: z.string().trim().min(2, "Nama usaha wajib diisi."),
});

export const emailFallbackInputSchema = z.object({
  email: z.string().trim().email("Email belum valid."),
  claimToken: z.string().optional(),
});

export const otpInputSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kode harus 6 digit angka."),
});

export const mockAuthSessionSchema = z.object({
  mode: authModeSchema,
  phone: z.string().optional(),
  email: z.string().email().optional(),
  ownerName: z.string().optional(),
  businessName: z.string().optional(),
  claimToken: z.string().optional(),
  verified: z.boolean(),
});

export const businessConfirmationInputSchema = z.object({
  name: z.string().trim().min(2, "Nama usaha wajib diisi."),
  category: z.string().trim().min(2, "Kategori usaha wajib diisi."),
  city: z.string().trim().min(2, "Kota wajib diisi."),
  whatsapp: z.string().trim().min(8, "Nomor WhatsApp wajib diisi."),
  role: z.enum(["owner", "family", "staff"]),
});

export const learningPreferenceInputSchema = z.object({
  digitalComfort: digitalComfortSchema,
  dailyMinutes: z.coerce.number().pipe(z.union([z.literal(5), z.literal(10), z.literal(15)])),
  preferredFormats: z
    .array(z.enum(["video", "audio", "text", "mixed"]))
    .min(1, "Pilih minimal satu format belajar."),
  fontScale: z.enum(["standard", "large"]),
});

export const rhythmInputSchema = z.object({
  preferredDaypart: z.enum(["morning", "afternoon", "evening", "flexible"]),
  remindersEnabled: z.boolean(),
});

export const onboardingDraftSchema = z.object({
  business: businessConfirmationInputSchema.optional(),
  learningPreference: learningPreferenceInputSchema.optional(),
  rhythm: rhythmInputSchema.optional(),
  completed: z.boolean().default(false),
});

export const onboardingStepSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(5)
  .default(1);

export const pendingCheckupClaimSchema = z.object({
  claimToken: z.string(),
  resultId: z.string(),
  source: z.literal("main_site"),
  expiresAt: z.string(),
  businessHint: z.string().optional(),
});

export const claimFocusModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  shortOutcome: z.string(),
  estimatedMinutes: z.number().int().positive(),
  reason: z.string(),
  assetType: z.string(),
});

export const claimDistractorModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  shortOutcome: z.string(),
});

export const checkupClaimPreviewSchema = z.object({
  claimToken: z.string().min(1),
  resultId: z.string(),
  businessHint: z
    .object({
      name: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
  recommendedModules: z.array(claimFocusModuleSchema).length(3),
  distractorModules: z.array(claimDistractorModuleSchema).length(3),
  expiresAt: z.string(),
  status: z.literal("valid"),
});

export const preAuthStageSchema = z.enum([
  "result_ready",
  "recall",
  "path_preview",
  "signup",
]);

export const preAuthJourneySchema = z.object({
  claimToken: z.string().min(1),
  stage: preAuthStageSchema,
  selectedModuleIds: z.array(z.string()).max(3),
  attemptCount: z.number().int().min(0),
  completedRecall: z.boolean(),
  helpRevealed: z.boolean().default(false),
});

export const recallEvaluationSchema = z.object({
  selectedModuleIds: z.array(z.string()).length(3),
  matchingCount: z.number().int().min(0).max(3),
  missedModuleIds: z.array(z.string()).max(3),
  isCorrect: z.boolean(),
  contextualHint: z.string().optional(),
  canRevealHelp: z.boolean(),
});

export const claimModuleAssignmentSchema = z.object({
  moduleId: z.string(),
  position: z.number().int().min(1).max(3),
  state: moduleStateSchema,
});

export const claimAssociationSchema = z.object({
  claimToken: z.string().min(1),
  userId: z.string(),
  businessId: z.string(),
  resultId: z.string(),
  planId: z.string(),
  moduleAssignments: z.array(claimModuleAssignmentSchema).length(3),
  associatedAt: z.string(),
});

export const checkupPillarScoreSchema = z.object({
  pillarKey: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100),
  band: z.enum(["high_priority", "medium_priority", "reinforcement", "strong"]),
  explanation: z.string(),
});

export const checkupResultSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  totalScore: z.number().min(0).max(100),
  level: z.string(),
  completedAt: z.string(),
  source: z.enum(["main_site", "repeat_mock"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  priorities: z.array(z.string()),
  pillarScores: z.array(checkupPillarScoreSchema),
});

export const nextBestActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  rationale: z.string(),
  estimatedMinutes: z.number().positive(),
  href: z.string(),
  ctaLabel: z.string(),
  progressLabel: z.string(),
  scoring: z
    .object({
      scoreSeverity: z.number().min(0).max(100),
      dependency: z.number().min(0).max(100),
      expectedImpact: z.number().min(0).max(100),
      quickWin: z.number().min(0).max(100),
      readiness: z.number().min(0).max(100),
      learningPreference: z.number().min(0).max(100),
      total: z.number().min(0),
    })
    .optional(),
});

export const planStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  moduleSlug: z.string(),
  position: z.number().int().positive(),
  state: moduleStateSchema,
  required: z.boolean(),
  estimatedMinutes: z.number().positive(),
  reason: z.string(),
  prerequisite: z.string().optional(),
  outcome: z.string().optional(),
  assetCreated: z.string().optional(),
  entitlement: z.enum(["free", "premium_preview"]).default("free"),
});

export const lessonSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["story", "reading", "video", "audio", "choice", "checklist", "template"]),
  estimatedMinutes: z.number().positive(),
});

export const lessonChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  isRecommended: z.boolean(),
  feedback: z.string(),
});

export const lessonTemplateFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  placeholder: z.string(),
  example: z.string(),
});

export const lessonScreenSchema = z.object({
  id: z.string(),
  type: lessonScreenTypeSchema,
  eyebrow: z.string(),
  title: z.string(),
  body: z.string(),
  businessExample: z.string().optional(),
  transcript: z.string().optional(),
  mediaDuration: z.string().optional(),
  choices: z.array(lessonChoiceSchema).optional(),
  checklistItems: z.array(z.string()).optional(),
  templateFields: z.array(lessonTemplateFieldSchema).optional(),
});

export const lessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  moduleSlug: z.string(),
  title: z.string(),
  outcome: z.string(),
  estimatedMinutes: z.number().positive(),
  screens: z.array(lessonScreenSchema).min(1),
  nextLessonId: z.string().optional(),
  assessmentId: z.string(),
  isCorrective: z.boolean().default(false),
});

export const lessonProgressSchema = z.object({
  lessonId: z.string(),
  moduleId: z.string(),
  currentScreen: z.number().int().min(0),
  completedScreenIds: z.array(z.string()),
  responses: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .default({}),
  status: lessonStatusSchema,
  syncState: syncStateSchema,
  updatedAt: z.string(),
});

export const assessmentOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const assessmentQuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  prompt: z.string(),
  options: z.array(assessmentOptionSchema).min(2),
  correctOptionId: z.string(),
  correctExplanation: z.string(),
  incorrectExplanation: z.string(),
  correctiveLessonId: z.string(),
});

export const assessmentSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  moduleSlug: z.string(),
  title: z.string(),
  description: z.string(),
  passScore: z.number().min(0).max(100),
  questions: z.array(assessmentQuestionSchema).min(1),
  taskId: z.string(),
});

export const assessmentAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  correct: z.boolean(),
});

export const assessmentResultSchema = z.object({
  assessmentId: z.string(),
  moduleId: z.string(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  attemptNumber: z.number().int().positive(),
  answers: z.array(assessmentAnswerSchema),
  strongTopics: z.array(z.string()),
  weakTopics: z.array(z.string()),
  correctiveLessonIds: z.array(z.string()),
  submittedAt: z.string(),
});

export const finalTestQuestionSchema = z.object({
  id: z.string(),
  focusModuleId: z.string(),
  focusModuleSlug: z.string(),
  focusTitle: z.string(),
  scenario: z.string(),
  prompt: z.string(),
  options: z.array(assessmentOptionSchema).min(2),
  correctOptionId: z.string(),
  correctExplanation: z.string(),
  incorrectExplanation: z.string(),
  reviewHint: z.string(),
});

export const finalTestSchema = z.object({
  id: z.string(),
  planId: z.string(),
  title: z.string(),
  description: z.string(),
  passScore: z.number().min(0).max(100),
  questions: z.array(finalTestQuestionSchema).length(3),
});

export const finalTestAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  correct: z.boolean(),
  focusModuleId: z.string(),
});

export const finalTestAttemptSchema = z.object({
  finalTestId: z.string(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  attemptNumber: z.number().int().positive(),
  answers: z.array(finalTestAnswerSchema),
  strongFocuses: z.array(z.string()),
  weakFocuses: z.array(z.string()),
  reviewItems: z.array(
    z.object({
      focusTitle: z.string(),
      moduleSlug: z.string(),
      reason: z.string(),
    }),
  ),
  submittedAt: z.string(),
});

export const businessTaskSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  moduleSlug: z.string(),
  title: z.string(),
  instruction: z.string(),
  businessExample: z.string(),
  template: z.string(),
  evidenceTypes: z.array(evidenceTypeSchema).min(1),
  checklistOptions: z.array(z.string()),
  createsAssetType: z.string(),
  createsAssetLabel: z.string(),
  futureUse: z.string(),
  required: z.boolean(),
});

export const evidenceDraftSchema = z.object({
  taskId: z.string(),
  text: z.string().max(1200).default(""),
  link: z.union([z.literal(""), z.string().url()]).default(""),
  imageName: z.string().max(160).default(""),
  checklist: z.array(z.string()).default([]),
  status: taskStatusSchema,
  syncState: syncStateSchema,
  reviewerFeedback: z.string().optional(),
  updatedAt: z.string(),
});

export const moduleCompletionSchema = z.object({
  moduleId: z.string(),
  moduleSlug: z.string(),
  lessonsCompleted: z.number().int().min(0),
  lessonsTotal: z.number().int().positive(),
  assessmentPassed: z.boolean(),
  taskStatus: taskStatusSchema,
  assetId: z.string().optional(),
  completed: z.boolean(),
  missingRequirements: z.array(z.string()),
});

export const learningModuleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  outcome: z.string(),
  reasonAssigned: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().positive(),
  state: moduleStateSchema,
  lessons: z.array(lessonSummarySchema).min(1),
  requiredTask: z.object({
    title: z.string(),
    description: z.string(),
  }),
  assetCreated: z.string(),
  prerequisite: z.string().optional(),
  entitlement: z.enum(["free", "premium_preview"]),
  completionRule: z.string(),
});

export const interventionPlanSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  headline: z.string(),
  summary: z.string(),
  rationale: z.string(),
  estimatedMinutes: z.number().positive(),
  steps: z.array(planStepSchema),
  nextBestAction: nextBestActionSchema,
  rewardPreview: z
    .object({
      title: z.string(),
      description: z.string(),
      isEligible: z.boolean(),
    })
    .optional(),
});

export const businessAssetSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  assetType: z.string(),
  label: z.string(),
  value: z.string(),
  status: z.enum(["draft", "ready", "needs_review"]),
  source: z.string(),
  sourceModuleId: z.string().optional(),
  futureUse: z.string().optional(),
  updatedAt: z.string(),
});

export const recheckupComparisonSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  originalResult: checkupResultSchema,
  latestResult: checkupResultSchema,
  completedAt: z.string(),
  changedHighlights: z.array(z.string()),
  contributingActions: z.array(
    z.object({
      label: z.string(),
      source: z.string(),
    }),
  ),
  updatedRecommendationPreview: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      expectedValue: z.string(),
      prerequisite: z.string(),
    }),
  ),
});

export const certificateSchema = z.object({
  id: z.string(),
  learnerName: z.string(),
  businessName: z.string(),
  pathTitle: z.string(),
  moduleTitles: z.array(z.string()).length(3),
  issueDate: z.string(),
  mockCertificateId: z.string(),
  disclaimer: z.string(),
  verificationPlaceholder: z.string(),
});

export const rewardTrackingStatusSchema = z.enum([
  "waiting_for_data",
  "data_complete",
  "in_progress",
  "owner_review",
  "live",
]);

export const rewardChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  complete: z.boolean(),
  detail: z.string(),
  actionHref: z.string().optional(),
});

export const rewardEligibilitySchema = z.object({
  rewardId: z.string(),
  title: z.string(),
  eligible: z.boolean(),
  checklist: z.array(rewardChecklistItemSchema),
  missingRequirements: z.array(z.string()),
  requiredAssetLabels: z.array(z.string()),
  businessProfileCompleteness: z.number().min(0).max(100),
  termsAccepted: z.boolean(),
  programCapacity: z.enum(["available", "waitlist", "full"]),
});

export const rewardClaimSchema = z.object({
  id: z.string(),
  rewardId: z.string(),
  businessId: z.string(),
  selectedStyle: z.enum(["bersih-praktis", "hangat-lokal", "visual-produk"]),
  status: rewardTrackingStatusSchema,
  tracking: z.array(
    z.object({
      status: rewardTrackingStatusSchema,
      label: z.string(),
      complete: z.boolean(),
      current: z.boolean(),
    }),
  ),
  submittedAt: z.string(),
  updatedAt: z.string(),
});

export const premiumRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  outcome: z.string(),
  reason: z.string(),
  prerequisite: z.string(),
  expectedBusinessValue: z.string(),
  status: z.enum(["locked", "available"]),
});

export const threeFocusProgressSchema = z.object({
  completedModules: z.number().int().min(0).max(3),
  totalModules: z.literal(3),
  currentFocus: planStepSchema.optional(),
  completedFocuses: z.array(planStepSchema),
  moduleCompletions: z.array(moduleCompletionSchema).length(3),
  postTestMastery: z.array(
    z.object({
      moduleTitle: z.string(),
      passed: z.boolean(),
      detail: z.string(),
    }),
  ),
  actionTasks: z.array(
    z.object({
      moduleTitle: z.string(),
      status: taskStatusSchema,
      assetLabel: z.string(),
      complete: z.boolean(),
    }),
  ),
  assets: z.array(businessAssetSchema),
  finalTestReady: z.boolean(),
  finalTestPassed: z.boolean(),
  recheckupReady: z.boolean(),
  recheckupCompleted: z.boolean(),
  rewardReady: z.boolean(),
  timeline: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(["done", "current", "locked"]),
      timestamp: z.string().optional(),
    }),
  ),
  points: z.number().min(0),
  activeDays: z.number().min(0),
  insight: z.string(),
  syncState: syncStateSchema,
});

export const progressSummarySchema = z.object({
  learningPercent: z.number().min(0).max(100),
  actionPercent: z.number().min(0).max(100),
  points: z.number().min(0),
  activeDays: z.number().min(0),
  syncState: syncStateSchema,
  insight: z.string(),
});

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  href: z.string().optional(),
  read: z.boolean(),
});

export const appViewSchema = z.object({
  scenario: scenarioKeySchema,
  user: userSchema,
  business: businessSchema,
  learningPreference: learningPreferenceSchema,
  notifications: z.array(notificationSchema),
  isOffline: z.boolean(),
});

export const dashboardViewSchema = appViewSchema.extend({
  checkup: checkupResultSchema.nullable(),
  activePlan: interventionPlanSchema.nullable(),
  progress: progressSummarySchema,
  assets: z.array(businessAssetSchema),
});

export type ScenarioKey = z.infer<typeof scenarioKeySchema>;
export type SyncState = z.infer<typeof syncStateSchema>;
export type DigitalComfort = z.infer<typeof digitalComfortSchema>;
export type BusinessStage = z.infer<typeof businessStageSchema>;
export type ModuleState = z.infer<typeof moduleStateSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type LessonStatus = z.infer<typeof lessonStatusSchema>;
export type LessonScreenType = z.infer<typeof lessonScreenTypeSchema>;
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export type SoundEventName = z.infer<typeof soundEventNameSchema>;
export type SoundPreference = z.infer<typeof soundPreferenceSchema>;
export type AssetRegistryEntry = z.infer<typeof assetRegistryEntrySchema>;
export type AdaptiveNavState = z.infer<typeof adaptiveNavStateSchema>;
export type ModuleLesson = z.infer<typeof foundationalModuleLessonSchema>;
export type PostTestQuestion = z.infer<typeof postTestQuestionSchema>;
export type CorrectiveReview = z.infer<typeof correctiveReviewSchema>;
export type FoundationalModule = z.infer<typeof foundationalModuleSchema>;
export type ModuleCatalog = z.infer<typeof moduleCatalogSchema>;
export type ModuleAssignment = z.infer<typeof moduleAssignmentSchema>;
export type ModuleContent = z.infer<typeof moduleContentSchema>;
export type User = z.infer<typeof userSchema>;
export type Business = z.infer<typeof businessSchema>;
export type LearningPreference = z.infer<typeof learningPreferenceSchema>;
export type PhoneAuthInput = z.infer<typeof phoneAuthInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type EmailFallbackInput = z.infer<typeof emailFallbackInputSchema>;
export type OtpInput = z.infer<typeof otpInputSchema>;
export type MockAuthSession = z.infer<typeof mockAuthSessionSchema>;
export type BusinessConfirmationInput = z.infer<typeof businessConfirmationInputSchema>;
export type LearningPreferenceInput = z.infer<typeof learningPreferenceInputSchema>;
export type RhythmInput = z.infer<typeof rhythmInputSchema>;
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;
export type PendingCheckupClaim = z.infer<typeof pendingCheckupClaimSchema>;
export type ClaimFocusModule = z.infer<typeof claimFocusModuleSchema>;
export type ClaimDistractorModule = z.infer<typeof claimDistractorModuleSchema>;
export type CheckupClaimPreview = z.infer<typeof checkupClaimPreviewSchema>;
export type PreAuthStage = z.infer<typeof preAuthStageSchema>;
export type PreAuthJourney = z.infer<typeof preAuthJourneySchema>;
export type RecallEvaluation = z.infer<typeof recallEvaluationSchema>;
export type ClaimModuleAssignment = z.infer<typeof claimModuleAssignmentSchema>;
export type ClaimAssociation = z.infer<typeof claimAssociationSchema>;
export type CheckupPillarScore = z.infer<typeof checkupPillarScoreSchema>;
export type CheckupResult = z.infer<typeof checkupResultSchema>;
export type NextBestAction = z.infer<typeof nextBestActionSchema>;
export type PlanStep = z.infer<typeof planStepSchema>;
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
export type LessonChoice = z.infer<typeof lessonChoiceSchema>;
export type LessonScreen = z.infer<typeof lessonScreenSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonProgress = z.infer<typeof lessonProgressSchema>;
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type AssessmentAnswer = z.infer<typeof assessmentAnswerSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type FinalTestQuestion = z.infer<typeof finalTestQuestionSchema>;
export type FinalTest = z.infer<typeof finalTestSchema>;
export type FinalTestAnswer = z.infer<typeof finalTestAnswerSchema>;
export type FinalTestAttempt = z.infer<typeof finalTestAttemptSchema>;
export type BusinessTask = z.infer<typeof businessTaskSchema>;
export type EvidenceDraft = z.infer<typeof evidenceDraftSchema>;
export type ModuleCompletion = z.infer<typeof moduleCompletionSchema>;
export type LearningModule = z.infer<typeof learningModuleSchema>;
export type InterventionPlan = z.infer<typeof interventionPlanSchema>;
export type BusinessAsset = z.infer<typeof businessAssetSchema>;
export type RecheckupComparison = z.infer<typeof recheckupComparisonSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type RewardTrackingStatus = z.infer<typeof rewardTrackingStatusSchema>;
export type RewardChecklistItem = z.infer<typeof rewardChecklistItemSchema>;
export type RewardEligibility = z.infer<typeof rewardEligibilitySchema>;
export type RewardClaim = z.infer<typeof rewardClaimSchema>;
export type PremiumRecommendation = z.infer<typeof premiumRecommendationSchema>;
export type ThreeFocusProgress = z.infer<typeof threeFocusProgressSchema>;
export type ProgressSummary = z.infer<typeof progressSummarySchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type AppView = z.infer<typeof appViewSchema>;
export type DashboardView = z.infer<typeof dashboardViewSchema>;
