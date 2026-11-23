import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
