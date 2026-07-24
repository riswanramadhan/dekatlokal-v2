import { AssessmentStep, Question, Answers, QuestionGroup, Answer } from "./types";

const ECOMMERCE_PLATFORM_QUESTION_ID = "e-commerce-platform";
const ECOMMERCE_OTHER_OPTION_ID = "e-commerce-lainnya";
const ECOMMERCE_OTHER_TEXT_QUESTION_ID = "e-commerce-platform-other";

function isEcommerceOtherSelected(answers: Answers): boolean {
  const selected = answers[ECOMMERCE_PLATFORM_QUESTION_ID];
  return Array.isArray(selected) && selected.includes(ECOMMERCE_OTHER_OPTION_ID);
}

interface ProgressMetrics {
  current: number;
  total: number;
  percentage: number;
  roundedPercentage: number;
}

/**
 * Normalize current/total into safe progress values.
 */
export function getProgressMetrics(current: number, total: number): ProgressMetrics {
  const safeTotal = Math.max(0, Number.isFinite(total) ? total : 0);
  const normalizedCurrent = Math.max(0, Number.isFinite(current) ? current : 0);
  const safeCurrent = safeTotal > 0 ? Math.min(normalizedCurrent, safeTotal) : 0;
  const percentage = safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;

  return {
    current: safeCurrent,
    total: safeTotal,
    percentage,
    roundedPercentage: Math.round(percentage),
  };
}

/**
 * Build assessment progress from step state, then normalize to safe values.
 */
export function getAssessmentProgressMetrics(
  currentStep: AssessmentStep,
  currentGroupIndex: number,
  totalSteps: number
): ProgressMetrics {
  const current =
    currentStep === "welcome"
      ? 1
      : currentStep === "questions"
      ? currentGroupIndex + 2
      : totalSteps;

  return getProgressMetrics(current, totalSteps);
}

/**
 * Validate answer value based on requirement and optional validator rules
 */
export function validateInput(question: Question, value: Answer): { valid: boolean; message: string } {
  // Empty/undefined value
  if (value === undefined) {
    if (question.required) {
      return { valid: false, message: "Wajib diisi" };
    }
    return { valid: true, message: "" };
  }

  if (Array.isArray(value)) {
    if (question.required && value.length === 0) {
      return { valid: false, message: "Pilih minimal satu opsi" };
    }
    return { valid: true, message: "" };
  }

  if (String(value).trim() === "") {
    if (question.required) {
      return { valid: false, message: "Wajib diisi" };
    }
    return { valid: true, message: "" };
  }

  const trimmed = String(value).trim();
  const validator = question.validator;

  if (!validator) {
    return { valid: true, message: "" };
  }

  // Check minLength
  if (validator.minLength && trimmed.length < validator.minLength) {
    return { 
      valid: false, 
      message: `Minimal ${validator.minLength} karakter (saat ini ${trimmed.length})` 
    };
  }

  // Check maxLength
  if (validator.maxLength && trimmed.length > validator.maxLength) {
    return { 
      valid: false, 
      message: `Maksimal ${validator.maxLength} karakter (saat ini ${trimmed.length})` 
    };
  }

  // Check pattern
  if (validator.pattern && !validator.pattern.test(trimmed)) {
    const patternMap: { [key: string]: string } = {
      email: "Format email tidak valid",
      whatsapp: "Format nomor whatsapp tidak valid",
      instagram: "Username Instagram hanya boleh mengandung huruf, angka, underscore, titik, dan dash",
      tiktok: "Username TikTok hanya boleh mengandung huruf, angka, underscore, titik, dan dash",
      googleUrl: "Format URL Google Maps tidak valid",
    };
    
    // Try to identify the pattern type
    const patternStr = validator.pattern.toString();
    let message = "Format tidak valid";
    
    if (patternStr.includes("email") || patternStr.includes("@")) {
      message = patternMap.email;
    } else if (patternStr.includes("62|0")) {
      message = patternMap.whatsapp;
    } else if (validator.pattern.toString().includes("^[a-zA-Z0-9._-]{3,30}$")) {
      // For social media
      if (question.id.includes("instagram")) {
        message = patternMap.instagram;
      } else if (question.id.includes("tiktok")) {
        message = patternMap.tiktok;
      }
    } else if (question.id.includes("google")) {
      message = patternMap.googleUrl;
    }
    
    return { valid: false, message };
  }

  // Check custom validator
  if (validator.customValidator) {
    return validator.customValidator(trimmed);
  }

  return { valid: true, message: "" };
}

