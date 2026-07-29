import Image from "next/image";
import {
  BadgePercent,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
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
  "digitalisasi-umkm": "Fondasi digital",
  "branding-umkm": "Brand konsisten",
  "produk-dan-kemasan": "Info produk jelas",
  "konsistensi-promosi": "Promosi rutin",
  "marketplace-dan-kanal-penjualan": "Kanal jual",
  "operasional-dan-keuangan-dasar": "Catatan usaha",
  "legalitas-usaha": "Dokumen usaha",
  "komitmen-dan-growth-mindset": "Target tumbuh",
};

export function CourseExplorer({ courses }: { courses: LandingCourse[] }) {
  return (
    <section aria-labelledby="course-title" className="dl-course-shell dl-viewport-section" id="course">
      <div className="dl-course-section">
        <div className="dl-course-heading">
          <p className="dl-section-kicker">Belajar sesuai prioritas usahamu</p>
          <h2 id="course-title">
            Pilih course untuk <span className="dl-title-pill">aksi usahamu.</span>
          </h2>
          <p>
            Materi singkat dan praktis untuk membantumu membangun fondasi,
            menyelesaikan prioritas, dan menghasilkan Aset Usaha.
          </p>
        </div>

        <div className="dl-course-grid">
          {courses.map((course) => {
            const price = course.access === "Gratis" ? "Rp0" : "Rp99.000";
            const originalPrice = course.access === "Gratis" ? "Rp199.000" : "Rp149.000";
            const focus = conciseReasonBySlug[course.slug] ?? course.reason ?? "Praktik usaha";
            return (
              <article className="dl-course-card" key={course.slug}>
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
                    <span>Course DekatLokal</span>
                    <span>{course.category}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.outcome}</p>
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
                      <span><strong>{price}</strong><del>{originalPrice}</del></span>
                    </div>
                    <span>{course.access === "Gratis" ? "Fondasi" : "Lanjutan"}</span>
                  </div>
                  <div className="dl-course-actions" aria-label={`Aksi untuk ${course.title}`}>
                    <button aria-label={`Pilih course ${course.title} (segera hadir)`} disabled type="button">
                      <CheckCircle2 aria-hidden="true" size={15} />
                      Pilih Course
                    </button>
                    <button aria-label={`Lihat detail ${course.title} (segera hadir)`} disabled type="button">
                      <Eye aria-hidden="true" size={15} />
                      Lihat Detail
                    </button>
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
