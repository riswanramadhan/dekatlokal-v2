import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ScanSearch,
  Target,
} from "lucide-react";
import { CourseExplorer, type LandingCourse } from "@/components/landing/course-explorer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingRuntimeScript } from "@/components/landing/landing-runtime-script";
import { TestimonialsCarousel, type LandingStory } from "@/components/landing/testimonials-carousel";

type ModuleCardView = { slug: string; title: string; outcome: string; icon: string };
type CoursePresentation = Pick<LandingCourse, "access" | "category" | "duration" | "image" | "imageAlt" | "prerequisite" | "reason" | "recommended">;

const premiumPrerequisite = "Tuntaskan tiga course fondasi.";

const coursePresentationBySlug: Record<string, CoursePresentation> = {
  "digitalisasi-umkm": { access: "Gratis", category: "Digitalisasi", duration: "20-30 menit", image: "/platform-v2/courses/digitalisasi.webp", imageAlt: "Pelaku UMKM merapikan kanal digital usahanya", reason: "merapikan fondasi digital usaha", recommended: true },
  "branding-umkm": { access: "Gratis", category: "Branding", duration: "25-35 menit", image: "/platform-v2/courses/branding.webp", imageAlt: "Proses menyusun identitas visual usaha lokal", reason: "membuat identitas lebih konsisten", recommended: true },
  "produk-dan-kemasan": { access: "Gratis", category: "Penjualan", duration: "25-35 menit", image: "/platform-v2/courses/kemasan.webp", imageAlt: "Pemilik UMKM menata kemasan produk", reason: "memperjelas informasi untuk pelanggan", recommended: true },
  "konsistensi-promosi": { access: "Gratis", category: "Penjualan", duration: "20-30 menit", image: "/platform-v2/courses/promosi.webp", imageAlt: "Pembuatan konten promosi produk UMKM" },
  "marketplace-dan-kanal-penjualan": { access: "Premium", category: "Penjualan", duration: "35-45 menit", image: "/platform-v2/courses/marketplace.webp", imageAlt: "Pemilik usaha mengelola pesanan dari kanal penjualan", prerequisite: premiumPrerequisite },
  "operasional-dan-keuangan-dasar": { access: "Premium", category: "Operasional", duration: "35-45 menit", image: "/platform-v2/courses/keuangan.webp", imageAlt: "Pencatatan operasional dan keuangan usaha kecil", prerequisite: premiumPrerequisite },
  "legalitas-usaha": { access: "Premium", category: "Legalitas", duration: "30-40 menit", image: "/platform-v2/courses/legalitas.webp", imageAlt: "Dokumen legalitas usaha sedang disiapkan", prerequisite: premiumPrerequisite },
  "komitmen-dan-growth-mindset": { access: "Premium", category: "Pengembangan", duration: "30-40 menit", image: "/platform-v2/courses/growth.webp", imageAlt: "Pemilik UMKM menyusun rencana pertumbuhan", prerequisite: premiumPrerequisite },
};

const fallbackCoursePresentation: CoursePresentation = {
  access: "Gratis",
  category: "Digitalisasi",
  duration: "20-30 menit",
  image: "/platform-v2/courses/digitalisasi.webp",
  imageAlt: "Pelaku UMKM mengembangkan kemampuan digital",
};

const umkmLogos = [
  ["Aroma Bakery", "/umkm/aroma-bakery.webp"], ["Bakpia Malino", "/umkm/bakpia-malino.webp"],
  ["Banangih", "/umkm/banangih.webp"], ["Bio Atama", "/umkm/bio-atama.webp"],
  ["Dapur Karaeng", "/umkm/dapur-karaeng.jpg"], ["Eyfa Natural Oil", "/umkm/eyfa-natural-oil.webp"],
  ["Gingerfit Plus", "/umkm/gingerfit-plus.webp"], ["Growmates", "/umkm/growmates.webp"],
  ["Iboo IDN", "/umkm/iboo-idn.webp"], ["Kira Kira Michi", "/umkm/kira-kira-michi.webp"],
  ["Kopi Teko", "/umkm/kopi-teko.webp"], ["Kareppe", "/umkm/logo-kareppe-transparent.webp"],
  ["Minyak Pamboang", "/umkm/minyak-pamboang.webp"], ["Mulkan Mimbaun", "/umkm/mulkan-mimbaun.webp"],
  ["Rumah Keripik", "/umkm/rumah-keripik.webp"], ["Sikola Indonesia", "/umkm/sikola-indonesia.webp"],
  ["Synergy Unhas", "/umkm/synergy-unhas.webp"], ["With Soerai", "/umkm/with-soerai.webp"],
] as const;

