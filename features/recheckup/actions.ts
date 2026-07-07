"use server";

import { redirect } from "next/navigation";
import {
  getRepositoriesForRequest,
  getThreeFocusProgressView,
} from "@/domain/services/app-service";
import { createMockRecheckupComparison } from "@/features/recheckup/compare";

export async function completeMockRecheckup() {
  const repositories = await getRepositoriesForRequest();
  const { dashboard, progress } = await getThreeFocusProgressView();

  if (
    !dashboard.checkup ||
    !dashboard.activePlan ||
    !progress?.recheckupReady
  ) {
    redirect("/app/checkup-ulang");
  }

  const comparison = createMockRecheckupComparison({
    originalResult: dashboard.checkup,
    plan: dashboard.activePlan,
    assets: await repositories.assets.listBusinessAssets(dashboard.business.id),
  });
  await repositories.recheckup.saveComparison(comparison);
  redirect("/app/checkup-ulang?status=selesai");
}
