import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteTemplate } from "@/components/sites/site-template";
import { categoryLabel, isCategory, SITE_CATEGORIES } from "@/lib/sites/categories";
import { sampleContent } from "@/lib/sites/samples";
import { isTemplateCode, TEMPLATES, templateMeta } from "@/lib/sites/templates";
import s from "../../gallery.module.css";

type Params = Promise<{ template: string }>;
type Search = Promise<{ kategori?: string | string[] }>;
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
  const kategori = pick((await searchParams).kategori);
  const category = isCategory(kategori) ? kategori : meta.bestFor[0];
  const content = { ...sampleContent(category), palette: meta.defaultPalette };
  return <>
    <div className={s.previewBar}>
      <Link className={s.previewBack} href={`/templates?kategori=${category}`}><ArrowLeft size={16} aria-hidden="true" /> Template</Link>
      <p className={s.previewTitle}><strong>{meta.name}</strong> <span>· contoh {categoryLabel(category).toLowerCase()}</span></p>
      <Link className={s.previewCta} href={`/dashboard/website/baru?template=${template}&kategori=${category}`}>Pakai template ini <ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    <nav className={s.previewCats} aria-label="Lihat dengan contoh kategori lain">
      {SITE_CATEGORIES.map((item) => <Link key={item.id} href={`/templates/${template}/preview?kategori=${item.id}`} aria-current={item.id === category ? "page" : undefined}>{item.label}</Link>)}
    </nav>
    <SiteTemplate template={template} content={content} mode="preview" />
  </>;
}
