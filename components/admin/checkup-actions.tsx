"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { Button } from "@/components/system/button";

export function CheckupActions({ assessmentId, canCompute, finalExpertIds, hasRun }: { assessmentId: string; canCompute: boolean; finalExpertIds: string[]; hasRun: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "compute" | "cases">("");
  const [status, setStatus] = useState<{ tone: "ok" | "error" | ""; text: string }>({ tone: "", text: "" });
  const act = async (kind: "compute" | "cases", payload: unknown, done: string) => {
    setBusy(kind); setStatus({ tone: "", text: "Memproses…" });
    try { await api("research", "POST", payload); setStatus({ tone: "ok", text: done }); router.refresh(); }
    catch (error) { setStatus({ tone: "error", text: (error as Error).message }); }
    finally { setBusy(""); }
  };
  const expertIds = finalExpertIds.slice(0, 3);
  return <div className="adm-stack">
    <div className="adm-actions">
      <Button variant="primary" size="sm" disabled={!canCompute || Boolean(busy)} onClick={() => void act("compute", { action: "compute", assessmentId }, hasRun ? "Hasil dicek ulang. Jika model belum berubah, hasil yang sama tetap dipakai." : "Hasil berhasil dihitung.")}><RefreshCw size={16} aria-hidden="true" />{hasRun ? "Hitung ulang" : "Hitung sekarang"}</Button>
      <Button variant="secondary" size="sm" disabled={!canCompute || expertIds.length === 0 || Boolean(busy)} onClick={() => void act("cases", { action: "cases", assessmentId, expertIds }, `Kasus dibuka untuk ${expertIds.length} ahli.`)}><Users size={16} aria-hidden="true" />Buka validasi {expertIds.length || 3} ahli</Button>
    </div>
    <p className="adm-status" role="status" aria-live="polite" data-tone={status.tone}>{status.text}</p>
    {!canCompute && <p className="adm-help">Tombol aktif setelah checkup berstatus final.</p>}
  </div>;
}
