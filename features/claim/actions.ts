"use server";

import { redirect } from "next/navigation";
import {
  getAppView,
  getRepositoriesForRequest,
} from "@/domain/services/app-service";
import {
  clearPreAuthJourney,
  getPreAuthJourney,
} from "@/infrastructure/storage/mock-preauth-session";
import {
  getMockJourneySession,
  setClaimAssociation,
} from "@/infrastructure/storage/mock-session";
import { trackMockAnalytics } from "@/lib/analytics/mock";

export async function associatePendingClaim() {
  const [journey, session] = await Promise.all([
    getPreAuthJourney(),
    getMockJourneySession(),
  ]);

  if (!session.auth?.verified) {
    redirect("/masuk");
  }

  if (session.claimAssociation && !journey) {
    redirect("/app/beranda");
  }

  if (!journey) {
    redirect("/mulai");
  }

  const [repositories, appView] = await Promise.all([
    getRepositoriesForRequest(),
    getAppView(),
  ]);
  const result = await repositories.checkup.associateClaim({
    token: journey.claimToken,
    userId: appView.user.id,
  });

  if (result.status !== "success") {
    redirect(`/hubungkan-checkup?status=${result.status}`);
  }

  await setClaimAssociation(result.association);
  await clearPreAuthJourney();
  trackMockAnalytics({ name: "claim_associated_after_auth" });
  redirect("/app/beranda");
}
