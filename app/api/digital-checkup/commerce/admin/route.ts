import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
import { activateOrder, cancelOrder, listAllOrders } from "@/lib/commerce/orders";

/** Daftar pesanan untuk admin (hanya peran admin, bukan peneliti). */
export async function GET(request: Request) {
  try {
    await requireActor(["admin"]);
    const status = z.enum(["pending", "active", "cancelled", "all"]).catch("all").parse(new URL(request.url).searchParams.get("status") ?? "all");
    return json({ orders: await listAllOrders(status) });
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor(["admin"]);
    const input = z.object({ action: z.enum(["activate", "cancel"]), orderId: z.uuid(), note: z.string().trim().max(1000).default("") }).parse(await readBody(request));
    if (input.action === "activate") await activateOrder(actor.id, input.orderId, input.note);
    else await cancelOrder(input.orderId, input.note);
    return json({ ok: true });
  } catch (e) { return failure(e); }
}
