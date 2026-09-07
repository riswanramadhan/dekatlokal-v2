import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ScanSearch,
  Target,
} from "lucide-react";
import { CourseExplorer, type LandingCourse } from "@/components/landing/course-explorer";
import { HeroHeadline } from "@/components/landing/hero-headline";
import { HeroDashboardPreview } from "@/components/landing/hero-dashboard-preview";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingPricingSelector } from "@/components/landing/landing-pricing-selector";
import { LandingEffects } from "@/components/landing/landing-effects";
import { TestimonialsCarousel, type LandingStory } from "@/components/landing/testimonials-carousel";

type ModuleCardView = { slug: string; title: string; outcome: string; icon: string };
type CoursePresentation = Pick<LandingCourse, "access" | "category" | "duration" | "image" | "imageAlt" | "prerequisite" | "reason" | "recommended">;

const premiumPrerequisite = "Selesaikan tiga kelas dasar.";

const coursePresentationBySlug: Record<string, CoursePresentation> = {
  "digitalisasi-umkm": { access: "Gratis", category: "Digitalisasi", duration: "20-30 menit", image: "/platform-v2/courses/digitalisasi.webp", imageAlt: "Pelaku UMKM merapikan tampilan online usahanya", reason: "merapikan tampilan online usaha", recommended: true },
  "branding-umkm": { access: "Gratis", category: "Branding", duration: "25-35 menit", image: "/platform-v2/courses/branding.webp", imageAlt: "Proses menyusun identitas visual usaha lokal", reason: "membuat identitas lebih konsisten", recommended: true },
  "produk-dan-kemasan": { access: "Gratis", category: "Penjualan", duration: "25-35 menit", image: "/platform-v2/courses/kemasan.webp", imageAlt: "Pemilik UMKM menata kemasan produk", reason: "memperjelas informasi untuk pelanggan", recommended: true },
  "konsistensi-promosi": { access: "Gratis", category: "Penjualan", duration: "20-30 menit", image: "/platform-v2/courses/promosi.webp", imageAlt: "Pembuatan konten promosi produk UMKM" },
  "marketplace-dan-kanal-penjualan": { access: "Premium", category: "Penjualan", duration: "35-45 menit", image: "/platform-v2/courses/marketplace.webp", imageAlt: "Pemilik usaha mengelola pesanan dari tempat jualan", prerequisite: premiumPrerequisite },
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
  { id: "bio", business: "Bio Atama", category: "Produk alami", summary: "Produk bagus butuh pesan yang gampang dipahami. Bio Atama merapikan cara menjelaskan manfaat produknya supaya calon pelanggan tidak perlu menebak.", image: "/platform-v2/stories/latest/bio-atama.webp", imageAlt: "Tim Bio Atama menunjukkan perkembangan tampilan online usahanya", logo: "/umkm/bio-atama.webp" },
  { id: "eyfa", business: "Eyfa Natural Oil", category: "Perawatan alami", summary: "Identitas yang konsisten bikin produk lebih mudah dikenali. Eyfa mulai dari tampilan sederhana yang bisa dipakai di setiap tempat jualan.", image: "/platform-v2/stories/latest/eyfa-natural-oil.webp", imageAlt: "Tim Eyfa Natural Oil dalam perjalanan pengembangan usaha", logo: "/umkm/eyfa-natural-oil.webp" },
  { id: "gingerfit", business: "Gingerfit Plus", category: "Minuman herbal", summary: "Bertumbuh tidak harus serba sekaligus. Gingerfit memilih prioritas yang paling dekat, mengerjakannya, lalu lanjut ke langkah berikutnya.", image: "/platform-v2/stories/latest/gingerfit-plus.webp", imageAlt: "Tim Gingerfit Plus menunjukkan perkembangan usaha", logo: "/umkm/gingerfit-plus.webp" },
  { id: "iboo", business: "Iboo IDN", category: "Produk lokal", summary: "Saat rencana usaha lebih jelas, bikin konten dan mengambil keputusan terasa lebih ringan. Iboo IDN memulai dari hal yang paling berdampak.", image: "/platform-v2/stories/latest/iboo-idn.webp", imageAlt: "Tim Iboo IDN dalam perjalanan pengembangan usaha", logo: "/umkm/iboo-idn.webp" },
  { id: "kareppe", business: "Kareppe", category: "Kuliner", summary: "Cerita produk yang kuat membuat orang lebih mudah ingat. Kareppe menyusun tampilan online agar karakter produknya tetap terasa di layar.", image: "/platform-v2/stories/latest/kareppe.webp", imageAlt: "Tim Kareppe dalam perjalanan pengembangan usaha", logo: "/umkm/logo-kareppe-transparent.webp" },
  { id: "michi", business: "Kira Kira Michi", category: "Kuliner kreatif", summary: "Ide kreatif jadi lebih kuat saat tampilannya konsisten. Kira Kira Michi menyatukan identitas, konten, dan pengalaman pelanggan.", image: "/platform-v2/stories/latest/kira-kira-michi.webp", imageAlt: "Tim Kira Kira Michi menunjukkan perkembangan usaha", logo: "/umkm/kira-kira-michi.webp" },
  { id: "kopi", business: "Kopi Teko", category: "Kopi lokal", summary: "Kopi Teko merapikan informasi produk dan cara pemesanan agar pelanggan bisa menemukan, memahami, lalu membeli dengan lebih mudah.", image: "/platform-v2/stories/latest/kopi-teko.webp", imageAlt: "Tim Kopi Teko dalam perjalanan pengembangan usaha", logo: "/umkm/kopi-teko.webp" },
  { id: "pamboang", business: "Minyak Pamboang", category: "Produk tradisional", summary: "Produk lokal punya cerita yang layak dikenal lebih luas. Minyak Pamboang membawanya ke ruang digital dengan langkah yang bisa dikerjakan satu per satu.", image: "/platform-v2/stories/latest/minyak-pamboang.webp", imageAlt: "Tim Minyak Pamboang menunjukkan perkembangan tampilan online", logo: "/umkm/minyak-pamboang.webp" },
  { id: "mulkan", business: "Mulkan Mimbaun", category: "Produk lokal", summary: "Mulkan Mimbaun mengubah target besar menjadi langkah kecil yang jelas. Jadi lebih mudah dimulai dan dilanjutkan.", image: "/platform-v2/stories/latest/mulkan-mimbaun.webp", imageAlt: "Tim Mulkan Mimbaun dalam perjalanan pengembangan usaha", logo: "/umkm/mulkan-mimbaun.webp" },
  { id: "keripik", business: "Rumah Keripik", category: "Camilan", summary: "Rumah Keripik mulai dari informasi produk yang rapi, supaya promosi tidak cuma ramai sesaat tetapi benar-benar membantu penjualan.", image: "/platform-v2/stories/latest/rumah-keripik.webp", imageAlt: "Tim Rumah Keripik menunjukkan perkembangan usahanya", logo: "/umkm/rumah-keripik.webp" },
];

