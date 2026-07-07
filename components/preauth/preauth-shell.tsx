import type { ReactNode } from "react";
import { BrandLogo } from "@/components/app-shell";
import { ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

export function PreAuthShell({
  children,
  currentStep,
  largeText = false,
}: {
  children: ReactNode;
  currentStep: 1 | 2 | 3 | 4;
  largeText?: boolean;
}) {
  return (
    <main
      className={cn(
        "preauth-flow v3-shell v3-decor min-h-screen px-4 py-5 fixed-cta-offset sm:px-5 md:pb-10",
        largeText && "font-scale-large",
      )}
    >
      <div className="relative z-10 mx-auto w-full max-w-[520px]">
        <header className="mb-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo href="/mulai" />
              <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-text-muted shadow-[var(--shadow-soft)]">
                {currentStep} dari 4
              </span>
            </div>
            <ProgressBar value={currentStep * 25} />
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
              Tekap bantu kamu mengingat tiga fokus usaha tanpa terburu-buru.
            </p>
          </div>
        </div>

        <div className="compact-card p-4 md:p-5">{children}</div>
      </div>
    </main>
  );
}
