import type {
  AssessmentResult,
  BusinessAsset,
  BusinessTask,
  EvidenceDraft,
  LearningModule,
  LessonProgress,
  ModuleCompletion,
} from "@/domain/entities";
import { businessAssetSchema, moduleCompletionSchema } from "@/domain/schemas";

const approvedTaskStates = new Set(["approved", "auto_approved"]);

export function evaluateModuleCompletion({
  module,
  lessonProgress,
  assessmentResult,
  taskDraft,
  assetId,
}: {
  module: LearningModule;
  lessonProgress: LessonProgress[];
  assessmentResult: AssessmentResult | null;
  taskDraft: EvidenceDraft | null;
  assetId?: string;
}): ModuleCompletion {
  const completedLessonIds = new Set(
    lessonProgress
      .filter((progress) => progress.status === "completed")
      .map((progress) => progress.lessonId),
  );
  const lessonsCompleted = module.lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id),
  ).length;
  const assessmentPassed = assessmentResult?.passed ?? false;
  const taskStatus = taskDraft?.status ?? "not_started";
  const taskApproved = approvedTaskStates.has(taskStatus);
  const missingRequirements: string[] = [];

  if (lessonsCompleted < module.lessons.length) {
    missingRequirements.push("Selesaikan semua lesson");
  }
  if (!assessmentPassed) {
    missingRequirements.push("Kuasai cek pemahaman");
  }
  if (!taskApproved) {
    missingRequirements.push("Kirim dan setujui tugas usaha");
  }

  return moduleCompletionSchema.parse({
    moduleId: module.id,
    moduleSlug: module.slug,
    lessonsCompleted,
    lessonsTotal: module.lessons.length,
    assessmentPassed,
    taskStatus,
    assetId,
    completed: missingRequirements.length === 0,
    missingRequirements,
  });
}

export function createAssetFromTask({
  task,
  draft,
  businessId,
  moduleTitle,
}: {
  task: BusinessTask;
  draft: EvidenceDraft;
  businessId: string;
  moduleTitle: string;
}): BusinessAsset {
  const value =
    draft.text ||
    draft.link ||
    draft.imageName ||
    draft.checklist.join(", ") ||
    task.template;

  return businessAssetSchema.parse({
    id: `asset-${task.id}`,
    businessId,
    assetType: task.createsAssetType,
    label: task.createsAssetLabel,
    value,
    status: "ready",
    source: moduleTitle,
    sourceModuleId: task.moduleId,
    futureUse: task.futureUse,
    updatedAt: new Date().toISOString(),
  });
}
