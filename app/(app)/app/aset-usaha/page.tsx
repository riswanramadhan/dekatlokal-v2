import type { Metadata } from "next";
import { Archive, ArrowUpRight, Globe2 } from "lucide-react";
import {
  HeroBanner,
  ProgressTile,
  StateBlock,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { getAssetBankView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Aset Usaha" };

export default async function AssetBankPage() {
  const view = await getAssetBankView();

  return (
    <div className="space-y-6">
      <HeroBanner
        description="Output dari tugas yang disetujui tersimpan sebagai data terstruktur, bukan sekadar tanda selesai belajar."
        eyebrow="Aset Usaha"
        imageSrc="/illustrations/learning-action.png"
        meta={<StatusPill>{view.assets.length} aset</StatusPill>}
        title={`Hasil yang siap dipakai ${view.business.name}`}
        tone="purple"
      />

      {view.assets.length === 0 ? (
        <StateBlock
          action={{ href: "/app/jalur", label: "Lihat langkah berikutnya" }}
          description="Selesaikan tugas usaha pertama. Hasil yang disetujui akan muncul di sini dan dapat dipakai kembali."
          kind="empty"
          title="Belum ada Aset Usaha"
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <ProgressTile
              description="Siap dipakai ulang"
              icon={Archive}
              title="Total aset"
              tone="blue"
              value={String(view.assets.length)}
            />
            <ProgressTile
              description="Dari tugas usaha"
              icon={ArrowUpRight}
              title="Sumber"
              tone="yellow"
              value="Modul"
            />
            <ProgressTile
              description="Bisa masuk reward landing page"
              icon={Globe2}
              title="Pemakaian"
              tone="pink"
              value="Aktif"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {view.assets.map((asset, index) => (
              <VisualPanel key={asset.id} tone={index % 2 === 0 ? "white" : "sky"}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-brand-primary-soft text-brand-primary">
                    <Archive aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <StatusPill tone={asset.status === "ready" ? "success" : "warning"}>
                    {asset.status === "ready" ? "Siap dipakai" : "Perlu ditinjau"}
                  </StatusPill>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold text-text-primary">
                  {asset.label}
                </h2>
                <p className="mt-2 line-clamp-4 text-base leading-7 text-text-secondary">
                  {asset.value}
                </p>
                <div className="mt-5 grid gap-3 text-sm leading-6 text-text-secondary">
                  <p className="flex items-center gap-2">
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-brand-primary" />
                    Sumber: {asset.source}
                  </p>
                  <p className="flex items-start gap-2">
                    <Globe2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-primary" />
                    {asset.futureUse ?? "Dapat dipakai untuk landing page dan Jejak Tumbuh."}
                  </p>
                </div>
              </VisualPanel>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
