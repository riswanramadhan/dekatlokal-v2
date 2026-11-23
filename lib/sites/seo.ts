// Metadata & data terstruktur (JSON-LD) untuk website UMKM. Murni (tanpa I/O).
import { PRODUCTION_ORIGIN } from "@/lib/digital-checkup/site";
import type { SiteCategory } from "./categories";
import { heroUrl } from "./images";
import { waNumber, type SiteContent } from "./schema";
import { sitePath } from "./types";

const SCHEMA_TYPE: Record<SiteCategory, string> = {
  kuliner: "FoodEstablishment",
  fashion: "ClothingStore",
  toko: "Store",
  jasa: "ProfessionalService",
  kecantikan: "HealthAndBeautyBusiness",
  kreatif: "LocalBusiness",
  pangan: "LocalBusiness",
  pendidikan: "LocalBusiness",
};

export const siteUrl = (slug: string, origin = PRODUCTION_ORIGIN) => `${origin}${sitePath(slug)}`;

export function siteTitle(content: SiteContent) {
  const place = content.city ? ` di ${content.city}` : "";
  return content.tagline ? `${content.businessName} – ${content.tagline}`.slice(0, 90) : `${content.businessName}${place}`;
}

export function siteDescription(content: SiteContent) {
  const base = content.about || content.tagline || `${content.businessName}${content.city ? ` di ${content.city}` : ""}.`;
  const items = content.products.slice(0, 3).map((item) => item.name).join(", ");
  const text = `${base}${items ? ` Tersedia ${items}.` : ""} Pesan lewat WhatsApp.`;
  return text.replace(/\s+/g, " ").trim().slice(0, 160);
}

const absolute = (src: string | null, origin: string) => (src ? (src.startsWith("http") ? src : `${origin}${src}`) : undefined);

export function siteJsonLd(slug: string, content: SiteContent, origin = PRODUCTION_ORIGIN) {
  const phone = waNumber(content.whatsapp);
  const sameAs = [content.instagram && `https://instagram.com/${content.instagram}`, content.tiktok && `https://www.tiktok.com/@${content.tiktok}`].filter(Boolean);
  const offers = content.products.filter((item) => item.price !== null).slice(0, 12).map((item) => ({
    "@type": "Offer",
    price: item.price,
    priceCurrency: "IDR",
    itemOffered: { "@type": content.category === "jasa" || content.category === "pendidikan" ? "Service" : "Product", name: item.name, ...(item.description ? { description: item.description } : {}) },
  }));
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[content.category],
    "@id": `${siteUrl(slug, origin)}#usaha`,
    name: content.businessName,
    url: siteUrl(slug, origin),
    description: siteDescription(content),
    ...(absolute(heroUrl(content.heroImage), origin) ? { image: absolute(heroUrl(content.heroImage), origin) } : {}),
    ...(phone ? { telephone: `+${phone}` } : {}),
    ...(content.address || content.city ? { address: { "@type": "PostalAddress", ...(content.address ? { streetAddress: content.address } : {}), ...(content.city ? { addressLocality: content.city } : {}), addressCountry: "ID" } } : {}),
    ...(content.googleMaps ? { hasMap: content.googleMaps } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(offers.length ? { hasOfferCatalog: { "@type": "OfferCatalog", name: "Daftar produk & harga", itemListElement: offers } } : {}),
  };
}

/** JSON aman di dalam <script>: cegah penutupan tag lewat "</script>". */
export const jsonLdString = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
