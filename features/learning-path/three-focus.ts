import type {
  InterventionPlan,
  ModuleCompletion,
  ModuleState,
} from "@/domain/entities";

function stateFromCompletion(
  completion: ModuleCompletion | null,
  fallback: ModuleState,
): ModuleState {
  if (completion?.completed || fallback === "completed") {
    return "completed";
  }
  if (completion?.taskStatus === "submitted") {
    return "awaiting_review";
  }
  if (
    completion?.taskStatus === "draft" ||
    completion?.taskStatus === "needs_revision"
  ) {
    return "awaiting_evidence";
  }
  if (
    completion &&
    completion.lessonsCompleted === completion.lessonsTotal &&
    !completion.assessmentPassed
  ) {
    return "needs_retry";
  }
  if (completion && completion.lessonsCompleted > 0) {
    return "in_progress";
  }
  return fallback === "locked" || fallback === "available" ? "active" : fallback;
}

export function applySequentialThreeFocusState(input: {
  plan: InterventionPlan;
  completions: Map<string, ModuleCompletion | null>;
}): InterventionPlan {
  if (input.plan.steps.length !== 3) {
    throw new Error("The active basic path must contain exactly three modules.");
  }

  let foundCurrent = false;
  const steps = input.plan.steps.map((step, index, allSteps) => {
    const moduleId = `module-${step.moduleSlug}`;
    const completion = input.completions.get(moduleId) ?? null;
    const completed = completion?.completed || step.state === "completed";

    if (completed) {
      return { ...step, state: "completed" as const, prerequisite: undefined };
    }

    if (!foundCurrent) {
      foundCurrent = true;
      return {
        ...step,
        state: stateFromCompletion(completion, step.state),
        prerequisite: undefined,
      };
    }

    const prerequisiteTitle = allSteps[index - 1]?.title;
    return {
      ...step,
      state: "locked" as const,
      prerequisite: prerequisiteTitle
        ? `Selesaikan ${prerequisiteTitle} terlebih dahulu agar fokus ini dapat dibuka.`
        : step.prerequisite,
    };
  });

  return { ...input.plan, steps };
}
