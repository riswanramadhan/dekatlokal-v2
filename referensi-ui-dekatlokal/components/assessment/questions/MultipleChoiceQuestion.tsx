import { Question } from "../types";

interface MultipleChoiceQuestionProps {
  question: Question;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

function getUniqueValues(values: string[] | undefined): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  return Array.from(new Set(values));
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  const selectedValues = getUniqueValues(value);

  const handleToggle = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter((id) => id !== optionId));
      return;
    }

    onChange([...selectedValues, optionId]);
  };

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-labelledby={`${question.id}-label`}
    >
      {question.options?.map((option) => {
        const isSelected = selectedValues.includes(option.id);

        return (
          <label
            key={option.id}
            htmlFor={`${question.id}-${option.id}`}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-primary ${
              isSelected
                ? "bg-background"
                : "bg-[#C0C4EE] hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <input
              id={`${question.id}-${option.id}`}
              name={question.id}
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(option.id)}
              className="sr-only"
            />
            <span className="flex items-center justify-center w-5 h-5 rounded border border-primary/30 bg-white">
              {isSelected && <span className="w-3 h-3 rounded bg-primary" />}
            </span>
            <span className={`flex-1 ${isSelected ? "text-primary font-bold" : "text-primary-800"}`}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
