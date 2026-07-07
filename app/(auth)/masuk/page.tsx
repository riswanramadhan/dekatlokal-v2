import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, MessageCircle, Search } from "lucide-react";
import { Button, ButtonLink, Card, CardContent, FieldLabel, Input } from "@/components/ui";
import {
  startEmailFallback,
  startGoogleMock,
  startWhatsappLogin,
} from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Masuk",
};

type MasukPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

const statusCopy: Record<string, string> = {
  invalid: "Nomor WhatsApp belum valid. Periksa kembali sebelum lanjut.",
  "email-invalid": "Email belum valid. Gunakan email aktif untuk demo.",
};

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const { claim, status } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-5 md:p-7">
        <div>
          <p className="text-sm font-semibold text-brand-primary">Masuk</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            Lanjutkan Ruang Tumbuh
          </h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            Masuk untuk menyimpan Jalur Naik Kelas atau melanjutkan progres
            yang sudah ada. Verifikasi pada demo tetap menggunakan kode mock.
          </p>
        </div>
        {status && statusCopy[status] ? (
          <p className="rounded-2xl bg-danger-soft p-3 text-sm leading-6 text-danger">
            {statusCopy[status]}
          </p>
        ) : null}
        <form action={startWhatsappLogin} className="space-y-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
            <Input
              autoComplete="tel"
              id="phone"
              inputMode="tel"
              name="phone"
              placeholder="Contoh: 0812 3456 7890"
            />
          </div>
          <Button className="w-full" type="submit">
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            Kirim kode mock
          </Button>
        </form>
        <form action={startGoogleMock}>
          <Button className="w-full" type="submit" variant="secondary">
            <Search aria-hidden="true" className="h-5 w-5" />
            Lanjut dengan Google mock
          </Button>
        </form>
        <form action={startEmailFallback} className="space-y-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="email">Email cadangan</FieldLabel>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="nama@email.com"
              type="email"
            />
          </div>
          <Button className="w-full" type="submit" variant="ghost">
            <Mail aria-hidden="true" className="h-5 w-5" />
            Kirim tautan verifikasi mock
          </Button>
        </form>
        <ButtonLink
          className="w-full"
          href="/daftar"
          variant="secondary"
        >
          Buat akun baru
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
