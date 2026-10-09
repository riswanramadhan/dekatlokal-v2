"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { readLocalCheckup } from "@/lib/digital-checkup/local-draft";
import { fadeUp, stagger } from "@/components/system/motion";

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.56 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.36a4.6 4.6 0 0 1-1.99 2.93v2.53h3.23c1.9-1.75 2.96-4.32 2.96-7.3Z" /><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.53c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.87v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.47l3.34-2.6Z" /><path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.95 5.53l3.34 2.6C7.18 7.76 9.39 6 12 6Z" /></svg>;
}

export function SignInForm({ initialNotice = "" }: { initialNotice?: string }) {
  const reduced = useReducedMotion();
  const [notice, setNotice] = useState(initialNotice), [isError, setIsError] = useState(Boolean(initialNotice));
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false), [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(""), [token, setToken] = useState("");
  const [pendingBusiness, setPendingBusiness] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => { const draft = readLocalCheckup(); if (draft?.profile.businessName) setPendingBusiness(draft.profile.businessName); }, 0); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!cooldown) return; const t = setTimeout(() => setCooldown(cooldown - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const login = async (mode: "google" | "otp_request" | "otp_verify") => {
    setBusy(true); setNotice(""); setIsError(false);
    try {
      const result = await api<{ next?: string; message?: string }>("auth", "POST", { mode, email: mode === "google" ? undefined : email, token: mode === "otp_verify" ? token : undefined });
      if (result.next) window.location.assign(result.next);
      else { if (mode === "otp_request") { setSent(true); setCooldown(60); } setNotice(result.message ?? "Cek emailmu untuk melanjutkan."); }
    } catch (error) { setNotice((error as Error).message); setIsError(true); } finally { setBusy(false); }
  };

  return (
    <main className="au-page">
      <aside className="au-aside" aria-hidden="true">
        <div className="au-aside-brand"><Image src="/brand/dekat-lokal.png" alt="" width={150} height={46} unoptimized /></div>
        <div>
          <h2>Checkup selesai. Langkahmu baru mulai.</h2>
          <p>Simpan hasil checkup, buka modul yang paling kamu butuhkan, dan coba langsung di usahamu.</p>
          <div className="au-benefits">
            <div className="au-benefit"><span><Sparkles size={18} /></span><div><strong>Hasil tersambung otomatis</strong><small>Checkup yang baru kamu isi langsung masuk ke akun.</small></div></div>
            <div className="au-benefit"><span><BookOpenCheck size={18} /></span><div><strong>Akses modul gratis 7 hari</strong><small>Materi singkat, latihan nyata, kuis cepat.</small></div></div>
            <div className="au-benefit"><span><ShieldCheck size={18} /></span><div><strong>Tanpa kata sandi</strong><small>Masuk pakai Google atau kode sekali pakai dari email.</small></div></div>
          </div>
        </div>
        <div className="au-aside-foot">DekatLokal · Teman bertumbuh usahamu</div>
      </aside>

      <section className="au-main">
        <div className="au-topbar">
          <Link className="btn btn-ghost btn-sm" href="/" aria-label="Kembali ke beranda"><ArrowLeft size={16} /> Beranda</Link>
          <Link href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={128} height={40} priority unoptimized /></Link>
          <span style={{ width: 92 }} aria-hidden="true" />
        </div>

        <motion.article className="au-card" aria-labelledby="login-title" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.06)}>
          <motion.div variants={fadeUp} className="au-steps" aria-hidden="true"><span className="is-on" /><span className={sent ? "is-on" : ""} /><span /></motion.div>
          <motion.header variants={fadeUp}>
            <p className="eyebrow">{sent ? "Langkah 2 dari 2" : "Senang kamu di sini"}</p>
            <h1 id="login-title">{sent ? "Masukkan kode dari email." : "Yuk, lanjut tumbuh."}</h1>
            <p>{sent ? `Kami mengirim kode 6–8 digit ke ${email}. Cek juga folder spam.` : "Masuk atau buat akun. Hasil checkup ikut tersimpan."}</p>
          </motion.header>

          {pendingBusiness && !sent && <motion.div variants={fadeUp} className="au-pending"><CheckCircle2 size={18} /><div><strong>Hasil checkup {pendingBusiness} siap disambungkan.</strong>Masuk dengan email yang sama, hasilnya otomatis masuk ke akunmu.</div></motion.div>}

          {!sent && <>
            <motion.button variants={fadeUp} className="au-google" type="button" disabled={busy} onClick={() => void login("google")}><GoogleMark /> Lanjut dengan Google</motion.button>
            <motion.div variants={fadeUp} className="au-divider"><span>atau pakai kode email</span></motion.div>
          </>}

          <motion.form variants={fadeUp} className="au-form" onSubmit={(event) => { event.preventDefault(); void login(sent ? "otp_verify" : "otp_request"); }}>
            <label htmlFor="signin-email">Email<input id="signin-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={254} value={email} readOnly={sent} onChange={(e) => setEmail(e.target.value)} /></label>
            {sent && <label htmlFor="signin-token">Kode dari email<input id="signin-token" className="au-otp" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></label>}
            {sent && <small style={{ color: "var(--color-muted)", fontSize: 13 }}>Kode berlaku sekitar 10 menit dan hanya bisa dipakai sekali.</small>}
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sebentar, ya…" : sent ? <>Verifikasi & lanjut <ArrowRight size={18} /></> : <><Mail size={17} /> Kirim kode masuk</>}</button>
          </motion.form>

          {sent && <div className="au-row"><button type="button" disabled={busy || cooldown > 0} onClick={() => void login("otp_request")}>{cooldown ? `Kirim ulang dalam ${cooldown} dtk` : "Kirim ulang kode"}</button><button type="button" disabled={busy} onClick={() => { setSent(false); setToken(""); setNotice(""); setIsError(false); }}>Ubah email</button></div>}

          {notice && <div className={`au-notice${isError ? " is-error" : ""}`} role="status"><p style={{ margin: 0 }}>{notice}</p></div>}

          {!sent && <motion.p variants={fadeUp} className="au-first"><KeyRound size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Belum punya akun? Akun dibuat otomatis saat kode email diverifikasi. Belum checkup? <Link className="link" href="/mulai">Mulai Digital Checkup gratis</Link> dulu.</motion.p>}
          <motion.p variants={fadeUp} className="au-legal">Dengan melanjutkan, kamu menyetujui <a href="https://dekatlokal.com/terms-of-service" target="_blank" rel="noopener noreferrer">Syarat &amp; Ketentuan</a> dan <a href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Kebijakan Privasi</a> DekatLokal.</motion.p>
        </motion.article>
      </section>
    </main>
  );
}
