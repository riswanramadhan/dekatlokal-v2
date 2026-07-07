import { describe, expect, it } from "vitest";
import { applySequentialThreeFocusState } from "@/features/learning-path/three-focus";
import { mockScenarios } from "@/infrastructure/mock/scenarios";

describe("three-focus sequential state", () => {
  it("keeps only the first incomplete module actionable", () => {
    const plan = mockScenarios["culinary-new-user"].activePlan!;
    const normalized = applySequentialThreeFocusState({
      plan,
      completions: new Map(),
    });

    expect(normalized.steps.map((step) => step.state)).toEqual([
      "active",
      "locked",
      "locked",
    ]);
    expect(normalized.steps[1].prerequisite).toContain(normalized.steps[0].title);
  });

  it("unlocks the second module only after the first is complete", () => {
    const plan = mockScenarios["culinary-new-user"].activePlan!;
    const firstModuleId = `module-${plan.steps[0].moduleSlug}`;
    const normalized = applySequentialThreeFocusState({
      plan,
      completions: new Map([
        [
          firstModuleId,
          {
            moduleId: firstModuleId,
            moduleSlug: plan.steps[0].moduleSlug,
            lessonsCompleted: 3,
            lessonsTotal: 3,
            assessmentPassed: true,
            taskStatus: "auto_approved",
            completed: true,
            missingRequirements: [],
          },
        ],
      ]),
    });

    expect(normalized.steps.map((step) => step.state)).toEqual([
      "completed",
      "active",
      "locked",
    ]);
  });
});
