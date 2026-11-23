"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "@/components/digital-checkup/api";

export function SignInForm({ initialNotice = "", next = null, google = true }: { initialNotice?: string; next?: string | null; google?: boolean }) {
  const [notice, setNotice] = useState(initialNotice);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false), [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(""), [token, setToken] = useState("");
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(cooldown - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);
  const login = async (mode: "password" | "google" | "otp_request" | "otp_verify", email?: string, password?: string) => {
    setBusy(true); setNotice("");
    try {
      const result = await api<{ next?: string; message?: string }>("auth", "POST", { mode, email, password, token: mode === "otp_verify" ? token : undefined, next: next ?? undefined });
      if (result.next) window.location.assign(result.next);
      else { if (mode === "otp_request") { setSent(true); setCooldown(60); } setNotice(result.message ?? "Cek emailmu untuk melanjutkan."); }
    } catch (error) { setNotice((error as Error).message); } finally { setBusy(false); }
  };

  return (
    <article className="dl-signin" aria-labelledby="login-title">
      <aside className="dl-signin-aside">
        <div>
          <span>RUANG TUMBUH DEKATLOKAL</span>
          <h2>Checkup selesai. Langkahmu baru mulai.</h2>
          <p>Simpan hasil checkup, pilih modul yang kamu butuhkan, dan coba langsung di usahamu.</p>
        </div>
        <div className="dl-signin-aside-note">
          <strong>Akses modul gratis 7 hari.</strong>
          <p>Materi singkat, latihan nyata, progres tetap tersimpan.</p>
        </div>
      </aside>
      <div className="dl-signin-main">
        <div className="dl-signin-topbar">
          <Link className="dl-signin-back" href="/" aria-label="Kembali ke beranda"><ArrowLeft aria-hidden="true" size={18} /></Link>
          <Link className="dl-signin-brand" href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} priority unoptimized /></Link>
          <span aria-hidden="true" />
        </div>

        <header>
          <p>Senang kamu di sini</p>
          <h1 id="login-title">Yuk, lanjut tumbuh.</h1>
          <p>Masuk atau buat akun. Hasil checkup ikut tersimpan.</p>
        </header>

        {google ? <>
          <button className="dl-signin-google" type="button" disabled={busy} onClick={() => void login("google")}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M21.56 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.36a4.6 4.6 0 0 1-1.99 2.93v2.53h3.23c1.9-1.75 2.96-4.32 2.96-7.3Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.53c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.87v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.47l3.34-2.6Z" />
            <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.95 5.53l3.34 2.6C7.18 7.76 9.39 6 12 6Z" />
            </svg>
            Lanjut dengan Google
          </button>

          <div className="dl-signin-divider"><span>atau pakai kode email</span></div>
        </> : null}
        <form onSubmit={(event) => { event.preventDefault(); void login(sent ? "otp_verify" : "otp_request", email); }}>
          <label htmlFor="signin-email">Email</label>
          <input id="signin-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={254} value={email} readOnly={sent} onChange={(e) => setEmail(e.target.value)} />

          {sent && <><label htmlFor="signin-token">Kode dari email</label><input id="signin-token" className="dl-signin-otp" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} placeholder="Masukkan kode OTP" /></>}
          <button className="dl-signin-submit" type="submit" disabled={busy}>{busy ? "Sebentar, ya…" : sent ? "Verifikasi & lanjut" : "Kirim kode masuk"} <ArrowRight aria-hidden="true" size={18} /></button>
        </form>
        {sent && <div className="dl-otp-actions"><button className="dl-signin-magic" type="button" disabled={busy || cooldown > 0} onClick={() => void login("otp_request", email)}>{cooldown ? `Kirim ulang dalam ${cooldown} dtk` : "Kirim ulang kode"}</button><button className="dl-signin-magic" disabled={busy} onClick={() => { setSent(false); setToken(""); setNotice(""); }}>Ubah email</button></div>}
        <p className="dl-signin-first">Belum punya akun? <Link href="/mulai">Mulai Digital Checkup gratis</Link> dulu, lalu simpan hasilmu saat mendaftar.</p>

        {notice && <div className="dl-signin-notice" role="status"><p>{notice}</p></div>}
        <p className="dl-signin-legal">Dengan melanjutkan, kamu menyetujui <a href="https://dekatlokal.com/terms-of-service" target="_blank" rel="noopener noreferrer">Syarat &amp; Ketentuan</a> dan <a href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Kebijakan Privasi</a> DekatLokal.</p>
      </div>
    </article>
  );
}
