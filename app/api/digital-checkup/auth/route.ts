import { z } from "zod";
import { authClient, currentActor } from "@/lib/supabase/server";
import { failure, json, readBody } from "@/lib/digital-checkup/http";

export async function POST(request: Request) {
  try {
    const input = z.object({ mode: z.enum(["password", "magic", "google", "logout"]), email: z.string().email().max(254).optional(), password: z.string().max(256).optional() }).parse(await readBody(request));
    const client = await authClient();
    const callback = `${new URL(request.url).origin}/auth/callback`;
    if (input.mode === "logout") { await client.auth.signOut(); return json({ next: "/masuk" }); }
    if (input.mode === "google") {
      const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback } });
      if (error || !data.url) throw new Error("Masuk Google belum dapat digunakan. Coba email dan kata sandi."); return json({ next: data.url });
    }
    if (!input.email) throw new Error("Isi emailmu dulu.");
    if (input.mode === "magic") {
      await client.auth.signInWithOtp({ email: input.email, options: { shouldCreateUser: false, emailRedirectTo: callback } });
      return json({ message: "Kalau emailmu terdaftar, tautan masuk akan dikirim. Cek juga folder spam." });
    }
    if (!input.password) throw new Error("Isi kata sandimu.");
    const { error } = await client.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error) throw new Error("Email atau kata sandi belum cocok. Coba periksa lagi.");
    const actor = await currentActor();
    return json({ next: actor?.role === "expert" ? "/ahli" : actor && ["admin", "researcher"].includes(actor.role) ? "/admin" : "/mulai" });
  } catch (e) { return failure(e); }
}
