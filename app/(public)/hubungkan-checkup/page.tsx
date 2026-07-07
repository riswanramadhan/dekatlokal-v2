import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Link2 } from "lucide-react";
import { AssociationRunner } from "@/components/preauth/association-runner";
import { PreAuthShell } from "@/components/preauth/preauth-shell";
import { Button } from "@/components/ui";
import { getAppView } from "@/domain/services/app-service";
import { associatePendingClaim } from "@/features/claim/actions";
import { getPreAuthJourney } from "@/infrastructure/storage/mock-preauth-session";
import { getMockJourneySession } from "@/infrastructure/storage/mock-session";

export const metadata: Metadata = {
  title: "Hubungkan Checkup",
};

type HubungkanCheckupPageProps = {
  searchParams: Promise<{ token?: string; status?: string }>;
};

const statusCopy: Record<string, string> = {
  expired:
    "Tautan hasil sudah kedaluwarsa sebelum sempat dihubungkan. Buka kembali Digital Checkup untuk mendapatkan tautan baru.",
  already_claimed:
    "Hasil ini sudah terhubung ke akun lain. Masuk dengan akun yang benar atau hubungi tim DekatLokal.",
  invalid:
    "Tautan hasil tidak lagi dapat divalidasi. Jalur belum diubah dan pilihan recall tidak digunakan sebagai pengganti.",
  missing: "Tidak ada hasil Digital Checkup yang menunggu untuk dihubungkan.",
  offline: "Koneksi sedang terputus. Jalurmu tetap tersimpan dan bisa dicoba lagi.",
  network_error:
    "Layanan penghubung sedang tidak dapat dijangkau. Jalurmu tetap tersimpan dan bisa dicoba lagi.",
};

export default async function HubungkanCheckupPage({
  searchParams,
}: HubungkanCheckupPageProps) {
  const [{ token, status }, session, journey, appView] = await Promise.all([
    searchParams,
    getMockJourneySession(),
    getPreAuthJourney(),
    getAppView(),
  ]);

  if (token) {
    redirect(`/mulai?claim=${encodeURIComponent(token)}`);
  }
  if (!session.auth?.verified) {
    redirect("/masuk");
  }
  if (!journey && session.claimAssociation) {
    redirect("/app/beranda");
  }
  if (!journey) {
    redirect("/mulai");
  }

  const description = status ? statusCopy[status] : undefined;
  return (
    <PreAuthShell
      currentStep={4}
      largeText={appView.learningPreference.fontScale === "large"}
    >
      <section className="space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-brand-primary-soft text-brand-primary">
          <Link2 aria-hidden="true" className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-primary">Akun siap</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
            {description ? "Hasil belum dapat dihubungkan" : "Menyimpan Jalur Naik Kelas"}
          </h1>
          <p aria-live="polite" className="mt-3 text-base leading-7 text-text-secondary">
            {description ??
              "Kami sedang menghubungkan akun, usaha, hasil Digital Checkup, dan tiga modul resmi. Pilihan recall tidak mengubah jalur ini."}
          </p>
        </div>
        {description ? (
          <form action={associatePendingClaim}>
            <Button className="w-full" type="submit">
              Coba hubungkan lagi
            </Button>
          </form>
        ) : (
          <AssociationRunner action={associatePendingClaim} />
        )}
      </section>
    </PreAuthShell>
  );
}
