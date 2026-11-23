import { requireActor } from "@/lib/supabase/server";
import { json, readBody } from "@/lib/digital-checkup/http";
import { layananFailure } from "@/lib/layanan/http";
import { layananOverview } from "@/lib/layanan/overview";
import { submitServiceRequest } from "@/lib/layanan/service-requests";
import { requestInputSchema } from "@/lib/layanan/request-schema";

/** Ringkasan Layanan Pro (hak akses, pesanan, permintaan) untuk akun UMKM yang sedang masuk. */
export async function GET() {
  try {
    const actor = await requireActor(["umkm"]);
    return json(await layananOverview(actor.id));
  } catch (e) { return layananFailure(e); }
}

/** Kirim/perbarui permintaan layanan. Hak akses dicek ulang di server sebelum menulis. */
export async function POST(request: Request) {
  try {
    const actor = await requireActor(["umkm"]);
    const input = requestInputSchema.parse(await readBody(request));
    const result = await submitServiceRequest(actor.id, input);
    return json({ updated: result.updated, overview: await layananOverview(actor.id) });
  } catch (e) { return layananFailure(e); }
}
