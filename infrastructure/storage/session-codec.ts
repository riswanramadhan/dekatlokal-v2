import { z } from "zod";
import {
  claimAssociationSchema,
  mockAuthSessionSchema,
  onboardingDraftSchema,
} from "@/domain/schemas";

export const mockJourneySessionSchema = z.object({
  auth: mockAuthSessionSchema.optional(),
  onboarding: onboardingDraftSchema.optional(),
  claimedResultId: z.string().optional(),
  claimAssociation: claimAssociationSchema.optional(),
});

export type MockJourneySession = z.infer<typeof mockJourneySessionSchema>;

export function encodeSession(session: MockJourneySession): string {
  return encodeURIComponent(JSON.stringify(mockJourneySessionSchema.parse(session)));
}

export function decodeSession(value: string | undefined): MockJourneySession {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return mockJourneySessionSchema.parse(parsed);
  } catch {
    return {};
  }
}
