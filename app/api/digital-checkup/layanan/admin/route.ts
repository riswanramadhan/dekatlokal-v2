import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
import { listAllServiceRequests, updateServiceRequest } from "@/lib/layanan/service-requests";
import { REQUEST_KINDS, REQUEST_STATUSES } from "@/lib/layanan/request-schema";

/** Daftar permintaan layanan untuk admin (hanya peran admin). */
export async function GET(request: Request) {
  try {
    await requireActor(["admin"]);
    const params = new URL(request.url).searchParams;
    const kind = z.enum([...REQUEST_KINDS, "all"]).catch("all").parse(params.get("kind") ?? "all");
    const status = z.enum([...REQUEST_STATUSES, "open", "all"]).catch("open").parse(params.get("status") ?? "open");
    return json({ requests: await listAllServiceRequests({ kind, status }) });
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    await requireActor(["admin"]);
    const input = z.object({ id: z.uuid(), status: z.enum(REQUEST_STATUSES), note: z.string().trim().max(2000).default("") }).parse(await readBody(request));
    await updateServiceRequest(input.id, input.status, input.note);
    return json({ ok: true });
  } catch (e) { return failure(e); }
}
