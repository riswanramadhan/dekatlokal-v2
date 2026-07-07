import { describe, expect, it } from "vitest";
import type { Repositories } from "@/domain/repositories";
import type { ScenarioKey } from "@/domain/entities";
import { createMockRepositories } from "@/infrastructure/mock/repositories";
import { createRepositories } from "@/infrastructure/repositories";

function runThreeFocusContract(
  label: string,
  createRepository: () => Repositories,
) {
  describe(label, () => {
    it("returns an active basic path with exactly three required steps", async () => {
      const repositories = createRepository();
      const plan = await repositories.learning.getActivePlan("demo-user");

      expect(plan).not.toBeNull();
      expect(plan?.steps).toHaveLength(3);
      expect(plan?.steps.every((step) => step.required)).toBe(true);
      expect(plan?.steps.map((step) => step.position)).toEqual([1, 2, 3]);
    });

    it("keeps claim preview and association aligned to three authoritative modules", async () => {
      const repositories = createRepository();
      const preview = await repositories.checkup.previewClaim({
        token: "mock-claim-token",
      });

      expect(preview.status).toBe("valid");
      if (preview.status !== "valid") return;

      const association = await repositories.checkup.associateClaim({
        token: preview.preview.claimToken,
        userId: "demo-user",
      });

      expect(preview.preview.recommendedModules).toHaveLength(3);
      expect(association.status).toBe("success");
      if (association.status !== "success") return;
      expect(association.association.moduleAssignments).toHaveLength(3);
      expect(association.association.moduleAssignments.map((item) => item.moduleId)).toEqual(
        preview.preview.recommendedModules.map((item) => item.id),
      );
    });
  });
}

const contractScenarios: ScenarioKey[] = [
  "culinary-new-user",
  "fast-fashion",
  "returning-service",
  "reward-eligible",
];

for (const scenario of contractScenarios) {
  runThreeFocusContract(`mock repository contract: ${scenario}`, () =>
    createMockRepositories(scenario),
  );
}

describe("repository factory", () => {
  it("uses mock repositories without database configuration", async () => {
    const repositories = createRepositories("mock", "culinary-new-user");
    const dashboard = await repositories.dashboard.getDashboard("demo-user");

    expect(dashboard.business.name).toBe("Warung Rina");
    expect(dashboard.activePlan?.steps).toHaveLength(3);
  });
});
