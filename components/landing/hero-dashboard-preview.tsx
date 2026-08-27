import Image from "next/image";
import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  LayoutDashboard,
  LockKeyhole,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

const dashboardCourses = [
  {
    badge: "Sedang dipelajari",
    className: "is-primary",
    eyebrow: "Fondasi Usaha",
    progress: 72,
    title: "Brand yang Mudah Diingat",
  },
  {
    badge: "Rekomendasi",
    className: "is-sky",
    eyebrow: "Pemasaran",
    progress: 46,
    title: "Konten yang Bantu Jualan",
  },
  {
    badge: "Wajib",
    className: "is-amber",
    eyebrow: "Keuangan",
    progress: 28,
    title: "Catatan Keuangan Praktis",
  },
] as const;

const dashboardStats = [
  {
    detail: "6 dari 9 modul",
    icon: BarChart3,
    label: "Progres belajar",
    value: "68%",
  },
  {
    detail: "Siap dilanjutkan",
    icon: BookOpenCheck,
    label: "Course aktif",
    value: "3",
  },
  {
    detail: "Terus pertahankan",
    icon: Flame,
    label: "Streak belajar",
    value: "7 hari",
  },
] as const;

export function HeroDashboardPreview() {
  return (
    <div
      aria-label="Pratinjau dashboard course DekatLokal"
      className="dl-hero-dashboard-preview"
      role="img"
    >
      <div aria-hidden="true" className="dl-dashboard-window">
        <div className="dl-dashboard-browser-bar">
          <div className="dl-dashboard-window-controls">
            <i className="is-close" />
            <i className="is-minimize" />
            <i className="is-maximize" />
          </div>

          <div className="dl-dashboard-browser-address">
            <LockKeyhole size={12} strokeWidth={2.4} />
            <span>digitalcheckup.dekatlokal.com/app</span>
          </div>

          <div className="dl-dashboard-browser-actions">
            <span />
            <span />
          </div>
        </div>

        <div className="dl-dashboard-app">
          <aside className="dl-dashboard-sidebar">
            <div className="dl-dashboard-brand">
              <Image
                alt=""
                aria-hidden="true"
                className="dl-dashboard-brand-logo"
                height={32}
                src="/brand/dekat-lokal-icon.png"
                unoptimized
                width={32}
              />
              <strong>DekatLokal</strong>
            </div>

            <div className="dl-dashboard-menu-label">Ruang belajar</div>
            <div className="dl-dashboard-menu">
              <span className="is-active">
                <LayoutDashboard size={16} />
                Ringkasan
              </span>
              <span>
                <BookOpenCheck size={16} />
                Course saya
              </span>
              <span>
                <Target size={16} />
                Aset usaha
              </span>
              <span>
                <Trophy size={16} />
                Pencapaian
              </span>
            </div>

            <div className="dl-dashboard-sidebar-note">
              <span>
                <Sparkles size={15} />
              </span>
              <strong>Langkah berikutnya</strong>
              <p>Selesaikan satu modul untuk membuka rekomendasi baru.</p>
            </div>
          </aside>

          <div className="dl-dashboard-main">
            <div className="dl-dashboard-topbar">
              <div className="dl-dashboard-mobile-brand">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="dl-dashboard-brand-logo"
                  height={28}
                  src="/brand/dekat-lokal-icon.png"
                  unoptimized
                  width={28}
                />
                <strong>DekatLokal</strong>
              </div>

              <div className="dl-dashboard-search">
                <Search size={14} />
                <span>Cari materi course...</span>
              </div>

              <div className="dl-dashboard-avatar">
                <span>RA</span>
                <i />
              </div>
            </div>

            <div className="dl-dashboard-content">
              <header className="dl-dashboard-welcome">
                <div>
                  <span className="dl-dashboard-kicker">
                    Dashboard course
                  </span>
                  <h2>Selamat datang, Raka!</h2>
                  <p>Lanjutkan progres kecil yang membuat usahamu makin siap.</p>
                </div>

                <span className="dl-dashboard-level">
                  <CheckCircle2 size={15} />
                  Level Bertumbuh
                </span>
              </header>

              <div className="dl-dashboard-stats">
                {dashboardStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article key={stat.label}>
                      <span className="dl-dashboard-stat-icon">
                        <Icon size={17} />
                      </span>
                      <div>
                        <p>{stat.label}</p>
                        <strong>{stat.value}</strong>
                        <small>{stat.detail}</small>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="dl-dashboard-course-heading">
                <div>
                  <span>Course untukmu</span>
                  <h3>Lanjutkan belajar</h3>
                </div>
                <span className="dl-dashboard-see-all">
                  Lihat semua <ChevronRight size={14} />
                </span>
              </div>

              <div className="dl-dashboard-course-grid">
                {dashboardCourses.map((course, index) => (
                  <article className={course.className} key={course.title}>
                    <div className="dl-dashboard-course-art">
                      <span>0{index + 1}</span>
                      <i />
                      <BookOpenCheck size={22} />
                    </div>
                    <div className="dl-dashboard-course-copy">
                      <span className="dl-dashboard-course-badge">{course.badge}</span>
                      <small>{course.eyebrow}</small>
                      <h4>{course.title}</h4>
                      <div className="dl-dashboard-course-progress">
                        <span>
                          <i style={{ width: `${course.progress}%` }} />
                        </span>
                        <strong>{course.progress}%</strong>
                      </div>
                      <p>
                        <Clock3 size={12} />
                        12 menit tersisa
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
