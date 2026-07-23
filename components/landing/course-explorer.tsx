import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, BookOpen, Clock3, LockKeyhole } from "lucide-react";

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
          <div>
            <p className="dl-section-kicker">Belajar sesuai prioritas usahamu</p>
            <h2 id="course-title">Course yang berakhir pada <span className="dl-title-pill">aksi nyata.</span></h2>
          </div>
          <p>Mulai dari fondasi gratis yang menghasilkan Aset Usaha. Course lanjutan terbuka setelah prasyarat selesai, lengkap dengan alasan rekomendasinya.</p>
        </div>

        <div className="dl-course-grid">
          {courses.map((course) => {
            const price = course.access === "Gratis" ? "Rp0" : "Rp99.000";
            const originalPrice = course.access === "Gratis" ? "Rp199.000" : "Rp149.000";
            return (
              <article className="dl-course-card" key={course.slug}>
                <div className="dl-course-image">
                  <Image alt={course.imageAlt} fill sizes="(max-width: 699px) 84vw, (max-width: 1099px) 42vw, 23vw" src={course.image} unoptimized />
                  {course.recommended ? <span className="dl-recommended-badge">Prioritas awal</span> : null}
                </div>
                <div className="dl-course-body">
                  <div className="dl-course-access-row"><span className={`dl-access-badge is-${course.access.toLocaleLowerCase("id-ID")}`}>{course.access}</span><span>{course.category}</span></div>
                  <h3>{course.title}</h3>
                  <p>{course.outcome}</p>
                  <div className="dl-course-meta">
                    <span><BookOpen aria-hidden="true" size={16} /><span>{conciseReasonBySlug[course.slug] ?? course.reason ?? "Praktik usaha"}</span></span>
                    <span><Clock3 aria-hidden="true" size={16} /><span>{course.duration}</span></span>
                    <span className={course.prerequisite ? "dl-course-prerequisite" : "dl-course-prerequisite is-open"}>{course.prerequisite ? <LockKeyhole aria-hidden="true" size={16} /> : <BadgePercent aria-hidden="true" size={16} />}<span>{course.prerequisite ?? "akses setelah Checkup"}</span></span>
                  </div>
                  <div className="dl-course-price-row"><div><del>{originalPrice}</del><strong>{price}</strong></div><span>{course.access === "Gratis" ? "Fondasi" : "Preview"}</span></div>
                  <Link className="dl-course-preview" href={`/app/modul/${course.slug}`}>Lihat Preview <ArrowRight aria-hidden="true" size={16} /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