const stories: LandingStory[] = [
  { id: "aroma", business: "Aroma Bakery", category: "Kuliner", summary: "Fondasi digital dimulai dari informasi produk yang rapi, mudah ditemukan, dan mudah dibagikan kepada pelanggan.", image: "/platform-v2/stories/aroma-bakery.webp", imageAlt: "Suasana usaha bakery lokal Indonesia" },
  { id: "bakpia", business: "Bakpia Malino", category: "Oleh-oleh", summary: "Kemasan, cerita produk, dan kanal pemesanan dapat dirangkai menjadi pengalaman pelanggan yang lebih konsisten.", image: "/platform-v2/stories/bakpia-malino.webp", imageAlt: "Suasana produksi oleh-oleh bakpia lokal" },
  { id: "bio", business: "Bio Atama", category: "Produk alami", summary: "Pesan usaha yang sederhana membantu manfaat produk dipahami tanpa membuat pelanggan menebak-nebak.", image: "/platform-v2/stories/bio-atama.webp", imageAlt: "Pelaku usaha produk alami Indonesia" },
  { id: "dapur", business: "Dapur Karaeng", category: "Kuliner", summary: "Konten promosi menjadi lebih ringan ketika ada fokus, jadwal, dan format yang dapat digunakan berulang.", image: "/platform-v2/stories/dapur-karaeng.webp", imageAlt: "Pemilik usaha kuliner di dapur Indonesia" },
  { id: "eyfa", business: "Eyfa Natural Oil", category: "Perawatan alami", summary: "Kejelasan identitas dan informasi produk menjadi dasar untuk membangun kepercayaan di kanal digital.", image: "/platform-v2/stories/eyfa-natural-oil.webp", imageAlt: "Suasana usaha perawatan alami lokal" },
  { id: "gingerfit", business: "Gingerfit Plus", category: "Minuman herbal", summary: "Catatan usaha yang teratur memudahkan pemilik melihat prioritas dan menentukan aksi berikutnya.", image: "/platform-v2/stories/gingerfit-plus.webp", imageAlt: "Pelaku UMKM menyiapkan minuman herbal" },
  { id: "keripik", business: "Rumah Keripik", category: "Camilan", summary: "Kanal penjualan yang tepat dipilih setelah fondasi produk dan operasional siap mendukung permintaan.", image: "/platform-v2/stories/rumah-keripik.webp", imageAlt: "Suasana usaha camilan keripik Indonesia" },
  { id: "sikola", business: "Sikola Indonesia", category: "Pendidikan", summary: "Rencana pertumbuhan yang realistis mengubah tujuan besar menjadi langkah kecil yang bisa diselesaikan.", image: "/platform-v2/stories/sikola-indonesia.webp", imageAlt: "Pelaku usaha bidang pendidikan lokal" },
];

const pricingPlans = [
  { name: "Fondasi Gratis", price: "Rp0", description: "Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.", features: ["Digital Checkup delapan aspek", "Tiga course fondasi personal", "Kuis dan tugas praktik usaha", "Aset Usaha dan Jejak Tumbuh"], cta: "Mulai Gratis", hrefType: "checkup", featured: false },
  { name: "Tumbuh Terarah", price: "Rp249.000", description: "Pendalaman mandiri untuk menguatkan hasil setelah fondasi selesai.", features: ["Semua manfaat Fondasi Gratis", "Empat course lanjutan", "Jalur tindakan personal 90 hari", "Workbook dan template premium"], cta: "Lihat Preview", hrefType: "premium", featured: true },
  { name: "Pendampingan Naik Kelas", price: "Rp799.000", description: "Belajar lebih terarah dengan klinik usaha dan review aset prioritas.", features: ["Semua manfaat Tumbuh Terarah", "Dua klinik usaha kelompok", "Review tiga Aset Usaha", "Rencana aksi personal 30 hari"], cta: "Daftar Minat", hrefType: "interest", featured: false },
] as const;

