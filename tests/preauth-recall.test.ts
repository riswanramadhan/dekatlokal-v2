import { describe, expect, it } from "vitest";
import {
  evaluateRecallSelection,
  isAllowedRecallSelection,
} from "@/features/preauth/recall";
import { createMockRepositories } from "@/infrastructure/mock/repositories";

async function getPreview() {
  const result = await createMockRepositories(
    "culinary-new-user",
  ).checkup.previewClaim({ token: "mock-claim-token" });
  if (result.status !== "valid") {
    throw new Error("Expected a valid mock claim.");
  }
  return result.preview;
}

describe("pre-auth recall", () => {
  it("requires exactly three unique choices from the presented six", async () => {
    const preview = await getPreview();
    expect(isAllowedRecallSelection(preview, [
      preview.recommendedModules[0].id,
      preview.recommendedModules[1].id,
    ])).toBe(false);
    expect(isAllowedRecallSelection(preview, [
      preview.recommendedModules[0].id,
      preview.recommendedModules[1].id,
      "module-not-presented",
    ])).toBe(false);
  });

  it("returns supportive partial feedback and unlocks help after two attempts", async () => {
    const preview = await getPreview();
    const selection = [
      preview.recommendedModules[0].id,
      preview.recommendedModules[1].id,
      preview.distractorModules[0].id,
    ];
    const evaluation = evaluateRecallSelection({
      preview,
      selectedModuleIds: selection,
      attemptCount: 2,
    });

    expect(evaluation.matchingCount).toBe(2);
    expect(evaluation.isCorrect).toBe(false);
    expect(evaluation.contextualHint).not.toMatch(/\d+\/100/);
    expect(evaluation.canRevealHelp).toBe(true);
  });

  it("recognizes all three authoritative recommendations", async () => {
    const preview = await getPreview();
    const evaluation = evaluateRecallSelection({
      preview,
      selectedModuleIds: preview.recommendedModules.map((module) => module.id),
      attemptCount: 1,
    });

    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.matchingCount).toBe(3);
    expect(evaluation.canRevealHelp).toBe(false);
  });
});
