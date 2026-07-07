import type {
  Assessment,
  AssessmentAnswer,
  AssessmentResult,
} from "@/domain/entities";
import { assessmentResultSchema } from "@/domain/schemas";

export function evaluateAssessment({
  assessment,
  selectedAnswers,
  attemptNumber,
  questionIds,
  forceFailure = false,
}: {
  assessment: Assessment;
  selectedAnswers: Record<string, string>;
  attemptNumber: number;
  questionIds?: string[];
  forceFailure?: boolean;
}): AssessmentResult {
  const includedQuestions = questionIds?.length
    ? assessment.questions.filter((question) => questionIds.includes(question.id))
    : assessment.questions;

  const answers: AssessmentAnswer[] = includedQuestions.map((question, index) => ({
    questionId: question.id,
    optionId: selectedAnswers[question.id] ?? "",
    correct:
      selectedAnswers[question.id] === question.correctOptionId &&
      !(forceFailure && index === 0),
  }));
  const correctCount = answers.filter((answer) => answer.correct).length;
  const score = Math.round((correctCount / includedQuestions.length) * 100);
  const strongTopics = includedQuestions
    .filter((question) =>
      answers.some((answer) => answer.questionId === question.id && answer.correct),
    )
    .map((question) => question.topic);
  const weakQuestions = includedQuestions.filter((question) =>
    answers.some((answer) => answer.questionId === question.id && !answer.correct),
  );

  return assessmentResultSchema.parse({
    assessmentId: assessment.id,
    moduleId: assessment.moduleId,
    score,
    passed: score >= assessment.passScore,
    attemptNumber,
    answers,
    strongTopics,
    weakTopics: weakQuestions.map((question) => question.topic),
    correctiveLessonIds: weakQuestions.map(
      (question) => question.correctiveLessonId,
    ),
    submittedAt: new Date().toISOString(),
  });
}

export function targetedQuestionIds(
  assessment: Assessment,
  previous: AssessmentResult | null,
) {
  if (!previous || previous.passed) {
    return assessment.questions.map((question) => question.id);
  }

  return assessment.questions
    .filter((question) => previous.weakTopics.includes(question.topic))
    .map((question) => question.id);
}
