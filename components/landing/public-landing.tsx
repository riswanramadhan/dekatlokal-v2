import "@/app/landing.css";

import { adminWhatsApp } from "@/lib/digital-checkup/contact";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  ScanSearch,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/system/reveal";
import { CourseExplorer, buildLandingCourses } from "@/components/landing/course-explorer";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { HeroHeadline } from "@/components/landing/hero-headline";
import { HeroVisual } from "@/components/landing/hero-visual";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingPricingSelector } from "@/components/landing/landing-pricing-selector";
import { SectionHeading } from "@/components/landing/section-heading";
import { TestimonialsCarousel, type LandingStory } from "@/components/landing/testimonials-carousel";

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

const accessSteps = [
  { number: "01", label: "Mulai Checkup Gratis", title: "Ceritakan kondisi usahamu", description: "Jawab pertanyaan sederhana dalam 5–7 menit.", image: "/platform-v2/access/checkup.webp", imageAlt: "Pemilik UMKM memulai Digital Checkup melalui ponsel", icon: ScanSearch, tone: "var(--color-primary)", tint: "var(--color-primary-soft)", wide: true },
  { number: "02", label: "Pahami hasil", title: "Lihat tiga fokus utama", description: "Temukan apa yang perlu dikerjakan lebih dahulu dan alasannya.", image: "/platform-v2/access/analysis.webp", imageAlt: "Pemilik usaha meninjau hasil analisis usahanya", icon: BarChart3, tone: "#5b3fd6", tint: "var(--color-violet-soft)", wide: false },
  { number: "03", label: "Langsung praktik", title: "Kerjakan langsung di usaha", description: "Coba latihan sederhana untuk produk, promosi, atau catatan usahamu.", image: "/platform-v2/access/action.webp", imageAlt: "Pelaku UMKM menerapkan aksi pada produk usahanya", icon: Target, tone: "var(--color-success)", tint: "var(--color-mint-soft)", wide: false },
  { number: "04", label: "Lanjut belajar", title: "Belajar dari mana saja", description: "Belajar sebentar dulu, lanjut lagi saat ada waktu.", image: "/platform-v2/access/course.webp", imageAlt: "Pemilik UMKM belajar course menggunakan laptop", icon: BookOpenCheck, tone: "var(--color-warning)", tint: "var(--color-amber-soft)", wide: true },
] as const;

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

const faqGroups = [
  { title: "Tentang Digital Checkup", items: faqItems.slice(0, 3) },
  { title: "Tentang Ruang Tumbuh", items: faqItems.slice(3) },
];

export function PublicLanding({ checkupHref }: { checkupHref: string }) {
  const courses = buildLandingCourses();

  return (
    <div className="dl-landing">
      <a className="dl-skip-link" href="#konten-utama">Lewati ke konten utama</a>
      <LandingNavbar checkupHref={checkupHref} />
      <main id="konten-utama" tabIndex={-1}>
        <Hero checkupHref={checkupHref} />
        <AccessLearningSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CourseExplorer courses={courses} />
        <PricingSection checkupHref={checkupHref} />
        <FaqSection />
        <FinalCta checkupHref={checkupHref} />
      </main>
      <LandingFooter checkupHref={checkupHref} />
    </div>
  );
}

