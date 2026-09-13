import { timingSafeEqual } from "node:crypto";
import { processRecommendationJobs } from "@/lib/digital-checkup/jobs";
import { json } from "@/lib/digital-checkup/http";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const received = request.headers.get("authorization") ?? "";
  if (!secret || secret.length < 32) return json({ error: "Worker belum dikonfigurasi." }, 503);
  const expected = `Bearer ${secret}`;
  if (Buffer.byteLength(received) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return json({ error: "Akses ditolak." }, 401);
  try { return json(await processRecommendationJobs()); } catch { return json({ error: "Worker akan mencoba kembali." }, 503); }
}
