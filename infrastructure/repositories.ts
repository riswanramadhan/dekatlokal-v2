import "server-only";

import type { Repositories } from "@/domain/repositories";
import type { ScenarioKey } from "@/domain/entities";
import { createMockRepositories } from "@/infrastructure/mock/repositories";
import { createNeonRepositories } from "@/infrastructure/neon/repositories";

export function createRepositories(
  mode: "mock" | "neon",
  scenario: ScenarioKey,
): Repositories {
  if (mode === "neon") {
    return createNeonRepositories();
  }

  return createMockRepositories(scenario);
}
