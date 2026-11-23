import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
import { PRODUCTS, TRIAL_DAYS, type Feature } from "@/lib/commerce/catalog";
import { accessFrom, listEntitlements, startTrial } from "@/lib/commerce/entitlements";
import { createOrder, listOrders } from "@/lib/commerce/orders";
import { latestBusinessProfile } from "@/lib/commerce/business";

const FEATURES = ["site_publish", "ai_admin", "checkup_pro", "gbp", "website_care"] as const;

/** Ringkasan produk, hak akses, dan pesanan milik akun UMKM yang sedang masuk. */
export async function GET() {
  try {
    const actor = await requireActor(["umkm"]);
    const [entitlements, orders] = await Promise.all([listEntitlements(actor.id), listOrders(actor.id)]);
    const access = Object.fromEntries(FEATURES.map((feature) => [feature, accessFrom(entitlements, feature)]));
    return json({ products: PRODUCTS, trials: TRIAL_DAYS, access, entitlements, orders });
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor(["umkm"]);
    const input = z.discriminatedUnion("action", [
      z.object({ action: z.literal("order"), product: z.enum(["site_upgrade", "ai_admin_monthly", "checkup_pro", "gbp_optimization", "website_care_monthly"]), resourceId: z.uuid().nullable().default(null), note: z.string().trim().max(1000).default("") }),
      z.object({ action: z.literal("trial"), feature: z.enum(["site_publish", "ai_admin"]), resourceId: z.uuid().nullable().default(null) }),
    ]).parse(await readBody(request));
    if (input.action === "trial") return json({ access: await startTrial(actor.id, input.feature as Feature, input.resourceId) });
    const business = await latestBusinessProfile(actor.id);
    return json(await createOrder(actor.id, input.product, input.resourceId, input.note, business?.profile.businessName ?? ""));
  } catch (e) { return failure(e); }
}
