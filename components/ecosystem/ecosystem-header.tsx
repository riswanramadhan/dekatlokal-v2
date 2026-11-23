import { CHECKUP_TICKER } from "@/lib/ecosystem/ticker";
import EcosystemNavbar from "./ecosystem-navbar";
import { TickerMarquee } from "./ticker-marquee";

/** Header Digital Checkup: spanduk teks berjalan + navbar pil (gaya visual sama dengan dekatlokal.com). */
export default function EcosystemHeader() {
  return (
    <div className="public-header pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div className="public-announcement pointer-events-auto w-full border-b border-white/15 bg-primary pb-1.5 text-[0.7rem] leading-5 text-white sm:text-xs">
        <TickerMarquee items={CHECKUP_TICKER} />
      </div>
      <div className="pointer-events-auto mx-auto mt-2 w-full max-w-7xl px-4 sm:px-6 md:mt-3 lg:px-12">
        <EcosystemNavbar />
      </div>
    </div>
  );
}
