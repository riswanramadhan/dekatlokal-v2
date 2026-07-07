"use server";

import { redirect } from "next/navigation";
import {
  businessConfirmationInputSchema,
  learningPreferenceInputSchema,
  rhythmInputSchema,
} from "@/domain/schemas";
import {
  completeOnboarding,
  updateOnboardingDraft,
} from "@/infrastructure/storage/mock-session";

export async function saveBusinessConfirmation(formData: FormData) {
  const parsed = businessConfirmationInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    city: formData.get("city"),
    whatsapp: formData.get("whatsapp"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/onboarding?step=2&status=invalid");
  }

  await updateOnboardingDraft({ business: parsed.data });
  redirect("/onboarding?step=3");
}

export async function saveLearningPreference(formData: FormData) {
  const parsed = learningPreferenceInputSchema.safeParse({
    dailyMinutes: formData.get("dailyMinutes"),
    digitalComfort: formData.get("digitalComfort"),
    preferredFormats: formData.getAll("preferredFormats"),
    fontScale: formData.get("fontScale"),
  });

  if (!parsed.success) {
    redirect("/onboarding?step=3&status=invalid");
  }

  await updateOnboardingDraft({ learningPreference: parsed.data });
  redirect("/onboarding?step=4");
}

export async function saveRhythm(formData: FormData) {
  const parsed = rhythmInputSchema.safeParse({
    preferredDaypart: formData.get("preferredDaypart"),
    remindersEnabled: formData.get("remindersEnabled") === "on",
  });

  if (!parsed.success) {
    redirect("/onboarding?step=4&status=invalid");
  }

  await updateOnboardingDraft({ rhythm: parsed.data });
  redirect("/onboarding?step=5");
}

export async function finishOnboarding() {
  await completeOnboarding();
  redirect("/app/beranda");
}
