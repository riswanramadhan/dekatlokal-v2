import type {
  Answer,
  Answers,
  Question,
  QuestionGroup,
} from "@/components/assessment/types";

export const ECOMMERCE_PLATFORM_QUESTION_ID = "e-commerce-platform";
export const ECOMMERCE_OTHER_OPTION_ID = "e-commerce-lainnya";
export const ECOMMERCE_OTHER_TEXT_QUESTION_ID = "e-commerce-platform-other";

const RESPONSE_FIELD_QUESTION_IDS = new Set([
  "umkm-name",
  "owner-name",
  "whatsapp",
  "email",
  "instagram-username",
  "tiktok-username",
  "google-business-url",
]);

export interface AssessmentAnswerRow {
  questionId: string;
  choice: string;
  score: number;
}

export interface ManualAssessmentScore {
  answerRows: AssessmentAnswerRow[];
  hasEcommerceOther: boolean;
  manualMaxScoreForResponse: number;
  theoreticalManualMaxScore: number;
  totalScore: number;
}

export interface DigitalPlatformCompensationInput {
  provided: boolean;
  maxScore: number;
  state: {
    requested: boolean;
    success: boolean;
    errorType: "user" | "system" | null;
  };
}

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getSanitizedMultipleValues(
  question: Question,
  answer: Answer,
): string[] {
  if (!question.options) return [];

  const validOptionIds = new Set(question.options.map((option) => option.id));

  if (Array.isArray(answer)) {
    return Array.from(
      new Set(
        answer.filter(
          (value): value is string =>
            typeof value === "string" && validOptionIds.has(value),
        ),
      ),
    );
  }

  if (typeof answer === "string" && validOptionIds.has(answer)) {
    return [answer];
  }

  return [];
}

export function getQuestionScore(question: Question, answer: Answer): number {
  if (!question.options) return 0;

  if (question.type === "single" && typeof answer === "string") {
    return question.options.find((option) => option.id === answer)?.score ?? 0;
  }

  if (question.type === "multiple") {
    const selectedValues = getSanitizedMultipleValues(question, answer);
    if (selectedValues.length === 0) return 0;

    return question.options
      .filter((option) => selectedValues.includes(option.id))
      .reduce((sum, option) => sum + option.score, 0);
  }

  return 0;
}

export function getQuestionMaxScore(question: Question): number {
  if (!question.options) return 0;

  if (question.type === "multiple") {
    return question.options.reduce((sum, option) => sum + option.score, 0);
  }

  return question.options.reduce(
    (max, option) => Math.max(max, option.score),
    0,
  );
}

export function normalizeAnswerValue(
  question: Question,
  answer: Answer,
): string | null {
  if (answer === undefined) return null;

  if (question.type === "multiple") {
    const selectedValues = getSanitizedMultipleValues(question, answer);
    return selectedValues.length > 0 ? JSON.stringify(selectedValues) : null;
  }

  if (question.type === "single") {
    if (typeof answer !== "string") return null;
    if (!question.options || question.options.length === 0) return null;

    return question.options.some((option) => option.id === answer) ? answer : null;
  }

  if (Array.isArray(answer)) return null;

  const trimmed = String(answer).trim();
  return trimmed.length ? trimmed : null;
}

export function hasEcommerceOtherSelection(
  answers: Answers,
  questionGroups: QuestionGroup[],
): boolean {
  const ecommerceQuestion = questionGroups
    .flatMap((group) => group.questions)
    .find((question) => question.id === ECOMMERCE_PLATFORM_QUESTION_ID);

  if (!ecommerceQuestion) return false;

  return getSanitizedMultipleValues(
    ecommerceQuestion,
    answers[ECOMMERCE_PLATFORM_QUESTION_ID],
  ).includes(ECOMMERCE_OTHER_OPTION_ID);
}

export function calculateManualAssessmentScore(
  answers: Answers,
  questionGroups: QuestionGroup[],
): ManualAssessmentScore {
  const hasEcommerceOther = hasEcommerceOtherSelection(answers, questionGroups);
  const answerRows: AssessmentAnswerRow[] = [];
  let totalScore = 0;
  let manualMaxScoreForResponse = 0;
  let theoreticalManualMaxScore = 0;

  for (const group of questionGroups) {
    for (const question of group.questions) {
      const answer = answers[question.id];
      theoreticalManualMaxScore += getQuestionMaxScore(question);

      if (RESPONSE_FIELD_QUESTION_IDS.has(question.id)) continue;
      if (
        question.id === ECOMMERCE_OTHER_TEXT_QUESTION_ID &&
        !hasEcommerceOther
      ) {
        continue;
      }

      manualMaxScoreForResponse += getQuestionMaxScore(question);

      const normalizedChoice = normalizeAnswerValue(question, answer);
      if (!normalizedChoice) continue;

      const score = getQuestionScore(question, answer);
      totalScore += score;
      answerRows.push({
        questionId: question.id,
        choice: normalizedChoice,
        score,
      });
    }
  }

  return {
    answerRows,
    hasEcommerceOther,
    manualMaxScoreForResponse,
    theoreticalManualMaxScore,
    totalScore: roundScore(totalScore),
  };
}

export function calculateGroupScores(
  groupIds: string[],
  questionGroups: QuestionGroup[],
  answers: Answers,
): { earned: number; max: number } {
  let earned = 0;
  let max = 0;

  for (const group of questionGroups) {
    if (!groupIds.includes(group.id)) continue;

    for (const question of group.questions) {
      if (!question.options || question.options.length === 0) continue;

      max += getQuestionMaxScore(question);
      earned += getQuestionScore(question, answers[question.id]);
    }
  }

  return {
    earned: roundScore(earned),
    max: roundScore(max),
  };
}

export function toPercent(earned: number, max: number): number {
  return max > 0
    ? Math.min(100, Math.max(0, Math.round((earned / max) * 100)))
    : 0;
}

export function shouldCompensateDigitalPlatform(
  platform: DigitalPlatformCompensationInput,
): boolean {
  return Boolean(
    platform.provided &&
      platform.state.requested &&
      !platform.state.success &&
      platform.state.errorType === "system",
  );
}

export function calculateCompensatedDigitalMaxScore(
  baseMaxScore: number,
  platforms: DigitalPlatformCompensationInput[],
): number {
  const compensation = platforms
    .filter(shouldCompensateDigitalPlatform)
    .reduce((sum, platform) => sum + platform.maxScore, 0);

  return Math.max(0, baseMaxScore - compensation);
}
