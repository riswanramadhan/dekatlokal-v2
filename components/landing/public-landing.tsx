import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Maximize2,
  Menu,
  Play,
  Sparkles,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { CourseExplorer, type LandingCourse } from "@/components/landing/course-explorer";

type ModuleCardView = {
  slug: string;
  title: string;
  outcome: string;
  icon: string;
};

type CoursePresentation = Pick<
  LandingCourse,
  "access" | "category" | "duration" | "image" | "prerequisite" | "reason" | "recommended"
>;

const navItems = [
  ["Beranda", "#beranda"],
  ["Cara Kerja", "#akses-belajar"],
  ["Pengalaman", "#pengalaman"],
  ["Course", "#course"],
  ["Harga", "#paket"],
] as const;

const checkupDomains = [
  "Identitas",
  "Legalitas",
  "Produk",
  "Branding",
  "Jejak Digital",
  "Konsistensi",
  "Operasional",
  "Komitmen",
] as const;

const premiumPrerequisite = "Tuntaskan tiga course fondasi.";

const coursePresentationBySlug: Record<string, CoursePresentation> = {
  "digitalisasi-umkm": {
    access: "Gratis",
    category: "Digitalisasi",
    duration: "20–30 menit",
    image: "/landing/outcome-aroma.webp",
    reason: "merapikan fondasi digital usaha",
    recommended: true,
  },
  "branding-umkm": {
    access: "Gratis",
    category: "Branding",
    duration: "25–35 menit",
    image: "/landing/outcome-dapur.png",
    reason: "membuat identitas lebih konsisten",
    recommended: true,
  },
  "produk-dan-kemasan": {
    access: "Gratis",
    category: "Penjualan",
    duration: "25–35 menit",
    image: "/landing/outcome-gingerfit.webp",
    reason: "memperjelas informasi untuk pelanggan",
    recommended: true,
  },
  "konsistensi-promosi": {
    access: "Gratis",
    category: "Penjualan",
    duration: "20–30 menit",
    image: "/landing/outcome-kopi.webp",
  },
  "marketplace-dan-kanal-penjualan": {
    access: "Premium",
    category: "Penjualan",
    duration: "35–45 menit",
    image: "/landing/outcome-rumah-keripik.webp",
    prerequisite: premiumPrerequisite,
  },
  "operasional-dan-keuangan-dasar": {
    access: "Premium",
    category: "Operasional",
    duration: "35–45 menit",
    image: "/landing/outcome-kareppe.webp",
    prerequisite: premiumPrerequisite,
  },
  "legalitas-usaha": {
    access: "Premium",
    category: "Legalitas",
    duration: "30–40 menit",
    image: "/landing/outcome-eyfa.webp",
    prerequisite: premiumPrerequisite,
  },
  "komitmen-dan-growth-mindset": {
    access: "Premium",
    category: "Pengembangan",
    duration: "30–40 menit",
    image: "/landing/outcome-michi.webp",
    prerequisite: premiumPrerequisite,
  },
};

const fallbackCoursePresentation: CoursePresentation = {
  access: "Gratis",
  category: "Digitalisasi",
  duration: "20–30 menit",
  image: "/landing/outcome-aroma.webp",
};

const demoClaimToken = "clm_7N4k9Q2vY8pR5tX1";

const testimonials = [
  {
    quote:
      "Sebelumnya saya mencoba banyak hal sekaligus. Setelah melihat hasil Checkup, saya tahu tiga langkah yang paling penting untuk usaha saya.",
    highlight: "tiga langkah yang paling penting",
    name: "Rina",
    role: "Skenario demo · Usaha kuliner",
    tone: "mint",
    avatarPosition: "18% 58%",
  },
  {
    quote:
      "Materinya singkat dan tugasnya jelas. Saya selesai belajar sambil membuat profil usaha dan kalender promosi yang langsung bisa dipakai.",
    highlight: "langsung bisa dipakai",
    name: "Dimas",
    role: "Skenario demo · Jasa kreatif",
    tone: "yellow",
    avatarPosition: "86% 58%",
  },
  {
    quote:
      "Saya jadi paham mengapa sebuah course direkomendasikan. Saat Checkup ulang, perubahan usahanya terlihat lebih nyata.",
    highlight: "perubahan usahanya terlihat lebih nyata",
    name: "Ayu",
    role: "Skenario demo · Fesyen lokal",
    tone: "lilac",
    avatarPosition: "52% 52%",
  },
] as const;

