import "server-only";

import { cookies } from "next/headers";
import type { PreAuthJourney } from "@/domain/entities";
import {
  decodePreAuthJourney,
  encodePreAuthJourney,
} from "@/infrastructure/storage/preauth-session-codec";

export const PREAUTH_COOKIE = "dekatlokal_mock_preauth";

export async function getPreAuthJourney() {
  const cookieStore = await cookies();
  return decodePreAuthJourney(cookieStore.get(PREAUTH_COOKIE)?.value);
}

export async function setPreAuthJourney(journey: PreAuthJourney) {
  const cookieStore = await cookies();
  cookieStore.set(PREAUTH_COOKIE, encodePreAuthJourney(journey), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPreAuthJourney() {
  const cookieStore = await cookies();
  cookieStore.delete(PREAUTH_COOKIE);
}
