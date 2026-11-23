"use client";

import { useSyncExternalStore, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { WhatsAppGlyph } from "../parts";

const subscribe = () => () => undefined;

/** Alamat website + tombol salin & bagikan ke WhatsApp. */
export function ShareCard({ path, businessName, live, title = "Websitemu sudah online" }: { path: string; businessName: string; live: boolean; title?: string }) {
  // Origin dibaca di client (bisa domain produksi atau localhost saat uji coba).
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, () => "");
  const url = `${origin}${path}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Salin alamat website:", url); }
  };
  const share = `https://wa.me/?text=${encodeURIComponent(`Mampir ke website ${businessName}, ya: ${url}`)}`;
  return <section className="sb-share" aria-label="Bagikan website">
    <div>
      <p className="sb-share-title">{live ? title : "Alamat websitemu"}</p>
      <p className="sb-share-url">{url || path}</p>
    </div>
    <div className="sb-share-actions">
      <button type="button" className="dc-secondary" onClick={() => void copy()}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copied ? "Tersalin" : "Salin tautan"}</button>
      {live ? <a className="dc-secondary" href={share} target="_blank" rel="noopener noreferrer"><WhatsAppGlyph size={16} />Bagikan ke WhatsApp</a> : null}
      {live ? <a className="dc-primary" href={path} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" />Buka website</a> : null}
    </div>
  </section>;
}
