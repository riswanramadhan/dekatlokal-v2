// Potongan bersama untuk semua template website. Tanpa hook → bisa dirender di server (situs publik)
// maupun di client (pratinjau langsung di builder).
import Image from "next/image";
import type { ReactNode } from "react";
import { categoryLabel, type SiteCategory } from "@/lib/sites/categories";
import { resolveHero } from "@/lib/sites/images";
import { motifStyle, type MotifId } from "@/lib/sites/motifs";
import { waLink, type Product, type SiteContent } from "@/lib/sites/schema";
import { OpenNow } from "./open-status";
import { AddToOrder, OrderBar, OrderProvider } from "./order-cart";
import s from "./parts.module.css";

export type TemplateMode = "live" | "preview" | "thumb";
export interface TemplateProps {
  content: SiteContent;
  mode: TemplateMode;
}

export const cx = (...values: (string | false | null | undefined)[]) => values.filter(Boolean).join(" ");
export const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Tautan pesan WhatsApp; tanpa nomor (contoh galeri) mengarah ke bagian kontak. */
export function orderHref(content: SiteContent, item?: string) {
  return waLink(content.whatsapp, item ? `Halo ${content.businessName}, saya mau pesan ${item}. Apakah tersedia?` : `Halo ${content.businessName}, saya lihat website kalian dan mau pesan.`) ?? "#kontak";
}
export const orderProps = (content: SiteContent, item?: string) => {
  const href = orderHref(content, item);
  return href.startsWith("#") ? { href } : { href, ...external };
};

export function mapHref(content: SiteContent) {
  if (content.googleMaps) return content.googleMaps;
  const query = [content.address, content.city].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "U";
/** id anker hanya di website/pratinjau penuh; kartu galeri (thumb) tanpa id agar tidak ganda. */
export const anchor = (mode: TemplateMode, id: string) => (mode === "thumb" ? {} : { id });
export const pad = (index: number) => String(index + 1).padStart(2, "0");
export const ctaLabel = (content: SiteContent) => content.cta || "Pesan lewat WhatsApp";

/** Judul bagian yang menyesuaikan kategori usaha. */
export function sectionCopy(category: SiteCategory) {
  const products: Record<SiteCategory, [string, string]> = {
    kuliner: ["Menu", "Yang paling sering dipesan"],
    fashion: ["Katalog", "Koleksi pilihan"],
    toko: ["Produk", "Belanja kebutuhan harian"],
    jasa: ["Paket & harga", "Pilih layanan yang kamu butuhkan"],
    kecantikan: ["Produk & perawatan", "Pilihan untuk merawat diri"],
    kreatif: ["Koleksi", "Dibuat dengan tangan"],
    pangan: ["Produk", "Segar dari sumbernya"],
    pendidikan: ["Program", "Pilih kelas yang pas"],
  };
  const [productsLabel, productsTitle] = products[category];
  return { productsLabel, productsTitle, servicesLabel: category === "jasa" ? "Layanan" : "Kenapa kami", categoryLabel: categoryLabel(category) };
}

export function HeroImage({ content, mode, className, sizes = "(min-width: 900px) 50vw, 100vw" }: { content: SiteContent; mode: TemplateMode; className?: string; sizes?: string }) {
  const hero = resolveHero(content.heroImage, content.businessName);
  if (!hero) return null;
  // Foto hero ada di atas lipatan: langsung dimuat kecuali di kartu galeri (banyak pratinjau sekaligus).
  const shared = { fill: true, className, sizes: mode === "thumb" ? "360px" : sizes, loading: mode === "thumb" ? ("lazy" as const) : ("eager" as const), fetchPriority: mode === "live" ? ("high" as const) : undefined };
  return hero.kind === "bundled" ? <Image src={hero.image.src} alt={hero.image.alt} {...shared} /> : <Image src={hero.src} alt={hero.alt} unoptimized {...shared} />;
}

export function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.07a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.89.9-2.99-.2-.31a8.14 8.14 0 1 1 6.8 3.72Zm4.46-6.1c-.24-.12-1.45-.72-1.67-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.16-.29.18-.53.06a6.66 6.66 0 0 1-3.32-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.85 2.04 4.77 4.77 0 0 0 1 2.53 10.9 10.9 0 0 0 4.18 3.69c1.55.67 2.16.73 2.94.61.47-.07 1.45-.59 1.65-1.17.2-.57.2-1.06.14-1.17-.06-.1-.22-.16-.46-.28Z" /></svg>;
}

