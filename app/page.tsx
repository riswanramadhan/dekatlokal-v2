import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  PackageCheck,
  PlayCircle,
  Smartphone,
  Sparkles,
  Sprout,
  Store,
} from "lucide-react";
import { BrandLogo } from "@/components/app-shell";
import { ButtonLink, ProgressBar, StatusPill } from "@/components/ui";
import { SoundToggle } from "@/components/sound";
import { getRepositoriesForRequest } from "@/domain/services/app-service";
import { env } from "@/lib/env";

const iconMap = {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  PackageCheck,
  Smartphone,
  Sprout,
  Store,
} as const;

const faqs = [
  {
    question: "Apakah harus bayar?",
    answer:
      "Demo fondasi berjalan gratis. Fitur premium hanya muncul sebagai preview personal dan tidak ada pembayaran aktif.",
  },
  {
    question: "Kenapa hanya tiga modul?",
    answer:
      "Agar pemilik usaha tidak bingung memilih. Tiga fokus dipilih dari Digital Checkup dan dikerjakan bertahap.",
  },
  {
    question: "Apakah bisa belajar lewat HP?",
    answer:
      "Ya. Ruang Tumbuh dibuat mobile-first dengan tombol besar, progress singkat, dan CTA tetap di bawah.",
  },
  {
    question: "Bagaimana hasil Digital Checkup terhubung?",
    answer:
      "Hasil dari dekatlokal.com masuk ke app lewat token klaim opaque. Skor dan data pribadi tidak ditaruh di URL.",
  },
  {
    question: "Kapan bisa mendapatkan landing page?",
    answer:
      "Setelah tiga modul selesai, ujian akhir lulus, Checkup ulang selesai, aset usaha lengkap, syarat diterima, dan kapasitas program tersedia.",
  },
  {
    question: "Apakah progres tersimpan?",
    answer:
      "Ya untuk demo mock. Di produksi nanti penyimpanan pindah ke akun dan database server-side.",
  },
];

