import { describe, expect, it } from "vitest";
import { evaluateAssessment, targetedQuestionIds } from "@/features/assessment/evaluate";
import { createAssetFromTask, evaluateModuleCompletion } from "@/features/evidence/completion";
import { advanceLessonProgress, createInitialLessonProgress } from "@/features/lesson/progress";
import { createLearningContent } from "@/infrastructure/mock/modules";
import { mockScenarios } from "@/infrastructure/mock/scenarios";
import { evidenceDraftSchema } from "@/domain/schemas";

const plan = mockScenarios["culinary-new-user"].activePlan!;
const content = createLearningContent(plan.steps);
const learningModule = content.modules.find((item) => item.slug === "digitalisasi-umkm")!;
const lesson = content.lessons.find((item) => item.id === "digitalisasi-umkm-lesson-1")!;
const assessment = content.assessments.find((item) => item.id === "assessment-digitalisasi-umkm")!;
const task = content.tasks.find((item) => item.id === "task-digitalisasi-umkm")!;

describe("P0.4 learning lifecycle", () => {
  it("resumes from the next persisted lesson screen", () => {
    const initial = createInitialLessonProgress(lesson);
    const saved = advanceLessonProgress({
      lesson,
      previous: initial,
      screenIndex: 0,
    });

    expect(saved.status).toBe("in_progress");
    expect(saved.currentScreen).toBe(1);
    expect(saved.completedScreenIds).toContain(lesson.screens[0].id);
  });

  it("turns failure into targeted correction and a passing retry", () => {
    const firstAttempt = evaluateAssessment({
      assessment,
      selectedAnswers: Object.fromEntries(
        assessment.questions.map((question, index) => [
          question.id,
          index < 2 ? "wrong" : question.correctOptionId,
        ]),
      ),
      attemptNumber: 1,
    });
    expect(firstAttempt.passed).toBe(false);
    expect(firstAttempt.weakTopics).toEqual([
      assessment.questions[0].topic,
      assessment.questions[1].topic,
    ]);

    const retryIds = targetedQuestionIds(assessment, firstAttempt);
    const retry = evaluateAssessment({
      assessment,
      selectedAnswers: {
        [assessment.questions[0].id]: assessment.questions[0].correctOptionId,
        [assessment.questions[1].id]: assessment.questions[1].correctOptionId,
      },
      attemptNumber: 2,
      questionIds: retryIds,
    });
    expect(retry.passed).toBe(true);
    expect(retry.score).toBe(100);
  });

  it("does not complete a required module from lessons alone", () => {
    const lessonProgress = learningModule.lessons.map((item) => {
      const detail = content.lessons.find((candidate) => candidate.id === item.id)!;
      return {
        ...createInitialLessonProgress(detail),
        status: "completed" as const,
        completedScreenIds: detail.screens.map((screen) => screen.id),
      };
    });

    const completion = evaluateModuleCompletion({
      module: learningModule,
      lessonProgress,
      assessmentResult: null,
      taskDraft: null,
    });
    expect(completion.completed).toBe(false);
    expect(completion.missingRequirements).toEqual([
      "Kuasai cek pemahaman",
      "Kirim dan setujui tugas usaha",
    ]);
  });

  it("creates a structured asset only from approved business evidence", () => {
    const draft = evidenceDraftSchema.parse({
      taskId: task.id,
      text: "Warung Rina menyediakan menu rumahan dan cara pesan yang jelas.",
      link: "",
      imageName: "katalog.jpg",
      checklist: task.checklistOptions,
      status: "auto_approved",
      syncState: "synced",
      updatedAt: "2026-07-06T08:00:00.000Z",
    });
    const asset = createAssetFromTask({
      task,
      draft,
      businessId: "business-warung-rina",
      moduleTitle: learningModule.title,
    });

    expect(asset.label).toBe("Digital Profile Checklist");
    expect(asset.sourceModuleId).toBe(learningModule.id);
    expect(asset.futureUse).toContain("landing page");
  });
});
