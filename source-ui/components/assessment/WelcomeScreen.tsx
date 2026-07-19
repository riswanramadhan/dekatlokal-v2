import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion } from "motion/react";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface WelcomeScreenProps {
  onStart: () => void;
  onBackHome: () => void;
}

export function WelcomeScreen({ onStart, onBackHome }: WelcomeScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center lg:justify-start text-center px-2 md:px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp} className="w-full mb-4 flex justify-start">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 border-2 border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:bg-neutral-50"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          Kembali ke Beranda
        </button>
      </motion.div>
      
      <motion.div variants={fadeInUp}>
        <Image
          src="/image/illustrations/welcome-illustration.png"
          alt="Ilustrasi Digital Checkup UMKM DekatLokal"
          width={633}
          height={320}
          priority
          className="mb-8 w-86 md:w-96 h-auto"
        />
      </motion.div>

      <motion.h1
        variants={fadeInUp}
        className="text-2xl md:text-4xl font-medium text-foreground leading-relaxed mb-4"
      >
        Cek Kesiapan Digital UMKM dan Dapatkan Rekomendasi
      </motion.h1>
      
      <motion.p
        variants={fadeInUp}
        className="text-sm md:text-lg text-foreground max-w-2xl mb-8"
      >
        Jawab beberapa pertanyaan singkat untuk memahami kondisi digital bisnis Anda dan mendapatkan rekomendasi langkah berikutnya.
      </motion.p>
      
      <motion.div variants={fadeInUp}>
        <button
          type="button"
          onClick={onStart}
          className="flex items-center bg-primary text-white px-4 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold whitespace-nowrap transition-all duration-300 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Mulai Digital Checkup Gratis <Icon icon="mdi:arrow-right" className="w-5 md:w-7 h-auto ml-2 md:ml-3" />
        </button>
      </motion.div>
    </motion.div>
  );
}
