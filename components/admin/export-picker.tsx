"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { fmtDate } from "@/lib/digital-checkup/format";
import type { ExportData } from "@/lib/digital-checkup/admin-data";

export function ExportPicker({ data }: { data: ExportData }) {
  const [versionId, setVersionId] = useState("");
  const [runId, setRunId] = useState("");
  const version = data.versions.find((item) => item.id === versionId);
  const runs = data.runs.filter((run) => !version || run.modelVersion === version.code);
  const run = runs.find((item) => item.id === runId);
  const query = new URLSearchParams({ ...(version ? { version: version.code } : {}), ...(run ? { run: run.id } : {}) }).toString();
  const href = (format: string) => `/api/digital-checkup/research?${query ? `${query}&` : ""}format=${format}`;
  return <div className="adm-stack">
    <div className="adm-form-grid">
      <label className="adm-field">Versi model<select value={versionId} onChange={(event) => { setVersionId(event.target.value); setRunId(""); }}><option value="">Semua versi</option>{data.versions.map((item) => <option key={item.id} value={item.id}>{item.code}{item.frozenAt ? "" : " (belum dikunci)"}</option>)}</select></label>
      <label className="adm-field">Hasil (run)<select value={run?.id ?? ""} onChange={(event) => setRunId(event.target.value)}><option value="">Semua hasil</option>{runs.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.businessName} · {fmtDate(item.createdAt, false)}</option>)}</select></label>
    </div>
    <div className="adm-actions">
      <a className="btn btn-secondary btn-sm" href={href("colab")} download><Download size={16} aria-hidden="true" />JSON siap Google Colab</a>
      <a className="btn btn-secondary btn-sm" href={href("json")} download><Download size={16} aria-hidden="true" />JSON lengkap</a>
      <a className="btn btn-secondary btn-sm" href={href("csv")} download><Download size={16} aria-hidden="true" />CSV</a>
      {run && <a className="btn btn-soft btn-sm" href={`/api/digital-checkup/research?run=${run.id}&format=canonical`} download><Download size={16} aria-hidden="true" />Input mentah satu hasil</a>}
    </div>
    <p className="adm-help">{data.runs.length === 0 ? "Belum ada hasil tersimpan; berkas teknis akan berisi data model dan ahli saja." : `${runs.length} hasil ikut diekspor dengan saringan ini.`}</p>
  </div>;
}
