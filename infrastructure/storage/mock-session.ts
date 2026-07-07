import "server-only";

import { cookies } from "next/headers";
import type {
  ClaimAssociation,
  MockAuthSession,
  OnboardingDraft,
} from "@/domain/entities";
import {
  decodeSession,
  encodeSession,
  type MockJourneySession,
} from "@/infrastructure/storage/session-codec";

export const JOURNEY_SESSION_COOKIE = "dekatlokal_mock_journey";

async function readSession(): Promise<MockJourneySession> {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(JOURNEY_SESSION_COOKIE)?.value);
}

async function writeSession(session: MockJourneySession) {
  const cookieStore = await cookies();
  cookieStore.set(JOURNEY_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getMockJourneySession() {
  return readSession();
}

export async function setAuthSession(auth: MockAuthSession) {
  const current = await readSession();
  await writeSession({ ...current, auth });
}

export async function markAuthVerified() {
  const current = await readSession();
  if (!current.auth) {
    await writeSession({
      ...current,
      auth: { mode: "login", verified: true },
    });
    return;
  }

  await writeSession({
    ...current,
    auth: { ...current.auth, verified: true },
  });
}

export async function setClaimedResult(resultId: string) {
  const current = await readSession();
  await writeSession({ ...current, claimedResultId: resultId });
}

export async function setClaimAssociation(association: ClaimAssociation) {
  const current = await readSession();
  await writeSession({
    ...current,
    claimedResultId: association.resultId,
    claimAssociation: association,
  });
}

export async function updateOnboardingDraft(
  patch: Partial<OnboardingDraft>,
) {
  const current = await readSession();
  await writeSession({
    ...current,
    onboarding: {
      completed: false,
      ...current.onboarding,
      ...patch,
    },
  });
}

export async function completeOnboarding() {
  const current = await readSession();
  await writeSession({
    ...current,
    onboarding: {
      completed: true,
      ...current.onboarding,
    },
  });
}