const faqItems = [
  {
    question: "Apakah Digital Checkup DekatLokal gratis?",
    answer:
      "Iya, gratis. Jawab pertanyaan tentang usahamu, lalu lihat apa yang sudah bagus dan apa yang perlu kamu perbaiki dulu.",
  },
  {
    question: "Apa yang saya dapat setelah mengisi Checkup?",
    answer:
      "Kamu dapat ringkasan kondisi usaha, tiga hal yang perlu didahulukan, dan pilihan materi belajar yang sesuai kebutuhanmu. Jadi, tahu mau mulai dari mana.",
  },
  {
    question: "Apakah harus punya akun dulu?",
    answer:
      "Nggak harus. Kamu bisa isi Digital Checkup dulu tanpa masuk akun. Setelah hasilnya keluar, ikuti petunjuk untuk melanjutkan belajar.",
  },
  {
    question: "Kalau saya belum terbiasa teknologi, apakah tetap bisa ikut?",
    answer:
      "Bisa banget. Materinya dibagi jadi langkah-langkah kecil, dengan contoh yang dekat dengan kegiatan jualan sehari-hari. Kamu bisa belajar pelan-pelan.",
  },
  {
    question: "Apakah hasil Checkup langsung membuat saya dapat website gratis?",
    answer:
      "Belum tentu. Website gratis mengikuti syarat dan kuota program. Mengisi Digital Checkup saja belum menjamin kamu mendapatkannya.",
  },
  {
    question: "Untuk apa data usaha saya dipakai?",
    answer:
      "Jawabanmu dipakai untuk menyusun hasil Digital Checkup dan saran belajar. Baca Kebijakan Privasi di bagian bawah halaman untuk tahu lebih lengkap tentang penggunaan data.",
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
      <LandingEffects />
    </div>
  );
}

