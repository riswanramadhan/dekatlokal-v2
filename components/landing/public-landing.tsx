import Image from "next/image";
import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ScanSearch,
  Target,
} from "lucide-react";
import { CourseExplorer, type LandingCourse } from "@/components/landing/course-explorer";
import { HeroDashboardPreview } from "@/components/landing/hero-dashboard-preview";
import { LandingPricingSelector } from "@/components/landing/landing-pricing-selector";
import { LandingEffects } from "@/components/landing/landing-effects";
import { TestimonialsCarousel, type LandingStory } from "@/components/landing/testimonials-carousel";
import { fallbackModuleVisual, moduleVisualBySlug } from "@/lib/digital-checkup/module-catalog";
import EcosystemHeader from "@/components/ecosystem/ecosystem-header";
import EcosystemFooter from "@/components/ecosystem/ecosystem-footer";
import EcosystemWhatsAppFAB from "@/components/ecosystem/whatsapp-fab";
import FinalCTA from "@/components/ecosystem/final-cta";
import { EcosystemHero } from "@/components/ecosystem/ecosystem-hero";
import { RotatingWord } from "@/components/ecosystem/rotating-word";
import { AboutWithLogos } from "@/components/ecosystem/about-logos";

type ModuleCardView = { slug: string; title: string; outcome: string; icon: string };
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
  const courses: LandingCourse[] = modules.map((module) => ({ slug: module.slug, title: module.title, outcome: module.outcome, ...(moduleVisualBySlug[module.slug] ?? fallbackModuleVisual) }));

  return (
    <div className="dl-landing public-page-shell public-page-transition">
      <a className="dl-skip-link" href="#konten-utama">Lewati ke konten utama</a>
      <EcosystemHeader />
      <main>
        <Hero checkupHref={checkupHref} />
        <AccessLearningSection />
        <TestimonialsSection />
        <CourseExplorer courses={courses} />
        <PricingSection checkupHref={checkupHref} />
        <FaqSection />
      </main>
      <FinalCTA
        title="Kenali usahamu. Tentukan langkah berikutnya."
        description="Mulai dari Digital Checkup gratis, lalu lanjut belajar atau bikin website sesuai kebutuhan."
        primaryLabel="Mulai Checkup Gratis"
        primaryHref={checkupHref}
        secondaryLabel="Lihat Template Website"
        secondaryHref="/templates"
      />
      <EcosystemFooter />
      <EcosystemWhatsAppFAB />
      <LandingEffects />
    </div>
  );
}

function Hero({ checkupHref }: { checkupHref: string }) {
  return (
    <>
    <EcosystemHero
      id="hero-checkup"
      kicker="Digital Checkup gratis untuk UMKM"
      title={<>Cek kondisi usahamu, biar makin dekat dengan{" "}<RotatingWord words={["pelanggan", "cuan", "pasar", "peluang", "teknologi"]} className="font-mono font-medium tracking-[-0.055em]" /></>}
      description="Usaha mau maju, tapi bingung mulai dari mana? Cek kondisinya dulu, lalu temukan langkah yang bisa kamu coba hari ini."
      primary={{ label: "Mulai Checkup Gratis", href: checkupHref }}
      secondary={{ label: "Lihat cara kerjanya", href: "#akses-belajar" }}
      footnote={<ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Informasi Digital Checkup">{["Gratis", "Cuma 5–7 menit", "Hasil langsung"].map((item) => <li key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" size={15} />{item}</li>)}</ul>}
      visual={<div className="dl-hero-product eco-hero-product" id="konten-utama" tabIndex={-1}><HeroDashboardPreview /></div>}
    />
    <AboutWithLogos
      eyebrow="Tentang Digital Checkup"
      ghost="Checkup"
      title="Kenali kondisi usahamu dulu, lalu ambil langkah"
      accent="digital"
      after=" yang paling dibutuhkan."
      description="Digital Checkup memetakan 8 sisi digital usahamu dalam 5–7 menit, lalu memberi urutan prioritas dan kelas belajar yang sesuai. Bagian dari ekosistem DekatLokal: dari checkup, belajar, sampai website yang siap jualan."
      logos={umkmLogos}
    />
    </>
  );
}

const accessSteps = [
  { number: "01", label: "Mulai Checkup Gratis", title: "Ceritakan kondisi usahamu", description: "Jawab pertanyaan sederhana dalam 5–7 menit.", image: "/platform-v2/access/checkup.webp", imageAlt: "Pemilik UMKM memulai Digital Checkup melalui ponsel", icon: ScanSearch },
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
