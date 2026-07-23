import type { Metadata } from "next";
import { Bell, Clock3, Settings, UserRound } from "lucide-react";
import {
  HeroBanner,
  ProfileSummary,
  ProgressTile,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { getDashboardView } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Akun",
};

export default async function AkunPage() {
  const dashboard = await getDashboardView();
  const preference = dashboard.learningPreference;

  return (
    <div className="space-y-6">
      <HeroBanner
        description="Informasi ini membantu DekatLokal menyesuaikan ritme, ukuran teks, dan cara pendampingan."
        eyebrow="Akun"
        imageSrc="/illustrations/onboarding-hero.png"
        meta={<StatusPill>Profil pembelajaran</StatusPill>}
        title={`Halo, ${dashboard.user.name}`}
        tone="purple"
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <VisualPanel tone="white">
          <h2 className="text-2xl font-extrabold text-text-primary">Identitas usaha</h2>
          <div className="mt-5">
            <ProfileSummary
              business={dashboard.business.name}
              detail={`${dashboard.business.category} di ${dashboard.business.city}`}
              name={dashboard.user.name}
            />
          </div>
          <dl className="mt-5 grid gap-3 text-base">
            <div className="flex justify-between gap-4 rounded-[22px] bg-surface-blue p-4">
              <dt className="text-text-secondary">WhatsApp</dt>
              <dd className="font-extrabold text-text-primary">
                {dashboard.user.phone ?? "Nomor belum tersedia"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 rounded-[22px] bg-surface-lavender p-4">
              <dt className="text-text-secondary">Mode akun</dt>
              <dd className="font-extrabold text-text-primary">Ruang Tumbuh</dd>
            </div>
          </dl>
        </VisualPanel>

        <VisualPanel tone="sky">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Preferensi belajar
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <ProgressTile
              description="Durasi belajar per sesi"
              icon={Clock3}
              title="Ritme"
              tone="yellow"
              value={`${preference.dailyMinutes} mnt`}
            />
            <ProgressTile
              description="Gaya pendampingan"
              icon={UserRound}
              title="Mode"
              tone="coral"
              value={preference.digitalComfort}
            />
            <ProgressTile
              description="Ukuran teks pilihan"
              icon={Settings}
              title="Teks"
              tone="purple"
              value={preference.fontScale}
            />
          </div>
        </VisualPanel>
      </section>

      <VisualPanel tone="yellow">
        <div className="flex items-start gap-3">
          <Bell aria-hidden="true" className="mt-1 h-5 w-5 text-brand-primary" />
          <p className="text-base leading-7 text-text-secondary">
            Pengiriman notifikasi WhatsApp dan email belum tersedia. Preferensi
            waktu pengingat tetap dapat disimpan.
          </p>
        </div>
      </VisualPanel>
    </div>
  );
}
