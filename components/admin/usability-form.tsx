"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/digital-checkup/api";
import { Button } from "@/components/system/button";

const TASKS: { key: string; label: string }[] = [{ key: "profil", label: "Mengisi profil usaha" }, { key: "pertanyaan", label: "Menjawab 32 pertanyaan" }, { key: "kirim", label: "Mengirim checkup" }, { key: "baca_hasil", label: "Membaca hasil" }];
export const TASK_LABEL = Object.fromEntries(TASKS.map((task) => [task.key, task.label]));
export const TASK_STATUS_LABEL: Record<string, string> = { selesai: "Selesai mandiri", dengan_bantuan: "Dengan bantuan", gagal: "Gagal" };

export function UsabilityForm({ assessments }: { assessments: { id: string; label: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error" | ""; text: string }>({ tone: "", text: "" });
  if (!assessments.length) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Observasi bisa dicatat setelah ada checkup final.</span></div>;
  return <form className="adm-form" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setStatus({ tone: "", text: "Menyimpan…" });
    try {
      await api("research", "POST", { action: "usability", payload: { assessmentId: data.get("assessment"), date: data.get("date"), tasks: Object.fromEntries(TASKS.map((task) => [task.key, data.get(task.key)])), minutes: Number(data.get("minutes")), ease: Number(data.get("ease")), note: String(data.get("note") ?? "") } });
      form.reset(); setStatus({ tone: "ok", text: "Observasi tersimpan." }); router.refresh();
    } catch (error) { setStatus({ tone: "error", text: (error as Error).message }); } finally { setBusy(false); }
  }}>
    <p className="adm-help">Catat pengujian yang benar-benar dilakukan: tanggal aktual dan hasil pengamatan, bukan perkiraan.</p>
    <div className="adm-form-grid">
      <label className="adm-field">Checkup yang diuji<select name="assessment" required defaultValue=""><option value="" disabled>Pilih checkup</option>{assessments.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="adm-field">Tanggal pengujian<input type="date" name="date" required /></label>
      <label className="adm-field">Waktu total (menit)<input type="number" min="0.1" step="0.1" max="1440" name="minutes" required /></label>
      {TASKS.map((task) => <label className="adm-field" key={task.key}>{task.label}<select name={task.key} defaultValue="selesai"><option value="selesai">Selesai mandiri</option><option value="dengan_bantuan">Dengan bantuan</option><option value="gagal">Gagal</option></select></label>)}
      <label className="adm-field">Kemudahan (1 sulit – 5 mudah)<input type="number" min="1" max="5" name="ease" required /></label>
    </div>
    <label className="adm-field">Catatan pengamatan<textarea name="note" maxLength={2000} placeholder="Apa yang membuat bingung, apa yang lancar, komentar penguji." /></label>
    <div className="adm-actions"><Button type="submit" variant="primary" size="sm" disabled={busy}>Simpan observasi</Button><p className="adm-status" role="status" aria-live="polite" data-tone={status.tone}>{status.text}</p></div>
  </form>;
}
