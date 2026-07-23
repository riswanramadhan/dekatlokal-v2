import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  FieldLabel,
  FixedCta,
  Input,
  ProgressBar,
  Select,
  StateBlock,
  StateGrid,
} from "@/components/ui";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Design System",
};

export default function DesignSystemPage() {
  if (env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 fixed-cta-offset md:px-8">
      <section className="space-y-3">
        <Badge>Development only</Badge>
        <h1 className="text-3xl font-bold text-text-primary">
          Fondasi UI DekatLokal
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-secondary">
          Halaman ini dipakai untuk meninjau token, state, tombol, form, dan
          safe-area sebelum fitur lengkap dibangun.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">Tombol</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button>Mulai Langkah</Button>
              <Button variant="secondary">Lihat prasyarat</Button>
              <Button variant="ghost">Buka bantuan</Button>
              <Button disabled>Memuat</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">Form</h2>
            <div className="space-y-2">
              <FieldLabel htmlFor="sample-input">Nama usaha</FieldLabel>
              <Input id="sample-input" placeholder="Warung Rina" />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="sample-select">Mode belajar</FieldLabel>
              <Select id="sample-select">
                <option>Guided</option>
                <option>Standard</option>
                <option>Fast</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">State</h2>
        <StateGrid>
          <StateBlock
            description="Konten sedang disiapkan dari data pengembangan."
            kind="loading"
            title="Loading"
          />
          <StateBlock
            description="Belum ada Aset Usaha yang dibuat."
            kind="empty"
            title="Empty"
          />
          <StateBlock
            description="Ada bagian yang perlu dicoba ulang."
            kind="error"
            title="Error"
          />
          <StateBlock
            description="Data lokal tetap ditampilkan sampai koneksi kembali."
            kind="offline"
            title="Offline"
          />
          <StateBlock
            description="Selesaikan modul sebelumnya untuk membuka langkah ini."
            kind="locked"
            title="Locked"
          />
          <StateBlock
            description="Perubahan sedang menunggu sinkronisasi."
            kind="sync"
            title="Sync pending"
          />
        </StateGrid>
      </section>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Progress</h2>
          <ProgressBar label="Belajar" value={42} />
          <ProgressBar label="Aksi usaha" value={28} />
        </CardContent>
      </Card>

      <FixedCta>
        <ButtonLink className="w-full" href="/app/beranda">
          Kembali ke Beranda
        </ButtonLink>
      </FixedCta>
    </main>
  );
}
