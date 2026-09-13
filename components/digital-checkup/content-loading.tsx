import { LoaderCircle } from "lucide-react";
export function ContentLoading({ title = "Sebentar, lagi disiapkan…", description = "Biar kamu bisa lanjut dari langkah terakhir." }: { title?: string; description?: string }) {
  return <div className="dc-content-loading" role="status" aria-live="polite"><div className="dc-loading-symbol"><LoaderCircle size={44} aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p><span className="sr-only">Sedang memuat konten.</span></div>;
}
