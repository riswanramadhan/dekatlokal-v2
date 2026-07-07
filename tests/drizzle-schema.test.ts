import { describe, expect, it } from "vitest";
import * as schema from "@/db/schema";

describe("Drizzle schema", () => {
  it("exports the Neon-ready product tables", () => {
    const requiredExports = [
      "users",
      "businesses",
      "checkupResults",
      "checkupClaimTokens",
      "interventionPlans",
      "interventionPlanSteps",
      "modules",
      "lessons",
      "assessments",
      "assessmentAttempts",
      "taskSubmissions",
      "businessAssets",
      "finalTests",
      "finalTestAttempts",
      "recheckups",
      "certificates",
      "rewardClaims",
      "notifications",
      "auditEvents",
    ];

    const exportedSchema = schema as Record<string, unknown>;

    for (const exportName of requiredExports) {
      expect(exportedSchema[exportName], exportName).toBeDefined();
    }
  });
});
