import type { Metadata } from "next";
import { CheckCircle2, Circle, Palette, Send, Sparkles } from "lucide-react";
import {
  Button,
  ButtonLink,
  CategoryChip,
  HeroBanner,
  StateBlock,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { getRewardLandingPageView } from "@/domain/services/app-service";
import { claimLandingPageReward } from "@/features/rewards/actions";
import { createRewardTracking } from "@/features/rewards/eligibility";

export const metadata: Metadata = { title: "Reward Landing Page" };

export default async function LandingPageRewardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const [{ error, status }, view] = await Promise.all([
    searchParams,
    getRewardLandingPageView(),
  ]);

  if (!view.progress || !view.eligibility) {
    return (
      <StateBlock
        action={{ href: "/app/progres", label: "Lihat Progres" }}
        description="Reward landing page menunggu Jalur Naik Kelas tiga fokus tersedia."
        kind="empty"
        title="Reward belum tersedia"
      />
    );
  }

  const tracking = view.claim?.tracking ?? createRewardTracking("waiting_for_data");

  return (
    <div className="space-y-6">
      <HeroBanner
        description="DekatLokal mengecek modul, ujian akhir, Checkup ulang, Aset Usaha, kelengkapan profil, syarat program, dan kapasitas sebelum klaim landing page."
        eyebrow="Reward landing page"
        imageSrc="/illustrations/reward-hero.png"
        meta={
          <div className="flex flex-wrap gap-2">
            <CategoryChip active icon={Sparkles}>
              {view.eligibility.eligible ? "Siap diajukan" : "Lengkapi syarat"}
            </CategoryChip>
            <CategoryChip icon={Palette}>3 gaya</CategoryChip>
          </div>
        }
        title={
          view.eligibility.eligible
            ? "Syarat utama sudah terpenuhi"
            : "Lengkapi syarat reward"
        }
        tone="yellow"
      />

      {error ? (
        <div className="rounded-[24px] bg-warning-soft p-4 font-bold text-warning">
          {error === "terms"
            ? "Setujui syarat program sebelum mengajukan klaim."
            : "Beberapa syarat masih belum lengkap."}
        </div>
      ) : null}
      {status === "diajukan" ? (
        <div className="rounded-[24px] bg-success-soft p-4 font-bold text-success">
          Klaim reward sudah masuk ke antrean mock.
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <VisualPanel tone="white">
            <h2 className="text-2xl font-extrabold text-text-primary">
              Checklist eligibility
            </h2>
            <div className="mt-4 grid gap-3">
              {view.eligibility.checklist.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-[24px] bg-white/82 p-4 shadow-[var(--shadow-soft)]"
                  key={item.id}
                >
                  {item.complete ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-success"
                    />
                  ) : (
                    <Circle
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-text-muted"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-extrabold text-text-primary">{item.label}</p>
                      <StatusPill tone={item.complete ? "success" : "warning"}>
                        {item.complete ? "Lengkap" : "Perlu aksi"}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {item.detail}
                    </p>
                    {!item.complete && item.actionHref ? (
                      <ButtonLink
                        className="mt-3 min-h-11 px-4 text-sm"
                        href={item.actionHref}
                        variant="secondary"
                      >
                        Lengkapi
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </VisualPanel>

          {!view.eligibility.eligible ? (
            <VisualPanel tone="coral">
              <StatusPill tone="warning">Belum lengkap</StatusPill>
              <h2 className="mt-3 text-xl font-extrabold text-text-primary">
                Data yang perlu diselesaikan
              </h2>
              <p className="mt-2 text-base leading-7 text-text-secondary">
                {view.eligibility.missingRequirements.join(", ")}.
              </p>
            </VisualPanel>
          ) : !view.claim ? (
            <VisualPanel tone="purple">
              <div className="flex items-start gap-3">
                <Palette aria-hidden="true" className="mt-1 h-5 w-5 text-brand-primary" />
                <div>
                  <h2 className="text-2xl font-extrabold text-text-primary">
                    Pilih gaya landing page
                  </h2>
                  <p className="mt-1 text-base leading-7 text-text-secondary">
                    Ini hanya pengajuan mock. Tidak ada pembayaran dan belum ada
                    produksi website sungguhan.
                  </p>
                </div>
              </div>
              <form action={claimLandingPageReward} className="mt-5 space-y-4">
                <fieldset className="grid gap-3 md:grid-cols-3">
                  <legend className="sr-only">Gaya landing page</legend>
                  {[
                    ["bersih-praktis", "Bersih Praktis", "Ringkas untuk kontak cepat"],
                    ["hangat-lokal", "Hangat Lokal", "Lebih personal dan dekat"],
                    ["visual-produk", "Visual Produk", "Menonjolkan foto dan katalog"],
                  ].map(([value, label, description]) => (
                    <label
                      className="min-h-28 cursor-pointer rounded-[24px] bg-white/82 p-4 shadow-[var(--shadow-soft)] has-[:checked]:bg-brand-primary-soft"
                      key={value}
                    >
                      <input
                        className="sr-only"
                        defaultChecked={value === "bersih-praktis"}
                        name="selectedStyle"
                        type="radio"
                        value={value}
                      />
                      <span className="font-extrabold text-text-primary">{label}</span>
                      <span className="mt-1 block text-sm leading-6 text-text-secondary">
                        {description}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <label className="flex items-start gap-3 rounded-[24px] bg-white/82 p-4 shadow-[var(--shadow-soft)]">
                  <input
                    className="mt-1 h-4 w-4"
                    defaultChecked={view.eligibility.termsAccepted}
                    name="acceptTerms"
                    type="checkbox"
                  />
                  <span className="text-sm leading-6 text-text-secondary">
                    Saya memahami reward bergantung pada kelengkapan data,
                    kapasitas program, dan review mock DekatLokal.
                  </span>
                </label>
                <Button className="w-full" type="submit">
                  <Send aria-hidden="true" className="h-5 w-5" />
                  Ajukan klaim landing page
                </Button>
              </form>
            </VisualPanel>
          ) : null}
        </div>

        <aside className="space-y-5">
          <VisualPanel tone="sky">
            <h2 className="text-xl font-extrabold text-text-primary">
              Aset Usaha untuk landing page
            </h2>
            <div className="mt-4 grid gap-3">
              {view.eligibility.requiredAssetLabels.map((label) => {
                const asset = view.assets.find((item) => item.label === label);
                return (
                  <div className="rounded-[24px] bg-white/78 p-4 shadow-[var(--shadow-soft)]" key={label}>
                    <p className="font-extrabold text-text-primary">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {asset
                        ? asset.value
                        : "Belum tersedia dari tugas usaha wajib."}
                    </p>
                  </div>
                );
              })}
            </div>
          </VisualPanel>

          <VisualPanel tone="white">
            <h2 className="text-xl font-extrabold text-text-primary">Tracking klaim</h2>
            <div className="mt-4 grid gap-3">
              {tracking.map((item) => (
                <div
                  className={`rounded-[22px] p-4 ${
                    item.current
                      ? "bg-brand-primary text-white"
                      : item.complete
                        ? "bg-success-soft text-success"
                        : "bg-surface-subtle text-text-secondary"
                  }`}
                  key={item.status}
                >
                  <p className="font-extrabold">{item.label}</p>
                </div>
              ))}
            </div>
          </VisualPanel>
        </aside>
      </section>
    </div>
  );
}
