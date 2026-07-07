"use server";

import { z } from "zod";
import { getRepositoriesForRequest } from "@/domain/services/app-service";
import {
  evaluateFinalTest,
  targetedFinalQuestionIds,
} from "@/features/final-test/evaluate";

const finalTestSubmissionSchema = z.object({
  finalTestId: z.string(),
  answers: z.record(z.string(), z.string()),
  targeted: z.boolean().default(false),
});

export async function submitFinalTest(input: {
  finalTestId: string;
  answers: Record<string, string>;
  targeted: boolean;
}) {
  const parsed = finalTestSubmissionSchema.parse(input);
  const repositories = await getRepositoriesForRequest();
  const finalTest = await repositories.finalTest.getFinalTest("demo-user");
  if (!finalTest || finalTest.id !== parsed.finalTestId) {
    return { status: "error" as const, message: "Ujian akhir tidak ditemukan." };
  }

  const latest = await repositories.finalTest.getLatestAttempt(finalTest.id);
  const result = evaluateFinalTest({
    finalTest,
    selectedAnswers: parsed.answers,
    attemptNumber: (latest?.attemptNumber ?? 0) + 1,
    questionIds: parsed.targeted
      ? targetedFinalQuestionIds(finalTest, latest)
      : undefined,
  });
  await repositories.finalTest.saveAttempt(result);

  return { status: "saved" as const, result };
}
