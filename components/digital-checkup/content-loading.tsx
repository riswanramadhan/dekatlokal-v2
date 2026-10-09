import { LoaderCircle } from "lucide-react";
export function ContentLoading({ title = "Sebentar, lagi disiapkan…", description = "Biar kamu bisa lanjut dari langkah terakhir." }: { title?: string; description?: string }) {
  return <div className="ck-loading" role="status" aria-live="polite"><LoaderCircle size={40} aria-hidden="true" /><h2>{title}</h2><p>{description}</p><span className="sr-only">Sedang memuat konten.</span></div>;
}
