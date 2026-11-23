import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteTemplate } from "@/components/sites/site-template";
import { categoryLabel, isCategory, SITE_CATEGORIES } from "@/lib/sites/categories";
import { sampleContent } from "@/lib/sites/samples";
import { isPaletteId, paletteById } from "@/lib/sites/palettes";
import { isTemplateCode, TEMPLATES, templateMeta } from "@/lib/sites/templates";
import s from "../../gallery.module.css";

type Params = Promise<{ template: string }>;
type Search = Promise<{ kategori?: string | string[]; warna?: string | string[] }>;
const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function generateStaticParams() {
  return TEMPLATES.map((item) => ({ template: item.code }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { template } = await params;
  if (!isTemplateCode(template)) return { title: "Template tidak ditemukan", robots: { index: false } };
  const meta = templateMeta(template);
  return {
    title: `Contoh Template ${meta.name}`,
    description: meta.summary,
    alternates: { canonical: "/templates" },
    // Isi contoh (usaha fiktif) tidak perlu diindeks; galeri /templates yang diindeks.
    robots: { index: false, follow: true },
  };
}

export default async function TemplatePreviewPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { template } = await params;
  if (!isTemplateCode(template)) notFound();
  const meta = templateMeta(template);
  const query = await searchParams;
  const kategori = pick(query.kategori), warna = pick(query.warna);
  const category = isCategory(kategori) ? kategori : meta.bestFor[0];
  // Warna dari tautan galeri boleh palet apa saja yang valid; daftar tombol memakai pilihan kurasi template.
  const palette = isPaletteId(warna) ? warna : meta.defaultPalette;
  const choices = meta.palettes.includes(palette) ? meta.palettes : [...meta.palettes, palette];
  const content = { ...sampleContent(category), palette };
  const href = (params: Record<string, string>) => `/templates/${template}/preview?${new URLSearchParams(params)}`;
  return <>
    <div className={s.previewBar}>
      <Link className={s.previewBack} href={`/templates?kategori=${category}#daftar-template`}><ArrowLeft size={16} aria-hidden="true" /> Template</Link>
      <p className={s.previewTitle}><strong>{meta.name}</strong> <span>· contoh {categoryLabel(category).toLowerCase()}</span></p>
      <Link className={s.previewCta} href={`/dashboard/website/baru?${new URLSearchParams({ template, kategori: category, warna: palette })}`}>Pakai template ini <ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    <nav className={s.previewCats} aria-label="Lihat dengan contoh kategori lain">
      {SITE_CATEGORIES.map((item) => <Link key={item.id} href={href({ kategori: item.id, warna: palette })} aria-current={item.id === category ? "page" : undefined}>{item.label}</Link>)}
    </nav>
    <nav className={s.previewColors} aria-label="Pilihan warna">
      <span>Warna</span>
      {choices.map((id) => { const item = paletteById(id); return <Link key={id} href={href({ kategori: category, warna: id })} scroll={false} replace aria-current={id === palette ? "true" : undefined}>
        <i style={{ background: `linear-gradient(135deg, ${item.bg} 0 50%, ${item.accent} 50% 100%)` }} aria-hidden="true" />{item.label}
      </Link>; })}
    </nav>
    <SiteTemplate template={template} content={content} mode="preview" />
  </>;
}
