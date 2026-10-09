"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, CloudOff, Loader2 } from "lucide-react";

export function TopBar({ progress, label, saveState, onBack, backLabel = "Kembali" }: { progress: number; label?: string; saveState?: string; onBack?: () => void; backLabel?: string }) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <header className="ck-top">
      <div className="ck-top-inner">
        {onBack ? (
          <button type="button" className="ck-icon-btn" onClick={onBack} aria-label={backLabel}><ArrowLeft size={20} /></button>
        ) : (
          <Link href="/" className="ck-top-logo" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={118} height={36} priority /></Link>
        )}
        <div className="ck-top-center">
          <div className="ck-progress" role="progressbar" aria-label="Kemajuan checkup" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><span style={{ width: `${pct}%` }} /></div>
          {label && <span className="ck-top-badge">{label}</span>}
        </div>
        <div className="ck-top-right">
          {saveState && (
            <span className={`ck-save${saveState === "Gagal disimpan" ? " is-error" : ""}`} role="status" aria-live="polite">
              {saveState === "Menyimpan…" ? <Loader2 size={14} className="ck-spin" /> : saveState === "Gagal disimpan" ? <CloudOff size={14} /> : <Check size={14} />}
              <span className="ck-save-text">{saveState}</span>
            </span>
          )}
          {!onBack && <Link href="/masuk">Masuk</Link>}
        </div>
      </div>
    </header>
  );
}
