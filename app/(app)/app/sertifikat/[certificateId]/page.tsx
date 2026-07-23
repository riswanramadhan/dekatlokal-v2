import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, ShieldCheck } from "lucide-react";
import { CertificateActions } from "@/components/certificate/certificate-actions";
import { Badge, Card, CardContent, StateBlock } from "@/components/ui";
import { getCertificateView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Sertifikat" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const view = await getCertificateView(certificateId);
  if (!view.certificate) notFound();

  if (!view.earned) {
    return (
      <StateBlock
        action={{ href: "/app/checkup-ulang", label: "Lihat Checkup ulang" }}
        description="Sertifikat penyelesaian muncul setelah tiga fokus selesai, ujian akhir lulus, dan Checkup ulang selesai."
        kind="locked"
        title="Sertifikat belum terbuka"
      />
    );
  }

  const certificate = view.certificate;

  return (
    <div className="mx-auto max-w-[860px] space-y-5">
      <section className="space-y-2">
        <Badge>Sertifikat penyelesaian</Badge>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Bukti penyelesaian Jalur Naik Kelas
        </h1>
        <p className="text-base leading-7 text-text-secondary">
          Sertifikat ini mencatat penyelesaian jalur tiga fokus. Ini bukan
          sertifikasi kompetensi resmi.
        </p>
      </section>

      <Card className="overflow-hidden border-brand-primary/20">
        <CardContent className="space-y-6 p-6 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-primary">
                DekatLokal
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
                Sertifikat Penyelesaian
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <Award aria-hidden="true" className="h-7 w-7" />
            </div>
          </div>

          <div className="rounded-2xl bg-surface-blue p-5">
            <p className="text-sm font-semibold text-text-muted">
              Diberikan kepada
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {certificate.learnerName}
            </p>
            <p className="mt-4 text-sm font-semibold text-text-muted">
              Untuk usaha
            </p>
            <p className="mt-1 text-xl font-bold text-text-primary">
              {certificate.businessName}
            </p>
          </div>

          <div>
            <p className="font-semibold text-text-primary">
              Jalur yang diselesaikan
            </p>
            <p className="mt-1 text-base leading-7 text-text-secondary">
              {certificate.pathTitle}
            </p>
            <div className="mt-3 grid gap-2">
              {certificate.moduleTitles.map((title, index) => (
                <p
                  className="rounded-2xl bg-surface-subtle p-3 text-sm font-semibold text-text-primary"
                  key={title}
                >
                  {index + 1}. {title}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-3 border-t border-border-default pt-5 md:grid-cols-2">
            <Info label="Tanggal terbit" value={certificate.issueDate} />
            <Info label="ID sertifikat" value={certificate.mockCertificateId} />
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-warning-soft p-4">
            <ShieldCheck
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-warning"
            />
            <div>
              <p className="font-semibold text-text-primary">
                Catatan verifikasi
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {certificate.disclaimer} {certificate.verificationPlaceholder}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CertificateActions />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-subtle p-4">
      <p className="text-sm font-semibold text-text-muted">{label}</p>
      <p className="mt-1 font-bold text-text-primary">{value}</p>
    </div>
  );
}
