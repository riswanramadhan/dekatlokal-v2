import type {
  Answers,
  AssessmentResponse,
  AssessmentStep,
} from "@/components/assessment/types";

export const ASSESSMENT_SESSION_KEY =
  "dekatlokal:digital-checkup-session:v1";
export const ASSESSMENT_SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const SESSION_VERSION = 1 as const;
const MAX_FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface AssessmentSessionSnapshot {
  version: typeof SESSION_VERSION;
  savedAt: number;
  currentStep: Exclude<AssessmentStep, "calculating">;
  currentGroupIndex: number;
  answers: Answers;
  consentChecked: boolean;
  termsChecked: boolean;
  responseData: AssessmentResponse | null;
  unlockedGroups: number[];
  touchedQuestions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnswers(value: unknown): value is Answers {
  if (!isRecord(value)) return false;

  return Object.values(value).every(
    (answer) =>
      typeof answer === "string" ||
      (Array.isArray(answer) &&
        answer.every((item) => typeof item === "string")),
  );
}

function isAssessmentResponse(value: unknown): value is AssessmentResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.totalScore === "number" &&
    Number.isFinite(value.totalScore) &&
    typeof value.maxScore === "number" &&
    Number.isFinite(value.maxScore) &&
    (value.percentage === null ||
      (typeof value.percentage === "number" &&
        Number.isFinite(value.percentage))) &&
    typeof value.scoringVersion === "string" &&
    (value.digitalPresence === null || isRecord(value.digitalPresence))
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item) => Number.isInteger(item) && item >= 0)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function createAssessmentSessionSnapshot({
  currentStep,
  currentGroupIndex,
  answers,
  consentChecked,
  termsChecked,
  responseData,
  unlockedGroups,
  touchedQuestions,
  now = Date.now(),
}: Omit<AssessmentSessionSnapshot, "version" | "savedAt" | "currentStep"> & {
  currentStep: AssessmentStep;
  now?: number;
}): AssessmentSessionSnapshot {
  const restorableStep =
    currentStep === "calculating"
      ? responseData
        ? "results"
        : "questions"
      : currentStep;

  return {
    version: SESSION_VERSION,
    savedAt: now,
    currentStep: restorableStep,
    currentGroupIndex,
    answers,
    consentChecked,
    termsChecked,
    responseData: restorableStep === "results" ? responseData : null,
    unlockedGroups: Array.from(new Set(unlockedGroups)).sort((a, b) => a - b),
    touchedQuestions: Array.from(new Set(touchedQuestions)),
  };
}

export function parseAssessmentSessionSnapshot(
  serialized: string | null,
  now = Date.now(),
): AssessmentSessionSnapshot | null {
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!isRecord(value)) return null;

    const currentStep = value.currentStep;
    const responseData = value.responseData;
    const savedAt = value.savedAt;

    if (
      value.version !== SESSION_VERSION ||
      typeof savedAt !== "number" ||
      !Number.isFinite(savedAt) ||
      savedAt > now + MAX_FUTURE_CLOCK_SKEW_MS ||
      now - savedAt > ASSESSMENT_SESSION_TTL_MS ||
      (currentStep !== "welcome" &&
        currentStep !== "questions" &&
        currentStep !== "results") ||
      typeof value.currentGroupIndex !== "number" ||
      !Number.isInteger(value.currentGroupIndex) ||
      value.currentGroupIndex < 0 ||
      !isAnswers(value.answers) ||
      typeof value.consentChecked !== "boolean" ||
      typeof value.termsChecked !== "boolean" ||
      !isNumberArray(value.unlockedGroups) ||
      !isStringArray(value.touchedQuestions) ||
      (responseData !== null && !isAssessmentResponse(responseData)) ||
      (currentStep === "results" && !isAssessmentResponse(responseData))
    ) {
      return null;
    }

    return value as unknown as AssessmentSessionSnapshot;
  } catch {
    return null;
  }
}
