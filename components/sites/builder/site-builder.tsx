"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { SITE_CATEGORIES } from "@/lib/sites/categories";
import { BUNDLED_IMAGES, bundledImage } from "@/lib/sites/images";
import { PALETTES } from "@/lib/sites/palettes";
import { sampleLeftovers } from "@/lib/sites/samples";
import { formatPrice, LIMITS, publishIssues, siteContentSchema, slugify, slugIssue, type SiteContent } from "@/lib/sites/schema";
import { TEMPLATES, type TemplateCode } from "@/lib/sites/templates";
import type { SiteAvailability } from "@/lib/sites/access";
import type { SiteRecord } from "@/lib/sites/types";
import { SitePreview } from "./site-preview";
import { ShareCard } from "./share-card";

type SaveResult = { site: SiteRecord; availability: SiteAvailability; path: string; notice: string; leftovers: string[] };
type ListKey = "products" | "services" | "testimonials" | "faq" | "hours";

const LABELS: Record<string, string> = { businessName: "Nama usaha", tagline: "Tagline", about: "Cerita usaha", city: "Kota", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok", googleMaps: "Google Maps", address: "Alamat", heroImage: "Foto utama", cta: "Teks tombol", products: "Produk", services: "Keunggulan", testimonials: "Testimoni", faq: "Tanya jawab", hours: "Jam buka" };
const BLANK: { [K in ListKey]: SiteContent[K][number] } = {
  products: { name: "", price: null, description: "" },
  services: { title: "", description: "" },
  testimonials: { name: "", quote: "", role: "" },
  faq: { question: "", answer: "" },
  hours: { days: "", time: "" },
};

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return <label className="sb-field"><span>{label}</span>{children}{error ? <small className="sb-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}

/** Builder website: form di kiri, pratinjau langsung di kanan (desktop) atau tab (ponsel). */
export function SiteBuilder({ siteId, initial, status }: { siteId: string | null; initial: { template: TemplateCode; content: SiteContent; slug: string }; status: "draft" | "published" }) {
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateCode>(initial.template);
  const [content, setContent] = useState<SiteContent>(initial.content);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(siteId));
  const [slugState, setSlugState] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [customImage, setCustomImage] = useState(Boolean(initial.content.heroImage) && !bundledImage(initial.content.heroImage));
  const [currentStatus, setCurrentStatus] = useState(status);
  const [statusProp, setStatusProp] = useState(status);
  if (statusProp !== status) { setStatusProp(status); setCurrentStatus(status); } // sinkron setelah router.refresh()

  const parsed = useMemo(() => siteContentSchema.safeParse(content), [content]);
  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) map[issue.path.join(".")] ??= issue.message;
    return map;
  }, [parsed]);
  const err = (path: string) => (showErrors ? errors[path] : undefined);
  const previewContent = parsed.success ? parsed.data : content;
  const images = useMemo(() => [...BUNDLED_IMAGES].sort((a, b) => Number(b.categories.includes(content.category)) - Number(a.categories.includes(content.category))), [content.category]);
  const leftovers = useMemo(() => new Set(sampleLeftovers(content)), [content]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Cek ketersediaan alamat (debounce 500 ms).
  useEffect(() => {
    const issue = slugIssue(slug);
    if (issue) return;
    const timer = setTimeout(() => {
      void api<{ available: boolean; issue?: string; suggestion?: string }>(`sites?slug=${encodeURIComponent(slug)}${siteId ? `&except=${siteId}` : ""}`)
        .then((r) => setSlugState(r.available ? { ok: true, text: "Alamat tersedia." } : { ok: false, text: `${r.issue ?? "Alamat tidak tersedia."}${r.suggestion ? ` Coba ${r.suggestion}.` : ""}` }))
        .catch(() => setSlugState(null));
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, siteId]);

  const update = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((current) => ({ ...current, [key]: value }));
    setDirty(true);
    if (key === "businessName" && !slugTouched) setSlug(slugify(String(value)));
  };
  const updateItem = <K extends ListKey>(key: K, index: number, patch: Partial<SiteContent[K][number]>) => update(key, content[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) as SiteContent[K]);
  const addItem = (key: ListKey) => update(key, [...content[key], { ...BLANK[key] }] as SiteContent[typeof key]);
  const removeItem = (key: ListKey, index: number) => update(key, content[key].filter((_, i) => i !== index) as SiteContent[typeof key]);
  const moveItem = (key: ListKey, index: number, delta: number) => {
    const list = [...content[key]] as unknown[];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    update(key, list as SiteContent[typeof key]);
  };

  const save = async (publish: boolean) => {
    setShowErrors(true); setMessage(null);
    if (!parsed.success) { setMessage({ tone: "error", text: `Periksa lagi: ${[...new Set(Object.keys(errors).map((key) => LABELS[key.split(".")[0]] ?? key))].join(", ")}.` }); return; }
    const issue = slugIssue(slug);
    if (issue) { setMessage({ tone: "error", text: `Alamat website: ${issue}` }); return; }
    if (publish) {
      const issues = publishIssues(parsed.data);
      if (issues.length) { setMessage({ tone: "error", text: issues.join(" ") }); return; }
      if (leftovers.size && !window.confirm(`Masih ada isi contoh yang belum diganti: ${[...leftovers].slice(0, 4).join(", ")}${leftovers.size > 4 ? ", …" : ""}.\n\nPelanggan bisa salah info. Tetap terbitkan?`)) return;
    }
    setBusy(publish ? "publish" : "save");
    try {
      let saved: SaveResult;
      if (!siteId) {
        saved = await api<SaveResult>("sites", "POST", { template, content: parsed.data, slug, publish });
        setDirty(false);
        router.replace(`/dashboard/website/${saved.site.id}${publish ? "?terbit=1" : "?tersimpan=1"}`);
        return;
      }
      saved = { ...(await api<SaveResult>(`sites/${siteId}`, "PATCH", { template, content: parsed.data, slug })), notice: "", leftovers: [] };
      if (publish) saved = await api<SaveResult>(`sites/${siteId}`, "POST", { action: "publish" });
      setDirty(false);
      setCurrentStatus(saved.site.status);
      setResult(publish ? saved : null);
      setMessage({ tone: "ok", text: saved.notice || (publish ? "Website terbit." : saved.site.status === "published" ? "Perubahan tersimpan dan langsung tampil (paling lama 1 menit)." : "Draf tersimpan.") });
      router.refresh();
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Belum berhasil disimpan. Coba lagi." });
    } finally { setBusy(""); }
  };

  const listHeader = (key: ListKey, title: string, max: number) => <div className="sb-list-head"><span>{content[key].length}/{max}</span>{content[key].length < max ? <button type="button" className="dc-text-button" onClick={() => addItem(key)}><Plus size={14} aria-hidden="true" /> Tambah {title}</button> : null}</div>;
  const rowTools = (key: ListKey, index: number, label: string) => <div className="sb-row-tools">
    <button type="button" onClick={() => moveItem(key, index, -1)} disabled={index === 0} aria-label={`Naikkan ${label}`}><ArrowUp size={15} /></button>
    <button type="button" onClick={() => moveItem(key, index, 1)} disabled={index === content[key].length - 1} aria-label={`Turunkan ${label}`}><ArrowDown size={15} /></button>
    <button type="button" onClick={() => removeItem(key, index)} aria-label={`Hapus ${label}`}><Trash2 size={15} /></button>
  </div>;
  const isPublished = currentStatus === "published";

  return <div className="sb-builder" data-tab={tab}>
    <div className="sb-mobile-tabs" role="tablist" aria-label="Tampilan builder">
      <button type="button" role="tab" aria-selected={tab === "edit"} onClick={() => setTab("edit")}>Isi website</button>
      <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>Pratinjau</button>
    </div>

    <form className="sb-form" onSubmit={(event) => { event.preventDefault(); void save(false); }} noValidate>
      <details className="sb-section" open>
        <summary>Tampilan</summary>
        <fieldset className="sb-choices">
          <legend>Template</legend>
          {TEMPLATES.map((item) => <label key={item.code} className={template === item.code ? "is-selected" : ""}>
            <input type="radio" name="template" value={item.code} checked={template === item.code} onChange={() => { setTemplate(item.code); setDirty(true); }} />
            <strong>{item.name}</strong><small>{item.layout}</small>
          </label>)}
        </fieldset>
        <fieldset className="sb-palettes">
          <legend>Warna</legend>
          {PALETTES.map((item) => <label key={item.id} title={item.label} className={content.palette === item.id ? "is-selected" : ""}>
            <input type="radio" name="palette" value={item.id} checked={content.palette === item.id} onChange={() => update("palette", item.id)} />
            <span className="sb-swatch" style={{ background: `linear-gradient(135deg, ${item.bg} 0 50%, ${item.accent} 50% 100%)` }} aria-hidden="true" />
            <small>{item.label}</small>
          </label>)}
        </fieldset>
        <fieldset className="sb-images">
          <legend>Foto utama</legend>
          <label className={!content.heroImage && !customImage ? "is-selected" : ""}><input type="radio" name="hero" checked={!content.heroImage && !customImage} onChange={() => { setCustomImage(false); update("heroImage", ""); }} /><span className="sb-noimage">Tanpa foto</span></label>
          {images.map((item) => <label key={item.id} className={content.heroImage === item.id ? "is-selected" : ""} title={item.label}>
            <input type="radio" name="hero" checked={content.heroImage === item.id} onChange={() => { setCustomImage(false); update("heroImage", item.id); }} />
            <Image src={item.src} alt={item.label} width={120} height={80} sizes="120px" />
          </label>)}
          <label className={customImage ? "is-selected" : ""}><input type="radio" name="hero" checked={customImage} onChange={() => { setCustomImage(true); update("heroImage", ""); }} /><span className="sb-noimage">Foto sendiri</span></label>
        </fieldset>
        {customImage ? <Field label="Tautan foto (https://…)" error={err("heroImage")} hint="Unggah fotomu ke Google Drive/Instagram tidak bisa dipakai langsung. Gunakan tautan gambar yang diawali https:// dan berakhiran .jpg/.png/.webp."><input type="url" inputMode="url" value={content.heroImage} onChange={(e) => update("heroImage", e.target.value.trim())} placeholder="https://…/foto-usaha.jpg" /></Field> : null}
      </details>

      <details className="sb-section" open>
        <summary>Info usaha</summary>
        <div className="sb-grid">
          <Field label="Nama usaha" error={err("businessName")}><input value={content.businessName} maxLength={80} onChange={(e) => update("businessName", e.target.value)} required /></Field>
          <Field label="Kategori"><select value={content.category} onChange={(e) => update("category", e.target.value as SiteContent["category"])}>{SITE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
          <Field label="Kota" error={err("city")}><input value={content.city} maxLength={80} onChange={(e) => update("city", e.target.value)} placeholder="Makassar" /></Field>
          <Field label="Teks tombol pesan" error={err("cta")} hint="Contoh: Pesan lewat WhatsApp"><input value={content.cta} maxLength={40} onChange={(e) => update("cta", e.target.value)} /></Field>
        </div>
        <Field label="Tagline (satu kalimat)" error={err("tagline")} hint={`${content.tagline.length}/120`}><input value={content.tagline} maxLength={120} onChange={(e) => update("tagline", e.target.value)} placeholder="Apa yang membuat usahamu dicari pelanggan?" /></Field>
        <Field label="Cerita usaha" error={err("about")} hint={`${content.about.length}/1200 · ceritakan sejak kapan, bahan/keahlian, dan area layanan.`}><textarea value={content.about} maxLength={1200} rows={4} onChange={(e) => update("about", e.target.value)} /></Field>
        {leftovers.has("Cerita usaha") ? <p className="sb-sample">Cerita ini masih contoh. Ganti dengan cerita usahamu.</p> : null}
      </details>

      <details className="sb-section" open>
        <summary>Kontak & lokasi</summary>
        <div className="sb-grid">
          <Field label="WhatsApp" error={err("whatsapp")} hint="Nomor untuk tombol pesan, misalnya 081234567890."><input inputMode="tel" value={content.whatsapp} maxLength={25} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
          <Field label="Instagram" error={err("instagram")}><input value={content.instagram} maxLength={64} onChange={(e) => update("instagram", e.target.value)} placeholder="@namausaha" /></Field>
          <Field label="TikTok" error={err("tiktok")}><input value={content.tiktok} maxLength={64} onChange={(e) => update("tiktok", e.target.value)} placeholder="@namausaha" /></Field>
          <Field label="Tautan Google Maps" error={err("googleMaps")}><input type="url" inputMode="url" value={content.googleMaps} maxLength={500} onChange={(e) => update("googleMaps", e.target.value.trim())} placeholder="https://maps.app.goo.gl/…" /></Field>
        </div>
        <Field label="Alamat" error={err("address")}><input value={content.address} maxLength={240} onChange={(e) => update("address", e.target.value)} /></Field>
        <div className="sb-subhead"><strong>Jam buka</strong>{listHeader("hours", "jam", LIMITS.hours)}</div>
        {content.hours.map((row, index) => <div className="sb-row sb-row-inline" key={index}>
          <Field label="Hari" error={err(`hours.${index}.days`)}><input value={row.days} maxLength={40} onChange={(e) => updateItem("hours", index, { days: e.target.value })} placeholder="Senin–Sabtu" /></Field>
          <Field label="Jam" error={err(`hours.${index}.time`)}><input value={row.time} maxLength={40} onChange={(e) => updateItem("hours", index, { time: e.target.value })} placeholder="08.00–21.00" /></Field>
          {rowTools("hours", index, `jam ${index + 1}`)}
        </div>)}
      </details>

      <details className="sb-section" open>
        <summary>Produk / menu & harga</summary>
        {listHeader("products", "produk", LIMITS.products)}
        {content.products.map((item, index) => <div className="sb-row" key={index}>
          <div className="sb-row-title"><strong>{item.name || `Produk ${index + 1}`}</strong>{leftovers.has(item.name) ? <span className="dc-badge">Contoh</span> : null}{rowTools("products", index, item.name || `produk ${index + 1}`)}</div>
          <div className="sb-grid">
            <Field label="Nama" error={err(`products.${index}.name`)}><input value={item.name} maxLength={80} onChange={(e) => updateItem("products", index, { name: e.target.value })} /></Field>
            <Field label="Harga (Rp)" error={err(`products.${index}.price`)} hint={formatPrice(item.price)}><input inputMode="numeric" value={item.price ?? ""} onChange={(e) => { const digits = e.target.value.replace(/\D/g, "").slice(0, 9); updateItem("products", index, { price: digits ? Number(digits) : null }); }} placeholder="Kosongkan = Tanya harga" /></Field>
          </div>
          <Field label="Keterangan singkat" error={err(`products.${index}.description`)}><input value={item.description} maxLength={200} onChange={(e) => updateItem("products", index, { description: e.target.value })} /></Field>
        </div>)}
      </details>

      <details className="sb-section">
        <summary>Keunggulan ({content.services.length})</summary>
        {listHeader("services", "keunggulan", LIMITS.services)}
        {content.services.map((item, index) => <div className="sb-row" key={index}>
          <div className="sb-row-title"><strong>{item.title || `Keunggulan ${index + 1}`}</strong>{leftovers.has(item.title) ? <span className="dc-badge">Contoh</span> : null}{rowTools("services", index, item.title || `keunggulan ${index + 1}`)}</div>
          <Field label="Judul" error={err(`services.${index}.title`)}><input value={item.title} maxLength={60} onChange={(e) => updateItem("services", index, { title: e.target.value })} /></Field>
          <Field label="Penjelasan" error={err(`services.${index}.description`)}><input value={item.description} maxLength={200} onChange={(e) => updateItem("services", index, { description: e.target.value })} /></Field>
        </div>)}
      </details>

      <details className="sb-section">
        <summary>Testimoni ({content.testimonials.length})</summary>
        <p className="sb-help">Tulis ulasan asli dari pelanggan, sebaiknya dengan izin mereka.</p>
        {listHeader("testimonials", "testimoni", LIMITS.testimonials)}
        {content.testimonials.map((item, index) => <div className="sb-row" key={index}>
          <div className="sb-row-title"><strong>{item.name || `Testimoni ${index + 1}`}</strong>{rowTools("testimonials", index, `testimoni ${index + 1}`)}</div>
          <div className="sb-grid">
            <Field label="Nama pelanggan" error={err(`testimonials.${index}.name`)}><input value={item.name} maxLength={60} onChange={(e) => updateItem("testimonials", index, { name: e.target.value })} /></Field>
            <Field label="Keterangan (opsional)" error={err(`testimonials.${index}.role`)}><input value={item.role} maxLength={60} onChange={(e) => updateItem("testimonials", index, { role: e.target.value })} placeholder="Pelanggan sejak 2023" /></Field>
          </div>
          <Field label="Ulasan" error={err(`testimonials.${index}.quote`)}><textarea rows={2} value={item.quote} maxLength={280} onChange={(e) => updateItem("testimonials", index, { quote: e.target.value })} /></Field>
        </div>)}
      </details>

      <details className="sb-section">
        <summary>Tanya jawab ({content.faq.length})</summary>
        <p className="sb-help">Pertanyaan ini juga dipakai AI Admin untuk menjawab pelanggan.</p>
        {listHeader("faq", "pertanyaan", LIMITS.faq)}
        {content.faq.map((item, index) => <div className="sb-row" key={index}>
          <div className="sb-row-title"><strong>{item.question || `Pertanyaan ${index + 1}`}</strong>{rowTools("faq", index, `pertanyaan ${index + 1}`)}</div>
          <Field label="Pertanyaan" error={err(`faq.${index}.question`)}><input value={item.question} maxLength={150} onChange={(e) => updateItem("faq", index, { question: e.target.value })} /></Field>
          <Field label="Jawaban" error={err(`faq.${index}.answer`)}><textarea rows={2} value={item.answer} maxLength={500} onChange={(e) => updateItem("faq", index, { answer: e.target.value })} /></Field>
        </div>)}
      </details>

      <details className="sb-section" open>
        <summary>Alamat website</summary>
        <label className="sb-field">
          <span>digitalcheckup.dekatlokal.com/situs/</span>
          <input value={slug} maxLength={40} onChange={(e) => { setSlugTouched(true); setSlugState(null); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setDirty(true); }} aria-describedby="slug-status" />
          <small id="slug-status" className={slugIssue(slug) || slugState?.ok === false ? "sb-error" : ""}>{slugIssue(slug) ?? slugState?.text ?? (siteId && currentStatus === "published" && slug !== initial.slug ? "Tautan lama akan berhenti berfungsi setelah alamat diganti." : "Huruf kecil, angka, dan tanda minus.")}</small>
        </label>
      </details>
    </form>

    <SitePreview template={template} content={previewContent} />

    <div className="sb-actions">
      {message ? <p className={message.tone === "error" ? "sb-message is-error" : "sb-message"} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p> : <p className="sb-message">{dirty ? "Ada perubahan yang belum disimpan." : siteId ? "Semua perubahan tersimpan." : "Belum disimpan."}</p>}
      <div className="sb-action-buttons">
        <button type="button" className="dc-secondary" disabled={Boolean(busy)} onClick={() => void save(false)}>{busy === "save" ? "Menyimpan…" : isPublished ? "Simpan perubahan" : "Simpan draf"}</button>
        {!isPublished || dirty ? <button type="button" className="dc-primary" disabled={Boolean(busy)} onClick={() => void save(true)}>{busy === "publish" ? "Menerbitkan…" : isPublished ? "Simpan & terbitkan" : "Terbitkan gratis"}</button> : null}
      </div>
    </div>

    {result && result.site.status === "published" ? <div className="sb-result"><ShareCard path={result.path} businessName={result.site.content.businessName} live={result.availability.visibility === "live"} /></div> : null}
  </div>;
}
