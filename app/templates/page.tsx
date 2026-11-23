import { MOTIFS } from "@/lib/sites/motifs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { TemplateThumb } from "@/components/sites/template-thumb";
import { PRODUCTS, priceLabel, TRIAL_DAYS } from "@/lib/commerce/catalog";
import { categoryLabel, isCategory, SITE_CATEGORIES, type SiteCategory } from "@/lib/sites/categories";
import { sampleContent } from "@/lib/sites/samples";
import { templatesForCategory, type TemplateInfo } from "@/lib/sites/templates";
import s from "./gallery.module.css";

type Search = Promise<{ kategori?: string | string[] }>;
const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const kategori = pick((await searchParams).kategori);
  const category = isCategory(kategori) ? kategori : null;
  const label = category ? categoryLabel(category) : null;
  const title = label ? `Template Website ${label} Gratis untuk UMKM` : "Template Website Gratis untuk UMKM";
  const description = label
    ? `Pilih template website ${label.toLowerCase()} yang modern dan siap jualan. Isi data usahamu, website langsung online gratis ${TRIAL_DAYS.site_publish} hari, lengkap dengan tombol pesan WhatsApp.`
    : `Template website modern untuk UMKM: kuliner, fashion, toko, jasa, kecantikan, kerajinan, pangan, dan kursus. Online dalam hitungan menit, gratis ${TRIAL_DAYS.site_publish} hari.`;
  const canonical = category ? `/templates?kategori=${category}` : "/templates";
  return { title, description, alternates: { canonical }, openGraph: { title: `${title} | DekatLokal`, description, url: canonical, type: "website", images: [{ url: "/landing/hero-umkm.webp", width: 900, height: 1032, alt: "Pemilik UMKM memakai ponsel" }] }, robots: { index: true, follow: true } };
}

const sitePrice = PRODUCTS.find((product) => product.code === "site_upgrade");
const aiPrice = PRODUCTS.find((product) => product.code === "ai_admin_monthly");

function TemplateCard({ template, category }: { template: TemplateInfo; category: SiteCategory }) {
  const content = { ...sampleContent(category), palette: template.defaultPalette };
  const query = `template=${template.code}&kategori=${category}`;
  return <li className={s.card}>
    <div className={s.thumbWrap}>
      <TemplateThumb template={template.code} content={content} />
      {/* Tautan menimpa pratinjau (bukan membungkusnya) agar tidak ada <a> bersarang. */}
      <Link href={`/templates/${template.code}/preview?kategori=${category}`} className={s.thumbLink} aria-label={`Lihat contoh template ${template.name}`} />
    </div>
    <div className={s.cardBody}>
      <div className={s.cardTitle}><h3>{template.name}</h3><span>Motif {MOTIFS[template.motif].label} · {MOTIFS[template.motif].origin}</span></div>
      <p>{template.summary}</p>
      <p className={s.fit}>Cocok untuk {template.bestFor.map(categoryLabel).join(", ")}</p>
      <div className={s.cardActions}>
        <Link className={s.primary} href={`/dashboard/website/baru?${query}`}>Pakai template ini <ArrowRight size={16} aria-hidden="true" /></Link>
        <Link className={s.secondary} href={`/templates/${template.code}/preview?kategori=${category}`}><Eye size={16} aria-hidden="true" /> Lihat contoh</Link>
      </div>
    </div>
  </li>;
}

export default async function TemplatesPage({ searchParams }: { searchParams: Search }) {
  const kategori = pick((await searchParams).kategori);
  const category = isCategory(kategori) ? kategori : null;
  const templates = templatesForCategory(category);
  return <div className={s.page}>
    <header className={s.top}>
      <Link href="/" className={s.logo}><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} loading="eager" /></Link>
      <nav aria-label="Menu"><Link href="/mulai">Digital Checkup</Link><Link href="/dashboard/website" className={s.topCta}>Website saya</Link></nav>
    </header>

    <main>
      <section className={s.hero}>
        <p className={s.eyebrow}>Gratis {TRIAL_DAYS.site_publish} hari · Tanpa coding · Siap di ponsel</p>
        <h1>{category ? <>Template website <em>{categoryLabel(category).toLowerCase()}</em> untuk usahamu</> : <>Website rapi untuk usahamu, <em>online hari ini</em></>}</h1>
        <p className={s.lead}>Pilih desain, isi data usaha (otomatis dari Digital Checkup), lalu terbitkan. Pelanggan bisa lihat menu, harga, jam buka, dan langsung pesan lewat WhatsApp.</p>
      </section>

      <nav className={s.filters} aria-label="Kategori usaha">
        <Link href="/templates" aria-current={!category ? "page" : undefined}>Semua</Link>
        {SITE_CATEGORIES.map((item) => <Link key={item.id} href={`/templates?kategori=${item.id}`} aria-current={category === item.id ? "page" : undefined}>{item.label}</Link>)}
      </nav>

      <section aria-labelledby="daftar-template">
        <h2 id="daftar-template" className={s.srOnly}>{category ? `Template untuk ${categoryLabel(category)}` : "Semua template"}</h2>
        <ul className={s.grid}>
          {templates.map((template) => <TemplateCard key={template.code} template={template} category={category ?? template.bestFor[0]} />)}
        </ul>
      </section>

      <section className={s.steps} aria-labelledby="cara-kerja">
        <h2 id="cara-kerja">Tiga langkah, selesai</h2>
        <ol>
          <li><strong>Pilih template</strong><span>Semua template dirancang untuk layar ponsel dan cepat dibuka.</span></li>
          <li><strong>Isi data usaha</strong><span>Nama, WhatsApp, dan media sosial terisi otomatis dari Digital Checkup-mu.</span></li>
          <li><strong>Terbitkan & bagikan</strong><span>Dapat alamat website sendiri. Bagikan ke WhatsApp, Instagram, dan Google Maps.</span></li>
        </ol>
      </section>

      <section className={s.pricing} aria-labelledby="harga">
        <h2 id="harga">Mulai gratis, bayar kalau sudah cocok</h2>
        <div className={s.priceGrid}>
          <article>
            <p className={s.eyebrow}>Website</p>
            <h3>Gratis {TRIAL_DAYS.site_publish} hari</h3>
            <p>Lanjutkan permanen {sitePrice ? `${priceLabel(sitePrice)} sekali bayar` : ""}. Website tetap bisa kamu ubah kapan saja.</p>
          </article>
          <article>
            <p className={s.eyebrow}>AI Admin</p>
            <h3>Coba {TRIAL_DAYS.ai_admin} hari</h3>
            <p>Asisten chat di websitemu yang menjawab harga, menu, dan jam buka pakai data usahamu, lalu mengarahkan pembeli ke WhatsApp. Setelahnya {aiPrice ? priceLabel(aiPrice) : ""}.</p>
          </article>
        </div>
        <Link className={s.primary} href="/dashboard/website/baru">Buat website gratis <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </main>

    <footer className={s.footer}>
      <p>DekatLokal · Teman digital untuk UMKM Indonesia</p>
      <p>Foto contoh adalah ilustrasi. Usaha di contoh template bersifat fiktif.</p>
    </footer>
  </div>;
}
