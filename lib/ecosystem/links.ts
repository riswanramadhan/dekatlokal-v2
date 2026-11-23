// Peta tautan ekosistem DekatLokal untuk Digital Checkup (v2).
// Halaman situs utama memakai URL absolut ke dekatlokal.com; halaman milik v2 memakai path relatif.
// Nama kunci sengaja sama dengan `siteRoutes` di repo dekatlokal.com supaya komponen yang disalin tetap identik.

export const MAIN_SITE_URL = "https://dekatlokal.com";

export const siteRoutes = {
  home: MAIN_SITE_URL,
  services: `${MAIN_SITE_URL}/layanan`,
  websiteUmkmService: `${MAIN_SITE_URL}/layanan/website-umkm`,
  websiteCustomService: `${MAIN_SITE_URL}/layanan/website-custom`,
  digitalSystemService: `${MAIN_SITE_URL}/layanan/sistem-digital`,
  websiteUmkm: `${MAIN_SITE_URL}/website-umkm`,
  articles: `${MAIN_SITE_URL}/artikel`,
  termsOfService: `${MAIN_SITE_URL}/terms-of-service`,
  privacyPolicy: `${MAIN_SITE_URL}/privacy-policy`,
  // Milik Digital Checkup (domain ini)
  digitalCheckup: "/",
  checkupStart: "/mulai",
  templates: "/templates",
  layananPro: "/layanan-pro",
  signIn: "/masuk",
  dashboard: "/dashboard",
} as const;

export const WHATSAPP_NUMBER = "6289516335023";

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Tautan internal v2 (path) vs tautan ke situs utama (URL absolut). */
export const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");
