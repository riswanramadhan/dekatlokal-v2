import "server-only";
import { failure, json } from "@/lib/digital-checkup/http";
import { AccessRequiredError } from "./gating";

/** Seperti failure(), tetapi hak akses yang belum aktif dikembalikan sebagai 403. */
export function layananFailure(error: unknown) {
  if (error instanceof AccessRequiredError) return json({ error: error.message, code: "ACCESS_REQUIRED" }, 403);
  return failure(error);
}
