import { PolicyPageProps } from "@/lib/types/policy";
import { PolicySection } from "./PolicySection";
import { PolicyTableOfContents } from "./PolicyTableOfContents";

/**
 * Reusable policy page layout: server component.
 * Client interactivity is isolated to <PolicyTableOfContents />.
 *
 * Usage:
 *   <PolicyLayout title="Syarat & Ketentuan" lastUpdated="2 Mei 2026" intro={...} sections={[...]} />
 */
export function PolicyLayout({ title, lastUpdated, intro, sections }: PolicyPageProps) {
  const tocItems = sections.map(({ number, title }) => ({ number, title }));

  return (
    <div className="min-h-screen bg-white py-12 mt-12 md:mt-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-[#9B9B9B] mb-3 tracking-wide uppercase">
            Terakhir diperbarui: {lastUpdated}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#37352F] leading-tight tracking-tight">
            {title}
          </h1>
        </div>

        {/* Intro */}
        <div className="mb-10 pb-10 border-b border-[#E8E8E5] text-[#37352F] text-base md:text-[17px] leading-[1.75]">
          {intro}
        </div>

        {/* Table of Contents: client island */}
        <PolicyTableOfContents sections={tocItems} />

        {/* Sections: server rendered */}
        <div className="space-y-10">
          {sections.map((section) => (
            <PolicySection key={section.number} {...section} />
          ))}
        </div>

        </div>
      </div>
    </div>
  );
}
