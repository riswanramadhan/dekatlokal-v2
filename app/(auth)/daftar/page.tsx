import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, ButtonLink, Card, CardContent, FieldLabel, Input } from "@/components/ui";
import { startSignup } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Daftar",
};

type DaftarPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

export default async function DaftarPage({ searchParams }: DaftarPageProps) {
  const { claim, status } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-5 md:p-7">
        <div>
          <p className="text-sm font-semibold text-brand-primary">Daftar</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            Buat akun Ruang Tumbuh
          </h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            Simpan hasil Digital Checkup, tiga fokus usaha, dan progres
            belajarmu dalam satu akun Ruang Tumbuh.
          </p>
        </div>
        {status === "invalid" ? (
          <p className="rounded-2xl bg-danger-soft p-3 text-sm leading-6 text-danger">
            Lengkapi nama pemilik, nama usaha, dan nomor WhatsApp.
          </p>
        ) : null}
        <form action={startSignup} className="grid gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="name">Nama pemilik</FieldLabel>
            <Input id="name" name="ownerName" placeholder="Contoh: Bu Rina" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="business">Nama usaha</FieldLabel>
            <Input
              id="business"
              name="businessName"
              placeholder="Contoh: Warung Rina"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
            <Input
              id="phone"
              inputMode="tel"
              name="phone"
              placeholder="0812 3456 7890"
            />
          </div>
          <Button className="w-full" type="submit">
            Lanjut ke verifikasi mock
          </Button>
        </form>
        <ButtonLink
          className="w-full"
          href="/masuk"
          variant="secondary"
        >
          Sudah punya akun
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