const faqItems = [
  {
    question: "Apakah Digital Checkup DekatLokal gratis?",
    answer:
      "Ya. Digital Checkup dapat dimulai gratis untuk memetakan kondisi usaha dan menemukan prioritas digital yang paling dekat untuk dikerjakan.",
  },
  {
    question: "Apa yang saya dapat setelah mengisi Checkup?",
    answer:
      "Kamu akan melihat ringkasan kondisi usaha, tiga fokus utama, alasan rekomendasi, dan jalur belajar singkat yang menghasilkan Aset Usaha.",
  },
  {
    question: "Apakah harus punya akun dulu?",
    answer:
      "Tidak harus. Kamu bisa mulai dari Checkup, lalu menghubungkan hasilnya ke Ruang Tumbuh dengan token klaim yang aman ketika ingin melanjutkan.",
  },
  {
    question: "Kalau saya belum terbiasa teknologi, apakah tetap bisa ikut?",
    answer:
      "Bisa. Ruang Tumbuh dibuat bertahap dengan instruksi pendek, tombol besar, dan langkah harian yang realistis untuk pemilik UMKM.",
  },
  {
    question: "Apakah hasil Checkup langsung membuat saya dapat website gratis?",
    answer:
      "Hasil Checkup membuka peluang mengikuti program dan menunjukkan kesiapan usaha. Kelayakan reward tetap mengikuti checklist, kapasitas program, dan syarat yang transparan.",
  },
  {
    question: "Apakah data usaha saya aman?",
    answer:
      "Hasil Checkup tidak menaruh skor atau data pribadi langsung di URL publik. Saat lanjut ke Ruang Tumbuh, hasil dihubungkan melalui token klaim yang aman.",
  },
] as const;

export function PublicLanding({ modules, checkupHref }: { modules: ModuleCardView[]; checkupHref: string }) {
  const courses: LandingCourse[] = modules.map((module) => ({ slug: module.slug, title: module.title, outcome: module.outcome, ...(coursePresentationBySlug[module.slug] ?? fallbackCoursePresentation) }));

  return (
    <div className="dl-landing">
      <a className="dl-skip-link" href="#konten-utama">Lewati ke konten utama</a>
      <LandingNavbar checkupHref={checkupHref} />
      <main>
        <Hero checkupHref={checkupHref} />
        <AccessLearningSection />
        <TestimonialsSection />
        <CourseExplorer courses={courses} />
        <PricingSection checkupHref={checkupHref} />
        <FaqSection />
        <FinalCta checkupHref={checkupHref} />
      </main>
      <LandingFooter checkupHref={checkupHref} />
      <LandingRuntimeScript />
    </div>
  );
}

function Hero({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="hero-title" className="dl-hero-section" id="beranda">
      <div aria-hidden="true" className="dl-hero-grid" />
      <div aria-hidden="true" className="dl-hero-soft-tiles" />
      <div className="dl-hero-copy" id="konten-utama" tabIndex={-1}>
        <h1 id="hero-title">Buka Potensi Usaha lewat Digital Checkup.</h1>
        <p className="dl-hero-description">Pahami kondisi UMKM, temukan prioritas paling penting, lalu lanjut ke course singkat yang menghasilkan Aset Usaha.</p>
        <div className="dl-hero-actions">
          <Link className="dl-primary-button" href={checkupHref}>Mulai Checkup Gratis</Link>
          <Link className="dl-secondary-button" href="#course">Lihat Course</Link>
        </div>
        <ul className="dl-hero-trust" aria-label="Informasi Digital Checkup">
          {["Gratis", "5-7 menit", "Hasil langsung"].map((item) => <li key={item}><CheckCircle2 aria-hidden="true" size={16} />{item}</li>)}
        </ul>
      </div>

      <div aria-label="UMKM dalam ekosistem DekatLokal" className="dl-logo-ticker" tabIndex={0}>
        <p className="dl-logo-trusted-label">Dipercaya oleh UMKM dan komunitas lokal</p>
        <div className="dl-logo-track">
          {[...umkmLogos, ...umkmLogos].map(([name, src], index) => (
            <span aria-hidden={index >= umkmLogos.length} className="dl-logo-item" key={`${name}-${index}`}><Image alt={index < umkmLogos.length ? name : ""} height={52} loading="eager" src={src} unoptimized width={128} /></span>
          ))}
        </div>
      </div>
    </section>
  );
}