function Hero({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="hero-title" className="dl-hero-section" id="beranda">
      <div aria-hidden="true" className="dl-hero-grid" />
      <div aria-hidden="true" className="dl-hero-orb dl-hero-orb-one" />
      <div aria-hidden="true" className="dl-hero-orb dl-hero-orb-two" />
      <div className="dl-hero-inner">
        <div className="dl-hero-copy" data-reveal-item id="konten-utama" tabIndex={-1}>
          <HeroHeadline />
          <p className="dl-hero-description">Usaha mau maju, tapi bingung mulai dari mana? Cek kondisinya dulu, lalu temukan langkah yang bisa kamu coba hari ini.</p>
          <div className="dl-hero-actions">
            <Link className="dl-primary-button" href={checkupHref}>Cek Usahaku Gratis <ArrowUpRight aria-hidden="true" size={18} /></Link>
            <Link className="dl-secondary-button" href="#akses-belajar">Lihat cara kerjanya</Link>
          </div>
          <ul className="dl-hero-trust" aria-label="Informasi Digital Checkup">
            {["Gratis", "Cuma 5–7 menit", "Hasil langsung"].map((item) => <li key={item}><CheckCircle2 aria-hidden="true" size={16} />{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="dl-hero-product" data-reveal-item>
        <HeroDashboardPreview />
      </div>

      <div aria-label="Usaha lokal bersama DekatLokal" className="dl-logo-strip" data-reveal-item tabIndex={0}>
        <p className="dl-logo-strip-label">Bareng usaha lokal, tumbuh selangkah lagi</p>
        <div className="dl-logo-mask">
          <div className="dl-logo-track">
            {[...umkmLogos, ...umkmLogos].map(([name, src], index) => (
              <span aria-hidden={index >= umkmLogos.length} className="dl-logo-item" key={`${name}-${index}`}><Image alt={index < umkmLogos.length ? name : ""} height={52} loading={index < 4 ? "eager" : "lazy"} src={src} unoptimized width={128} /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const accessSteps = [
  { number: "01", label: "Cek Usahaku Gratis", title: "Ceritakan kondisi usahamu", description: "Jawab pertanyaan sederhana dalam 5-7 menit.", image: "/platform-v2/access/checkup.webp", imageAlt: "Pemilik UMKM memulai Digital Checkup melalui ponsel", icon: ScanSearch },
  { number: "02", label: "Pahami hasil", title: "Lihat tiga fokus utama", description: "Temukan apa yang perlu dikerjakan lebih dahulu dan alasannya.", image: "/platform-v2/access/analysis.webp", imageAlt: "Pemilik usaha meninjau hasil analisis usahanya", icon: BarChart3 },
  { number: "03", label: "Langsung praktik", title: "Kerjakan langsung di usaha", description: "Coba latihan sederhana untuk produk, promosi, atau catatan usahamu.", image: "/platform-v2/access/action.webp", imageAlt: "Pelaku UMKM menerapkan aksi pada produk usahanya", icon: Target },
  { number: "04", label: "Lanjut belajar", title: "Belajar dari mana saja", description: "Belajar sebentar dulu, lanjut lagi saat ada waktu.", image: "/platform-v2/access/course.webp", imageAlt: "Pemilik UMKM belajar course menggunakan laptop", icon: BookOpenCheck },
] as const;

function AccessLearningSection() {
  return (
    <section aria-labelledby="access-title" className="dl-access-section dl-viewport-section" id="akses-belajar">
      <div className="dl-access-board" data-reveal-item>
        <article className="dl-access-lead">
          <div className="dl-access-lead-heading">
            <p className="dl-section-kicker">Cara kerjanya</p>
            <h2 id="access-title">
              Mulai dari yang penting. <span className="dl-title-pill">Lanjut tanpa bingung.</span>
            </h2>
            <p>
              Nggak perlu mengerjakan semuanya sekaligus. Mulai dari hal yang paling dibutuhkan usahamu, lalu lanjut satu per satu.
            </p>
          </div>
        </article>

        <div className="dl-access-row-list">
          {accessSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article className="dl-access-row" key={step.number}>
                <div aria-hidden="true" className="dl-access-row-icon">
                  <Icon size={23} />
                </div>
                <div className="dl-access-row-copy">
                  <span>{step.number} / {step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="dl-access-row-media">
                  <Image
                    alt={step.imageAlt}
                    fill
                    loading="eager"
                    sizes="(max-width: 560px) 86vw, 150px"
                    src={step.image}
                    unoptimized
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section aria-labelledby="experience-title" className="dl-testimonials-section dl-viewport-section" id="pengalaman">
      <div className="dl-story-heading" data-reveal-item><div><p className="dl-section-kicker">Cerita perjalanan UMKM</p><h2 id="experience-title">Bukan soal langsung besar. <span className="dl-title-pill">Soal terus bergerak.</span></h2></div><p>Kenalan dengan usaha lokal yang terus belajar, merapikan jualan, dan mencoba hal baru.</p></div>
      <TestimonialsCarousel stories={stories} />
    </section>
  );
}

function PricingSection({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="pricing-title" className="dl-pricing-section dl-viewport-section" id="paket">
      <LandingPricingSelector checkupHref={checkupHref} />
    </section>
  );
}

function FaqSection() {
  const faqGroups = [
    { title: "Tentang Digital Checkup", items: faqItems.slice(0, 3) },
    { title: "Tentang Ruang Tumbuh", items: faqItems.slice(3) },
  ];

  return (
    <section aria-labelledby="faq-title" className="dl-faq-section dl-viewport-section" id="faq">
      <div className="dl-faq-layout" data-reveal-item>
        <div className="dl-faq-copy">
          <div className="dl-faq-eyebrow">
            <span aria-hidden="true" className="dl-faq-logo">
              <Image alt="" height={32} loading="eager" src="/brand/dekat-lokal-icon.png" unoptimized width={32} />
            </span>
            <p className="dl-section-kicker">FAQ</p>
          </div>
          <h2 id="faq-title">Masih ada yang bikin ragu?</h2>
        </div>

        <div className="dl-faq-columns">
          {faqGroups.map((group, groupIndex) => (
            <section aria-labelledby={`faq-group-${groupIndex}`} className="dl-faq-category" key={group.title}>
              <h3 id={`faq-group-${groupIndex}`}>{group.title}</h3>
              <div className="dl-faq-list">
                {group.items.map((item, itemIndex) => (
                  <details
                    className="dl-faq-item dl-faq-reference-item"
                    key={item.question}
                    open={groupIndex === 0 && itemIndex === 0}
                  >
                    <summary>
                      <span>{item.question}</span>
                      <i aria-hidden="true" className="dl-faq-toggle" />
                    </summary>
                    <p className="dl-faq-answer">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="start-title" className="dl-final-cta dl-viewport-section" id="mulai">
      <div aria-hidden="true" className="dl-cta-grid" />
      <div className="dl-final-inner">
        <div className="dl-final-copy" data-reveal-item>
          <p className="dl-section-kicker">Langkah kecil, mulai hari ini</p>
          <h2 id="start-title">Usahamu punya peluang. Yuk, cari langkah berikutnya.</h2>
          <p>Luangkan 5–7 menit untuk cek usahamu. Lihat yang perlu dibenahi, lalu mulai dari yang paling mudah.</p>
          <div><Link className="dl-final-primary" href={checkupHref}>Cek Usahaku Sekarang <ArrowUpRight aria-hidden="true" size={18} /></Link></div>
        </div>
        <div aria-hidden="true" className="dl-final-visual" data-reveal-item>
          <Image alt="" height={1050} src="/platform-v2/hero/owner-cutout.webp" unoptimized width={820} />
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ checkupHref }: { checkupHref: string }) {
  return (
    <footer className="dl-footer" data-testid="landing-footer"><div className="dl-footer-grid"><div className="dl-footer-about"><Image alt="DekatLokal" height={64} src="/brand/dekat-lokal.png" width={207} /><p>Teman belajar pemilik usaha. Cek kondisi jualanmu, temukan yang perlu dibenahi, lalu coba langkah kecil setiap hari.</p><a href="mailto:hello@dekatlokal.com">hello@dekatlokal.com</a><span>Indonesia</span></div><FooterColumn title="Platform" links={[["Digital Checkup", checkupHref], ["Cara Kerja", "#akses-belajar"], ["Kelas", "#course"], ["Harga", "#paket"]]} /><FooterColumn title="Ruang Tumbuh" links={[["Mulai Belajar", "/masuk"], ["Perkembangan Belajar", "/masuk"], ["Hasil Praktik", "/masuk"]]} /><FooterColumn title="Dukungan" links={[["Masuk", "/masuk"], ["Bantuan", "mailto:hello@dekatlokal.com"], ["Hubungi Kami", "mailto:hello@dekatlokal.com"]]} /></div><div aria-hidden="true" className="dl-footer-word">DekatLokal</div><div className="dl-footer-bottom"><span>&copy; 2026 DekatLokal. Hak cipta dilindungi.</span><div><a href="https://dekatlokal.com/privacy-policy" rel="noreferrer" target="_blank">Kebijakan Privasi</a><a href="https://dekatlokal.com/terms-of-service" rel="noreferrer" target="_blank">Syarat &amp; Ketentuan</a></div><span>UMKM bertumbuh, satu langkah lebih dekat.</span></div></footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return <div className="dl-footer-column"><h2>{title}</h2>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>;
}