export default async function PublicLandingPage() {
  const repositories = await getRepositoriesForRequest();
  const modules = await repositories.learning.listFoundationalModules();
  const checkupHref = new URL("/digital-checkup", env.NEXT_PUBLIC_MAIN_SITE_URL).toString();

  return (
    <main className="v3-shell min-h-screen overflow-hidden text-text-primary">
      <header className="sticky top-0 z-30 border-b border-white/80 bg-white/86 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <BrandLogo href="/" />
          <nav className="hidden items-center gap-5 text-sm font-bold text-text-secondary md:flex">
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#modul">Modul</a>
            <a href="#dampak">Dampak</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <SoundToggle className="hidden lg:inline-flex" />
            <Link
              className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold text-text-secondary md:inline-flex"
              href="/masuk"
            >
              Masuk
            </Link>
            <ButtonLink className="min-h-11 rounded-full px-4 text-sm" href={checkupHref}>
              Mulai Digital Checkup
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="v3-decor relative px-4 pb-12 pt-8 md:pt-14">
        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_25rem] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-primary/15 bg-white px-3 text-sm font-bold text-brand-primary shadow-[var(--shadow-soft)]">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Ruang Tumbuh untuk UMKM
            </div>
            <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.08] md:text-6xl">
              Dari hasil Digital Checkup menjadi langkah nyata untuk usahamu.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary md:text-lg">
              DekatLokal memilih tiga fokus utama, membimbingmu belajar singkat,
              menerapkannya ke usaha, lalu mengukur perkembanganmu.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink className="rounded-full" href={checkupHref}>
                Mulai Digital Checkup
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink className="rounded-full" href="/mulai?claim=demo-warung-rina" variant="secondary">
                Coba Demo Jalur
                <PlayCircle aria-hidden="true" className="h-5 w-5" />
              </ButtonLink>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="cara-kerja" className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Cara kerja"
            title="Satu perjalanan, tiga fokus, hasil yang bisa dipakai."
            body="Pengguna tidak memilih katalog acak. Jalur disusun dari kondisi usaha dan dibuktikan lewat aksi."
          />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["1", "Isi Digital Checkup", "Mulai dari dekatlokal.com tanpa login produksi."],
              ["2", "Selesaikan tiga fokus", "Belajar pendek, kuis, lalu tugas usaha."],
              ["3", "Ukur perkembangan", "Checkup ulang, before-after, sertifikat, dan reward."],
            ].map(([number, title, body]) => (
              <article className="compact-card p-5" key={number}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-sm font-extrabold text-white">
                  {number}
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-base leading-7 text-text-secondary">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <StatusPill>Masalah yang diselesaikan</StatusPill>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Terlalu banyak materi membuat pemilik usaha berhenti sebelum mulai.
            </h2>
            <p className="mt-3 text-base leading-8 text-text-secondary">
              DekatLokal menyederhanakan pilihan menjadi tiga kebutuhan utama,
              menjelaskan alasannya, lalu mengubah belajar menjadi Aset Usaha.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Langkah Terbaik Hari Ini", "Satu aksi utama terlihat dalam 10 detik."],
              ["Aset Usaha", "Tugas menghasilkan data yang bisa dipakai ulang."],
              ["Checkup ulang", "Perubahan usaha terlihat sebelum dan sesudah."],
              ["Reward transparan", "Eligibility dijelaskan lewat checklist."],
            ].map(([title, body]) => (
              <article className="compact-card p-4" key={title}>
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-brand-primary" />
                <h3 className="mt-3 font-extrabold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modul" className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="8 modul fondasi"
            title="Semua tersedia, tapi dashboard hanya menonjolkan tiga fokus."
            body="Modul lain tetap bisa dipreview sebagai referensi terkunci agar pengguna tidak terdistraksi dari jalur aktif."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const Icon = iconMap[module.icon as keyof typeof iconMap] ?? BookOpen;
              return (
                <article className="compact-card p-4" key={module.slug}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold leading-tight">{module.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        {module.outcome}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="dampak" className="px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-5">
          {[
            ["Guided lesson", "Satu konsep per layar, 3-7 menit."],
            ["Post-test", "Umpan balik langsung dan review topik lemah."],
            ["Tugas usaha", "Checklist, teks, link, dan foto mock."],
            ["Aset Usaha", "Output tersimpan untuk profil dan reward."],
            ["Before-after", "Checkup ulang menunjukkan perubahan."],
          ].map(([title, body]) => (
            <article className="compact-card p-4" key={title}>
              <BarChart3 aria-hidden="true" className="h-5 w-5 text-brand-primary" />
              <h3 className="mt-3 font-extrabold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-xl)] bg-brand-primary p-5 text-white shadow-[var(--shadow-blue)] md:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_18rem] md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-white/72">
                Reward landing page
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight">
                Reward baru terbuka setelah usaha benar-benar siap.
              </h2>
              <p className="mt-3 text-base leading-8 text-white/82">
                Syaratnya transparan: tiga modul selesai, ujian akhir lulus,
                Checkup ulang selesai, Aset Usaha lengkap, syarat diterima, dan
                kapasitas program tersedia.
              </p>
            </div>
            <Image
              alt=""
              className="mx-auto aspect-square w-44 rounded-[24px] object-cover"
              height={240}
              src="/illustrations/reward-hero.png"
              width={240}
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Contoh testimoni"
            title="Placeholder demo, bukan klaim pengguna asli."
            body="Testimoni nyata perlu persetujuan dan sumber yang terverifikasi sebelum digunakan produksi."
          />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              "Demo: Saya jadi tahu langkah pertama tanpa harus mencari materi sendiri.",
              "Demo: Tugasnya langsung bisa dipakai untuk profil usaha.",
              "Demo: Checkup ulang membantu melihat perubahan dengan lebih jelas.",
            ].map((quote) => (
              <blockquote className="compact-card p-5 text-base leading-7 text-text-secondary" key={quote}>
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="FAQ"
            title="Pertanyaan yang biasanya muncul sebelum mulai."
            body="Jawaban dibuat untuk demo mock dan akan disesuaikan saat produksi."
          />
          <div className="mt-6 grid gap-3">
            {faqs.map((faq) => (
              <details className="compact-card p-4" key={faq.question}>
                <summary className="flex cursor-pointer items-center gap-3 font-extrabold">
                  <HelpCircle aria-hidden="true" className="h-5 w-5 text-brand-primary" />
                  {faq.question}
                </summary>
                <p className="mt-3 text-base leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight">
            Mulai dari Digital Checkup, lanjutkan dengan tiga langkah paling penting.
          </h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink className="rounded-full" href={checkupHref}>
              Mulai dari Digital Checkup
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink className="rounded-full" href="/mulai?claim=demo-warung-rina" variant="secondary">
              Coba Demo Jalur
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold leading-tight">{title}</h2>
      <p className="mt-3 text-base leading-8 text-text-secondary">{body}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="compact-card mx-auto w-full max-w-[25rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-text-muted">Ruang Tumbuh</p>
          <h2 className="font-extrabold">Warung Rina</h2>
        </div>
        <StatusPill>Demo</StatusPill>
      </div>
      <div className="mt-4 rounded-[22px] bg-brand-primary p-4 text-white">
        <p className="text-sm font-bold text-white/75">Langkah Terbaik Hari Ini</p>
        <h3 className="mt-2 text-xl font-extrabold leading-tight">
          Rapikan Fondasi Digital
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/82">
          Karena Kehadiran Digital masih 38/100, mulai dari profil usaha yang jelas.
        </p>
        <div className="mt-4">
          <ProgressBar value={33} />
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {["Digitalisasi UMKM", "Branding UMKM", "Konsistensi Promosi"].map((title, index) => (
          <div className="flex items-center gap-3 rounded-[18px] border border-border-default bg-white p-3" key={title}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary-soft text-sm font-extrabold text-brand-primary">
              {index + 1}
            </div>
            <span className="font-bold">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
