"use client";

import { Bot, X } from "lucide-react";
import { useState } from "react";

export function TekapButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-tekap fixed bottom-[calc(6.25rem+var(--safe-bottom))] right-4 z-40 md:bottom-6 md:right-6">
      {open ? (
        <div className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-xl)] bg-white/94 p-4 shadow-[var(--shadow-floating)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-text-primary">Tekap</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Saya siap membantu membaca langkah berikutnya. Percakapan dengan
                pendamping belum tersedia.
              </p>
            </div>
            <button
              aria-label="Tutup Tekap"
              className="rounded-xl p-2 text-text-muted hover:bg-surface-subtle"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
      <button
        aria-expanded={open}
        aria-label="Buka bantuan Tekap"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-accent-purple text-white shadow-[var(--shadow-floating)] transition hover:bg-brand-primary-hover"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bot aria-hidden="true" className="h-6 w-6" />
      </button>
    </div>
  );
}
