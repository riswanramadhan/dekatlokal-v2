// Kartu "Langkah lanjut" di halaman hasil Checkup (murni, aman di client).
import { instrument } from "@/lib/decision-engine";
import { TRIAL_DAYS, priceLabel, productByCode, type ProductCode } from "@/lib/commerce/catalog";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";

/**
 * Dimensi yang mewakili kehadiran/visibilitas online: C5 "Pemakaian digital"
 * (kanal digital, alur pesanan, pengukuran hasil, akses akun; Q17 menanyakan apakah akun
 * digital usaha sudah siap membantu orang membeli). C4 lebih ke konsistensi merek.
 */
export const VISIBILITY_DIMENSION = "C5";
/** Di bawah 50 berarti rata-rata jawaban C5 belum sampai "profil, produk, dan kontak sudah tersedia". */
export const VISIBILITY_LOW_SCORE = 50;
export const PRO_SERVICES_PATH = "/layanan-pro";
export const SIGN_IN_TO_PRO = `/masuk?next=${PRO_SERVICES_PATH}`;

export interface NextStepCard {
  key: "checkup_pro" | "gbp" | "website";
  eyebrow: string;
  title: string;
  body: string;
  price: string;
  href: string;
  cta: string;
}

const price = (code: ProductCode) => { const product = productByCode(code); return product ? priceLabel(product) : ""; };

export function visibilityScore(scores: number[]) {
  const index = instrument.dimensions.findIndex((dimension) => dimension.code === VISIBILITY_DIMENSION);
  const value = scores[index];
  return Number.isFinite(value) ? value : null;
}

export function nextStepCards({ scores, profile, signedIn }: { scores: number[]; profile: Partial<BusinessProfile>; signedIn: boolean }): NextStepCard[] {
  const paidHref = (anchor: string) => signedIn ? `${PRO_SERVICES_PATH}#${anchor}` : SIGN_IN_TO_PRO;
  const cards: NextStepCard[] = [{
    key: "checkup_pro",
    eyebrow: "Checkup Pro",
    title: "Laporan lengkap + konsultasi 30 menit",
    body: "PDF berisi skor 8 bagian, celah kebutuhan, urutan 7 modul beserta alasannya, dan rencana aksi 30 hari. Lalu dibahas bareng tim DekatLokal.",
    price: price("checkup_pro"),
    href: paidHref("checkup-pro"),
    cta: signedIn ? "Lihat Checkup Pro" : "Masuk untuk memesan",
  }];
  const hasMaps = Boolean(profile.googleMaps?.trim());
  const visibility = visibilityScore(scores);
  const lowVisibility = visibility !== null && visibility < VISIBILITY_LOW_SCORE;
  if (!hasMaps || lowVisibility) {
    cards.push({
      key: "gbp",
      eyebrow: "Google Business Profile",
      title: hasMaps ? "Rapikan profil Google Maps-mu" : "Siapkan profil Google Maps usahamu",
      body: `${hasMaps ? `Nilai Pemakaian digital-mu ${Math.round(visibility ?? 0)}/100.` : "Kamu belum mencantumkan tautan Google Maps."} Kami bantu merapikan kategori, jam buka, foto, dan produk supaya info usahamu lengkap saat dicari. Peringkat di Google tidak bisa dijamin.`,
      price: price("gbp_optimization"),
      href: paidHref("gbp"),
      cta: signedIn ? "Lihat layanan GBP" : "Masuk untuk memesan",
    });
  }
  cards.push({
    key: "website",
    eyebrow: "Website UMKM",
    title: "Buat website gratis",
    body: `Pilih template dan pakai gratis ${TRIAL_DAYS.site_publish ?? 14} hari. Bayar hanya kalau kamu ingin website tetap online setelahnya.`,
    price: `Gratis ${TRIAL_DAYS.site_publish ?? 14} hari`,
    href: "/templates",
    cta: "Pilih template",
  });
  return cards;
}
