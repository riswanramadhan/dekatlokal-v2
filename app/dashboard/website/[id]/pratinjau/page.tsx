import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteTemplate } from "@/components/sites/site-template";
import { requireSiteOwner } from "@/lib/sites/owner-guard";
import { ownerSite } from "@/lib/sites/repository";

export const dynamic = "force-dynamic";

/** Pratinjau penuh khusus pemilik (termasuk draf yang belum publik). */
export default async function OwnerPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireSiteOwner(`/dashboard/website/${id}/pratinjau`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const site = await ownerSite(actor.id, id).catch(() => null);
  if (!site) notFound();
  return <>
    <div className="sb-owner-bar" role="status">
      <span>{site.status === "draft" ? "Pratinjau draf · belum bisa dilihat pelanggan" : "Pratinjau pemilik"}</span>
      <Link href={`/dashboard/website/${site.id}`}>Kembali mengedit</Link>
    </div>
    <SiteTemplate template={site.templateCode} content={site.content} mode="preview" />
  </>;
}
