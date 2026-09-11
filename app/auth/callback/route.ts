import { NextResponse } from "next/server";
import { authClient, currentActor } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get("code"), token = url.searchParams.get("token_hash"), type = url.searchParams.get("type");
  try {
  if (code || (token && ["invite", "magiclink", "email"].includes(type ?? ""))) {
    const client = await authClient();
    const { error } = code ? await client.auth.exchangeCodeForSession(code) : await client.auth.verifyOtp({ token_hash: token!, type: type as "invite" | "magiclink" | "email" });
    if (!error) {
      const actor = await currentActor();
      const path = actor?.role === "expert" ? "/ahli" : actor && ["admin", "researcher"].includes(actor.role) ? "/admin" : "/mulai";
      return NextResponse.redirect(new URL(path, url.origin));
    }
  }
  } catch { /* Invalid/expired links and temporary Auth outages return to sign-in safely. */ }
  return NextResponse.redirect(new URL("/masuk?status=tautan-kedaluwarsa", url.origin));
}