const pricingPlans = [
  {
    name: "Fondasi Gratis",
    price: "Rp0",
    description: "Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.",
    features: [
      ["Digital Checkup delapan aspek", true],
      ["Tiga course fondasi personal", true],
      ["Kuis dan tugas praktik usaha", true],
      ["Aset Usaha dan Jejak Tumbuh", true],
      ["Course premium", false],
    ],
    cta: "Mulai Gratis",
    hrefType: "checkup",
    featured: false,
  },
  {
    name: "Tumbuh Terarah",
    price: "Rp249.000",
    description: "Pendalaman mandiri untuk menguatkan hasil setelah fondasi selesai.",
    features: [
      ["Semua manfaat Fondasi Gratis", true],
      ["Empat course premium", true],
      ["Jalur tindakan personal 90 hari", true],
      ["Workbook dan template premium", true],
      ["Materi mandiri tanpa batas waktu", true],
    ],
    cta: "Lihat Preview Premium",
    hrefType: "premium",
    featured: true,
  },
  {
    name: "Pendampingan Naik Kelas",
    price: "Rp799.000",
    description: "Belajar lebih terarah dengan klinik usaha dan review aset prioritas.",
    features: [
      ["Semua manfaat Tumbuh Terarah", true],
      ["Dua klinik usaha kelompok", true],
      ["Review tiga Aset Usaha", true],
      ["Rencana aksi personal 30 hari", true],
      ["Ringkasan prioritas berikutnya", true],
    ],
    cta: "Daftar Minat",
    hrefType: "interest",
    featured: false,
  },
] as const;

export function PublicLanding({
  modules,
  checkupHref,
}: {
  modules: ModuleCardView[];
  checkupHref: string;
}) {
  const courses: LandingCourse[] = modules.map((module) => ({
    slug: module.slug,
    title: module.title,
    outcome: module.outcome,
    ...(coursePresentationBySlug[module.slug] ?? fallbackCoursePresentation),
  }));

  return (
    <div className="dl-landing">
      <a className="dl-skip-link" href="#konten-utama">
        Lewati ke konten utama
      </a>

      <main>
        <Hero checkupHref={checkupHref} />
        <AccessLearningSection />
        <TestimonialsSection />
        <CourseExplorer courses={courses} />
        <PricingSection checkupHref={checkupHref} />
        <FinalCta checkupHref={checkupHref} />
      </main>
      <LandingFooter checkupHref={checkupHref} />
    </div>
  );
}

function LandingHeader({ checkupHref }: { checkupHref: string }) {
  return (
    <header className="dl-header">
      <Link aria-label="Ke beranda DekatLokal" className="dl-header-logo" href="/">
        <Image alt="DekatLokal" height={64} priority src="/brand/dekat-lokal-2.png" width={207} />
      </Link>

      <nav aria-label="Navigasi landing page" className="dl-header-nav">
        {navItems.map(([label, href], index) => (
          <a className={index === 0 ? "is-active" : undefined} href={href} key={label}>
            {label}
          </a>
        ))}
      </nav>

      <div className="dl-header-actions">
        <Link className="dl-login-button" href="/masuk">
          Masuk
        </Link>
        <Link className="dl-register-button" href={checkupHref}>
          Mulai Gratis
        </Link>
      </div>

      <details className="dl-mobile-menu">
        <summary>
          <Menu aria-hidden="true" size={21} />
          <span className="sr-only">Buka menu utama</span>
        </summary>
        <nav aria-label="Navigasi landing page mobile">
          {navItems.map(([label, href]) => (
            <a href={href} key={label}>{label}</a>
          ))}
          <Link href="/masuk">Masuk</Link>
          <Link className="is-primary" href={checkupHref}>Mulai Digital Checkup</Link>
        </nav>
      </details>
    </header>
  );
}

