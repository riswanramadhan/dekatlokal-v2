"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CommercialFaqItem } from "./config";

export default function AnimatedCommercialFaqList({
  items,
  headingId,
}: {
  items: readonly CommercialFaqItem[];
  headingId?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3" aria-labelledby={headingId}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const questionId = `${headingId ?? "commercial-faq"}-question-${index}`;
        const answerId = `${headingId ?? "commercial-faq"}-answer-${index}`;

        return (
          <motion.div
            key={item.question}
            layout
            className="group overflow-hidden rounded-3xl border px-5 shadow-[0_8px_24px_rgba(1,34,98,0.04)] md:px-7"
            animate={{
              backgroundColor: isOpen ? "#EBF1FE" : "#FFFFFF",
              borderColor: isOpen ? "rgba(2,85,245,0.18)" : "rgba(229,229,229,0.95)",
              boxShadow: isOpen
                ? "0 18px 40px rgba(2,85,245,0.1)"
                : "0 8px 24px rgba(1,34,98,0.04)",
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              id={questionId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex((current) => current === index ? null : index)}
              className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-neutral-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-base"
            >
              <span className={isOpen ? "text-primary" : "group-hover:text-primary"}>
                {item.question}
              </span>
              <motion.span
                aria-hidden="true"
                animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? 1.04 : 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg leading-none transition-colors ${
                  isOpen
                    ? "bg-primary text-white"
                    : "bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white"
                }`}
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.25, ease: "easeOut" },
                  }}
                  className="overflow-hidden"
                >
                  <motion.p
                    initial={{ y: -8 }}
                    animate={{ y: 0 }}
                    exit={{ y: -6 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="border-t border-primary-100 pb-5 pt-4 text-sm leading-7 text-neutral-600 md:pb-6 md:text-base"
                  >
                    {item.answer}
                  </motion.p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
