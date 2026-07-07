"use server";

import { z } from "zod";
import {
  getCurrentScenario,
  getRepositoriesForRequest,
} from "@/domain/services/app-service";
import {
  evaluateAssessment,
  targetedQuestionIds,
} from "@/features/assessment/evaluate";

const assessmentSubmissionSchema = z.object({
  assessmentId: z.string(),
  answers: z.record(z.string(), z.string()),
  targeted: z.boolean().default(false),
});

export async function submitAssessment(input: {
  assessmentId: string;
  answers: Record<string, string>;
  targeted: boolean;
}) {
  const parsed = assessmentSubmissionSchema.parse(input);
  const repositories = await getRepositoriesForRequest();
  const assessment = await repositories.assessments.getAssessment(
    parsed.assessmentId,
  );
  if (!assessment) {
    return { status: "error" as const, message: "Cek pemahaman tidak ditemukan." };
  }

  const latest = await repositories.assessments.getLatestResult(assessment.id);
  const scenario = await getCurrentScenario();
  const result = evaluateAssessment({
    assessment,
    selectedAnswers: parsed.answers,
    attemptNumber: (latest?.attemptNumber ?? 0) + 1,
    questionIds: parsed.targeted
      ? targetedQuestionIds(assessment, latest)
      : undefined,
    forceFailure: scenario === "quiz-failure" && !latest,
  });
  await repositories.assessments.saveResult(result);

  return { status: "saved" as const, result };
}
