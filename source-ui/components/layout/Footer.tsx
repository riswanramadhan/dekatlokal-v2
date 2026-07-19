import Image from "next/image";
import Link from "next/link";

import { siteRoutes } from "@/lib/site-config";
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/whatsapp";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/dekatlokal",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/dekatlokal",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/dekatlokal",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
] as const;

const serviceLinks = [
  { label: "Digital Checkup", href: siteRoutes.digitalCheckup },
  { label: "Website UMKM Cepat", href: siteRoutes.websiteUmkmService },
  { label: "Website Custom", href: siteRoutes.websiteCustomService },
  { label: "Sistem Digital", href: siteRoutes.digitalSystemService },
] as const;

const exploreLinks = [
  { label: "Beranda", href: siteRoutes.home },
  { label: "Semua Layanan", href: siteRoutes.services },
  { label: "Portofolio UMKM", href: siteRoutes.websiteUmkm },
  { label: "Artikel", href: siteRoutes.articles },
] as const;

const whatsappUrl = buildWhatsAppUrl(
  "Halo, saya ingin mengetahui lebih lanjut tentang DekatLokal.",
);

const whatsappDisplayNumber = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5, 9)} ${WHATSAPP_NUMBER.slice(9)}`;

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon-hover-motion h-4.5 w-4.5 shrink-0 text-primary" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WhatsAppContactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="icon-hover-motion h-4.5 w-4.5 shrink-0 text-primary" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
      <path d="M12.05 2a9.87 9.87 0 0 0-8.4 15.04l-1.1 4.02 4.12-1.08A9.87 9.87 0 1 0 12.05 2Z" fill="none" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

const footerLinkClass =
  "group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm leading-6 text-neutral-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/15 bg-white text-neutral-950">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="grid gap-x-10 gap-y-9 py-11 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.75fr)_repeat(3,minmax(0,1fr))] lg:gap-x-12 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={siteRoutes.home}
              className="inline-flex min-h-11 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="DekatLokal, kembali ke beranda"
            >
              <Image
                src="/image/brand/dekat-lokal.png"
                alt="DekatLokal"
                width={528}
                height={163}
                className="h-auto w-36 sm:w-40"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-600">
              Mendampingi bisnis lokal bertumbuh melalui website, Digital
              Checkup, dan sistem digital yang relevan dengan kebutuhannya.
            </p>

            <nav aria-label="Media sosial DekatLokal" className="mt-5">
              <ul className="flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-label={`Kunjungi ${social.label} DekatLokal`}
                    >
                      <span className="icon-hover-motion inline-flex">{social.icon}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <nav aria-labelledby="footer-services-heading">
            <h2
              id="footer-services-heading"
              className="text-sm font-semibold text-neutral-950"
            >
              Layanan
            </h2>
            <ul className="mt-3 space-y-0.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-explore-heading">
            <h2
              id="footer-explore-heading"
              className="text-sm font-semibold text-neutral-950"
            >
              Jelajahi
            </h2>
            <ul className="mt-3 space-y-0.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div aria-labelledby="footer-contact-heading">
            <h2
              id="footer-contact-heading"
              className="text-sm font-semibold text-neutral-950"
            >
              Hubungi
            </h2>
            <ul className="mt-3 space-y-0.5">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  <WhatsAppContactIcon />
                  {whatsappDisplayNumber}
                  <span className="sr-only"> (terbuka di tab baru)</span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@dekatlokal.com" className={footerLinkClass}>
                  <MailIcon />
                  hello@dekatlokal.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-200 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-neutral-600">
            © {currentYear} DekatLokal. Built for Local Growth.
          </p>

          <nav aria-label="Informasi legal">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <li>
                <Link href={siteRoutes.termsOfService} className={footerLinkClass}>
                  Syarat dan Ketentuan
                </Link>
              </li>
              <li>
                <Link href={siteRoutes.privacyPolicy} className={footerLinkClass}>
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