const accessSteps = [
  { number: "01", label: "Mulai Checkup", title: "Ceritakan kondisi usahamu", description: "Jawab pertanyaan sederhana dalam 5-7 menit.", image: "/platform-v2/access/checkup.webp", imageAlt: "Pemilik UMKM memulai Digital Checkup melalui ponsel", icon: ScanSearch },
  { number: "02", label: "Pahami hasil", title: "Lihat tiga fokus utama", description: "Temukan apa yang perlu dikerjakan lebih dahulu dan alasannya.", image: "/platform-v2/access/analysis.webp", imageAlt: "Pemilik usaha meninjau hasil analisis usahanya", icon: BarChart3 },
  { number: "03", label: "Terapkan aksi", title: "Kerjakan langsung di usaha", description: "Setiap materi berujung pada tugas dan Aset Usaha.", image: "/platform-v2/access/action.webp", imageAlt: "Pelaku UMKM menerapkan aksi pada produk usahanya", icon: Target },
  { number: "04", label: "Lanjutkan course", title: "Belajar dari mana saja", description: "Simpan progres dan lanjutkan saat waktumu tersedia.", image: "/platform-v2/access/course.webp", imageAlt: "Pemilik UMKM belajar course menggunakan laptop", icon: BookOpenCheck },
] as const;

function AccessLearningSection() {
  return (
    <section aria-labelledby="access-title" className="dl-access-section dl-viewport-section" id="akses-belajar">
      <div className="dl-access-heading"><p className="dl-section-kicker">Satu jalur, dari pemetaan hingga tindakan</p><h2 id="access-title">Dari Checkup ke Course, <span className="dl-title-pill">tetap terarah</span>.</h2><p>Tidak perlu menebak apa yang harus dipelajari. Kondisi usahamu menentukan urutan langkah berikutnya.</p></div>
      <div className="dl-access-steps">
        {accessSteps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="dl-access-card" key={step.number}>
              <div className="dl-access-media"><Image alt={step.imageAlt} fill loading="eager" sizes="(max-width: 699px) 90vw, (max-width: 1099px) 46vw, 24vw" src={step.image} unoptimized /></div>
              <div className="dl-access-copy"><span>{step.number}</span><div><p>{step.label}</p><h3>{step.title}</h3><small>{step.description}</small><div className="dl-access-ui"><span><Icon aria-hidden="true" size={16} /></span><i><b /></i><small>{step.label}</small></div></div></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section aria-labelledby="experience-title" className="dl-testimonials-section dl-viewport-section" id="pengalaman">
      <div className="dl-story-heading"><div><p className="dl-section-kicker">Cerita Perjalanan UMKM</p><h2 id="experience-title">Setiap usaha punya <span className="dl-title-pill">langkah terdekat</span>.</h2></div><p>Gambaran fokus perjalanan dari pelaku usaha lokal. Visual bersifat representatif dan tidak digunakan sebagai klaim hasil pelanggan.</p></div>
      <TestimonialsCarousel stories={stories} />
    </section>
  );
}

function PricingSection({ checkupHref }: { checkupHref: string }) {
  const resolveHref = (type: string) => type === "checkup" ? checkupHref : type === "premium" ? "/app/premium" : "mailto:hello@dekatlokal.com?subject=Minat%20Pendampingan%20Naik%20Kelas";
  return (
    <section aria-labelledby="pricing-title" className="dl-pricing-section dl-viewport-section" id="paket">
      <div className="dl-pricing-heading"><p className="dl-section-kicker">Mulai dari kebutuhan, bukan paket terbesar</p><h2 id="pricing-title">Mulai gratis. Lanjut saat <span className="dl-title-pill">memang relevan</span>.</h2><p>Tuntaskan fondasi gratis lebih dahulu, lalu pilih pendalaman sesuai hasil usaha dan tujuan berikutnya.</p></div>
      <div className="dl-pricing-grid">
        {pricingPlans.map((plan) => (
          <article className={`dl-price-card${plan.featured ? " is-featured" : ""}`} data-testid={plan.featured ? "featured-ticket" : undefined} key={plan.name}>
            {plan.featured ? <><i aria-hidden="true" className="dl-ticket-notch is-left" /><i aria-hidden="true" className="dl-ticket-notch is-right" /></> : null}
            <div className="dl-price-head">{plan.featured ? <span className="dl-popular-plan">Paling relevan setelah fondasi</span> : null}<p>{plan.name}</p><strong>{plan.price}</strong><small>sekali bayar</small></div>
            <div className="dl-perforation" aria-hidden="true"><span /><i /></div>
            <div className="dl-price-body"><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}><span><Check aria-hidden="true" size={14} /></span>{feature}</li>)}</ul><Link href={resolveHref(plan.hrefType)}>{plan.cta}<ArrowRight aria-hidden="true" size={16} /></Link></div>
          </article>
        ))}
      </div>
      <p className="dl-pricing-note">Aktivasi pembayaran dan layanan pendampingan belum tersedia. Kamu tetap dapat memulai fondasi gratis dan melihat preview course lanjutan.</p>
    </section>
  );
}

