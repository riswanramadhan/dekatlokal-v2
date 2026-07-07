import { preAuthJourneySchema } from "@/domain/schemas";
import type { PreAuthJourney } from "@/domain/entities";

export function encodePreAuthJourney(journey: PreAuthJourney): string {
  return encodeURIComponent(JSON.stringify(preAuthJourneySchema.parse(journey)));
}

export function decodePreAuthJourney(
  value: string | undefined,
): PreAuthJourney | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return preAuthJourneySchema.parse(parsed);
  } catch {
    return null;
  }
}
