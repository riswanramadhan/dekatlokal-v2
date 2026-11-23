import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { OrderButton } from "@/components/commerce/order-button";
import { AiAdminPanel } from "@/components/sites/builder/ai-admin-panel";
import { ShareCard } from "@/components/sites/builder/share-card";
import { SiteActions } from "@/components/sites/builder/site-actions";
import { SiteBuilder } from "@/components/sites/builder/site-builder";
import { WebsiteTopbar } from "@/components/sites/builder/website-topbar";
import { PRODUCTS, priceLabel, TRIAL_DAYS } from "@/lib/commerce/catalog";
import { aiStage } from "@/lib/sites/access";
import { defaultWelcome } from "@/lib/sites/chat";
import { requireSiteOwner } from "@/lib/sites/owner-guard";
import { ownerSite } from "@/lib/sites/repository";
import { ownerView } from "@/lib/sites/service";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type Search = Promise<{ tab?: string; terbit?: string; tersimpan?: string }>;
const sitePrice = PRODUCTS.find((product) => product.code === "site_upgrade")!;
const aiPrice = PRODUCTS.find((product) => product.code === "ai_admin_monthly")!;

export default async function EditWebsitePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { tab, terbit, tersimpan } = await searchParams;
  const actor = await requireSiteOwner(`/dashboard/website/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const site = await ownerSite(actor.id, id).catch(() => null);
  if (!site) notFound();
  const { availability, path } = await ownerView(actor.id, site);
  const activeTab = tab === "ai" ? "ai" : "isi";
  const live = availability.visibility === "live";
  return <main className="sb-page">
    <WebsiteTopbar back={{ href: "/dashboard/website", label: "Website saya" }} />
    <div className="sb-wrap">
      <header className="sb-page-head sb-page-head-row">
        <div>
          <span className={`sb-status is-${availability.visibility}`}>{availability.label}</span>
          <h1>{site.content.businessName}</h1>
        </div>
        <Link className="dc-secondary" href={`/dashboard/website/${site.id}/pratinjau`} target="_blank"><Eye size={16} aria-hidden="true" />Pratinjau penuh</Link>
      </header>

      {terbit && site.status === "published" ? <ShareCard path={path} businessName={site.content.businessName} live={live} /> : null}
      {tersimpan && site.status === "draft" ? <p className="dc-note" role="status">Draf tersimpan. Terbitkan kapan saja untuk mulai masa gratis {TRIAL_DAYS.site_publish} hari.</p> : null}
      {!terbit && site.status === "published" ? <ShareCard path={path} businessName={site.content.businessName} live={live} title="Alamat websitemu" /> : null}

      {availability.visibility === "inactive" ? <div className="dc-note sb-upgrade" role="status">
        <strong>Website tidak tampil untuk pelanggan karena masa gratis sudah selesai.</strong>
        <p>Aktifkan permanen {priceLabel(sitePrice)} sekali bayar. Setelah admin DekatLokal mengonfirmasi pembayaran, website langsung tayang lagi.</p>
        <OrderButton product="site_upgrade" resourceId={site.id} label={`Upgrade ${priceLabel(sitePrice)}`} />
      </div> : live && !availability.publish.paid ? <div className="sb-upgrade-inline">
        <p>Masa gratis tersisa {availability.publish.daysLeft ?? 0} hari. Upgrade sekali bayar supaya website tetap online.</p>
        <OrderButton product="site_upgrade" resourceId={site.id} label={`Upgrade ${priceLabel(sitePrice)}`} className="dc-secondary" />
      </div> : null}

      <nav className="sb-tabs" aria-label="Bagian website">
        <Link href={`/dashboard/website/${site.id}`} aria-current={activeTab === "isi" ? "page" : undefined}>Isi & tampilan</Link>
        <Link href={`/dashboard/website/${site.id}?tab=ai`} aria-current={activeTab === "ai" ? "page" : undefined}>AI Admin & kotak masuk</Link>
      </nav>

      {activeTab === "isi"
        ? <SiteBuilder siteId={site.id} initial={{ template: site.templateCode, content: site.content, slug: site.slug }} status={site.status} />
        : <AiAdminPanel siteId={site.id} path={path} live={live} stage={aiStage(availability.ai)} access={availability.ai} ai={site.ai} defaultWelcome={defaultWelcome(site.content)} priceLabel={priceLabel(aiPrice)} />}

      <SiteActions siteId={site.id} businessName={site.content.businessName} published={site.status === "published"} />
    </div>
  </main>;
}
