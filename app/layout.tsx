import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { SoundEffects } from "@/components/sound";
import "./globals.css";
import "./landing-nav-hero-refresh.css";
import "./landing-course-refresh.css";
import "./landing-sections-refresh.css";
import "./landing-commercial-polish.css";
import "./landing-future.css";
import "./landing-request-lock.css";
import "./landing-brand-refresh.css";
import { PwaRegistration } from "@/components/pwa-registration";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0255f5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalcheckup.dekatlokal.com"),
  title: {
    default: "Digital Checkup UMKM | DekatLokal",
    template: "%s | DekatLokal",
  },
  description:
    "Cek kondisi usahamu gratis. Temukan yang perlu dibenahi, belajar sesuai kebutuhan, dan mulai langkah kecil hari ini bersama DekatLokal.",
  openGraph: {
    title: "Digital Checkup UMKM | DekatLokal",
    description:
      "Teman belajar pemilik usaha. Cek kondisi jualanmu dan temukan langkah berikutnya bersama DekatLokal.",
    locale: "id_ID",
    siteName: "DekatLokal",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface-page text-text-primary">
        <SoundEffects />
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
