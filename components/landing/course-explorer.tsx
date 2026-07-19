"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Clock3,
  LockKeyhole,
  Search,
} from "lucide-react";

export type LandingCourse = {
  slug: string;
  title: string;
  outcome: string;
  image: string;
  category:
    | "Branding"
    | "Digitalisasi"
    | "Legalitas"
    | "Operasional"
    | "Pengembangan"
    | "Penjualan";
  access: "Gratis" | "Premium";
  duration: string;
  recommended?: boolean;
  reason?: string;
  prerequisite?: string;
};

const courseFilters = [
  "Semua Course",
  "Gratis",
  "Digitalisasi",
  "Branding",
  "Penjualan",
  "Operasional",
  "Legalitas",
  "Pengembangan",
  "Premium",
] as const;

type CourseFilter = (typeof courseFilters)[number];

export function CourseExplorer({ courses }: { courses: LandingCourse[] }) {
  const [activeFilter, setActiveFilter] = useState<CourseFilter>("Semua Course");
  const [query, setQuery] = useState("");
  const [savedCourses, setSavedCourses] = useState<Set<string>>(() => new Set());

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

    return courses.filter((course) => {
      const matchesFilter =
        activeFilter === "Semua Course" ||
        course.access === activeFilter ||
        course.category === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${course.title} ${course.outcome} ${course.category}`
          .toLocaleLowerCase("id-ID")
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, courses, query]);

  const toggleSaved = (slug: string) => {
    setSavedCourses((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <section aria-labelledby="course-title" className="dl-course-shell" id="course">
      <div className="dl-course-section">
      <div className="dl-course-heading">
        <h2 id="course-title">
          Course Pilihan untuk <span className="dl-title-pill is-coral">Naik Kelas.</span>
        </h2>
        <p>
          Mulai dari fondasi gratis yang menghasilkan Aset Usaha. Course premium baru
          direkomendasikan setelah fokus dasar selesai, lengkap dengan alasan dan prasyarat.
        </p>
      </div>

      <div aria-label="Filter course" className="dl-course-toolbar">
        <div className="dl-course-filters">
          {courseFilters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={activeFilter === filter ? "is-active" : undefined}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="dl-course-search">
          <span className="sr-only">Cari course</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari course"
            type="search"
            value={query}
          />
          <Search aria-hidden="true" size={19} />
        </label>
      </div>

      {visibleCourses.length > 0 ? (
        <div className="dl-course-grid">
          {visibleCourses.map((course) => {
            const isSaved = savedCourses.has(course.slug);

            return (
              <article className="dl-course-card" key={course.slug}>
                <div className="dl-course-image">
                  <Image
                    alt=""
                    fill
                    sizes="(max-width: 680px) 92vw, (max-width: 1120px) 45vw, 310px"
                    src={course.image}
                  />
                  {course.recommended ? (
                    <span className="dl-recommended-badge">Direkomendasikan</span>
                  ) : null}
                  <button
                    aria-label={`${isSaved ? "Hapus" : "Simpan"} ${course.title}`}
                    aria-pressed={isSaved}
                    className="dl-bookmark-button"
                    onClick={() => toggleSaved(course.slug)}
                    type="button"
                  >
                    <Bookmark aria-hidden="true" fill={isSaved ? "currentColor" : "none"} size={17} />
                  </button>
                </div>

                <div className="dl-course-body">
                  <div className="dl-course-access-row">
                    <span className={`dl-access-badge is-${course.access.toLocaleLowerCase("id-ID")}`}>
                      {course.access}
                    </span>
                    <span>{course.category}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.outcome}</p>
                  <div className="dl-course-meta">
                    {course.reason ? (
                      <span className="dl-course-reason"><BookOpen aria-hidden="true" size={16} /> <strong>Alasan:</strong> {course.reason}</span>
                    ) : null}
                    {course.prerequisite ? (
                      <span className="dl-course-prerequisite"><LockKeyhole aria-hidden="true" size={16} /> <strong>Prasyarat:</strong> {course.prerequisite}</span>
                    ) : null}
                    <span><Clock3 aria-hidden="true" size={16} /> {course.duration}</span>
                  </div>
                  <div className="dl-course-price-row">
                    <div>
                      {course.access === "Premium" ? <del>Rp149.000</del> : null}
                      <strong>{course.access === "Gratis" ? "Rp0" : "Rp99.000"}</strong>
                    </div>
                    {course.access === "Gratis" ? <span>Gratis</span> : <span>Berbayar</span>}
                  </div>
                  <Link className="dl-course-preview" href={`/app/modul/${course.slug}`}>
                    Lihat Preview
                    {course.access === "Premium" ? <LockKeyhole aria-hidden="true" size={15} /> : null}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dl-course-empty" role="status">
          <Search aria-hidden="true" size={24} />
          <strong>Course belum ditemukan</strong>
          <p>Coba kata kunci atau kategori lain.</p>
          <button
            onClick={() => {
              setActiveFilter("Semua Course");
              setQuery("");
            }}
            type="button"
          >
            Tampilkan semua course
          </button>
        </div>
      )}
      </div>
    </section>
  );
}
