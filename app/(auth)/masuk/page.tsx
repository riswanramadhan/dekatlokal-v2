import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Clock3,
  Info,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Masuk ke Ruang Tumbuh",
};

type MasukPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const { claim } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  return (
    <article className="auth-card auth-maintenance-card">
      <header>
        <p className="auth-heading-kicker">Maintenance Sistem</p>
        <h2>Ruang Tumbuh sedang dirapikan</h2>
        <p className="auth-heading-copy">
          Akses masuk sementara dinonaktifkan karena kami sedang memperbarui
          alur login, sinkronisasi hasil Checkup, dan keamanan akun.
        </p>
      </header>

      <div className="auth-maintenance-status" role="status">
        <span>
          <Clock3 aria-hidden="true" />
        </span>
        <div>
          <strong>Dalam proses maintenance</strong>
          <p>
            Kamu belum perlu mencoba login berulang kali. Hasil Checkup dan
            progres yang sudah tersimpan tetap kami jaga.
          </p>
        </div>
      </div>

      <div className="auth-maintenance-actions" aria-describedby="maintenance-disabled-note">
        <button className="auth-submit-button" disabled type="button">
          <MessageCircle aria-hidden="true" />
          Masuk dengan WhatsApp
        </button>
        <button className="auth-secondary-button" disabled type="button">
          <span aria-hidden="true" className="auth-google-mark">G</span>
          Lanjut dengan Google
        </button>
        <button className="auth-secondary-button" disabled type="button">
          <Mail aria-hidden="true" />
          Masuk dengan email
        </button>
      </div>

      <p className="auth-maintenance-note" id="maintenance-disabled-note">
        <LockKeyhole aria-hidden="true" />
        Semua tombol masuk sementara dinonaktifkan sampai proses maintenance
        selesai.
      </p>

      <div className="auth-maintenance-list" aria-label="Informasi maintenance">
        <div>
          <Info aria-hidden="true" />
          <span>Tim sedang merapikan pengalaman masuk agar lebih stabil.</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>Keamanan akun dan data Checkup tetap menjadi prioritas.</span>
        </div>
      </div>

      <p className="auth-card-footer">
        Butuh bantuan sekarang? <a href="mailto:hello@dekatlokal.com">Hubungi tim DekatLokal</a>
      </p>
    </article>
  );
}
