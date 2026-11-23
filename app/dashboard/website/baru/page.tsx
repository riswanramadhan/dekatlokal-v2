import Link from "next/link";
import { SiteBuilder } from "@/components/sites/builder/site-builder";
import { WebsiteTopbar } from "@/components/sites/builder/website-topbar";
import { latestBusinessProfile } from "@/lib/commerce/business";
import { requireSiteOwner } from "@/lib/sites/owner-guard";
import { prefillContent } from "@/lib/sites/prefill";
import { availableSlug, listOwnerSites } from "@/lib/sites/repository";
import { MAX_SITES_PER_OWNER } from "@/lib/sites/schema";
import { isTemplateCode, templateMeta } from "@/lib/sites/templates";

export const dynamic = "force-dynamic";

type Search = Promise<{ template?: string | string[]; kategori?: string | string[] }>;
const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function NewWebsitePage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams;
  const template = pick(query.template), kategori = pick(query.kategori);
  const next = `/dashboard/website/baru${template || kategori ? `?${new URLSearchParams({ ...(template ? { template } : {}), ...(kategori ? { kategori } : {}) })}` : ""}`;
  const actor = await requireSiteOwner(next);
  const sites = await listOwnerSites(actor.id).catch(() => []);
  if (sites.length >= MAX_SITES_PER_OWNER) return <main className="sb-page">
    <WebsiteTopbar back={{ href: "/dashboard/website", label: "Website saya" }} />
    <section className="dc-panel sb-empty"><h1>Batas website tercapai</h1><p>Satu akun bisa membuat maksimal {MAX_SITES_PER_OWNER} website. Hapus salah satu draf untuk membuat yang baru.</p><Link className="dc-primary" href="/dashboard/website">Kembali ke website saya</Link></section>
  </main>;

  const business = await latestBusinessProfile(actor.id).catch(() => null);
  const initial = prefillContent(business?.profile, { category: kategori, template: isTemplateCode(template) ? template : null });
  const slug = await availableSlug(initial.slug, initial.content.businessName, initial.content.city).catch(() => initial.slug);
  return <main className="sb-page">
    <WebsiteTopbar back={{ href: "/dashboard/website", label: "Website saya" }} />
    <div className="sb-wrap">
      <header className="sb-page-head">
        <span className="dc-badge">Template {templateMeta(initial.template).name}</span>
        <h1>Lengkapi websitemu</h1>
        <p>{business ? "Nama, kontak, dan kategori sudah diisi dari Digital Checkup-mu." : "Isi data usahamu. Selesaikan Digital Checkup supaya data ini terisi otomatis lain kali."} Produk & keunggulan di bawah masih contoh, ganti dengan milikmu.</p>
      </header>
      <SiteBuilder siteId={null} initial={{ ...initial, slug }} status="draft" />
    </div>
  </main>;
}
