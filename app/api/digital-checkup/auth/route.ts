import { z } from "zod";
import { authClient } from "@/lib/supabase/server";
import { finishSignIn } from "@/lib/digital-checkup/account";
import { AUTH_CALLBACK } from "@/lib/digital-checkup/site";
import { failure, json, readBody } from "@/lib/digital-checkup/http";

export async function POST(request: Request) {
  try {
    const input = z.object({ mode: z.enum(["password", "otp_request", "otp_verify", "google", "logout"]), email: z.string().email().max(254).optional(), password: z.string().max(256).optional(), token: z.string().regex(/^\d{6,10}$/).optional() }).parse(await readBody(request));
    const client = await authClient();
    const callback = AUTH_CALLBACK;
    if (input.mode === "logout") { await client.auth.signOut(); return json({ next: "/masuk" }); }
    if (input.mode === "google") {
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
      return json({ next: await finishSignIn() });
    }
    if (!input.password) throw new Error("Isi kata sandimu.");
    const { error } = await client.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error) throw new Error("Email atau kata sandi belum cocok. Coba periksa lagi.");
    return json({ next: await finishSignIn() });
  } catch (e) { return failure(e); }
}
