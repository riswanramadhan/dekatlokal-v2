import { z } from "zod";
import { requireActor } from "@/lib/supabase/server";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
import { availableSlug, createSite, listOwnerSites, slugTaken } from "@/lib/sites/repository";
import { siteContentSchema, slugIssue, slugSchema } from "@/lib/sites/schema";
import { ownerView, ownerViews, publishOwnerSite } from "@/lib/sites/service";
import { TEMPLATE_CODES } from "@/lib/sites/templates";

/** Daftar website milik UMKM, atau cek ketersediaan alamat: ?slug=nama&except=<id>. */
export async function GET(request: Request) {
  try {
    const actor = await requireActor(["umkm"]);
    const url = new URL(request.url), slug = url.searchParams.get("slug");
    if (slug !== null) {
      const value = slug.trim().toLowerCase(), except = z.uuid().safeParse(url.searchParams.get("except")).data ?? null;
      const issue = slugIssue(value);
      if (issue) return json({ available: false, issue });
      if (await slugTaken(value, except)) return json({ available: false, issue: "Alamat ini sudah dipakai.", suggestion: await availableSlug(null, value, "", except) });
      return json({ available: true });
    }
    return json({ sites: await ownerViews(actor.id, await listOwnerSites(actor.id)) });
  } catch (e) { return failure(e); }
}

/** Membuat website baru dari template (opsional langsung terbit). */
export async function POST(request: Request) {
  try {
    const actor = await requireActor(["umkm"]);
    const input = z.object({
      template: z.enum(TEMPLATE_CODES),
      content: siteContentSchema,
      slug: slugSchema.nullable().default(null),
      publish: z.boolean().default(false),
    }).parse(await readBody(request));
    const site = await createSite(actor.id, input);
    if (input.publish) return json(await publishOwnerSite(actor.id, site), 201);
    return json({ ...(await ownerView(actor.id, site)), notice: "", leftovers: [] }, 201);
  } catch (e) { return failure(e); }
}
