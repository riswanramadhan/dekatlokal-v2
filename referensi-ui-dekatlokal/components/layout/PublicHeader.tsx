import Navbar from "./Navbar";
import { siteConfig } from "@/lib/site-config";

export default function PublicHeader() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-auto w-full border-b border-white/15 bg-[linear-gradient(90deg,#0146cf,#0255f5_45%,#36a3ff)] px-4 py-1.5 text-center text-[0.7rem] font-medium leading-5 text-white shadow-[0_10px_30px_rgba(2,85,245,0.16)] sm:text-xs">
        <div className="inline-flex min-h-6 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full px-2">
          <span className="sm:hidden">Gratis Digital Checkup UMKM.</span>
          <span className="hidden sm:inline">Gratis Digital Checkup UMKM. Temukan prioritas website sebelum mulai.</span>
          <a
            href={siteConfig.digitalCheckupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-1.5 font-semibold underline-offset-4 transition-colors hover:bg-white/12 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Mulai Cek
          </a>
        </div>
      </div>
      <div className="pointer-events-auto mx-auto mt-2 w-full max-w-7xl px-4 sm:px-6 md:mt-3 lg:px-12">
        <Navbar />
      </div>
    </div>
  );
}
