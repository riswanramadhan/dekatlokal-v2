"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/digital-checkup/api";
import { Button } from "@/components/system/button";
import { fmt, fmtDate } from "@/lib/digital-checkup/format";
import type { ExpertPanelData, ExpertPanelItem } from "@/lib/digital-checkup/admin-data";
import { Chip, ConsistencyChip } from "./status-chip";

const DECISION: Record<string, string> = { layak_uji_coba: "Layak diuji coba", perlu_revisi: "Perlu revisi" };

function ExpertCard({ expert, selected, selectable, busy, onSelect, onDelete }: { expert: ExpertPanelItem; selected: boolean; selectable: boolean; busy: boolean; onSelect: (checked: boolean) => void; onDelete: () => void }) {
  const final = expert.status === "submitted";
  return <article className="adm-expert" aria-label={expert.name}>
    <div className="adm-expert-head">
      <label className="adm-check"><input type="checkbox" checked={selected} disabled={!selectable} onChange={(event) => onSelect(event.target.checked)} aria-label={`Pilih ${expert.name} untuk model`} /><span><strong>{expert.name}</strong><small>{[expert.jobTitle, expert.institution].filter(Boolean).join(" · ") || expert.code}</small></span></label>
      {expert.usedInModel ? <Chip tone="mint" dot>Dipakai model</Chip> : final ? <Chip tone="primary" dot>Final</Chip> : <Chip tone="amber" dot>Draf</Chip>}
    </div>
    <ul>
      <li><span>Telaah pertanyaan</span><b>{expert.completion.reviews} / 32</b></li>
      <li><span>Perbandingan berpasangan</span><b>{expert.completion.pairs} / 28</b></li>
      <li><span>Kecocokan modul</span><b>{expert.completion.relevance} / 56</b></li>
      <li><span>Rasio konsistensi (CR)</span><b>{expert.consistency ? fmt(expert.consistency.CR, 4) : "—"}</b></li>
      <li><span>Keputusan instrumen</span><b>{expert.decision ? DECISION[expert.decision] ?? expert.decision : "Belum dipilih"}</b></li>
      <li><span>Dikirim</span><b>{expert.submittedAt ? fmtDate(expert.submittedAt, false) : "—"}</b></li>
    </ul>
    <div className="adm-inline" style={{ justifyContent: "space-between" }}>
      <ConsistencyChip consistent={expert.consistency?.consistent ?? null} />
      {!final && <Button variant="danger" size="sm" disabled={busy} onClick={onDelete}>Hapus draf</Button>}
    </div>
    {final && <p className="adm-help">Penilaian final disimpan tetap agar bobot dan hasil selalu bisa diuji ulang.</p>}
  </article>;
}

export function ExpertPanel({ data }: { data: ExpertPanelData }) {
  const router = useRouter();
  const [versionId, setVersionId] = useState(data.versions[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error" | ""; text: string }>({ tone: "", text: "" });
  const version = data.versions.find((item) => item.id === versionId) ?? data.versions[0];
  const frozen = Boolean(version?.frozenAt);
  const experts = data.experts.filter((item) => !version || item.instrumentId === version.instrumentId);
  const act = async (payload: unknown, done: string) => {
    setBusy(true); setStatus({ tone: "", text: "Memproses…" });
    try { await api("research", "POST", payload); setStatus({ tone: "ok", text: done }); setSelected([]); setConfirmed(false); router.refresh(); }
    catch (error) { setStatus({ tone: "error", text: (error as Error).message }); }
    finally { setBusy(false); }
  };

  return <div className="adm-stack">
    {data.versions.length > 0 && <label className="adm-field" style={{ maxWidth: 420 }}>Versi model<select value={version?.id ?? ""} onChange={(event) => { setVersionId(event.target.value); setSelected([]); setConfirmed(false); }}>{data.versions.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.frozenAt ? "Aktif dan terkunci" : "Menunggu aktivasi"}</option>)}</select></label>}
    {version && <p className="adm-help">{frozen ? `Model ${version.code} dikunci pada ${fmtDate(version.frozenAt)}. Panel ahli di bawah bersifat tetap.` : `Model ${version.code} belum dikunci. Pilih tepat tiga ahli final, lalu kunci model.`}</p>}
    {experts.length === 0 ? <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Kartu ahli muncul setelah ahli mulai mengisi penilaian.</span></div>
      : <div className="adm-experts">{experts.map((expert) => <ExpertCard key={expert.id} expert={expert} busy={busy} selected={selected.includes(expert.id)} selectable={expert.status === "submitted" && !frozen && !expert.usedInModel} onSelect={(checked) => setSelected(checked ? [...selected, expert.id] : selected.filter((id) => id !== expert.id))} onDelete={() => { if (window.confirm(`Hapus draf penilaian ${expert.name}? Tindakan ini tidak bisa dibatalkan.`)) void act({ action: "deleteExpert", id: expert.id, confirmed: true }, "Draf dihapus."); }} />)}</div>}
    {version && !frozen && <div className="adm-stack">
      <label className="adm-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />Saya sudah meninjau tiga ahli final yang dipilih. Setelah dikunci, bobot model tidak bisa diubah lagi; perubahan panel memerlukan versi baru.</label>
      <div className="adm-actions"><Button variant="primary" disabled={busy || selected.length !== 3 || !confirmed} onClick={() => void act({ action: "freeze", versionId: version.id, expertIds: selected, confirmed: true }, "Model dikunci. Hasil untuk checkup final akan dihitung otomatis.")}>Kunci model dengan {selected.length} / 3 ahli</Button></div>
    </div>}
    <details className="adm-details"><summary>Buat versi model baru</summary><div>
      <p className="adm-help" style={{ marginBottom: 12 }}>Versi baru dipakai jika panel atau konfigurasi perlu diganti. Versi yang sudah dipakai tetap tersimpan untuk audit.</p>
      <form className="adm-form" onSubmit={(event) => { event.preventDefault(); const code = String(new FormData(event.currentTarget).get("code") ?? ""); if (version) void act({ action: "version", sourceId: version.id, code }, `Versi ${code} dibuat.`); }}>
        <label className="adm-field" style={{ maxWidth: 420 }}>Kode model baru<input required name="code" pattern="DC-MODEL-[A-Za-z0-9.\-]+" placeholder="DC-MODEL-1.2" /></label>
        <div className="adm-actions"><Button type="submit" variant="secondary" size="sm" disabled={busy || !version}>Buat versi</Button></div>
      </form>
    </div></details>
    <p className="adm-status" role="status" aria-live="polite" data-tone={status.tone}>{status.text}</p>
  </div>;
}
