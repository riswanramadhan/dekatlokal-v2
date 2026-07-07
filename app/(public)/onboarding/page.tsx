import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  FieldLabel,
  Input,
  Select,
} from "@/components/ui";
import { onboardingStepSchema } from "@/domain/schemas";
import { getDashboardView } from "@/domain/services/app-service";
import {
  finishOnboarding,
  saveBusinessConfirmation,
  saveLearningPreference,
  saveRhythm,
} from "@/features/onboarding/actions";
import { getMockJourneySession } from "@/infrastructure/storage/mock-session";

export const metadata: Metadata = {
  title: "Onboarding",
};

type OnboardingPageProps = {
  searchParams: Promise<{ step?: string; status?: string }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const step = onboardingStepSchema.parse(params.step);
  const [dashboard, session] = await Promise.all([
    getDashboardView(),
    getMockJourneySession(),
  ]);
  const draft = session.onboarding;

  return (
    <main className="v3-shell v3-decor min-h-screen px-4 py-6 md:px-8">
      <div className="relative z-10 mx-auto grid max-w-[560px] gap-5">
        <section className="space-y-2">
          <Badge>Onboarding {step} dari 5</Badge>
          <h1 className="text-2xl font-bold leading-tight text-text-primary md:text-3xl">
            Siapkan Jalur Naik Kelas
          </h1>
          <p className="text-base leading-7 text-text-secondary">
            Lima langkah singkat ini membantu DekatLokal menyesuaikan ritme,
            ukuran teks, dan alasan rekomendasi untuk usaha Anda.
          </p>
        </section>

        {params.status === "invalid" ? (
          <p className="rounded-2xl bg-danger-soft p-3 text-sm leading-6 text-danger">
            Lengkapi pilihan yang wajib diisi sebelum melanjutkan.
          </p>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardContent className="space-y-5 p-5 md:p-7">
              <div>
                <p className="text-sm font-semibold text-brand-primary">
                  Halo, {session.auth?.ownerName ?? dashboard.user.name}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">
                  Hasil Digital Checkup {dashboard.business.name} sudah siap.
                </h2>
                <p className="mt-2 text-base leading-7 text-text-secondary">
                  {dashboard.checkup?.summary ??
                    "Hubungkan hasil checkup agar rekomendasi bisa lebih personal."}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-blue p-4">
                <p className="font-semibold text-text-primary">
                  Fokus awal yang disarankan
                </p>
                <p className="mt-1 text-base leading-7 text-text-secondary">
                  {dashboard.activePlan?.rationale ??
                    "DekatLokal akan menyiapkan langkah pertama setelah profil usaha dilengkapi."}
                </p>
              </div>
              <ButtonLink className="w-full" href="/onboarding?step=2">
                Konfirmasi data usaha
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </ButtonLink>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardContent className="space-y-5 p-5 md:p-7">
              <h2 className="text-xl font-bold text-text-primary">
                Konfirmasi usaha
              </h2>
              <form action={saveBusinessConfirmation} className="grid gap-4">
                <div className="space-y-2">
                  <FieldLabel htmlFor="name">Nama usaha</FieldLabel>
                  <Input
                    defaultValue={
                      draft?.business?.name ??
                      session.auth?.businessName ??
                      dashboard.business.name
                    }
                    id="name"
                    name="name"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="category">Kategori</FieldLabel>
                    <Input
                      defaultValue={
                        draft?.business?.category ?? dashboard.business.category
                      }
                      id="category"
                      name="category"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="city">Kota</FieldLabel>
                    <Input
                      defaultValue={draft?.business?.city ?? dashboard.business.city}
                      id="city"
                      name="city"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="whatsapp">WhatsApp usaha</FieldLabel>
                  <Input
                    defaultValue={
                      draft?.business?.whatsapp ??
                      session.auth?.phone ??
                      dashboard.user.phone
                    }
                    id="whatsapp"
                    inputMode="tel"
                    name="whatsapp"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="role">Peran Anda</FieldLabel>
                  <Select
                    defaultValue={draft?.business?.role ?? "owner"}
                    id="role"
                    name="role"
                  >
                    <option value="owner">Pemilik usaha</option>
                    <option value="family">Keluarga yang membantu</option>
                    <option value="staff">Staf usaha</option>
                  </Select>
                </div>
                <Button className="w-full" type="submit">
                  Simpan dan lanjut
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardContent className="space-y-5 p-5 md:p-7">
              <h2 className="text-xl font-bold text-text-primary">
                Preferensi belajar
              </h2>
              <form action={saveLearningPreference} className="grid gap-5">
                <fieldset className="space-y-3">
                  <legend className="font-semibold text-text-primary">
                    Mode pendampingan
                  </legend>
                  <RadioOption
                    defaultChecked={
                      draft?.learningPreference?.digitalComfort === "guided" ||
                      !draft?.learningPreference
                    }
                    name="digitalComfort"
                    title="Guided"
                    value="guided"
                  />
                  <RadioOption
                    defaultChecked={
                      draft?.learningPreference?.digitalComfort === "standard"
                    }
                    name="digitalComfort"
                    title="Standard"
                    value="standard"
                  />
                  <RadioOption
                    defaultChecked={
                      draft?.learningPreference?.digitalComfort === "fast"
                    }
                    name="digitalComfort"
                    title="Fast"
                    value="fast"
                  />
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-semibold text-text-primary">
                    Waktu belajar per sesi
                  </legend>
                  {[5, 10, 15].map((minutes) => (
                    <RadioOption
                      defaultChecked={
                        (draft?.learningPreference?.dailyMinutes ?? 5) === minutes
                      }
                      key={minutes}
                      name="dailyMinutes"
                      title={`${minutes} menit`}
                      value={String(minutes)}
                    />
                  ))}
                </fieldset>

                <fieldset className="grid gap-3 sm:grid-cols-2">
                  <legend className="sr-only">Format belajar</legend>
                  {[
                    ["video", "Video"],
                    ["audio", "Audio"],
                    ["text", "Teks"],
                    ["mixed", "Campuran"],
                  ].map(([value, label]) => (
                    <label
                      className="flex min-h-12 items-center gap-3 rounded-2xl border border-border-default bg-white px-4"
                      key={value}
                    >
                      <input
                        defaultChecked={
                          draft?.learningPreference?.preferredFormats.includes(
                            value as "video" | "audio" | "text" | "mixed",
                          ) ?? value === "mixed"
                        }
                        name="preferredFormats"
                        type="checkbox"
                        value={value}
                      />
                      <span className="font-semibold text-text-primary">
                        {label}
                      </span>
                    </label>
                  ))}
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-semibold text-text-primary">
                    Ukuran teks
                  </legend>
                  <RadioOption
                    defaultChecked={
                      (draft?.learningPreference?.fontScale ?? "standard") ===
                      "standard"
                    }
                    name="fontScale"
                    title="Standard"
                    value="standard"
                  />
                  <RadioOption
                    defaultChecked={
                      draft?.learningPreference?.fontScale === "large"
                    }
                    name="fontScale"
                    title="Besar"
                    value="large"
                  />
                </fieldset>

                <Button className="w-full" type="submit">
                  Simpan preferensi
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card>
            <CardContent className="space-y-5 p-5 md:p-7">
              <h2 className="text-xl font-bold text-text-primary">
                Ritme pengingat
              </h2>
              <form action={saveRhythm} className="grid gap-5">
                <fieldset className="space-y-3">
                  <legend className="font-semibold text-text-primary">
                    Waktu yang paling nyaman
                  </legend>
                  {[
                    ["morning", "Pagi"],
                    ["afternoon", "Siang"],
                    ["evening", "Malam"],
                    ["flexible", "Fleksibel"],
                  ].map(([value, label]) => (
                    <RadioOption
                      defaultChecked={
                        (draft?.rhythm?.preferredDaypart ?? "flexible") === value
                      }
                      key={value}
                      name="preferredDaypart"
                      title={label}
                      value={value}
                    />
                  ))}
                </fieldset>
                <label className="flex items-start gap-3 rounded-2xl border border-border-default bg-white p-4">
                  <input
                    defaultChecked={draft?.rhythm?.remindersEnabled ?? true}
                    name="remindersEnabled"
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-semibold text-text-primary">
                      Aktifkan pengingat mock
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text-secondary">
                      Tidak ada notifikasi sungguhan pada demo. State ini hanya
                      membantu menyiapkan preferensi.
                    </span>
                  </span>
                </label>
                <Button className="w-full" type="submit">
                  Lihat jalur saya
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {step === 5 ? (
          <Card>
            <CardContent className="space-y-5 p-5 md:p-7">
              <div>
                <p className="text-sm font-semibold text-brand-primary">
                  Jalur siap
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">
                  {dashboard.activePlan?.headline ?? "Jalur Naik Kelas Dasar"}
                </h2>
                <p className="mt-2 text-base leading-7 text-text-secondary">
                  {dashboard.activePlan?.summary ??
                    "DekatLokal akan menampilkan langkah pertama setelah data usaha lengkap."}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-primary-soft p-4">
                <p className="font-semibold text-text-primary">
                  Mengapa jalur ini diberikan
                </p>
                <p className="mt-1 text-base leading-7 text-text-secondary">
                  {dashboard.activePlan?.rationale ??
                    "Rekomendasi berasal dari hasil Digital Checkup dan preferensi belajar Anda."}
                </p>
              </div>
              <div className="grid gap-3">
                {dashboard.activePlan?.steps.slice(0, 3).map((stepItem) => (
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-border-default bg-white p-4"
                    key={stepItem.id}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">
                        {stepItem.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        {stepItem.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form action={finishOnboarding}>
                <Button className="w-full" type="submit">
                  Mulai Langkah Pertama
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

function RadioOption({
  defaultChecked,
  name,
  title,
  value,
}: {
  defaultChecked?: boolean;
  name: string;
  title: string;
  value: string;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border-default bg-white px-4">
      <input
        defaultChecked={defaultChecked}
        name={name}
        type="radio"
        value={value}
      />
      <span className="font-semibold text-text-primary">{title}</span>
    </label>
  );
}
