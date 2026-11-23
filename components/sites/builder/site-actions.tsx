"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/digital-checkup/api";

/** Sembunyikan (kembali ke draf) atau hapus website. Keduanya meminta konfirmasi. */
export function SiteActions({ siteId, businessName, published }: { siteId: string; businessName: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const run = async (action: () => Promise<unknown>, after: () => void) => {
    setBusy(true); setError("");
    try { await action(); after(); } catch (e) { setError(e instanceof Error ? e.message : "Belum berhasil. Coba lagi."); } finally { setBusy(false); }
  };
  const unpublish = () => {
    if (!window.confirm(`Sembunyikan website ${businessName}? Pelanggan tidak bisa membukanya sampai kamu terbitkan lagi.`)) return;
    void run(() => api(`sites/${siteId}`, "POST", { action: "unpublish" }), () => router.refresh());
  };
  const remove = () => {
    if (!window.confirm(`Hapus website ${businessName} beserta kotak masuk AI Admin-nya? Tindakan ini tidak bisa dibatalkan.`)) return;
    void run(() => api(`sites/${siteId}`, "DELETE"), () => { router.push("/dashboard/website"); router.refresh(); });
  };
  return <div className="sb-danger">
    {published ? <button type="button" className="dc-text-button" disabled={busy} onClick={unpublish}>Sembunyikan website</button> : null}
    <button type="button" className="dc-text-button sb-delete" disabled={busy} onClick={remove}>Hapus website</button>
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
  </div>;
}
