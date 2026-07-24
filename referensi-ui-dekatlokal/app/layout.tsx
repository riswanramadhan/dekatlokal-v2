import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { PublicPageTransition, SplashScreen } from "@/components/layout";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const DEFAULT_DESCRIPTION =
  "DekatLokal membantu UMKM bertumbuh lebih terarah melalui digitalisasi, Digital Checkup, website modern, dan pendampingan usaha lokal.";
const DEFAULT_TITLE = "DekatLokal | Platform Digitalisasi dan Pendampingan UMKM";
const OG_IMAGE = "/og-image.png";

const SPLASH_BOOT_SCRIPT = `
  (() => {
    const storageKey = "dekatlokal:splash-last-shown";
    const cooldown = 60000;

    try {
      const now = Date.now();
      const lastShown = Number(window.localStorage.getItem(storageKey) || 0);
      const shouldShow = !lastShown || now - lastShown >= cooldown;

      document.documentElement.dataset.showSplash = shouldShow ? "true" : "false";

      if (shouldShow) {
        window.localStorage.setItem(storageKey, String(now));
        document.documentElement.classList.add("splash-active");
      }
    } catch {
      document.documentElement.dataset.showSplash = "true";
      document.documentElement.classList.add("splash-active");
    }
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.mainUrl),
  applicationName: "DekatLokal",
  authors: [{ name: "DekatLokal", url: siteConfig.mainUrl }],
  creator: "DekatLokal",
  publisher: "DekatLokal",
  category: "Website dan solusi digital untuk bisnis lokal",
  title: {
    default: DEFAULT_TITLE,
    template: "%s | DekatLokal",
  },
  description: DEFAULT_DESCRIPTION,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: "DekatLokal",
    locale: "id_ID",
    type: "website",
    url: "/",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "DekatLokal - Platform Digitalisasi dan Pendampingan UMKM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} font-sans antialiased`}
      >
        <SplashScreen />
        <div id="site-content">
          <PublicPageTransition>{children}</PublicPageTransition>
        </div>
      </body>
    </html>
  );
}
