"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type FaqGroup = {
  title: string;
  items: ReadonlyArray<{ question: string; answer: string }>;
};

/** Accordion FAQ: hanya satu jawaban terbuka pada satu waktu (semua grup). */
export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openKey, setOpenKey] = useState<string | null>(`${groups[0]?.title}-0`);

  return (
    <div className="dl-faq-groups">
      {groups.map((group, groupIndex) => (
        <section aria-labelledby={`faq-group-${groupIndex}`} className="dl-faq-group" key={group.title}>
          <h3 id={`faq-group-${groupIndex}`}>{group.title}</h3>
          <div className="dl-faq-list">
            {group.items.map((item, itemIndex) => {
              const key = `${group.title}-${itemIndex}`;
              const isOpen = openKey === key;
              return (
                <details className={`dl-faq-item${isOpen ? " is-active" : ""}`} key={item.question} open={isOpen}>
                  <summary
                    aria-expanded={isOpen}
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenKey(isOpen ? null : key);
                    }}
                  >
                    <span>{item.question}</span>
                    <i aria-hidden="true" className="dl-faq-icon"><Plus size={16} strokeWidth={2.5} /></i>
                  </summary>
                  <p className="dl-faq-answer">{item.answer}</p>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
