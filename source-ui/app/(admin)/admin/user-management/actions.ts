"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/types/action";

// ─── Schema validasi ───────────────────────────────────────
const createUserSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

// ─── Create User ───────────────────────────────────────────────
export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<ActionResult> {
  // Validasi input dulu sebelum ke network
  const parsed = createUserSchema.safeParse({ email, password, name });
  if (!parsed.success) {
    return {
      success: false,
      error: "Input tidak valid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await auth.api.signUpEmail({
      body: parsed.data,
    });
    return { success: true, data: null };
  } catch (err) {
    // Jangan expose error internal: log di server, return pesan generik
    console.error("[createUser]", err);
    return {
      success: false,
      error: "Gagal membuat akun. Email mungkin sudah terdaftar.",
    };
  }
}
