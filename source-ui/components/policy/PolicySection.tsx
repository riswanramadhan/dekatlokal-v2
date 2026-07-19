import { PolicySection as PolicySectionType } from "@/lib/types/policy";

export function PolicySection({ number, title, content }: PolicySectionType) {
  return (
    <section id={`section-${number}`} className="group scroll-mt-24">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#9B9B9B] uppercase tracking-widest mb-1">
        {number.padStart(2, "0")}
      </h2>
      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#37352F] mb-4 leading-snug">
        {title}
      </h3>
      <div
        className="
          text-[#37352F] text-base md:text-[17px] leading-[1.75]
          [&_p]:mb-3 [&_p:last-child]:mb-0
          [&_ul]:mt-3 [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5
          [&_em]:italic
        "
      >
        {content}
      </div>
      <div className="mt-10 border-b border-[#E8E8E5]" />
    </section>
  );
}