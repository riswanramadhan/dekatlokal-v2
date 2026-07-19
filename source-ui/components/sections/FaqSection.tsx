"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { faqData, type FaqItem } from "./faq-data";

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  idPrefix,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  idPrefix: string;
}) {
  return (
    <motion.div
      layout
      className="group mb-3 overflow-hidden rounded-3xl border px-5 md:px-7"
      animate={{
        backgroundColor: isOpen ? "#EBF1FE" : "#FFFFFF",
        borderColor: isOpen ? "rgba(2, 85, 245, 0.18)" : "rgba(229, 229, 229, 0.95)",
        boxShadow: isOpen
          ? "0 18px 40px rgba(2, 85, 245, 0.1)"
          : "0 8px 24px rgba(1, 34, 98, 0.04)",
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        id={`${idPrefix}-question-${index}`}
        type="button"
        onClick={onToggle}
        className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isOpen}
        aria-controls={`${idPrefix}-answer-${index}`}
      >
        <span className={`text-sm font-semibold text-neutral-950 transition-colors duration-300 md:text-base ${
            isOpen ? "text-primary" : "group-hover:text-primary"
          }`}>
          {item.question}
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-colors duration-300 ${
            isOpen
              ? "bg-primary text-white"
              : "bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white"
          }`}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${idPrefix}-answer-${index}`}
            role="region"
            aria-labelledby={`${idPrefix}-question-${index}`}
            key="answer"
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FaqSectionProps {
  items?: readonly FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  id?: string;
  className?: string;
  idPrefix?: string;
  variant?: "card" | "plain";
  stickyHeader?: boolean;
}

export default function FaqSection({
  items = faqData,
  eyebrow = "FAQ",
  title = "Pertanyaan yang sering ditanyakan",
  description = "Temukan jawaban atas pertanyaan paling umum seputar DekatLokal, layanan website UMKM, proses pendampingan, serta manfaat digitalisasi untuk bisnis lokal.",
  id,
  className = "mb-16 md:mb-24 lg:mb-32",
  idPrefix = "faq",
  variant = "card",
  stickyHeader = false,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => current === index ? null : index);
  };

  return (
    <section id={id} className={className}>
      <div className={stickyHeader ? "grid w-full gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14" : "w-full"}>
        {/* Header */}
        <motion.div
          className={
            stickyHeader
              ? "text-left lg:sticky lg:top-32 lg:self-start"
              : "mx-auto mb-8 max-w-4xl text-center lg:mb-12"
          }
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <p className={`text-xs font-semibold uppercase tracking-[0.14em] text-primary ${stickyHeader ? "mb-3" : "mb-3"}`}>
                {eyebrow}
            </p>
            <h2 className="mb-3 text-2xl font-bold leading-tight tracking-[-0.035em] text-foreground md:text-3xl lg:text-[2.35rem]">
                {title}
            </h2>
            <p className="text-sm leading-7 text-neutral-600 md:text-[0.95rem]">
                {description}
            </p>
        </motion.div>

        {/* Accordion */}
        <div
          className={
            variant === "plain"
              ? "rounded-none bg-transparent px-0"
              : "bg-white rounded-2xl md:rounded-3xl px-6 md:px-8 lg:px-10"
          }
        >
          {items.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
            >
              <AccordionItem
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
                index={index}
                idPrefix={idPrefix}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