/** Tombol pesan yang selalu terlihat di bawah layar; berubah jadi ringkasan pesanan saat pengunjung memilih produk. */
export function StickyOrder({ content, mode, className }: { content: SiteContent; mode: TemplateMode; className?: string }) {
  if (mode === "thumb") return null;
  return <OrderBar content={content} defaultHref={orderHref(content)} defaultLabel={ctaLabel(content)} className={className} icon={<WhatsAppGlyph size={20} />} />;
}

/** Tombol "Pesan" di kartu produk → masuk daftar pesanan WhatsApp (khas DekatLokal). */
export function ProductOrder({ content, item, className, label, children }: { content: SiteContent; item: Product; className?: string; label?: string; children: ReactNode }) {
  return <AddToOrder item={item} className={className} label={label ?? `Tambah ${item.name} ke pesanan`} fallbackHref={orderHref(content, item.name)}>{children}</AddToOrder>;
}

/** Pita motif Nusantara (kawung, tumpal, parang, …) yang warnanya mengikuti palet. Dekoratif. */
export function MotifBand({ motif, className, scale = 1, tall = false }: { motif: MotifId; className?: string; scale?: number; tall?: boolean }) {
  return <div className={cx(s.motifBand, tall && s.motifTall, className)} style={motifStyle(motif, scale)} aria-hidden="true" />;
}

/** Bidang motif tipis untuk latar (hero, kartu). Dekoratif. */
export function MotifField({ motif, className, scale = 1 }: { motif: MotifId; className?: string; scale?: number }) {
  return <div className={cx(s.motifField, className)} style={motifStyle(motif, scale)} aria-hidden="true" />;
}

/** Lencana "UMKM lokal · Kota" + status buka sekarang — identitas website DekatLokal. */
export function LocalBadge({ content, mode, className }: { content: SiteContent; mode: TemplateMode; className?: string }) {
  return <div className={cx(s.localRow, className)}>
    <span className={s.localBadge}>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.1 6.1 12.2 6.4 12.5a.8.8 0 0 0 1.2 0C12.9 21.2 19 14.1 19 9a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z" /></svg>
      UMKM lokal{content.city ? ` · ${content.city}` : ""}
    </span>
    {mode === "thumb" ? null : <OpenNow hours={content.hours} />}
  </div>;
}

export function HoursRows({ content, className }: { content: SiteContent; className?: string }) {
  if (!content.hours.length) return <p className={className}>Jam buka belum dicantumkan. Tanyakan lewat WhatsApp, ya.</p>;
  return <dl className={className}>{content.hours.map((row) => <div key={`${row.days}-${row.time}`}><dt>{row.days}</dt><dd>{row.time}</dd></div>)}</dl>;
}

export function Socials({ content, className }: { content: SiteContent; className?: string }) {
  if (!content.instagram && !content.tiktok) return null;
  return <ul className={className} aria-label="Media sosial">
    {content.instagram ? <li><a href={`https://instagram.com/${content.instagram}`} {...external}>Instagram @{content.instagram}</a></li> : null}
    {content.tiktok ? <li><a href={`https://www.tiktok.com/@${content.tiktok}`} {...external}>TikTok @{content.tiktok}</a></li> : null}
  </ul>;
}

export function FaqList({ content, className, summaryClassName }: { content: SiteContent; className?: string; summaryClassName?: string }) {
  return <div className={className}>{content.faq.map((item) => <details key={item.question}><summary className={summaryClassName}>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}

export function SiteCredit({ mode, className }: { mode: TemplateMode; className?: string }) {
  if (mode === "thumb") return null;
  return <p className={cx(s.credit, className)}>
    <span className={s.creditMark} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.1 6.1 12.2 6.4 12.5a.8.8 0 0 0 1.2 0C12.9 21.2 19 14.1 19 9a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z" /></svg>
    </span>
    Bagian dari jaringan UMKM lokal <a href="https://dekatlokal.com" target="_blank" rel="noopener">DekatLokal</a> · <a href="/templates">Buat website gratis</a>
  </p>;
}

/** Bungkus akar setiap template: palet, font, dan penanda mode (untuk gaya pratinjau). */
export function TemplateRoot({ className, fonts, style, mode, children }: { className: string; fonts: string; style: Record<string, string>; mode: TemplateMode; children: ReactNode }) {
  const body = <div className={cx(s.root, className, fonts)} style={style} data-mode={mode}>{children}</div>;
  // Kartu galeri statis; website & pratinjau mendapat daftar pesanan WhatsApp.
  return mode === "thumb" ? body : <OrderProvider>{body}</OrderProvider>;
}