/**
 * Check if a single question is answered and valid
 */
export function isQuestionAnswered(question: Question, answers: Answers): boolean {
  const isConditionallyRequired =
    question.id === ECOMMERCE_OTHER_TEXT_QUESTION_ID && isEcommerceOtherSelected(answers);

  if (!question.required && !isConditionallyRequired) return true;
  
  const answer = answers[question.id];

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  
  return answer !== undefined && String(answer).trim() !== "";
}

/**
 * Check if a single question is valid (answered + passes validation rules)
 */
export function isQuestionValid(question: Question, answers: Answers): boolean {
  const answer = answers[question.id];
  const questionForValidation =
    question.id === ECOMMERCE_OTHER_TEXT_QUESTION_ID && isEcommerceOtherSelected(answers)
      ? { ...question, required: true }
      : question;

  const validation = validateInput(questionForValidation, answer);
  return validation.valid;
}

/**
 * Get validation errors for a specific group
 */
export function getGroupValidationErrors(
  group: QuestionGroup,
  answers: Answers
): { questionId: string; question: string; message: string }[] {
  const errors: { questionId: string; question: string; message: string }[] = [];

  for (const question of group.questions) {
    const questionForValidation =
      question.id === ECOMMERCE_OTHER_TEXT_QUESTION_ID && isEcommerceOtherSelected(answers)
        ? { ...question, required: true }
        : question;

    const validation = validateInput(questionForValidation, answers[question.id]);
    if (!validation.valid) {
      errors.push({
        questionId: question.id,
        question: question.question,
        message: validation.message,
      });
    }
  }

  return errors;
}

/**
 * Check if all required questions in a group are answered
 */
export function isGroupValid(group: QuestionGroup, answers: Answers): boolean {
  return group.questions.every((question) => {
    // Must be answered if required
    if (!isQuestionAnswered(question, answers)) {
      return false;
    }
    // If answered, must pass validation
    return isQuestionValid(question, answers);
  });
}

/**
 * Check if all required questions up to a specific group index are answered
 */
export function areAllPreviousGroupsValid(
  groups: QuestionGroup[],
  upToIndex: number,
  answers: Answers
): boolean {
  for (let i = 0; i <= upToIndex; i++) {
    if (!isGroupValid(groups[i], answers)) {
      return false;
    }
  }
  return true;
}

/**
 * Get the index of the last completed group
 */
export function getLastCompletedGroupIndex(
  groups: QuestionGroup[],
  answers: Answers
): number {
  for (let i = 0; i < groups.length; i++) {
    if (!isGroupValid(groups[i], answers)) {
      return i - 1;
    }
  }
  return groups.length - 1;
}

/**
 * Check if a group can be navigated to based on unlocked groups
 */
export function canNavigateToGroup(
  groups: QuestionGroup[],
  targetIndex: number,
  answers: Answers,
  unlockedGroups: Set<number>
): boolean {
  // Can navigate if the group has been unlocked
  return unlockedGroups.has(targetIndex);
}

/**
 * Check if any question in a group has been touched/interacted with
 */
export function hasGroupBeenTouched(
  group: QuestionGroup,
  touchedQuestions: Set<string>
): boolean {
  return group.questions.some((question) => touchedQuestions.has(question.id));
}

/**
 * Check if a group is invalid (has errors) and has been touched
 * Returns true only if:
 * 1. The group has been touched/visited
 * 2. AND has validation errors or unfilled required fields
 */
export function isGroupInvalid(
  group: QuestionGroup,
  answers: Answers,
  touchedQuestions: Set<string>
): boolean {
  // If group hasn't been touched, it's not considered invalid
  if (!hasGroupBeenTouched(group, touchedQuestions)) {
    return false;
  }
  
  // Check if any touched question in the group is invalid
  for (const question of group.questions) {
    if (!touchedQuestions.has(question.id)) {
      continue; // Skip untouched questions
    }
    
    // Check if the question is invalid
    const answer = answers[question.id];
    const validation = validateInput(question, answer);
    
    if (!validation.valid) {
      return true; // Found an invalid touched question
    }
  }
  
  return false;
}

/**
 * Scroll to top of the page smoothly
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
