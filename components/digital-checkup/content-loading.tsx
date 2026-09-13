import { LoaderCircle } from "lucide-react";
export function ContentLoading({ title = "Sebentar, lagi disiapkan…", description = "Biar kamu bisa lanjut dari langkah terakhir." }: { title?: string; description?: string }) {
  return <div className="dc-content-loading" role="status" aria-live="polite"><div className="dc-loading-symbol"><LoaderCircle size={25} aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p><div className="dc-loading-skeleton" aria-hidden="true"><span /><span /><span /></div><span className="sr-only">Sedang memuat konten.</span></div>;
}