function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="dl-faq-section dl-viewport-section" id="faq">
      <div className="dl-faq-copy">
        <p className="dl-section-kicker">FAQ</p>
        <h2 id="faq-title">Yang Perlu Kamu Tahu Tentang Digital Checkup.</h2>
        <span aria-hidden="true" className="dl-faq-logo">
          <Image alt="" height={38} src="/brand/dekat-lokal-icon.png" unoptimized width={38} />
        </span>
      </div>
      <div className="dl-faq-list">
        {faqItems.map((item, index) => (
          <details className="dl-faq-item" key={item.question} open={index === 3}>
            <summary>
              <span>{item.question}</span>
              <i aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="start-title" className="dl-final-cta dl-viewport-section" id="mulai">
      <div aria-hidden="true" className="dl-cta-grid" />
      <div className="dl-final-copy"><h2 id="start-title">Siap Naikkan Kelas Usaha?</h2><p>Dapatkan prioritas tindakan, course singkat, dan Aset Usaha yang membantu pelanggan lebih mudah percaya.</p><div><Link className="dl-final-primary" href={checkupHref}>Mulai Checkup Gratis</Link></div></div>
      <div aria-hidden="true" className="dl-final-person">
        <Image alt="" height={1050} src="/platform-v2/hero/owner-cutout.webp" unoptimized width={820} />
      </div>
    </section>
  );
}

function LandingFooter({ checkupHref }: { checkupHref: string }) {
  const policyHref = "https://dekatlokal.com/kebijakan";
  return (
    <footer className="dl-footer" data-testid="landing-footer"><div className="dl-footer-grid"><div className="dl-footer-about"><Image alt="DekatLokal" height={64} src="/brand/dekat-lokal.png" width={207} /><p>DekatLokal membantu UMKM memahami kondisi, belajar yang relevan, dan menuntaskan aksi usaha yang terukur.</p><a href="mailto:hello@dekatlokal.com">hello@dekatlokal.com</a><span>Indonesia</span></div><FooterColumn title="Platform" links={[["Digital Checkup", checkupHref], ["Cara Kerja", "#akses-belajar"], ["Course", "#course"], ["Harga", "#paket"]]} /><FooterColumn title="Ruang Tumbuh" links={[["Jalur Naik Kelas", "/masuk"], ["Jejak Tumbuh", "/masuk"], ["Aset Usaha", "/masuk"]]} /><FooterColumn title="Dukungan" links={[["Masuk", "/masuk"], ["Bantuan", "mailto:hello@dekatlokal.com"], ["Hubungi Kami", "mailto:hello@dekatlokal.com"]]} /></div><div aria-hidden="true" className="dl-footer-word">DekatLokal</div><div className="dl-footer-bottom"><span>&copy; 2026 DekatLokal. Hak cipta dilindungi.</span><div><Link href={policyHref}>Kebijakan Privasi</Link><Link href={policyHref}>Syarat &amp; Ketentuan</Link></div><span>UMKM bertumbuh dengan langkah yang lebih dekat.</span></div></footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return <div className="dl-footer-column"><h2>{title}</h2>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>;
}
