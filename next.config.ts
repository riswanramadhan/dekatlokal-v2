import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hemat kuota Vercel Image Optimization (paket Hobby dipakai bersama semua project):
    // - cache hasil optimasi 31 hari (default Next 16 hanya 4 jam, jadi gambar
    //   yang sama ditransformasi ulang berkali-kali),
    // - satu format (WebP) dan 7 ukuran saja (default 15 ukuran per gambar).
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256, 384],
  },
  // Legacy prototype routes (mock "Ruang Tumbuh" app) were removed; keep old links working.
  async redirects() {
    return [
      { source: "/app", destination: "/dashboard", permanent: false },
      { source: "/app/:path*", destination: "/dashboard", permanent: false },
      { source: "/daftar", destination: "/masuk", permanent: false },
      { source: "/verifikasi", destination: "/masuk", permanent: false },
      { source: "/onboarding", destination: "/mulai", permanent: false },
      { source: "/hubungkan-checkup", destination: "/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    }];
  },
};

export default nextConfig;
