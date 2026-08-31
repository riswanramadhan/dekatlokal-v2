import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { SoundEffects } from "@/components/sound";
import "./globals.css";
import "./landing-nav-hero-refresh.css";
import "./landing-course-refresh.css";
import "./landing-sections-refresh.css";
import "./landing-commercial-polish.css";
import "./landing-future.css";
import "./landing-request-lock.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalcheckup.dekatlokal.com"),
  title: {
    default: "Digital Checkup UMKM | DekatLokal",
    template: "%s | DekatLokal",
  },
  description:
    "Ruang Tumbuh DekatLokal membantu UMKM menemukan langkah belajar dan aksi usaha yang paling relevan.",
  openGraph: {
    title: "Digital Checkup UMKM | DekatLokal",
    description:
      "Platform pendampingan UMKM yang personal, praktis, dan terukur.",
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
        {children}
      </body>
    </html>
  );
}
