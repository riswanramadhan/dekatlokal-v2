import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
