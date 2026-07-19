"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/types/action";
import { loginSchema } from "./schema";

// ─── Sign In ───────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: "Input tidak valid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
    return { success: true, data: null };
  } catch (err) {
    console.error("[signIn]", err);
    return {
      success: false,
      error: "Email atau password salah.",
    };
  }
}