function Hero({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="hero-title" className="dl-hero-section" id="beranda">
      <div className="dl-hero-panel">
        <Image
          alt="Pemilik UMKM siap mengikuti Digital Checkup DekatLokal"
          className="dl-hero-art"
          height={1024}
          priority
          sizes="(max-width: 760px) 900px, 100vw"
          src="/landing/hero-umkm-v2.png"
          width={1536}
        />
        <div aria-hidden="true" className="dl-hero-shade" />
        <LandingHeader checkupHref={checkupHref} />

        <div className="dl-hero-copy" id="konten-utama" tabIndex={-1}>
          <p className="dl-hero-eyebrow">
            <Sparkles aria-hidden="true" size={16} />
            Ruang Tumbuh untuk UMKM Indonesia
          </p>
          <h1 id="hero-title">
            <span className="dl-hero-line">Kenali kondisi</span>
            <span className="dl-hero-line"><span className="dl-highlight is-pink">usahamu.</span> Tumbuh</span>
            <span className="dl-hero-line">dengan <span className="dl-highlight is-yellow">langkah tepat.</span></span>
          </h1>
          <p className="dl-hero-description">
            Mulai dengan Digital Checkup gratis. Dapatkan tiga fokus usaha, course yang
            relevan, dan aksi praktis yang menghasilkan Aset Usaha.
          </p>
          <div className="dl-hero-actions">
            <Link className="dl-primary-button" href={checkupHref}>
              Mulai Digital Checkup
              <span><ArrowRight aria-hidden="true" size={18} /></span>
            </Link>
            <Link className="dl-secondary-button" href="/masuk">
              Masuk ke Ruang Tumbuh
            </Link>
          </div>
          <ul className="dl-hero-trust" aria-label="Informasi Digital Checkup">
            {[
              "Gratis",
              "5–7 menit",
              "Hasil langsung",
            ].map((item) => (
              <li key={item}><CheckCircle2 aria-hidden="true" size={16} />{item}</li>
            ))}
          </ul>
        </div>

        <div className="dl-floating-card dl-floating-card-one">
          <span className="dl-floating-icon"><ClipboardCheck aria-hidden="true" size={19} /></span>
          <span><strong>8 Aspek</strong><small>diperiksa ringkas</small></span>
        </div>
        <div className="dl-floating-card dl-floating-card-two">
          <span className="dl-focus-ring">3</span>
          <span><strong>Fokus Usaha</strong><small>disusun personal</small></span>
        </div>
        <div className="dl-floating-card dl-floating-card-three">
          <span className="dl-floating-icon is-yellow"><TrendingUp aria-hidden="true" size={19} /></span>
          <span><strong>Jejak Tumbuh</strong><small>ukur sebelum–sesudah</small></span>
        </div>
      </div>

      <div aria-label="Aspek yang diperiksa" className="dl-domain-marquee" tabIndex={0}>
        <div className="dl-domain-track">
          {[...checkupDomains, ...checkupDomains].map((domain, index) => (
            <span aria-hidden={index >= checkupDomains.length} key={`${domain}-${index}`}>
              <Check aria-hidden="true" size={16} />{domain}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccessLearningSection() {
  return (
    <section aria-labelledby="access-title" className="dl-access-section" id="akses-belajar">
      <h2 id="access-title">
        Dari Checkup ke Course, <span className="dl-title-pill is-coral">di Mana Saja.</span>
      </h2>

      <div className="dl-access-grid">
        <article className="dl-access-column">
          <p className="dl-access-label"><Sparkles aria-hidden="true" size={15} /> Digital Checkup gratis sedang berjalan</p>
          <div aria-label="Tiga tahap Digital Checkup" className="dl-checkup-stack">
            <CheckupWindow className="is-left" image="/landing/checkup-start.webp" label="Mulai" />
            <CheckupWindow className="is-center" image="/landing/checkup-analysis.webp" label="Analisis" />
            <CheckupWindow className="is-right" image="/landing/checkup-result.webp" label="Hasil" />
          </div>
          <h3>Kenali posisi usahamu tanpa laporan yang rumit.</h3>
          <p>Jawab pertanyaan sederhana dari ponsel atau laptop. DekatLokal merangkum delapan aspek usaha menjadi hasil yang mudah dipahami.</p>
        </article>

        <article className="dl-access-column">
          <p className="dl-access-label"><Sparkles aria-hidden="true" size={15} /> Jalur personal sudah siap</p>
          <div className="dl-learning-window" aria-label="Preview Jalur Naik Kelas">
            <div className="dl-window-dots"><i /><i /><i /></div>
            <div className="dl-learning-media">
              <Image
                alt="Pelaku UMKM melihat hasil dan jalur belajar DekatLokal"
                fill
                sizes="(max-width: 760px) 92vw, 600px"
                src="/landing/hero-umkm.webp"
              />
              <span className="dl-live-label"><i /> 08:21</span>
              <span className="dl-expand-icon"><Maximize2 aria-hidden="true" size={16} /></span>
              <span aria-hidden="true" className="dl-play-button"><Play fill="currentColor" size={22} /></span>
              <span className="dl-learner-name">Warung Rina</span>
              <span className="dl-volume-icon"><Volume2 aria-hidden="true" size={16} /></span>
            </div>
            <div className="dl-media-progress"><span>4:31</span><i><b /></i><span>08:21</span></div>
          </div>
          <h3>Kerjakan langkah yang paling berdampak lebih dulu.</h3>
          <p>Hasil Checkup menentukan tiga fokus, menjelaskan alasan rekomendasi, lalu membimbingmu melalui belajar singkat, kuis, dan aksi usaha.</p>
        </article>
      </div>
    </section>
  );
}

function CheckupWindow({ image, label, className }: { image: string; label: string; className: string }) {
  return (
    <div className={`dl-checkup-window ${className}`}>
      <div className="dl-window-dots"><i /><i /><i /></div>
      <div className="dl-checkup-image"><Image alt="" fill sizes="240px" src={image} /></div>
      <div className="dl-checkup-progress"><span>{label}</span><i><b /></i></div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section aria-labelledby="experience-title" className="dl-testimonials-section" id="pengalaman">
      <p className="dl-kicker">Gambaran pengalaman di Ruang Tumbuh</p>
      <h2 id="experience-title">
        Pemilik usaha bergerak dengan <span className="dl-title-pill is-yellow">lebih yakin.</span>
      </h2>

      <div className="dl-testimonial-grid">
        {testimonials.map((testimonial) => (
          <blockquote className="dl-testimonial-card" key={testimonial.name}>
            <span aria-hidden="true" className="dl-quote-mark">“</span>
            <p>{highlightText(testimonial.quote, testimonial.highlight, testimonial.tone)}</p>
            <footer>
              <span className={`dl-avatar is-${testimonial.tone}`}>
                <Image
                  alt=""
                  fill
                  sizes="48px"
                  src="/landing/hero-umkm.webp"
                  style={{ objectPosition: testimonial.avatarPosition }}
                />
              </span>
              <span><strong>{testimonial.name}</strong><small>{testimonial.role}</small></span>
            </footer>
          </blockquote>
        ))}
      </div>
      <Link className="dl-section-link" href={`/mulai?claim=${demoClaimToken}`}>Coba Jalur Demo <ArrowRight aria-hidden="true" size={17} /></Link>
      <p className="dl-demo-note">Seluruh nama, foto, jenis usaha, dan kutipan pada bagian ini adalah skenario demonstrasi untuk menjelaskan pengalaman yang dituju. Bukan testimoni pelanggan atau klaim hasil aktual.</p>
    </section>
  );
}

function highlightText(text: string, highlight: string, tone: string) {
  const [before, after] = text.split(highlight);
  return <>{before}<mark className={`is-${tone}`}>{highlight}</mark>{after}</>;
}

function PricingSection({ checkupHref }: { checkupHref: string }) {
  const resolveHref = (type: string) => {
    if (type === "checkup") return checkupHref;
    if (type === "premium") return "/app/premium";
    return "mailto:hello@dekatlokal.com?subject=Minat%20Pendampingan%20Naik%20Kelas";
  };

  return (
    <section aria-labelledby="pricing-title" className="dl-pricing-section" id="paket">
      <div className="dl-pricing-heading">
        <h2 id="pricing-title">Mulai gratis. Lanjut saat <span className="dl-title-pill is-yellow">memang relevan.</span></h2>
        <p>Tuntaskan fondasi gratis terlebih dahulu, lalu pilih pendalaman sesuai hasil usaha dan tujuan berikutnya.</p>
      </div>

      <div className="dl-pricing-grid">
        {pricingPlans.map((plan) => (
          <article className={`dl-price-card ${plan.featured ? "is-featured" : ""}`} key={plan.name}>
            <div className="dl-price-head">
              {plan.featured ? <span className="dl-popular-plan">Pilihan Utama</span> : null}
              <p>{plan.name}</p>
              <strong>{plan.price}</strong>
              <small>sekali bayar</small>
            </div>
            <div className="dl-perforation" aria-hidden="true"><i /></div>
            <div className="dl-price-body">
              <p>{plan.description}</p>
              <ul>
                {plan.features.map(([feature, included]) => (
                  <li className={included ? undefined : "is-muted"} key={feature}>
                    <span>{included ? <Check aria-hidden="true" size={14} /> : "×"}</span>{feature}
                  </li>
                ))}
              </ul>
              <Link href={resolveHref(plan.hrefType)}>{plan.cta}<ArrowRight aria-hidden="true" size={16} /></Link>
            </div>
          </article>
        ))}
      </div>
      <p className="dl-pricing-note">Harga satu kali dan sudah termasuk pajak. Pembayaran, aktivasi course premium, klinik kelompok, serta review pendamping belum diaktifkan dalam demo frontend ini.</p>
    </section>
  );
}

function FinalCta({ checkupHref }: { checkupHref: string }) {
  const collage = [
    ["/landing/checkup-start.webp", "one"],
    ["/landing/outcome-aroma.webp", "two"],
    ["/landing/outcome-dapur.png", "three"],
    ["/landing/checkup-result.webp", "four"],
    ["/landing/outcome-kopi.webp", "five"],
    ["/landing/outcome-rumah-keripik.webp", "six"],
    ["/landing/outcome-gingerfit.webp", "seven"],
    ["/landing/outcome-eyfa.webp", "eight"],
  ] as const;

  return (
    <section aria-labelledby="start-title" className="dl-final-cta" id="mulai">
      <div aria-hidden="true" className="dl-cta-collage">
        {collage.map(([src, position]) => (
          <div className={`dl-collage-card is-${position}`} key={src}>
            <Image alt="" fill sizes="220px" src={src} />
          </div>
        ))}
      </div>
      <div className="dl-final-copy">
        <p className="dl-kicker">Langkah pertama dimulai di sini</p>
        <h2 id="start-title">Mulai dari satu Checkup. Pulang dengan langkah yang jelas.</h2>
        <p>Dalam beberapa menit, pahami kondisi usaha, temukan tiga fokus utama, dan mulai membangun Aset Usaha satu per satu.</p>
        <div>
          <Link className="dl-final-primary" href={checkupHref}>Mulai Digital Checkup <ArrowRight aria-hidden="true" size={18} /></Link>
          <Link className="dl-final-secondary" href="/masuk">Masuk ke Ruang Tumbuh</Link>
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ checkupHref }: { checkupHref: string }) {
  const policyHref = new URL("/kebijakan", checkupHref).toString();

  return (
    <footer className="dl-footer" data-testid="landing-footer">
      <div className="dl-footer-grid">
        <div className="dl-footer-about">
          <Image alt="DekatLokal" height={64} src="/brand/dekat-lokal.png" width={207} />
          <p>DekatLokal membantu UMKM memahami kondisi, belajar yang relevan, dan menuntaskan aksi usaha yang terukur.</p>
          <a href="mailto:hello@dekatlokal.com">hello@dekatlokal.com</a>
          <span>Indonesia</span>
        </div>
        <FooterColumn title="Platform" links={[["Digital Checkup", checkupHref], ["Cara Kerja", "#akses-belajar"], ["Course", "#course"], ["Harga", "#paket"]]} />
        <FooterColumn title="Ruang Tumbuh" links={[["Jalur Naik Kelas", "/masuk"], ["Jejak Tumbuh", "/masuk"], ["Aset Usaha", "/masuk"]]} />
        <FooterColumn title="Dukungan" links={[["Masuk", "/masuk"], ["Coba Demo", `/mulai?claim=${demoClaimToken}`], ["Bantuan", "mailto:hello@dekatlokal.com"], ["Hubungi Kami", "mailto:hello@dekatlokal.com"]]} />
      </div>
      <div aria-hidden="true" className="dl-footer-word">DekatLokal</div>
      <div className="dl-footer-bottom">
        <span>© 2026 DekatLokal. Hak cipta dilindungi.</span>
        <div><Link href={policyHref}>Kebijakan Privasi</Link><Link href={policyHref}>Syarat &amp; Ketentuan</Link></div>
        <span>UMKM bertumbuh dengan langkah yang lebih dekat.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="dl-footer-column">
      <h2>{title}</h2>
      {links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
    </div>
  );
}
