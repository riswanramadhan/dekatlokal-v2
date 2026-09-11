import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
export function serviceClient() {
  if (!supabaseConfigured()) throw new Error("Penyimpanan belum terhubung. Coba lagi setelah tim menyelesaikan koneksinya.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function authClient() {
  const jar = await cookies();
  if (!supabaseConfigured()) throw new Error("Koneksi akun belum tersedia. Coba lagi sebentar.");
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) { try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server Component refresh is handled by proxy. */ } },
    },
  });
}
export async function currentActor() {
  const client = await authClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await client.from("dc_profiles").select("role,display_name").eq("user_id", user.id).maybeSingle();
  return { id: user.id, role: (profile?.role ?? "umkm") as "umkm" | "expert" | "admin" | "researcher", name: String(profile?.display_name ?? "") };
}
export async function requireActor(roles: string[]) {
  const actor = await currentActor();
  if (!actor || !roles.includes(actor.role)) throw new Error("Akses tidak diizinkan. Masuk dengan akun yang sesuai.");
  return actor;
}
