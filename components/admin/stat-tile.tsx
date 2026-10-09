import Link from "next/link";
import type { ReactNode } from "react";

export function StatTile({ label, value, note, href, tone, chip }: { label: string; value: ReactNode; note?: ReactNode; href?: string; tone?: "ok" | "bad"; chip?: ReactNode }) {
  const className = `adm-tile${tone ? ` adm-tile-${tone}` : ""}`;
  const body = <>
    <span className="adm-tile-label">{label}{chip}</span>
    <span className="adm-tile-value tabular">{value}</span>
    {note && <span className="adm-tile-note">{note}</span>}
  </>;
  return href ? <Link className={className} href={href}>{body}</Link> : <div className={className}>{body}</div>;
}
