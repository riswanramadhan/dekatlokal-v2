import Link from "next/link";
import { ArrowRight, Bot, ExternalLink, LayoutTemplate, Pencil } from "lucide-react";
import { OrderButton } from "@/components/commerce/order-button";
import { WebsiteTopbar } from "@/components/sites/builder/website-topbar";
import { TemplateThumb } from "@/components/sites/template-thumb";
import { PRODUCTS, priceLabel, TRIAL_DAYS } from "@/lib/commerce/catalog";
import { aiStage } from "@/lib/sites/access";
import { requireSiteOwner } from "@/lib/sites/owner-guard";
import { listOwnerSites } from "@/lib/sites/repository";
import { MAX_SITES_PER_OWNER } from "@/lib/sites/schema";
import { ownerViews, type OwnerSiteView } from "@/lib/sites/service";

export const dynamic = "force-dynamic";

const sitePrice = PRODUCTS.find((product) => product.code === "site_upgrade")!;

function SiteCard({ view }: { view: OwnerSiteView }) {
  const { site, availability, path } = view;
  const stage = aiStage(availability.ai);
  return <article className="sb-site-card">
    <div className="sb-site-thumb"><TemplateThumb template={site.templateCode} content={site.content} /><Link href={`/dashboard/website/${site.id}`} aria-label={`Edit ${site.content.businessName}`} /></div>
    <div className="sb-site-body">
      <div className="sb-site-title">
        <h2>{site.content.businessName}</h2>
        <span className={`sb-status is-${availability.visibility}`}>{availability.label}</span>
      </div>
      <p className="sb-site-url">{path}</p>
      {availability.visibility === "inactive" ? <div className="dc-note sb-upgrade">
        <strong>Masa gratis selesai, website tidak tampil untuk pelanggan.</strong>
        <p>Aktifkan permanen {priceLabel(sitePrice)} sekali bayar. Isi websitemu tetap aman.</p>
        <OrderButton product="site_upgrade" resourceId={site.id} label={`Upgrade ${priceLabel(sitePrice)}`} />
      </div> : null}
      {availability.visibility === "live" && !availability.publish.paid ? <div className="sb-upgrade-inline">
        <p>Gratis {availability.publish.daysLeft ?? 0} hari lagi. Jadikan permanen supaya tidak berhenti tayang.</p>
        <OrderButton product="site_upgrade" resourceId={site.id} label={`Upgrade ${priceLabel(sitePrice)}`} className="dc-secondary" />
      </div> : null}
      <div className="sb-site-actions">
        <Link className="dc-primary" href={`/dashboard/website/${site.id}`}><Pencil size={16} aria-hidden="true" />Edit website</Link>
        <Link className="dc-secondary" href={`/dashboard/website/${site.id}?tab=ai`}><Bot size={16} aria-hidden="true" />AI Admin{stage === "trial" ? " · coba" : stage === "paid" ? " · aktif" : ""}</Link>
        {availability.visibility === "live" ? <a className="dc-text-button" href={path} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} aria-hidden="true" /> Lihat website</a> : null}
      </div>
    </div>
  </article>;
}

export default async function WebsiteDashboardPage() {
  const actor = await requireSiteOwner("/dashboard/website");
  let views: OwnerSiteView[] = [], error = "";
  try { views = await ownerViews(actor.id, await listOwnerSites(actor.id)); }
  catch (e) { error = e instanceof Error ? e.message : "Data website belum bisa dimuat."; }
  const canCreate = views.length < MAX_SITES_PER_OWNER;
  return <main className="sb-page">
    <WebsiteTopbar />
    <div className="sb-wrap">
      <section className="sb-hero">
        <div>
          <span className="dc-badge">Gratis {TRIAL_DAYS.site_publish} hari · AI Admin coba {TRIAL_DAYS.ai_admin} hari</span>
          <h1>{views.length ? "Website usahamu" : "Bikin website usaha, gratis."}</h1>
          <p>Pilih template, isi otomatis dari Digital Checkup, lalu terbitkan. Pelanggan bisa lihat produk & harga dan langsung pesan lewat WhatsApp.</p>
        </div>
        {canCreate ? <div className="sb-hero-actions">
          <Link className="dc-primary" href="/dashboard/website/baru">Buat website baru <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link className="dc-secondary" href="/templates"><LayoutTemplate size={16} aria-hidden="true" />Lihat semua template</Link>
        </div> : <p className="dc-note">Kamu sudah punya {MAX_SITES_PER_OWNER} website (batas maksimal). Hapus salah satu draf untuk membuat yang baru.</p>}
      </section>
      {error ? <p className="dc-error" role="alert">{error}</p> : null}
      {views.length ? <div className="sb-site-list">{views.map((view) => <SiteCard key={view.site.id} view={view} />)}</div> : !error ? <section className="dc-panel sb-empty">
        <h2>Belum ada website</h2>
        <p>Mulai dari template yang paling cocok dengan usahamu. Kamu bisa mengganti template dan warna kapan saja.</p>
        <Link className="dc-primary" href="/dashboard/website/baru">Mulai sekarang <ArrowRight size={16} aria-hidden="true" /></Link>
      </section> : null}
    </div>
  </main>;
}
