"use client";

import { PolicySection } from "@/lib/types/policy";

interface PolicyTableOfContentsProps {
  sections: Pick<PolicySection, "number" | "title">[];
}

export function PolicyTableOfContents({ sections }: PolicyTableOfContentsProps) {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 115;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav className="mb-12 pb-10 border-b border-[#E8E8E5]" aria-label="Daftar Isi">
      <ol className="gap-x-12 gap-y-0">
        {sections.map((section) => (
          <li key={section.number} className="flex items-baseline gap-3 group">
            <span className="shrink-0 text-base md:text-[17px] text-[#37352F] tabular-nums w-5 text-right select-none">
              {section.number.padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => handleScrollTo(`section-${section.number}`)}
              className="
                text-left text-base md:text-[17px] text-[#37352F]
                py-1.75
                decoration-[#37352F] underline underline-offset-[3px]
                hover:text-[#37352F]/70 hover:decoration-[#37352F]/50
                transition-colors duration-150
                focus:outline-none focus-visible:text-[#37352F]/70
                leading-snug
              "
            >
              {section.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
