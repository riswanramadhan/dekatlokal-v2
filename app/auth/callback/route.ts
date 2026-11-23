import { NextResponse } from "next/server";
import { authClient } from "@/lib/supabase/server";
import { finishSignIn } from "@/lib/digital-checkup/account";
import { PRODUCTION_ORIGIN } from "@/lib/digital-checkup/site";

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get("code"), token = url.searchParams.get("token_hash"), type = url.searchParams.get("type");
  const next = url.searchParams.get("next");
  // Pengguna menekan "Batal" di layar Google, atau provider menolak: kembali ke /masuk dengan pesan yang jelas.
  if (url.searchParams.get("error")) {
    const back = new URL("/masuk", PRODUCTION_ORIGIN);
    back.searchParams.set("status", url.searchParams.get("error") === "access_denied" ? "google-batal" : "google-gagal");
    if (next) back.searchParams.set("next", next);
    return NextResponse.redirect(back);
  }
  try {
  if (code || (token && ["invite", "magiclink", "email"].includes(type ?? ""))) {
    const client = await authClient();
    const { error } = code ? await client.auth.exchangeCodeForSession(code) : await client.auth.verifyOtp({ token_hash: token!, type: type as "invite" | "magiclink" | "email" });
    if (!error) {
      return NextResponse.redirect(new URL(await finishSignIn(next), PRODUCTION_ORIGIN));
    }
  }
  } catch { /* Invalid/expired links and temporary Auth outages return to sign-in safely. */ }
  return NextResponse.redirect(new URL("/masuk?status=tautan-kedaluwarsa", PRODUCTION_ORIGIN));
}
