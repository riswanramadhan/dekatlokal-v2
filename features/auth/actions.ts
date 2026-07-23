"use server";

import { redirect } from "next/navigation";
import {
  emailFallbackInputSchema,
  phoneAuthInputSchema,
  signupInputSchema,
} from "@/domain/schemas";
import {
  getMockJourneySession,
  markAuthVerified,
  setAuthSession,
} from "@/infrastructure/storage/mock-session";
import { getPreAuthJourney } from "@/infrastructure/storage/mock-preauth-session";
import { trackMockAnalytics } from "@/lib/analytics/mock";

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function claimFromForm(formData: FormData) {
  const claimFromInput =
    optionalString(formData.get("claimToken")) ??
    optionalString(formData.get("claim"));
  if (claimFromInput) {
    return claimFromInput;
  }
  return (await getPreAuthJourney())?.claimToken;
}

export async function startWhatsappLogin(formData: FormData) {
  const parsed = phoneAuthInputSchema.safeParse({
    mode: "login",
    phone: formData.get("phone"),
    claimToken: await claimFromForm(formData),
  });

  if (!parsed.success) {
    redirect("/masuk?status=invalid");
  }

  await setAuthSession({
    mode: "login",
    phone: parsed.data.phone,
    claimToken: parsed.data.claimToken,
    verified: false,
  });
  redirect("/verifikasi?status=sent");
}

export async function startSignup(formData: FormData) {
  const parsed = signupInputSchema.safeParse({
    mode: "signup",
    ownerName: formData.get("ownerName"),
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
    claimToken: await claimFromForm(formData),
  });

  if (!parsed.success) {
    redirect("/daftar?status=invalid");
  }

  await setAuthSession({
    mode: "signup",
    ownerName: parsed.data.ownerName,
    businessName: parsed.data.businessName,
    phone: parsed.data.phone,
    claimToken: parsed.data.claimToken,
    verified: false,
  });
  if (parsed.data.claimToken) {
    trackMockAnalytics({ name: "preauth_to_signup" });
  }
  redirect("/verifikasi?status=sent");
}

export async function startEmailFallback(formData: FormData) {
  const parsed = emailFallbackInputSchema.safeParse({
    email: formData.get("email"),
    claimToken: await claimFromForm(formData),
  });

  if (!parsed.success) {
    redirect("/masuk?status=email-invalid");
  }

  await setAuthSession({
    mode: "login",
    email: parsed.data.email,
    claimToken: parsed.data.claimToken,
    verified: false,
  });
  redirect("/verifikasi?status=email-sent");
}

export async function startGoogleLogin(formData: FormData) {
  const claimToken = await claimFromForm(formData);
  await setAuthSession({
    mode: "login",
    claimToken,
    verified: false,
  });
  redirect("/verifikasi?status=google");
}

export async function verifyOtp(formData: FormData) {
  const code = formData.get("code");

  if (code === "000000") {
    redirect("/verifikasi?status=invalid");
  }

  if (code === "999999") {
    redirect("/verifikasi?status=expired");
  }

  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    redirect("/verifikasi?status=format");
  }

  await markAuthVerified();
  const [session, preAuthJourney] = await Promise.all([
    getMockJourneySession(),
    getPreAuthJourney(),
  ]);

  if (preAuthJourney || session.auth?.claimToken) {
    redirect("/hubungkan-checkup");
  }

  redirect("/app/beranda");
}

export async function resendOtp() {
  redirect("/verifikasi?status=resend");
}
