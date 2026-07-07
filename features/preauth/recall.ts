import type {
  CheckupClaimPreview,
  RecallEvaluation,
} from "@/domain/entities";
import { recallEvaluationSchema } from "@/domain/schemas";

export const RECALL_HELP_ATTEMPT_THRESHOLD = 2;

export function evaluateRecallSelection(input: {
  preview: CheckupClaimPreview;
  selectedModuleIds: string[];
  attemptCount: number;
}): RecallEvaluation {
  const selectedModuleIds = [...new Set(input.selectedModuleIds)];
  if (selectedModuleIds.length !== 3) {
    throw new Error("Recall requires exactly three unique module selections.");
  }

  const authoritativeIds = new Set(
    input.preview.recommendedModules.map((module) => module.id),
  );
  const matchingCount = selectedModuleIds.filter((id) =>
    authoritativeIds.has(id),
  ).length;
  const missedModules = input.preview.recommendedModules.filter(
    (module) => !selectedModuleIds.includes(module.id),
  );

  return recallEvaluationSchema.parse({
    selectedModuleIds,
    matchingCount,
    missedModuleIds: missedModules.map((module) => module.id),
    isCorrect: matchingCount === 3,
    contextualHint:
      matchingCount === 3
        ? undefined
        : `Ingat kembali fokus yang membantu usaha mencapai hasil ini: ${missedModules[0]?.shortOutcome ?? "usaha lebih terarah"}.`,
    canRevealHelp:
      !input.preview.recommendedModules.every((module) =>
        selectedModuleIds.includes(module.id),
      ) && input.attemptCount >= RECALL_HELP_ATTEMPT_THRESHOLD,
  });
}

export function isAllowedRecallSelection(
  preview: CheckupClaimPreview,
  selectedModuleIds: string[],
) {
  const allowedIds = new Set([
    ...preview.recommendedModules.map((module) => module.id),
    ...preview.distractorModules.map((module) => module.id),
  ]);
  const uniqueIds = new Set(selectedModuleIds);

  return (
    selectedModuleIds.length === 3 &&
    uniqueIds.size === 3 &&
    selectedModuleIds.every((id) => allowedIds.has(id))
  );
}
