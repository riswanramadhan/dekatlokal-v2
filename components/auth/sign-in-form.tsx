"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const unavailable = () => setNotice("Pilihan masuk ini belum tersedia. Kamu tetap bisa cek usaha gratis tanpa akun.");

  return (
    <article className="dl-signin" aria-labelledby="login-title">
      <aside className="dl-signin-aside">
        <div>
          <span>RUANG TUMBUH DEKATLOKAL</span>
          <h2>Hai, langkah kecilmu tetap berarti.</h2>
          <p>Lanjut belajar, coba langsung, dan lihat usahamu bergerak sedikit demi sedikit.</p>
        </div>
        <div className="dl-signin-aside-note">
          <strong>Mulai dari yang kamu butuhkan.</strong>
          <p>Nggak perlu serba bisa hari ini.</p>
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
          <p>Masuk dan lanjutkan langkah usahamu.</p>
        </header>

        <button className="dl-signin-google" type="button" onClick={unavailable}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M21.56 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.36a4.6 4.6 0 0 1-1.99 2.93v2.53h3.23c1.9-1.75 2.96-4.32 2.96-7.3Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.53c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.87v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.47l3.34-2.6Z" />
            <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.95 5.53l3.34 2.6C7.18 7.76 9.39 6 12 6Z" />
          </svg>
          Lanjut dengan Google
        </button>

        <div className="dl-signin-divider"><span>atau pakai email</span></div>
        <form onSubmit={(event) => { event.preventDefault(); unavailable(); }}>
          <label htmlFor="signin-email">Email</label>
          <input id="signin-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength={254} />
          <label htmlFor="signin-password">Kata sandi</label>
          <div className="dl-signin-password">
            <input id="signin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandimu" required maxLength={256} />
            <button type="button" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
            </button>
          </div>
          <button className="dl-signin-submit" type="submit">Masuk <ArrowRight aria-hidden="true" size={18} /></button>
        </form>

        {notice && <div className="dl-signin-notice" role="status"><p>{notice}</p><Link href="/mulai">Cek usahaku dulu <ArrowRight aria-hidden="true" size={16} /></Link></div>}
        <p className="dl-signin-new">Belum punya akun? <Link href="/mulai">Mulai dari cek usaha gratis</Link></p>
        <p className="dl-signin-legal">Dengan melanjutkan, kamu menyetujui <a href="https://dekatlokal.com/terms-of-service" target="_blank" rel="noopener noreferrer">Syarat &amp; Ketentuan</a> dan <a href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Kebijakan Privasi</a> DekatLokal.</p>
      </div>
    </article>
  );
}
