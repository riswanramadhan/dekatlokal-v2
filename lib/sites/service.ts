import "server-only";
// Alur pemilik website (dipakai API & halaman dashboard). Akses data lewat repository; hak akses lewat lib/commerce.
import { revalidatePath } from "next/cache";
import { listEntitlements, startTrial } from "@/lib/commerce/entitlements";
import { siteAvailability, type SiteAvailability } from "./access";
import { publishIssues } from "./schema";
import { sampleLeftovers } from "./samples";
import { setSiteStatus } from "./repository";
import { sitePath, type SiteRecord } from "./types";

export interface OwnerSiteView {
  site: SiteRecord;
  availability: SiteAvailability;
  path: string;
}

export async function ownerViews(ownerId: string, sites: SiteRecord[]): Promise<OwnerSiteView[]> {
  const entitlements = await listEntitlements(ownerId);
  return sites.map((site) => ({ site, availability: siteAvailability({ id: site.id, status: site.status, aiEnabled: site.ai.enabled }, entitlements), path: sitePath(site.slug) }));
}
export const ownerView = async (ownerId: string, site: SiteRecord) => (await ownerViews(ownerId, [site]))[0];

/** Segarkan cache halaman publik setelah isi/status berubah. */
export function refreshPublic(...slugs: (string | null | undefined)[]) {
  for (const slug of new Set(slugs.filter(Boolean) as string[])) {
    try { revalidatePath(sitePath(slug)); } catch { /* di luar konteks Next (test) */ }
  }
}

/** Terbitkan website. Terbit pertama kali memulai trial gratis 14 hari (sekali per akun). */
export async function publishOwnerSite(ownerId: string, site: SiteRecord) {
  const issues = publishIssues(site.content);
  if (issues.length) throw new Error(issues.join(" "));
  const { site: published, firstPublish } = await setSiteStatus(ownerId, site.id, "published");
  let notice = "";
  if (firstPublish) {
    try { await startTrial(ownerId, "site_publish", published.id); }
    catch (error) { notice = error instanceof Error ? error.message : "Masa gratis belum bisa dimulai."; }
  }
  refreshPublic(published.slug);
  const view = await ownerView(ownerId, published);
  if (view.availability.visibility === "inactive" && !notice) notice = "Website sudah terbit, tetapi masa gratis akunmu sudah terpakai. Upgrade supaya website tampil untuk pelanggan.";
  return { ...view, notice, leftovers: sampleLeftovers(published.content) };
}