function Hero({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="hero-title" className="dl-hero" id="beranda">
      <div aria-hidden="true" className="dl-hero-bg" />
      <div className="container-x">
        <div className="dl-hero-inner">
          <div className="dl-hero-copy">
            <span className="chip dl-hero-chip">
              <i><Sparkles aria-hidden="true" size={12} /></i>
              Digital Checkup gratis untuk UMKM
            </span>
            <HeroHeadline />
            <p className="dl-hero-desc">
              Usaha mau maju, tapi bingung mulai dari mana? Cek kondisinya dulu, lalu temukan langkah yang bisa kamu coba hari ini.
            </p>
            <div className="dl-hero-actions">
              <Link className="btn btn-primary btn-lg" href={checkupHref}>
                Mulai Checkup Gratis <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
              <Link className="btn btn-secondary btn-lg" href="#akses-belajar">Lihat cara kerjanya</Link>
            </div>
            <ul aria-label="Informasi Digital Checkup" className="dl-hero-trust">
              {["Gratis", "Cuma 5–7 menit", "Hasil langsung"].map((item) => (
                <li key={item}><CheckCircle2 aria-hidden="true" size={16} />{item}</li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>

        <div aria-label="Usaha lokal bersama DekatLokal" className="dl-logos">
          <p className="dl-logos-label">Bareng usaha lokal, tumbuh selangkah lagi</p>
          <div className="dl-logos-mask">
            <div className="dl-logos-track">
              {[...umkmLogos, ...umkmLogos].map(([name, src], index) => (
                <span aria-hidden={index >= umkmLogos.length} className="dl-logo" key={`${name}-${index}`}>
                  <Image alt={index < umkmLogos.length ? name : ""} height={44} loading={index < 6 ? "eager" : "lazy"} src={src} unoptimized width={120} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccessLearningSection() {
  return (
    <section aria-labelledby="access-title" className="dl-section" id="akses-belajar">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            center
            description="Nggak perlu mengerjakan semuanya sekaligus. Mulai dari hal yang paling dibutuhkan usahamu, lalu lanjut satu per satu."
            eyebrow="Cara kerjanya"
            title={<>Mulai dari yang penting. <span className="dl-mark-pill">Lanjut tanpa bingung.</span></>}
            titleId="access-title"
          />
        </Reveal>

        <RevealGroup className="dl-steps">
          {accessSteps.map((step) => {
            const Icon = step.icon;
            return (
              <RevealItem
                className={`dl-step ${step.wide ? "is-wide" : "is-narrow"}`}
                key={step.number}
                style={{ "--dl-tone": step.tone, "--dl-tint": step.tint } as CSSProperties}
              >
                <div className="dl-step-body">
                  <div className="dl-step-top">
                    <span aria-hidden="true" className="dl-step-icon"><Icon size={23} /></span>
                    <span className="dl-step-num">{step.number}</span>
                  </div>
                  <span className="dl-step-label">{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="dl-step-media">
                  <Image alt={step.imageAlt} fill sizes="(max-width: 699px) 90vw, (max-width: 1023px) 46vw, 340px" src={step.image} unoptimized />
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section aria-labelledby="benefit-title" className="dl-section-tight dl-section" id="manfaat">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            center
            description="Semuanya dimulai dari checkup gratis. Hasilnya jadi peta yang jelas untuk langkah berikutnya."
            eyebrow="Yang kamu dapat"
            title={<>Bukan cuma skor. <span className="dl-mark-pill">Arah yang jelas.</span></>}
            titleId="benefit-title"
          />
        </Reveal>

        <RevealGroup className="dl-benefits">
          <RevealItem className="dl-benefit" style={{ "--dl-tint": "var(--color-primary-soft)" } as CSSProperties}>
            <div aria-hidden="true" className="dl-benefit-visual">
              <div className="dl-mini-bars">
                {[72, 46, 88, 58, 39, 80, 64, 90].map((height, index) => (
                  <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} />
                ))}
              </div>
            </div>
            <div>
              <h3>Nilai 8 bagian usaha</h3>
              <p>Dari kenal usaha sendiri, legalitas, produk, merek, sampai pemakaian digital. Kamu tahu mana yang sudah kuat dan mana yang perlu dibenahi.</p>
            </div>
            <span className="chip chip-primary dl-benefit-tag"><BarChart3 size={14} /> Hasil langsung</span>
          </RevealItem>

          <RevealItem className="dl-benefit" style={{ "--dl-tint": "var(--color-violet-soft)" } as CSSProperties}>
            <div aria-hidden="true" className="dl-benefit-visual">
              <div className="dl-experts">
                <div className="dl-expert-avatars">
                  <span><UserRound size={20} /></span>
                  <span><UserRound size={20} /></span>
                  <span><UserRound size={20} /></span>
                </div>
                <ArrowRight className="dl-experts-arrow" size={18} />
                <div className="dl-expert-stack">
                  <span><i>1</i>Mulai Jualan Online</span>
                  <span><i>2</i>Usaha Mudah Diingat</span>
                  <span><i>3</i>Produk &amp; Kemasan</span>
                </div>
              </div>
            </div>
            <div>
              <h3>3 modul prioritas dari penilaian 3 ahli</h3>
              <p>Jawabanmu dinilai oleh tiga ahli usaha, lalu dirangkum jadi tiga modul yang paling pas untuk dikerjakan dulu.</p>
            </div>
            <span className="chip chip-violet dl-benefit-tag"><Users size={14} /> Dinilai manusia, bukan robot</span>
          </RevealItem>

          <RevealItem className="dl-benefit" style={{ "--dl-tint": "var(--color-mint-soft)" } as CSSProperties}>
            <div aria-hidden="true" className="dl-benefit-visual">
              <div className="dl-days-row">
                <div className="dl-days">
                  {["H1", "H2", "H3", "H4", "H5", "H6", "H7"].map((day, index) => (
                    <span className={index < 3 ? "is-done" : undefined} key={day}>{index < 3 ? "✓" : day}</span>
                  ))}
                </div>
                <div className="dl-days-chips">
                  <span className="chip chip-mint">Latihan</span>
                  <span className="chip chip-amber">Kuis</span>
                </div>
              </div>
            </div>
            <div>
              <h3>Akses modul gratis 7 hari + latihan &amp; kuis</h3>
              <p>Buka modul prioritasmu tanpa biaya selama 7 hari. Ada latihan dan kuis singkat supaya yang dipelajari langsung kepakai.</p>
            </div>
            <span className="chip chip-mint dl-benefit-tag"><ClipboardCheck size={14} /> Langsung praktik</span>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section aria-labelledby="experience-title" className="dl-section" id="pengalaman">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            description="Kenalan dengan usaha lokal yang terus belajar, merapikan jualan, dan mencoba hal baru."
            eyebrow="Cerita perjalanan UMKM"
            title={<>Bukan soal langsung besar. <span className="dl-mark-pill">Soal terus bergerak.</span></>}
            titleId="experience-title"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialsCarousel stories={stories} />
        </Reveal>
      </div>
    </section>
  );
}

function PricingSection({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="pricing-title" className="dl-section" id="paket">
      <div className="container-x">
        <Reveal>
          <LandingPricingSelector checkupHref={checkupHref} />
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="dl-section" id="faq">
      <div className="container-x">
        <div className="dl-faq">
          <Reveal className="dl-faq-copy">
            <SectionHeading
              description="Kalau pertanyaanmu belum ada di sini, langsung saja tanya tim DekatLokal lewat WhatsApp."
              eyebrow="Tanya jawab"
              title="Masih ada yang bikin ragu?"
              titleId="faq-title"
            />
            <a className="btn btn-secondary" href={adminWhatsApp()} rel="noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" size={18} /> Tanya lewat WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <FaqAccordion groups={faqGroups} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ checkupHref }: { checkupHref: string }) {
  return (
    <section aria-labelledby="start-title" className="dl-section-tight dl-section dl-cta-refined" id="mulai">
      <div className="container-x">
        <Reveal>
          <div className="dl-cta-box">
            <div className="dl-cta-copy">
              <p className="eyebrow">Langkah kecil, mulai hari ini</p>
              <h2 id="start-title">Kenali usahamu. Tentukan langkah berikutnya.</h2>
              <p>Mulai dari checkup gratis. Lihat kondisi usahamu dan lanjut belajar sesuai kebutuhan.</p>
              <div className="dl-cta-actions">
                <Link className="btn btn-lg dl-btn-white" href={checkupHref}>
                  Mulai Checkup Gratis <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
                <a className="btn btn-lg dl-btn-outline-white" href={adminWhatsApp()} rel="noreferrer" target="_blank">
                  Tanya dulu
                </a>
              </div>
            </div>
            <div aria-hidden="true" className="dl-cta-figure">
              <Image alt="" fill sizes="(max-width: 899px) 0px, 360px" src="/platform-v2/hero/owner-cutout.webp" unoptimized />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LandingFooter({ checkupHref }: { checkupHref: string }) {
  return (
    <footer className="dl-footer" data-testid="landing-footer">
      <div className="container-x">
        <div className="dl-footer-grid">
          <div className="dl-footer-about">
            <Image alt="DekatLokal" height={40} src="/brand/dekat-lokal.png" unoptimized width={130} />
            <p>Teman belajar pemilik usaha. Cek kondisi jualanmu, temukan yang perlu dibenahi, lalu coba langkah kecil setiap hari.</p>
            <a href={adminWhatsApp()} rel="noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" size={16} /> Hubungi DekatLokal
            </a>
            <span>Indonesia</span>
          </div>
          <FooterColumn links={[["Digital Checkup", checkupHref], ["Cara Kerja", "#akses-belajar"], ["Modul", "#course"], ["Harga", "#paket"]]} title="Platform" />
          <FooterColumn links={[["Mulai Belajar", "/masuk"], ["Perkembangan Belajar", "/masuk"], ["Hasil Praktik", "/masuk"]]} title="Ruang Tumbuh" />
          <FooterColumn links={[["Masuk", "/masuk"], ["Bantuan", adminWhatsApp()], ["Hubungi Kami", adminWhatsApp()]]} title="Dukungan" />
        </div>
        <div className="dl-footer-bottom">
          <span>&copy; 2026 DekatLokal. Hak cipta dilindungi.</span>
          <div className="dl-footer-legal">
            <a href="https://dekatlokal.com/privacy-policy" rel="noreferrer" target="_blank">Kebijakan Privasi</a>
            <a href="https://dekatlokal.com/terms-of-service" rel="noreferrer" target="_blank">Syarat &amp; Ketentuan</a>
          </div>
          <span>UMKM bertumbuh, satu langkah lebih dekat.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="dl-footer-column">
      <h2>{title}</h2>
      {links.map(([label, href]) =>
        href.startsWith("http") ? (
          <a href={href} key={label} rel="noreferrer" target="_blank">{label}</a>
        ) : (
          <Link href={href} key={label}>{label}</Link>
        ),
      )}
    </div>
  );
}
