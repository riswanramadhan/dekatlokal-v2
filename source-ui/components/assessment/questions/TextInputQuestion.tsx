import { useState, forwardRef } from "react";
import { Question } from "../types";
import { validateInput } from "../utils";

interface TextInputQuestionProps {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
  onNavigateNext?: () => void;
  isLastQuestion?: boolean;
}

export const TextInputQuestion = forwardRef<HTMLInputElement, TextInputQuestionProps>(
  (
    {
      question,
      value,
      onChange,
      onNavigateNext,
      isLastQuestion
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);
    const validation = validateInput(question, value);
    const isInvalid = touched && !validation.valid && (value !== undefined && String(value).trim() !== "");
    const inputConfig = question.textInput;
    const helperId = question.helper ? `${question.id}-helper` : undefined;
    const errorId = isInvalid ? `${question.id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // If this is the last question in group, don't navigate
        if (isLastQuestion) {
          return;
        }

        // Navigate to next question
        if (onNavigateNext) {
          onNavigateNext();
        }
      }
    };

    return (
      <div>
        <input
          id={question.id}
          name={question.id}
          ref={ref}
          type={inputConfig?.type ?? "text"}
          required={Boolean(question.required)}
          aria-required={Boolean(question.required)}
          aria-invalid={isInvalid}
          aria-labelledby={`${question.id}-label`}
          aria-describedby={describedBy}
          autoComplete={inputConfig?.autoComplete ?? "on"}
          inputMode={inputConfig?.inputMode ?? "text"}
          autoCapitalize={inputConfig?.autoCapitalize}
          autoCorrect={inputConfig?.autoCorrect}
          spellCheck={inputConfig?.spellCheck}
          enterKeyHint={isLastQuestion ? "done" : "next"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTouched(true)}
          placeholder={question.placeholder}
          className={`w-full bg-primary-foreground px-6 py-3 rounded-2xl focus:border-primary-foreground focus:ring-2 outline-none transition-all duration-200 placeholder:text-primary/50 ${
            isInvalid
              ? "text-red-600 ring-2 ring-red-300 focus:ring-red-300"
              : "text-foreground focus:ring-primary-foreground/20"
          }`}
        />
      {question.helper && (
        <span id={helperId} className="italic font-light text-sm text-primary-foreground/80">
          {question.helper}
        </span>
      )}
      {isInvalid && (
        <p id={errorId} className="text-red-600 text-sm font-medium mt-2" role="alert">
          ⚠️ {validation.message}
        </p>
      )}
    </div>
    );
  }
);

TextInputQuestion.displayName = "TextInputQuestion";
