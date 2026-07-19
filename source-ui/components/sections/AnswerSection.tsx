"use client";

import { Icon } from "@iconify/react";
import { motion } from "motion/react";

const features = [
  {
    icon: "solar:notes-bold-duotone",
    title: "Digital Checkup UMKM",
    description: "Membantu UMKM memahami kondisi digital bisnis secara ringan dan jelas",
  },
  {
    icon: "solar:book-bold",
    title: "Pembinaan Digital Dasar",
    description: "Untuk UMKM yang ingin menyiapkan langkah digital secara bertahap",
  },
  {
    icon: "mdi:web-check",
    title: "Website UMKM Siap Pakai",
    description: "Diarahkan untuk UMKM yang sudah berada di tahap siap digital",
  },
];

export default function AnswerSection() {
  return (
    <motion.section
      className="mb-10 rounded-[1.75rem] border border-neutral-200 bg-white px-5 py-8 shadow-[0_16px_42px_rgba(1,34,98,0.07)] md:mb-12 md:px-8 md:py-9 lg:mb-14 lg:px-10 lg:py-10"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="inline-flex items-center gap-2.5">
        <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
        <span className="h-px w-8 bg-primary/35" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          SOLUSI DEKATLOKAL
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-12 lg:gap-6">
        <h2 className="text-foreground text-2xl font-bold leading-tight tracking-[-0.035em] md:col-span-3 md:text-3xl lg:col-span-7 lg:text-[2.35rem]">
            DekatLokal Hadir dengan Pendekatan yang <span className="text-primary">Tepat</span>
        </h2>
        <p className="text-sm leading-7 text-neutral-600 md:col-span-3 md:text-[0.95rem] lg:col-span-5">
            DekatLokal membantu UMKM memulai digitalisasi lewat checkup ringan, rekomendasi yang jelas, pembinaan, dan website yang benar-benar berdampak.
        </p>
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="flex flex-col items-center gap-3 rounded-2xl bg-primary-50/55 p-4 text-center md:items-start md:text-start lg:col-span-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.15 }}
          >
            <Icon icon={feature.icon} width="48" height="48" className="text-primary"/>
            <h3 className="text-base font-bold md:text-lg">
                {feature.title}
            </h3>
            <p className="text-sm leading-6 text-neutral-600">
                {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
