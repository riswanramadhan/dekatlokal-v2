import { Question } from "../types";

interface SingleChoiceQuestionProps {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function SingleChoiceQuestion({ 
  question, 
  value, 
  onChange 
}: SingleChoiceQuestionProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-labelledby={`${question.id}-label`}
      aria-required={Boolean(question.required)}
    >
      {question.options?.map((option) => (
        <label
          key={option.id}
          htmlFor={`${question.id}-${option.id}`}
          className={`flex items-center gap-4 px-3 py-2 rounded-2xl cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-primary ${
            value === option.id
              ? "bg-background"
              : "bg-[#C0C4EE] hover:border-neutral-300 hover:bg-neutral-50"
          }`}
        >
          <input
            id={`${question.id}-${option.id}`}
            name={question.id}
            type="radio"
            value={option.id}
            checked={value === option.id}
            required={Boolean(question.required)}
            onChange={() => onChange(option.id)}
            className="sr-only"
          />
          <span className={`flex-1 ${value === option.id ? "text-primary font-bold" : "text-primary-800"}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
