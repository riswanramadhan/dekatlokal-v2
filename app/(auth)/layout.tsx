import type { ReactNode } from "react";
import Image from "next/image";
import { BrandLogo } from "@/components/app-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="v3-shell v3-decor min-h-screen px-4 py-6 md:grid md:place-items-center md:px-8">
      <div className="relative z-10 mx-auto w-full max-w-[520px]">
        <header className="mb-5 flex items-center justify-between">
          <BrandLogo href="/" />
          <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-text-muted shadow-[var(--shadow-soft)]">
            Mock auth
          </span>
        </header>
        <div className="mb-5 flex items-start gap-3">
          <Image
            alt=""
            className="mt-1 h-10 w-10 rounded-2xl"
            height={48}
            priority
            src="/brand/dekat-lokal-icon.png"
            width={48}
          />
          <div className="helper-bubble px-4 py-3">
            <p className="text-base leading-7 text-text-primary">
              Buat akun setelah melihat nilai jalur, agar hasil dan progres tidak hilang.
            </p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
