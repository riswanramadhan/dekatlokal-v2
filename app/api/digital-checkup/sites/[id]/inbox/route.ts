import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json } from "@/lib/digital-checkup/http";
import { conversationDetail, listConversations } from "@/lib/sites/repository";
import { isValidSessionId } from "@/lib/sites/chat";

/** Kotak masuk AI Admin: daftar percakapan, atau detail satu percakapan (?session=…). Hanya pemilik website. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireActor(["umkm"]);
    const id = z.uuid("Website tidak ditemukan.").parse((await params).id);
    const session = new URL(request.url).searchParams.get("session");
    if (session !== null) {
      if (!isValidSessionId(session)) throw new Error("Percakapan tidak ditemukan.");
      return json({ conversation: await conversationDetail(actor.id, id, session) });
    }
    return json({ conversations: await listConversations(actor.id, id) });
  } catch (e) { return failure(e); }
}
