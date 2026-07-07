import type {
  FinalTest,
  FinalTestAnswer,
  FinalTestAttempt,
  InterventionPlan,
} from "@/domain/entities";
import { finalTestAttemptSchema, finalTestSchema } from "@/domain/schemas";

export function createFinalTest(plan: InterventionPlan): FinalTest {
  if (plan.steps.length !== 3) {
    throw new Error("Final test requires exactly three focus modules.");
  }

  return finalTestSchema.parse({
    id: `final-test-${plan.id}`,
    planId: plan.id,
    title: "Ujian Akhir Jalur Tiga Fokus",
    description:
      "Tiga skenario singkat ini hanya menguji fokus yang diberikan dari Digital Checkup.",
    passScore: 80,
    questions: plan.steps.map((step, index) => ({
      id: `final-${step.moduleSlug}`,
      focusModuleId: `module-${step.moduleSlug}`,
      focusModuleSlug: step.moduleSlug,
      focusTitle: step.title,
      scenario: `Skenario ${index + 1}: pelanggan baru ingin memahami ${step.title.toLowerCase()} sebelum memutuskan.`,
      prompt: `Apa keputusan terbaik untuk memakai hasil dari fokus "${step.title}" pada usaha?`,
      options: [
        {
          id: "business-first",
          label: `Gunakan ${step.assetCreated ?? "Aset Usaha"} untuk menjawab kebutuhan pelanggan secara jelas`,
        },
        {
          id: "generic-copy",
          label: "Gunakan kalimat promosi umum agar terlihat ramai",
        },
        {
          id: "delay-action",
          label: "Tunda penerapan sampai semua kanal usaha sudah sempurna",
        },
      ],
      correctOptionId: "business-first",
      correctExplanation: `${step.assetCreated ?? "Aset Usaha"} membantu ${step.outcome ?? step.summary}`,
      incorrectExplanation:
        "Belum tepat. Ujian akhir menilai keputusan praktis yang memakai aset dari tiga fokus, bukan promosi umum atau penundaan.",
      reviewHint: `Ulangi inti modul ${step.title}: ${step.reason}`,
    })),
  });
}

export function evaluateFinalTest(input: {
  finalTest: FinalTest;
  selectedAnswers: Record<string, string>;
  attemptNumber: number;
  questionIds?: string[];
}): FinalTestAttempt {
  const includedQuestions = input.questionIds?.length
    ? input.finalTest.questions.filter((question) =>
        input.questionIds?.includes(question.id),
      )
    : input.finalTest.questions;
  const answers: FinalTestAnswer[] = includedQuestions.map((question) => ({
    questionId: question.id,
    optionId: input.selectedAnswers[question.id] ?? "",
    correct: input.selectedAnswers[question.id] === question.correctOptionId,
    focusModuleId: question.focusModuleId,
  }));
  const correctCount = answers.filter((answer) => answer.correct).length;
  const score = Math.round((correctCount / includedQuestions.length) * 100);
  const weakQuestions = includedQuestions.filter((question) =>
    answers.some((answer) => answer.questionId === question.id && !answer.correct),
  );
  const strongQuestions = includedQuestions.filter((question) =>
    answers.some((answer) => answer.questionId === question.id && answer.correct),
  );

  return finalTestAttemptSchema.parse({
    finalTestId: input.finalTest.id,
    score,
    passed: score >= input.finalTest.passScore,
    attemptNumber: input.attemptNumber,
    answers,
    strongFocuses: strongQuestions.map((question) => question.focusTitle),
    weakFocuses: weakQuestions.map((question) => question.focusTitle),
    reviewItems: weakQuestions.map((question) => ({
      focusTitle: question.focusTitle,
      moduleSlug: question.focusModuleSlug,
      reason: question.reviewHint,
    })),
    submittedAt: new Date().toISOString(),
  });
}

export function targetedFinalQuestionIds(
  finalTest: FinalTest,
  previous: FinalTestAttempt | null,
) {
  if (!previous || previous.passed) {
    return finalTest.questions.map((question) => question.id);
  }

  return finalTest.questions
    .filter((question) => previous.weakFocuses.includes(question.focusTitle))
    .map((question) => question.id);
}
