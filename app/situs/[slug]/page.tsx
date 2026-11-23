import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InactiveSite } from "@/components/sites/inactive-site";
import { SiteChat } from "@/components/sites/site-chat";
import { SiteTemplate } from "@/components/sites/site-template";
import { siteAvailability } from "@/lib/sites/access";
import { defaultWelcome, orderLink } from "@/lib/sites/chat";
import { heroUrl } from "@/lib/sites/images";
import { publicSite } from "@/lib/sites/repository";
import { jsonLdString, siteDescription, siteJsonLd, siteTitle } from "@/lib/sites/seo";
import { sitePath } from "@/lib/sites/types";
import { supabaseConfigured } from "@/lib/supabase/server";

// Dirender saat pertama dikunjungi lalu di-cache 60 detik; builder memanggil revalidatePath setelah perubahan.
export const revalidate = 60;
export async function generateStaticParams() { return []; }

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  if (!supabaseConfigured()) return null;
  try {
    const data = await publicSite(slug);
    if (!data) return null;
    const availability = siteAvailability({ id: data.site.id, status: data.site.status, aiEnabled: data.site.ai.enabled }, data.entitlements);
    return availability.visibility === "draft" ? null : { ...data, availability };
  } catch (error) {
    console.error("[situs] gagal memuat website", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Halaman tidak ditemukan", robots: { index: false, follow: false } };
  const { content } = data.site;
  if (data.availability.visibility === "inactive") return { title: { absolute: `${content.businessName} — tidak aktif` }, robots: { index: false, follow: false } };
  const title = siteTitle(content), description = siteDescription(content), image = heroUrl(content.heroImage);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: sitePath(slug) },
    openGraph: { type: "website", locale: "id_ID", siteName: content.businessName, title, description, url: sitePath(slug), ...(image ? { images: [{ url: image, alt: content.businessName }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function PublicSitePage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { site, availability } = data;
  if (availability.visibility === "inactive") return <InactiveSite businessName={site.content.businessName} />;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(siteJsonLd(site.slug, site.content)) }} />
    <SiteTemplate template={site.templateCode} content={site.content} mode="live" />
    {availability.chat ? <SiteChat slug={site.slug} businessName={site.content.businessName} welcome={site.ai.welcome || defaultWelcome(site.content)} whatsappUrl={orderLink(site.content)} palette={site.content.palette} /> : null}
  </>;
}
