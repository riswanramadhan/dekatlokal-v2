"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { Button } from "@/components/system/button";

export function AdminSignIn({ available = true, notice = "" }: { available?: boolean; notice?: string }) {
  const [busy, setBusy] = useState(false), [show, setShow] = useState(false), [error, setError] = useState(notice);
  return <main className="adm-login bg-glow">
    <section className="card adm-login-card" aria-labelledby="admin-login-title">
      <Link href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} priority /></Link>
      <span className="adm-lock" aria-hidden="true"><LockKeyhole size={24} /></span>
      <p className="eyebrow">Ruang pengelola</p>
      <h1 id="admin-login-title">Masuk admin</h1>
      <p>Gunakan akun admin atau peneliti yang sudah terdaftar.</p>
      <form onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setError(""); try { const result = await api<{ next: string }>("admin-auth", "POST", { email: data.get("email"), password: data.get("password") }); window.location.assign(result.next); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }}>
        <fieldset disabled={busy || !available}>
          <label className="adm-field">Email admin<input name="email" type="email" autoComplete="username" placeholder="admin@domain.com" required maxLength={254} /></label>
          <div className="adm-field"><label htmlFor="admin-password">Kata sandi</label><div className="adm-password"><input id="admin-password" name="password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" required maxLength={256} /><button type="button" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={show} onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
          {error && <p className="note note-danger" role="alert">{error}</p>}
          {!available && <p className="note note-warning" role="status">Layanan admin belum tersedia. Hubungi pengelola.</p>}
          <Button type="submit" variant="primary" block>{busy ? "Memverifikasi akun…" : "Masuk dashboard"}<ArrowRight size={17} aria-hidden="true" /></Button>
        </fieldset>
      </form>
      <Link className="adm-login-back" href="/"><ArrowLeft size={15} aria-hidden="true" />Kembali ke beranda</Link>
    </section>
  </main>;
}
