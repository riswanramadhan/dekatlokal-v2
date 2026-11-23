"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/digital-checkup/api";
import type { AdminServiceRequest, RequestStatusFilter } from "@/lib/layanan/service-requests";
import { KIND_LABEL, REQUEST_STATUSES, STATUS_LABEL, type RequestKind, type RequestStatus } from "@/lib/layanan/request-schema";
import { customerWhatsApp, describeRequest } from "@/lib/layanan/request-format";

const KIND_FILTERS: [RequestKind | "all", string][] = [["all", "Semua layanan"], ["consultation", "Konsultasi"], ["gbp", "GBP"], ["website_care", "Website Care"]];
const STATUS_FILTERS: [RequestStatusFilter, string][] = [["open", "Terbuka"], ["new", "Baru"], ["scheduled", "Terjadwal"], ["in_progress", "Dikerjakan"], ["done", "Selesai"], ["cancelled", "Dibatalkan"], ["all", "Semua"]];
const when = (iso: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(iso));

function RequestCard({ request, onSaved }: { request: AdminServiceRequest; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<RequestStatus>(request.status), [note, setNote] = useState(request.adminNote);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const dirty = status !== request.status || note !== request.adminNote;
  const contact = customerWhatsApp(request.whatsapp, request.kind, request.businessName, request.orderCode);
  const save = async () => {
    setBusy(true); setError("");
    try { await api("layanan/admin", "POST", { id: request.id, status, note }); await onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : "Perubahan belum tersimpan."); }
    finally { setBusy(false); }
  };
  return <article className="cm-order-card">
    <div className="cm-order-head">
      <div>
        <span className="cm-code">{KIND_LABEL[request.kind]}</span>
        <h2>{request.businessName || "Tanpa nama usaha"}</h2>
        <p>{request.email || "email tidak ada"} · masuk {when(request.createdAt)}{request.orderCode ? ` · pesanan ${request.orderCode}` : " · tanpa pesanan tertaut"}</p>
      </div>
      <span className={`dc-badge${request.status === "done" ? " is-ready" : ""}`}>{STATUS_LABEL[request.status]}</span>
    </div>
    <dl className="cm-order-meta cm-request-meta">{describeRequest(request.kind, request.payload).map((row) => <div key={row.label}>
      <dt>{row.label}</dt>
      <dd>{row.href ? <a href={row.href} target="_blank" rel="noopener noreferrer nofollow">{row.value}</a> : row.value}</dd>
    </div>)}</dl>
    <div className="cm-admin-edit">
      <label className="dc-field cm-field"><span className="cm-field-label">Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>{REQUEST_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABEL[value]}</option>)}</select>
      </label>
      <label className="dc-field cm-field"><span className="cm-field-label">Catatan admin (internal)</span>
        <textarea value={note} maxLength={2000} onChange={(event) => setNote(event.target.value)} placeholder="Mis. jadwal disepakati Kamis 10.00 WITA via Google Meet" />
      </label>
    </div>
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
    <div className="cm-order-actions">
      {contact ? <a className="dc-secondary" href={contact} target="_blank" rel="noopener noreferrer">Chat pelanggan</a> : <span className="cm-hint">Nomor WhatsApp tidak ada</span>}
      <button className="dc-primary" disabled={busy || !dirty} onClick={() => void save()} type="button">{busy ? "Menyimpan…" : "Simpan"}</button>
    </div>
  </article>;
}

export function RequestsAdmin({ name }: { name: string }) {
  const [kind, setKind] = useState<RequestKind | "all">("all"), [status, setStatus] = useState<RequestStatusFilter>("open");
  const [requests, setRequests] = useState<AdminServiceRequest[] | null>(null), [error, setError] = useState("");
  const fetchRequests = useCallback(() => api<{ requests: AdminServiceRequest[] }>(`layanan/admin?kind=${kind}&status=${status}`).then((data) => data.requests), [kind, status]);
  const load = async () => {
    setError("");
    try { setRequests(await fetchRequests()); }
    catch (e) { setError(e instanceof Error ? e.message : "Permintaan belum bisa dimuat."); }
  };
  useEffect(() => {
    let live = true;
    fetchRequests()
      .then((next) => { if (live) { setRequests(next); setError(""); } })
      .catch((e: Error) => { if (live) setError(e.message || "Permintaan belum bisa dimuat."); });
    return () => { live = false; };
  }, [fetchRequests]);

  return <main className="dc-page cm-admin">
    <div className="cm-admin-top">
      <div>
        <p className="dc-eyebrow">Admin · {name || "DekatLokal"}</p>
        <h1>Permintaan layanan</h1>
        <p className="dc-note">Konsultasi Checkup Pro, Optimasi GBP, dan Website Care dari pengguna yang sudah aktif. Konfirmasi lewat WhatsApp, lalu perbarui statusnya di sini.</p>
      </div>
      <Link className="dc-secondary" href="/admin/pesanan">Ke pesanan & langganan</Link>
    </div>
    <div className="cm-filter" role="group" aria-label="Filter layanan">
      {KIND_FILTERS.map(([value, label]) => <button key={value} aria-pressed={kind === value} className={kind === value ? "is-active" : ""} onClick={() => setKind(value)} type="button">{label}</button>)}
    </div>
    <div className="cm-filter" role="group" aria-label="Filter status">
      {STATUS_FILTERS.map(([value, label]) => <button key={value} aria-pressed={status === value} className={status === value ? "is-active" : ""} onClick={() => setStatus(value)} type="button">{label}</button>)}
    </div>
    {requests?.length ? <p className="cm-summary">{requests.length} permintaan</p> : null}
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
    {!requests ? <p className="dc-note">Memuat permintaan…</p> : requests.length === 0 ? <div className="dc-panel"><p className="dc-note">Belum ada permintaan dengan filter ini.</p></div> :
      <div className="cm-order-list">{requests.map((request) => <RequestCard key={`${request.id}:${request.updatedAt}`} request={request} onSaved={load} />)}</div>}
  </main>;
}
