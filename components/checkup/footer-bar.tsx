"use client";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function FooterBar({ primary, onPrimary, primaryDisabled, primaryIcon = <ArrowRight size={18} />, secondary = "Kembali", onSecondary, secondaryDisabled, note }: {
  primary: string; onPrimary: () => void; primaryDisabled?: boolean; primaryIcon?: ReactNode;
  secondary?: string; onSecondary?: () => void; secondaryDisabled?: boolean; note?: string;
}) {
  return (
    <div className="ck-footer">
      <div className="ck-footer-inner">
        {onSecondary && <button type="button" className="btn btn-secondary" disabled={secondaryDisabled} onClick={onSecondary}><ArrowLeft size={16} />{secondary}</button>}
        <button type="button" className="btn btn-primary" disabled={primaryDisabled} onClick={onPrimary}>{primary}{primaryIcon}</button>
      </div>
      {note && <p className="ck-footer-note">{note}</p>}
    </div>
  );
}
