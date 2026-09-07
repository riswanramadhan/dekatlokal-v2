import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  BookOpen,
  Clock3,
  LockKeyhole,
} from "lucide-react";

export type LandingCourse = {
  slug: string;
  title: string;
  outcome: string;
  image: string;
  imageAlt: string;
  category: "Branding" | "Digitalisasi" | "Legalitas" | "Operasional" | "Pengembangan" | "Penjualan";
  access: "Gratis" | "Premium";
  duration: string;
  recommended?: boolean;
  reason?: string;
  prerequisite?: string;
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

export function CourseExplorer({ courses }: { courses: LandingCourse[] }) {
  return (
    <section aria-labelledby="course-title" className="dl-course-shell dl-viewport-section" id="course">
      <div className="dl-course-section">
        <div className="dl-course-heading" data-reveal-item>
          <p className="dl-section-kicker">Belajar yang langsung kepakai</p>
          <h2 id="course-title">
            Belajar seperlunya. <span className="dl-title-pill">Praktikkan setelahnya.</span>
          </h2>
          <p>
            Materi singkat dan contoh sehari-hari. Selesai belajar, langsung coba untuk jualanmu.
          </p>
        </div>

        <div className="dl-course-grid">
          {courses.map((course) => {
            const price = course.access === "Gratis" ? "Rp0" : "Rp99.000";
            const focus = conciseReasonBySlug[course.slug] ?? course.reason ?? "Praktik usaha";
            return (
              <article className="dl-course-card" data-reveal-item key={course.slug}>
                <div className="dl-course-image">
                  <Image alt={course.imageAlt} fill sizes="(max-width: 699px) 84vw, (max-width: 1099px) 42vw, 23vw" src={course.image} unoptimized />
                  <div className="dl-course-image-badges">
                    <span className={`dl-access-badge is-${course.access.toLocaleLowerCase("id-ID")}`}>
                      {course.access}
                    </span>
                    {course.recommended ? <span className="dl-recommended-badge">Prioritas</span> : null}
                  </div>
                </div>
                <div className="dl-course-body">
                  <div className="dl-course-access-row">
                    <span>Kelas DekatLokal</span>
                    <span>{course.category}</span>
                  </div>
                  <h3>{courseCopy[course.slug]?.title ?? course.title}</h3>
                  <p>{courseCopy[course.slug]?.outcome ?? course.outcome}</p>
                  <div className="dl-course-meta">
                    <span>
                      <BookOpen aria-hidden="true" size={16} />
                      <span><strong>Fokus</strong>{focus}</span>
                    </span>
                    <span>
                      <Clock3 aria-hidden="true" size={16} />
                      <span><strong>Durasi</strong>{course.duration}</span>
                    </span>
                    <span className={course.prerequisite ? "dl-course-prerequisite" : "dl-course-prerequisite is-open"}>
                      {course.prerequisite ? <LockKeyhole aria-hidden="true" size={16} /> : <BadgePercent aria-hidden="true" size={16} />}
                      <span><strong>Akses</strong>{course.prerequisite ?? "Terbuka setelah Checkup"}</span>
                    </span>
                  </div>
                  <div className="dl-course-price-row">
                    <div>
                      <small>Mulai dari</small>
                      <span><strong>{price}</strong></span>
                    </div>
                    <span>{course.access === "Gratis" ? "Fondasi" : "Lanjutan"}</span>
                  </div>
                  <div className="dl-course-actions" aria-label={`Aksi untuk ${course.title}`}>
                    <Link href="/masuk">Masuk untuk belajar <BookOpen aria-hidden="true" size={16} /></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
