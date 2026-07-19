import { Icon } from "@iconify/react";
import { mainSiteUrl, siteRoutes } from "@/lib/site-config";
import { useRef } from "react";
import { QuestionGroup, Answers, Answer } from "./types";
import { SingleChoiceQuestion, MultipleChoiceQuestion, TextInputQuestion } from "./questions";
import { isGroupValid, areAllPreviousGroupsValid, scrollToTop } from "./utils";

interface QuestionGroupScreenProps {
  group: QuestionGroup;
  groupIndex: number;
  allGroups: QuestionGroup[];
  answers: Answers;
  onAnswerChange: (questionId: string, value: Answer) => void;
  onNext: () => void;
  onPrevious: () => void;
  onBackHome: () => void;
  isFirst: boolean;
  isLast: boolean;
  consentChecked: boolean;
  onConsentChange: (checked: boolean) => void;
  termsChecked: boolean;
  onTermsChange: (checked: boolean) => void;
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <div
        className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${
          checked ? "border-primary bg-primary" : "border-neutral-300"
        }`}
      >
        {checked && <Icon icon="mdi:check" className="w-4 h-4 text-white" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-foreground text-sm">{label}</span>
    </label>
  );
}

export function QuestionGroupScreen({
  group,
  groupIndex,
  allGroups,
  answers,
  onAnswerChange,
  onNext,
  onPrevious,
  onBackHome,
  isFirst,
  isLast,
  consentChecked,
  onConsentChange,
  termsChecked,
  onTermsChange,
}: QuestionGroupScreenProps) {
  // Create refs for all text input questions
  const textInputRefs = useRef<{ [questionId: string]: HTMLInputElement | null }>({});

  const selectedEcommercePlatforms = Array.isArray(answers["e-commerce-platform"])
    ? (answers["e-commerce-platform"] as string[])
    : [];
  const isEcommerceOtherSelected = selectedEcommercePlatforms.includes("e-commerce-lainnya");

  // Get all text input questions in this group
  const textInputQuestions = group.questions.filter((q) => {
    if (q.type !== "text") return false;
    if (q.id === "e-commerce-platform-other") {
      return isEcommerceOtherSelected;
    }
    return true;
  });

  // Handle navigation to next text input when Enter is pressed
  const handleNavigateToNextQuestion = (currentQuestionId: string) => {
    const currentIndex = textInputQuestions.findIndex((q) => q.id === currentQuestionId);
    
    if (currentIndex !== -1 && currentIndex < textInputQuestions.length - 1) {
      // Focus to next text input question
      const nextQuestion = textInputQuestions[currentIndex + 1];
      textInputRefs.current[nextQuestion.id]?.focus();
    }
  };

  // Check if current group is valid
  const isCurrentGroupValid = isGroupValid(group, answers);
  
  // Check if all previous groups are valid (for submit button)
  const allPreviousValid = areAllPreviousGroupsValid(allGroups, groupIndex, answers);
  
  // Can proceed to next if current group is valid
  const canProceed = isCurrentGroupValid;
  
  // Can submit if it's last group, all groups are valid, and consent and terms are checked
  const canSubmit = isLast ? allPreviousValid && consentChecked && termsChecked : canProceed;

  const handleNext = () => {
    if (canSubmit) {
      onNext();
      scrollToTop();
    }
  };

  const handlePrevious = () => {
    onPrevious();
    scrollToTop();
  };

  return (
    <div>
      <div className="w-full mb-4 flex justify-start">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 border-2 border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:bg-neutral-50"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          Kembali ke Beranda
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Group Header */}
        <div className="mb-4">
          <div className="flex items-center text-center gap-3 mb-4">
            <div className="mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-2">{group.title}</h2>
              <p className="text-sm text-foreground">{group.description}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 bg-primary rounded-2xl p-6">
          <p className="text-xs text-primary-foreground/80 -mt-1">
            Semua pertanyaan wajib diisi kecuali yang bertanda <span className="font-semibold">(Opsional)</span>.
          </p>

          {group.questions.map((question) => {
            if (question.id === "e-commerce-platform-other" && !isEcommerceOtherSelected) {
              return null;
            }

            const effectiveQuestion =
              question.id === "e-commerce-platform-other" && isEcommerceOtherSelected
                ? { ...question, required: true }
                : question;

            return (
              <div key={effectiveQuestion.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3
                      id={`${effectiveQuestion.id}-label`}
                      className="text-lg font-extrabold text-primary-foreground"
                    >
                      {effectiveQuestion.question}
                      {!effectiveQuestion.required && (
                        <span className="ml-2 text-xs font-medium text-primary-foreground/75 align-middle">
                          (Opsional)
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="">
                  {effectiveQuestion.type === "single" && (
                    <SingleChoiceQuestion
                      question={effectiveQuestion}
                      value={answers[effectiveQuestion.id] as string | undefined}
                      onChange={(value) => onAnswerChange(effectiveQuestion.id, value)}
                    />
                  )}
                  {effectiveQuestion.type === "multiple" && (
                    <MultipleChoiceQuestion
                      question={effectiveQuestion}
                      value={answers[effectiveQuestion.id] as string[] | undefined}
                      onChange={(value) => onAnswerChange(effectiveQuestion.id, value)}
                    />
                  )}
                  {effectiveQuestion.type === "text" && (
                    <TextInputQuestion
                      ref={(el) => {
                        if (el) {
                          textInputRefs.current[effectiveQuestion.id] = el;
                        }
                      }}
                      question={effectiveQuestion}
                      value={answers[effectiveQuestion.id] as string | undefined}
                      onChange={(value) => onAnswerChange(effectiveQuestion.id, value)}
                      onNavigateNext={() => handleNavigateToNextQuestion(effectiveQuestion.id)}
                      isLastQuestion={textInputQuestions[textInputQuestions.length - 1]?.id === effectiveQuestion.id}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Consent and Terms Checkbox (only on last group) */}
        {isLast && (
          <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
            <ConsentCheckbox
              checked={consentChecked}
              onChange={onConsentChange}
              label="Dengan ini, saya siap menerima hasil Digital Checkup dan mengikuti tahapan yang disarankan oleh DekatLokal."
            />
            <ConsentCheckbox
              checked={termsChecked}
              onChange={onTermsChange}
              label={
                <>
                  Saya telah membaca dan menyetujui{" "}
                  <a href={mainSiteUrl(siteRoutes.termsOfService)} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    Syarat dan Ketentuan
                  </a>{" "}
                  serta{" "}
                  <a href={mainSiteUrl(siteRoutes.privacyPolicy)} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    Kebijakan Privasi
                  </a>{" "}
                  DekatLokal.
                </>
              }
            />
          </div>
        )}

        {/* Validation Message for Submit */}
        {isLast && !allPreviousValid && (
          <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-3">
            <Icon icon="mdi:alert" className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm text-warning-700">
              <p className="font-semibold mb-1">Lengkapi semua pertanyaan</p>
              <p>Pastikan semua pertanyaan sudah diisi dengan benar sebelum mengirim checkup.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirst}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isFirst
                ? "text-neutral-400 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            Sebelumnya
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canSubmit
                ? "bg-primary text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {isLast ? (
              <>
                Kirim Checkup
                <Icon icon="mdi:send" className="w-5 h-5" />
              </>
            ) : (
              <>
                Lanjut
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
