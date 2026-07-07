import { z } from "zod";
import {
  finalTestAttemptSchema,
  recheckupComparisonSchema,
  rewardClaimSchema,
} from "@/domain/schemas";

export const mockGrowthSessionSchema = z.object({
  finalTestAttempts: z
    .record(z.string(), z.array(finalTestAttemptSchema))
    .default({}),
  recheckupComparisons: z
    .record(z.string(), recheckupComparisonSchema)
    .default({}),
  rewardClaims: z.record(z.string(), rewardClaimSchema).default({}),
});

export type MockGrowthSession = z.infer<typeof mockGrowthSessionSchema>;

export const emptyGrowthSession: MockGrowthSession = {
  finalTestAttempts: {},
  recheckupComparisons: {},
  rewardClaims: {},
};

export function encodeGrowthSession(session: MockGrowthSession): string {
  return encodeURIComponent(JSON.stringify(mockGrowthSessionSchema.parse(session)));
}

export function decodeGrowthSession(value: string | undefined): MockGrowthSession {
  if (!value) {
    return emptyGrowthSession;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return mockGrowthSessionSchema.parse(parsed);
  } catch {
    return emptyGrowthSession;
  }
}
