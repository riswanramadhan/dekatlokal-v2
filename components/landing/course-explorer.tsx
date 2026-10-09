import Image from "next/image";
import Link from "next/link";
import { BadgePercent, BookOpen, Clock3, LockKeyhole } from "lucide-react";
import { moduleVisualBySlug, type ModuleVisual } from "@/lib/digital-checkup/module-catalog";
import { RevealGroup, RevealItem } from "@/components/system/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

export type LandingCourse = ModuleVisual & {
  slug: string;
  title: string;
  outcome: string;
};

const conciseReasonBySlug: Record<string, string> = {
  "digitalisasi-umkm": "Mulai jualan online",
  "branding-umkm": "Usaha mudah dikenali",
  "produk-dan-kemasan": "Info produk jelas",
  "konsistensi-promosi": "Promosi rutin",
  "marketplace-dan-kanal-penjualan": "Tempat jualan",
  "operasional-dan-keuangan-dasar": "Catatan usaha",
  "legalitas-usaha": "Dokumen usaha",
  "komitmen-dan-growth-mindset": "Rencana usaha",
};

const courseCopy: Record<string, { title: string; outcome: string }> = {
  "digitalisasi-umkm": { title: "Mulai Jualan Online", outcome: "Bikin usahamu lebih mudah ditemukan dan dihubungi pelanggan lewat internet." },
  "branding-umkm": { title: "Bikin Usaha Mudah Diingat", outcome: "Rapikan nama, tampilan, dan cerita usahamu supaya pelanggan gampang mengenalinya." },
  "produk-dan-kemasan": { title: "Produk Rapi, Kemasan Menarik", outcome: "Buat informasi produk dan kemasan yang jelas agar pelanggan lebih yakin membeli." },
  "konsistensi-promosi": { title: "Promosi Nggak Putus-Putus", outcome: "Susun ide dan jadwal konten sederhana supaya promosi tetap jalan di sela jualan." },
  "marketplace-dan-kanal-penjualan": { title: "Tambah Tempat Jualan", outcome: "Pilih tempat jualan online yang cocok dan rapikan cara menerima pesanan." },
  "operasional-dan-keuangan-dasar": { title: "Catat Uang, Rapikan Usaha", outcome: "Pisahkan uang pribadi dan usaha, lalu catat pemasukan dan pengeluaran harian." },
  "legalitas-usaha": { title: "Urus Dokumen Usaha", outcome: "Kenali dokumen yang dibutuhkan usahamu dan pelajari langkah mengurusnya." },
  "komitmen-dan-growth-mindset": { title: "Bikin Rencana yang Jalan", outcome: "Ubah target besar jadi langkah kecil yang bisa kamu kerjakan setiap minggu." },
};

/** Daftar modul landing dibangun langsung dari katalog visual + copy landing (tanpa repository lama). */
export function buildLandingCourses(): LandingCourse[] {
  return Object.keys(moduleVisualBySlug).map((slug) => ({
    slug,
    title: courseCopy[slug]?.title ?? slug,
    outcome: courseCopy[slug]?.outcome ?? "",
    ...moduleVisualBySlug[slug],
  }));
}

export function CourseExplorer({ courses }: { courses: LandingCourse[] }) {
  return (
    <section aria-labelledby="course-title" className="dl-section" id="course">
      <div className="container-x">
        <SectionHeading
          center
          description="Materi singkat dan contoh sehari-hari. Selesai belajar, langsung coba untuk jualanmu."
          eyebrow="Belajar yang langsung kepakai"
          title={<>Belajar seperlunya. <span className="dl-mark-pill">Praktikkan setelahnya.</span></>}
          titleId="course-title"
        />

        <RevealGroup className="dl-courses" delay={0.06}>
          {courses.map((course) => {
            const price = course.access === "Gratis" ? "Rp0" : "Rp99.000";
            const focus = conciseReasonBySlug[course.slug] ?? course.reason ?? "Praktik usaha";
            return (
              <RevealItem className="dl-course" key={course.slug}>
                <article>
                  <div className="dl-course-media">
                    <Image alt={course.imageAlt} fill sizes="(max-width: 639px) 84vw, (max-width: 1099px) 46vw, 280px" src={course.image} unoptimized />
                    <div className="dl-course-badges">
                      <span className={`chip ${course.access === "Gratis" ? "chip-mint" : "chip-violet"}`}>{course.access}</span>
                      {course.recommended ? <span className="chip chip-amber">Prioritas</span> : null}
                    </div>
                  </div>
                  <div className="dl-course-body">
                    <span className="dl-course-cat">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>{course.outcome}</p>
                    <div className="dl-course-meta">
                      <span><BookOpen aria-hidden="true" size={15} />{focus}</span>
                      <span><Clock3 aria-hidden="true" size={15} />{course.duration}</span>
                      <span>
                        {course.prerequisite ? <LockKeyhole aria-hidden="true" size={15} /> : <BadgePercent aria-hidden="true" size={15} />}
                        {course.prerequisite ?? "Terbuka setelah Checkup"}
                      </span>
                    </div>
                    <div className="dl-course-foot">
                      <div className="dl-course-price">
                        <small>Mulai dari</small>
                        <strong>{price}</strong>
                      </div>
                      <Link aria-label={`Masuk untuk belajar ${course.title}`} href="/masuk">
                        Masuk untuk belajar <BookOpen aria-hidden="true" size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
        <p className="dl-courses-hint">Geser untuk lihat modul lainnya →</p>
      </div>
    </section>
  );
}
