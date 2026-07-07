"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getRepositoriesForRequest,
  getRewardLandingPageView,
} from "@/domain/services/app-service";

const rewardClaimFormSchema = z.object({
  selectedStyle: z.enum(["bersih-praktis", "hangat-lokal", "visual-produk"]),
  acceptTerms: z.literal("on"),
});

export async function claimLandingPageReward(formData: FormData) {
  const parsed = rewardClaimFormSchema.safeParse({
    selectedStyle: formData.get("selectedStyle"),
    acceptTerms: formData.get("acceptTerms"),
  });
  if (!parsed.success) {
    redirect("/app/reward/landing-page?error=terms");
  }

  const repositories = await getRepositoriesForRequest();
  const view = await getRewardLandingPageView();
  if (!view.eligibility || !view.progress) {
    redirect("/app/reward/landing-page");
  }

  const missingWithoutTerms = view.eligibility.missingRequirements.filter(
    (item) => item !== "Syarat program disetujui",
  );
  if (!view.eligibility.eligible && missingWithoutTerms.length > 0) {
    redirect("/app/reward/landing-page?error=incomplete");
  }

  await repositories.rewards.saveClaim({
    rewardId: view.eligibility.rewardId,
    businessId: view.dashboard.business.id,
    selectedStyle: parsed.data.selectedStyle,
  });
  redirect("/app/reward/landing-page?status=diajukan");
}
