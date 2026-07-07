import type { Metadata } from "next";
import { ClipboardCheck, Lock } from "lucide-react";
import { FinalTestRunner } from "@/components/final-test/final-test-runner";
import { HeroBanner, StateBlock, StatusPill, VisualPanel } from "@/components/ui";
import { getFinalTestView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Ujian Akhir" };

export default async function FinalTestPage({
  searchParams,
}: {
  searchParams: Promise<{ targeted?: string }>;
}) {
  const [{ targeted }, view] = await Promise.all([
    searchParams,
    getFinalTestView(),
  ]);

  if (!view.progress || !view.finalTest) {
    return (
      <StateBlock
        action={{ href: "/app/jalur", label: "Lihat Jalur Naik Kelas" }}
        description="Ujian akhir dibuat dari tiga fokus yang berasal dari Digital Checkup."
        kind="empty"
        title="Ujian akhir belum tersedia"
      />
    );
  }

  if (!view.progress.finalTestReady) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <StateBlock
          action={{ href: "/app/progres", label: "Lihat syarat progres" }}
          description={`${3 - view.progress.completedModules} fokus lagi perlu selesai melalui belajar, post-test, dan aksi usaha sebelum ujian akhir terbuka.`}
          kind="locked"
          title="Ujian akhir masih terkunci"
        />
        <VisualPanel tone="yellow">
          <div className="flex items-center gap-3">
            <Lock aria-hidden="true" className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-extrabold text-text-primary">
              Syarat membuka ujian
            </h2>
          </div>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            Ketiga modul wajib harus memenuhi aturan penyelesaian: lesson,
            penguasaan post-test, dan tugas usaha yang disetujui.
          </p>
        </VisualPanel>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HeroBanner
        description="Ujian ini hanya mencakup tiga area yang diberikan dari Digital Checkup. Bentuknya skenario keputusan, bukan hafalan."
        eyebrow="Ujian akhir"
        imageSrc="/illustrations/learning-action.png"
        meta={<StatusPill>Tanpa pengurangan Poin Tumbuh</StatusPill>}
        title="Uji keputusan dari tiga fokus"
        tone="purple"
      />
      <VisualPanel className="mx-auto max-w-[820px]" tone="sky">
        <p className="flex items-center gap-2 font-extrabold text-text-primary">
          <ClipboardCheck aria-hidden="true" className="h-5 w-5 text-brand-primary" />
          Review tetap terarah
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Jika belum lulus, DekatLokal menampilkan review pada fokus yang
          perlu diperkuat.
        </p>
      </VisualPanel>

      <FinalTestRunner
        finalTest={view.finalTest}
        initialAttempt={view.latestAttempt}
        targeted={targeted === "1"}
      />
    </div>
  );
}
