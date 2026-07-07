import type { Metadata } from "next";
import { Button, ButtonLink, Card, CardContent, FieldLabel, Input } from "@/components/ui";
import { resendOtp, verifyOtp } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Verifikasi",
};

type VerifikasiPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusCopy: Record<string, { tone: "info" | "danger"; text: string }> = {
  sent: {
    tone: "info",
    text: "Kode mock sudah disiapkan. Gunakan angka 6 digit apa saja untuk lanjut.",
  },
  "email-sent": {
    tone: "info",
    text: "Tautan email mock diganti dengan kode 6 digit agar demo tetap sederhana.",
  },
  google: {
    tone: "info",
    text: "Google mock terpilih. Tetap masukkan kode 6 digit untuk menunjukkan state verifikasi.",
  },
  invalid: {
    tone: "danger",
    text: "Kode mock tidak cocok. Coba 123456 untuk melanjutkan.",
  },
  expired: {
    tone: "danger",
    text: "Kode mock sudah kedaluwarsa. Kirim ulang kode sebelum mencoba lagi.",
  },
  format: {
    tone: "danger",
    text: "Kode harus berisi 6 digit angka.",
  },
  resend: {
    tone: "info",
    text: "Kode baru sudah dikirim secara mock. Tidak ada SMS atau WhatsApp sungguhan.",
  },
};

export default async function VerifikasiPage({
  searchParams,
}: VerifikasiPageProps) {
  const { status } = await searchParams;
  const statusMessage = status ? statusCopy[status] : undefined;

  return (
    <Card>
      <CardContent className="space-y-6 p-5 md:p-7">
        <div>
          <p className="text-sm font-semibold text-brand-primary">
            Verifikasi mock
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            Masukkan kode 6 digit
          </h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            Belum ada OTP sungguhan pada demo. Gunakan kode apa saja untuk
            melanjutkan ke klaim checkup atau dashboard.
          </p>
        </div>
        {statusMessage ? (
          <p
            className={
              statusMessage.tone === "danger"
                ? "rounded-2xl bg-danger-soft p-3 text-sm leading-6 text-danger"
                : "rounded-2xl bg-brand-primary-soft p-3 text-sm leading-6 text-text-primary"
            }
          >
            {statusMessage.text}
          </p>
        ) : null}
        <form action={verifyOtp} className="space-y-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="otp">Kode verifikasi</FieldLabel>
            <Input
              autoComplete="one-time-code"
              id="otp"
              inputMode="numeric"
              maxLength={6}
              name="code"
              placeholder="123456"
            />
            <p className="text-sm leading-6 text-text-muted">
              Gunakan 000000 untuk state invalid, 999999 untuk state expired,
              atau 123456 untuk sukses.
            </p>
          </div>
          <Button className="w-full" type="submit">
            Verifikasi dan lanjutkan
          </Button>
        </form>
        <form action={resendOtp}>
          <Button className="w-full" type="submit" variant="secondary">
            Kirim ulang kode mock
          </Button>
        </form>
        <ButtonLink className="w-full" href="/app/beranda" variant="ghost">
          Lewati untuk demo langsung
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
