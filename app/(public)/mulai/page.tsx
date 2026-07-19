import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Search,
} from "lucide-react";
import {
  Button,
  ButtonLink,
  Card,
  CardContent,
  FixedCta,
} from "@/components/ui";
import { PreAuthShell } from "@/components/preauth/preauth-shell";
import { RecallChallenge } from "@/components/preauth/recall-challenge";
import {
  getAppView,
  getRepositoriesForRequest,
} from "@/domain/services/app-service";
import { startGoogleLogin } from "@/features/auth/actions";
import {
  beginRecall,
  openSignupWall,
} from "@/features/preauth/actions";
import { evaluateRecallSelection } from "@/features/preauth/recall";
import { getPreAuthJourney } from "@/infrastructure/storage/mock-preauth-session";
import { getMockJourneySession } from "@/infrastructure/storage/mock-session";
import { trackMockAnalytics } from "@/lib/analytics/mock";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Mulai Jalur Naik Kelas",
};

type MulaiPageProps = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function MulaiPage({ searchParams }: MulaiPageProps) {
  const [{ claim: queryToken }, storedJourney, repositories, appView, session] =
    await Promise.all([
      searchParams,
      getPreAuthJourney(),
      getRepositoriesForRequest(),
      getAppView(),
      getMockJourneySession(),
    ]);
  const token = queryToken || storedJourney?.claimToken;
  const largeText = appView.learningPreference.fontScale === "large";

  if (!token) {
    return <NoClaimScreen largeText={largeText} />;
  }

  if (session.claimAssociation?.claimToken === token) {
    return (
      <ClaimStateScreen
        description="Hasil Digital Checkup ini sudah terhubung ke akunmu. Jalur tiga fokus dapat dilanjutkan dari Beranda."
        largeText={largeText}
        primaryHref="/app/beranda"
        primaryLabel="Lanjut ke Beranda"
        title="Hasil sudah tersimpan"
      />
    );
  }

  const result = await repositories.checkup.previewClaim({ token });
  if (result.status !== "valid") {
    const canRetry = result.status === "offline" || result.status === "network_error";
    return (
      <ClaimStateScreen
        description={result.message}
        largeText={largeText}
        primaryHref={
          canRetry
            ? `/mulai?claim=${encodeURIComponent(token)}`
            : new URL("/digital-checkup", env.NEXT_PUBLIC_MAIN_SITE_URL).toString()
        }
        primaryLabel={canRetry ? "Coba lagi" : "Mulai Digital Checkup"}
        title={
          result.status === "expired"
            ? "Tautan hasil sudah kedaluwarsa"
            : result.status === "already_claimed"
              ? "Hasil sudah pernah dihubungkan"
              : result.status === "invalid"
                ? "Tautan hasil tidak dikenali"
                : "Hasil belum dapat dimuat"
        }
      />
    );
  }

  const preview = result.preview;
  const journey =
    storedJourney?.claimToken === token ? storedJourney : undefined;
  const stage = journey?.stage ?? "result_ready";
  trackMockAnalytics({ name: "preauth_claim_viewed" });

  if (stage === "recall" && journey) {
    const evaluation =
      journey.attemptCount > 0 && journey.selectedModuleIds.length === 3
        ? evaluateRecallSelection({
            preview,
            selectedModuleIds: journey.selectedModuleIds,
            attemptCount: journey.attemptCount,
          })
        : null;
    return (
      <PreAuthShell currentStep={2} largeText={largeText}>
        <RecallChallenge
          evaluation={evaluation}
          journey={journey}
          key={`${journey.attemptCount}-${journey.selectedModuleIds.join("|")}`}
          preview={preview}
        />
      </PreAuthShell>
    );
  }

  if (stage === "path_preview") {
    return (
      <PreAuthShell currentStep={3} largeText={largeText}>
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-brand-primary">Jalur personal</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
              Ini Jalur Naik Kelas usahamu
            </h1>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              Kamu tidak perlu menyelesaikannya sekaligus. Progres akan tersimpan setelah membuat akun.
            </p>
          </div>
          <div className="grid gap-3">
            {preview.recommendedModules.map((module, index) => (
              <Card key={module.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-soft font-bold text-brand-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-text-primary">{module.title}</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-text-secondary">
                          {index === 0 ? (
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : (
                            <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
                          )}
                          {index === 0 ? "Siap dimulai" : "Terbuka berurutan"}
                        </span>
                      </div>
                      <p className="mt-1 text-base leading-7 text-text-secondary">
                        {module.shortOutcome}
                      </p>
                    </div>
                  </div>
                  <dl className="grid gap-2 rounded-2xl bg-surface-subtle p-3 text-sm leading-6">
                    <div className="flex gap-2">
                      <dt className="font-semibold text-text-primary">Durasi:</dt>
                      <dd className="text-text-secondary">{module.estimatedMinutes} menit</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-primary">Mengapa diberikan</dt>
                      <dd className="text-text-secondary">{module.reason}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-primary">Aset Usaha</dt>
                      <dd className="text-text-secondary">{module.assetType}</dd>
                    </div>
                    {index > 0 ? (
                      <div>
                        <dt className="font-semibold text-text-primary">Prasyarat</dt>
                        <dd className="text-text-secondary">
                          Selesaikan {preview.recommendedModules[index - 1]?.title} terlebih dahulu.
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
          <form action={openSignupWall} id="save-path-form">
            <Button className="hidden w-full md:inline-flex" type="submit">
              Simpan Jalur Saya
            </Button>
          </form>
          <FixedCta>
            <Button className="w-full" form="save-path-form" type="submit">
              Simpan Jalur Saya
            </Button>
          </FixedCta>
        </section>
      </PreAuthShell>
    );
  }

  if (stage === "signup") {
    return (
      <PreAuthShell currentStep={4} largeText={largeText}>
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-brand-primary">Satu langkah lagi</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
              Simpan perjalanan usahamu
            </h1>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              Buat akun agar hasil Digital Checkup, tiga fokus usaha, dan progres belajarmu tidak hilang.
            </p>
          </div>
          <Card>
            <CardContent className="grid gap-3 p-5">
              <ButtonLink className="w-full" href="/daftar">
                Daftar dengan WhatsApp
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </ButtonLink>
              <form action={startGoogleLogin}>
                <Button className="w-full" type="submit" variant="secondary">
                  <Search aria-hidden="true" className="h-5 w-5" />
                  Lanjutkan dengan Google
                </Button>
              </form>
              <ButtonLink className="w-full" href="/masuk" variant="ghost">
                Saya sudah punya akun
              </ButtonLink>
            </CardContent>
          </Card>
        </section>
      </PreAuthShell>
    );
  }

  return (
    <PreAuthShell currentStep={1} largeText={largeText}>
      <section className="space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-success-soft text-success">
          <CheckCircle2 aria-hidden="true" className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-primary">Digital Checkup selesai</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
            Hasil usahamu sudah siap!
          </h1>
          <p className="mt-3 text-base leading-7 text-text-secondary">
            Digital Checkup menemukan tiga fokus utama yang dapat membantu usaha berkembang lebih terarah.
          </p>
          {preview.businessHint?.name ? (
            <p className="mt-4 rounded-2xl bg-brand-primary-soft p-4 font-semibold text-text-primary">
              Jalur ini disiapkan untuk {preview.businessHint.name}.
            </p>
          ) : null}
        </div>
        <form action={beginRecall} id="begin-recall-form">
          <input name="claimToken" type="hidden" value={preview.claimToken} />
          <Button className="hidden w-full md:inline-flex" type="submit">
            Lihat Fokus Usaha Saya
          </Button>
        </form>
        <FixedCta>
          <Button className="w-full" form="begin-recall-form" type="submit">
            Lihat Fokus Usaha Saya
          </Button>
        </FixedCta>
      </section>
    </PreAuthShell>
  );
}

function NoClaimScreen({ largeText }: { largeText: boolean }) {
  return (
    <ClaimStateScreen
      description="Digital Checkup membantu DekatLokal menemukan tiga fokus yang paling dibutuhkan usahamu."
      largeText={largeText}
      primaryHref={new URL("/digital-checkup", env.NEXT_PUBLIC_MAIN_SITE_URL).toString()}
      primaryLabel="Mulai Digital Checkup"
      title="Buat jalur yang sesuai untuk usahamu"
    />
  );
}

function ClaimStateScreen({
  description,
  largeText,
  primaryHref,
  primaryLabel,
  title,
}: {
  description: string;
  largeText: boolean;
  primaryHref: string;
  primaryLabel: string;
  title: string;
}) {
  return (
    <PreAuthShell currentStep={1} largeText={largeText}>
      <section className="space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
          <Clock3 aria-hidden="true" className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-text-primary">{title}</h1>
          <p className="mt-3 text-base leading-7 text-text-secondary">{description}</p>
        </div>
        <div className="grid gap-3">
          <ButtonLink className="w-full" href={primaryHref}>
            {primaryLabel}
          </ButtonLink>
          <ButtonLink className="w-full" href="/masuk" variant="secondary">
            Saya sudah punya akun
          </ButtonLink>
        </div>
      </section>
    </PreAuthShell>
  );
}
