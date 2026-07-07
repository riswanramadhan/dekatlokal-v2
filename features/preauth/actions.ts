"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getRepositoriesForRequest,
  SCENARIO_COOKIE,
} from "@/domain/services/app-service";
import {
  evaluateRecallSelection,
  isAllowedRecallSelection,
} from "@/features/preauth/recall";
import {
  getPreAuthJourney,
  setPreAuthJourney,
} from "@/infrastructure/storage/mock-preauth-session";
import { scenarioForClaimToken } from "@/infrastructure/mock/scenarios";
import { trackMockAnalytics } from "@/lib/analytics/mock";

async function getValidPreview(token: string) {
  const repositories = await getRepositoriesForRequest();
  const result = await repositories.checkup.previewClaim({ token });
  return result.status === "valid" ? result.preview : null;
}

export async function beginRecall(formData: FormData) {
  const token = formData.get("claimToken");
  if (typeof token !== "string" || !token) {
    redirect("/mulai");
  }

  const scenario = scenarioForClaimToken(token);
  if (scenario) {
    const cookieStore = await cookies();
    cookieStore.set(SCENARIO_COOKIE, scenario, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  const preview = await getValidPreview(token);
  if (!preview) {
    redirect(`/mulai?claim=${encodeURIComponent(token)}`);
  }

  await setPreAuthJourney({
    claimToken: token,
    stage: "recall",
    selectedModuleIds: [],
    attemptCount: 0,
    completedRecall: false,
    helpRevealed: false,
  });
  trackMockAnalytics({ name: "recall_started" });
  redirect("/mulai");
}

export async function submitRecall(formData: FormData) {
  const journey = await getPreAuthJourney();
  if (!journey) {
    redirect("/mulai");
  }

  const preview = await getValidPreview(journey.claimToken);
  const selectedModuleIds = formData
    .getAll("selectedModuleIds")
    .filter((value): value is string => typeof value === "string");

  if (!preview || !isAllowedRecallSelection(preview, selectedModuleIds)) {
    redirect("/mulai");
  }

  const attemptCount = journey.attemptCount + 1;
  const evaluation = evaluateRecallSelection({
    preview,
    selectedModuleIds,
    attemptCount,
  });

  await setPreAuthJourney({
    ...journey,
    stage: "recall",
    selectedModuleIds: evaluation.selectedModuleIds,
    attemptCount,
    completedRecall: evaluation.isCorrect,
    helpRevealed: false,
  });
  trackMockAnalytics({
    name: "recall_submitted",
    metadata: { matchingCount: evaluation.matchingCount, attemptCount },
  });
  trackMockAnalytics({
    name: evaluation.isCorrect ? "recall_completed" : "recall_partial",
    metadata: { attemptCount },
  });
  redirect("/mulai");
}

export async function revealRecallHelp() {
  const journey = await getPreAuthJourney();
  if (!journey || journey.attemptCount < 2) {
    redirect("/mulai");
  }

  await setPreAuthJourney({ ...journey, helpRevealed: true });
  trackMockAnalytics({ name: "recall_help_used" });
  redirect("/mulai");
}

export async function continueToPathPreview() {
  const journey = await getPreAuthJourney();
  if (!journey || (!journey.completedRecall && !journey.helpRevealed)) {
    redirect("/mulai");
  }

  await setPreAuthJourney({ ...journey, stage: "path_preview" });
  trackMockAnalytics({ name: "path_preview_viewed" });
  redirect("/mulai");
}

export async function openSignupWall() {
  const journey = await getPreAuthJourney();
  if (!journey || journey.stage !== "path_preview") {
    redirect("/mulai");
  }

  await setPreAuthJourney({ ...journey, stage: "signup" });
  trackMockAnalytics({ name: "signup_wall_viewed" });
  redirect("/mulai");
}
