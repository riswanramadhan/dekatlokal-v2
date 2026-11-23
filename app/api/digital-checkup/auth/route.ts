import { z } from "zod";
import { authClient } from "@/lib/supabase/server";
import { finishSignIn } from "@/lib/digital-checkup/account";
import { googleAuthEnabled } from "@/lib/digital-checkup/auth-providers";
import { safeNextPath } from "@/lib/digital-checkup/next-path";
import { AUTH_CALLBACK } from "@/lib/digital-checkup/site";
import { clearExpertEntry } from "@/lib/digital-checkup/expert-access";
import { failure, json, readBody } from "@/lib/digital-checkup/http";

export async function POST(request: Request) {
  try {
    const input = z.object({ mode: z.enum(["password", "otp_request", "otp_verify", "google", "logout"]), email: z.string().email().max(254).optional(), password: z.string().max(256).optional(), token: z.string().regex(/^\d{6,10}$/).optional(), next: z.string().max(300).optional() }).parse(await readBody(request));
    const client = await authClient();
    const next = safeNextPath(input.next);
    // Tujuan setelah masuk ikut dibawa lewat tautan email/Google.
    const callback = next ? `${AUTH_CALLBACK}${AUTH_CALLBACK.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}` : AUTH_CALLBACK;
    if (input.mode === "logout") { await client.auth.signOut(); await clearExpertEntry(); return json({ next: "/masuk" }); }
    if (input.mode === "google") {
      if ((await googleAuthEnabled()) === false) throw new Error("Masuk dengan Google sedang disiapkan. Untuk sekarang pakai kode lewat email, ya.");
      const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback } });
      if (error || !data.url) throw new Error("Masuk Google belum dapat digunakan. Coba kode OTP lewat email."); return json({ next: data.url });
    }
    if (!input.email) throw new Error("Isi emailmu dulu.");
    if (input.mode === "otp_request") {
      const { error } = await client.auth.signInWithOtp({ email: input.email, options: { shouldCreateUser: true, emailRedirectTo: callback } });
      if (error) throw new Error("Kode belum bisa dikirim. Tunggu sebentar, lalu coba lagi atau gunakan Google.");
      return json({ message: "Cek kode di emailmu, termasuk folder spam. Jangan bagikan kode ini kepada siapa pun." });
    }
    if (input.mode === "otp_verify") {
      if (!input.token) throw new Error("Masukkan kode dari emailmu.");
      const { error } = await client.auth.verifyOtp({ email: input.email, token: input.token, type: "email" });
      if (error) throw new Error("Kode belum cocok atau sudah kedaluwarsa. Periksa lagi atau kirim kode baru.");
      return json({ next: await finishSignIn(next) });
    }
    if (!input.password) throw new Error("Isi kata sandimu.");
    const { error } = await client.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error) throw new Error("Email atau kata sandi belum cocok. Coba periksa lagi.");
    return json({ next: await finishSignIn(next) });
  } catch (e) { return failure(e); }
}
