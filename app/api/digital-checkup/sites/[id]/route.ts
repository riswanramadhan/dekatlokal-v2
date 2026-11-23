import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json, readBody, sameOrigin } from "@/lib/digital-checkup/http";
import { deleteSite, ownerSite, setSiteStatus, updateSite } from "@/lib/sites/repository";
import { siteAiSchema, siteContentSchema, slugSchema } from "@/lib/sites/schema";
import { ownerView, publishOwnerSite, refreshPublic } from "@/lib/sites/service";
import { TEMPLATE_CODES } from "@/lib/sites/templates";

type Context = { params: Promise<{ id: string }> };
const siteId = async (context: Context) => z.uuid("Website tidak ditemukan.").parse((await context.params).id);

export async function GET(_request: Request, context: Context) {
  try {
    const actor = await requireActor(["umkm"]);
    return json(await ownerView(actor.id, await ownerSite(actor.id, await siteId(context))));
  } catch (e) { return failure(e); }
}

/** Simpan perubahan isi, template, alamat, atau pengaturan AI Admin. */
export async function PATCH(request: Request, context: Context) {
  try {
    const actor = await requireActor(["umkm"]);
    const id = await siteId(context);
    const patch = z.object({
      template: z.enum(TEMPLATE_CODES).optional(),
      content: siteContentSchema.optional(),
      slug: slugSchema.optional(),
      ai: siteAiSchema.optional(),
    }).refine((value) => Object.values(value).some((item) => item !== undefined), "Tidak ada perubahan.").parse(await readBody(request));
    const { site, previousSlug } = await updateSite(actor.id, id, patch);
    refreshPublic(site.slug, previousSlug);
    return json(await ownerView(actor.id, site));
  } catch (e) { return failure(e); }
}

/** Terbitkan / sembunyikan website. */
export async function POST(request: Request, context: Context) {
  try {
    const actor = await requireActor(["umkm"]);
    const id = await siteId(context);
    const { action } = z.object({ action: z.enum(["publish", "unpublish"]) }).parse(await readBody(request));
    const site = await ownerSite(actor.id, id);
    if (action === "publish") return json(await publishOwnerSite(actor.id, site));
    const { site: hidden } = await setSiteStatus(actor.id, id, "draft");
    refreshPublic(hidden.slug);
    return json({ ...(await ownerView(actor.id, hidden)), notice: "Website disembunyikan. Pelanggan tidak bisa membukanya sampai kamu terbitkan lagi.", leftovers: [] });
  } catch (e) { return failure(e); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const actor = await requireActor(["umkm"]);
    const removed = await deleteSite(actor.id, await siteId(context));
    refreshPublic(removed.slug);
    return json({ ok: true });
  } catch (e) { return failure(e); }
}
