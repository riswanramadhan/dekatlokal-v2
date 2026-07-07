import "server-only";

import { cookies } from "next/headers";
import type {
  FinalTestAttempt,
  RecheckupComparison,
  RewardClaim,
} from "@/domain/entities";
import {
  decodeGrowthSession,
  encodeGrowthSession,
  type MockGrowthSession,
} from "@/infrastructure/storage/growth-session-codec";

const GROWTH_COOKIE = "dekatlokal_mock_growth";

export async function getMockGrowthSession(): Promise<MockGrowthSession> {
  const cookieStore = await cookies();
  return decodeGrowthSession(cookieStore.get(GROWTH_COOKIE)?.value);
}

async function writeGrowthSession(session: MockGrowthSession) {
  const cookieStore = await cookies();
  cookieStore.set(GROWTH_COOKIE, encodeGrowthSession(session), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function persistFinalTestAttempt(attempt: FinalTestAttempt) {
  const session = await getMockGrowthSession();
  await writeGrowthSession({
    ...session,
    finalTestAttempts: {
      ...session.finalTestAttempts,
      [attempt.finalTestId]: [attempt],
    },
  });
  return attempt;
}

export async function persistRecheckupComparison(
  comparison: RecheckupComparison,
) {
  const session = await getMockGrowthSession();
  await writeGrowthSession({
    ...session,
    recheckupComparisons: {
      ...session.recheckupComparisons,
      [comparison.businessId]: comparison,
    },
  });
  return comparison;
}

export async function persistRewardClaim(claim: RewardClaim) {
  const session = await getMockGrowthSession();
  await writeGrowthSession({
    ...session,
    rewardClaims: {
      ...session.rewardClaims,
      [claim.rewardId]: claim,
    },
  });
  return claim;
}
