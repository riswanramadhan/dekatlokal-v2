"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { instrument, PAIRS, crispMatrix, consistency } from "@/lib/decision-engine";
import { blankExpert, type ExpertDraft } from "@/lib/digital-checkup/validation";
import type { ExpertRow, blindCase } from "@/lib/digital-checkup/service";
import { api } from "./api";
import { ContentLoading } from "./content-loading";
type Case = ReturnType<typeof blindCase>;
type Data = { assignments: ExpertRow[]; cases: Case[]; identityName?: string | null };
export function ExpertWorkspace() {
  const [data, setData] = useState<Data | null>(null), [selected, setSelected] = useState("");
  const [draft, setDraft] = useState<ExpertDraft>(blankExpert), [tab, setTab] = useState(0), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false);
  const version = useRef(0), dirty = useRef(false), pending = useRef<Promise<unknown>>(Promise.resolve()), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDraft = useRef(draft);
  useEffect(() => { latestDraft.current = draft; }, [draft]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const active = data?.assignments.find((a) => a.id === selected), locked = active?.status === "submitted";
  const reload = async () => {
    const next = await api<Data>("expert"); setData(next);
    if (next.assignments[0]) { const a = next.assignments[0]; setSelected(a.id); setDraft(a.payload); version.current = a.revision; }
  };
  useEffect(() => { void api<Data>("expert").then((next) => { setData(next); if (next.assignments[0]) { const a = next.assignments[0]; setSelected(a.id); setDraft(a.payload); version.current = a.revision; } }).catch((e: Error) => setNotice(e.message)); }, []);
  const save = (payload: ExpertDraft, final = false) => {
    const work = pending.current.catch(() => undefined).then(async () => {
      setNotice("Menyimpan…");
      const saved = await api<ExpertRow>("expert", "POST", { kind: "stage1", id: selected, revision: version.current, final, confirmed: final && confirmed, payload });
      version.current = saved.revision; dirty.current = latestDraft.current !== payload;
      setData((d) => d && ({ ...d, assignments: d.assignments.map((a) => a.id === saved.id ? saved : a) }));
      setNotice(final ? "Penilaianmu sudah tersimpan. Hasil gabungan diproses otomatis setelah tiga ahli selesai." : "Tersimpan"); return saved;
    }); pending.current = work; return work;
  };
  useEffect(() => {
    if (!dirty.current || locked || !selected) return;
    timer.current = setTimeout(() => void save(draft).catch((e: Error) => setNotice(`Gagal disimpan: ${e.message}`)), 1100);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  const edit = (next: ExpertDraft) => { dirty.current = true; setDraft(next); };
  let cr: ReturnType<typeof consistency> | null = null;
  try { cr = consistency(crispMatrix(draft.pairs)); } catch { /* Incomplete pairwise draft. */ }
  const tabs = ["Profil", "Definisi", "Telaah 32 butir", "28 pasangan", "Relevansi modul", "Tinjau & kirim", "Validasi kasus"];
  return <main className="dc-page"><header className="dc-topbar"><Link href="/">DekatLokal</Link><span>Ruang ahli</span><button className="dc-text-button" onClick={async () => { await api("auth", "POST", { mode: "logout" }); window.location.assign("/ahli"); }}>Keluar</button></header><div className="dc-admin"><h1>Penilaian ahli</h1><p>Isi sesuai pertimbangan profesionalmu. Draf tersimpan otomatis. Setelah dikirim, nilainya langsung dicek dan digabung saat tiga ahli selesai.</p>{!data ? notice ? <div className="dc-error" role="alert"><p>{notice}</p><button className="dc-secondary" onClick={() => void reload().catch((e: Error) => setNotice(e.message))}>Coba lagi</button></div> : <ContentLoading title="Sebentar, ruang penilaianmu disiapkan." description="Penilaian bisa dicicil. Drafmu tetap tersimpan." /> : !data.assignments.length ? <div className="dc-note">Belum ada penugasan untuk akun ini. Hubungi peneliti.</div> : <>
    <label className="dc-field">Penugasan<select value={selected} disabled={busy} onChange={async (e) => { if (timer.current) clearTimeout(timer.current); if (dirty.current) { try { await save(draft); } catch (err) { setNotice((err as Error).message); return; } } const a = data.assignments.find((x) => x.id === e.target.value)!; setSelected(a.id); setDraft(a.payload); version.current = a.revision; setConfirmed(false); }}>{data.assignments.map((a) => <option key={a.id} value={a.id}>{a.code} · {a.status}</option>)}</select></label>
    <div className="dc-tabs">{tabs.map((t, i) => <button className="dc-secondary" key={t} aria-pressed={tab === i} onClick={() => setTab(i)}>{t}</button>)}</div><p role="status" aria-live="polite">{notice}</p>
    <section className="dc-panel"><fieldset disabled={locked || busy} style={{ border: 0, padding: 0 }}>
    {tab === 0 && <><h2>Profil dan persetujuan</h2><div className="dc-form-grid">{([['name','Nama'],['institution','Instansi'],['jobTitle','Jabatan'],['expertise','Bidang keahlian']] as const).map(([key,label]) => <label key={key}>{label}<input value={draft.profile[key]} readOnly={key === "name" && Boolean(data.identityName)} maxLength={key === "expertise" ? 500 : 150} onChange={(e) => edit({ ...draft, profile: { ...draft.profile, [key]: e.target.value } })} /></label>)}<label>Pengalaman mendampingi (tahun)<input type="number" min={0} max={100} value={draft.profile.experienceYears ?? ""} onChange={(e) => edit({ ...draft, profile: { ...draft.profile, experienceYears: e.target.value === "" ? null : Number(e.target.value) } })} /></label><label>Tanggal penilaian aktual<input type="date" value={draft.profile.assessmentDate} onChange={(e) => edit({ ...draft, profile: { ...draft.profile, assessmentDate: e.target.value } })} /></label></div><label className="dc-check"><input type="checkbox" checked={draft.profile.consent} onChange={(e) => edit({ ...draft, profile: { ...draft.profile, consent: e.target.checked } })} />Ya, saya memahami penelitian ini dan bersedia memberi penilaian profesional untuk telaah instrumen serta model pendampingan UMKM.</label></>}
    {tab === 1 && <><h2>Definisi yang dipakai bersama</h2>{instrument.dimensions.map((d) => <article className="dc-expert-item" key={d.code}><h3>{d.code} · {d.internalTitle}</h3><p>{d.definition}</p></article>)}{instrument.modules.map((m) => <article className="dc-expert-item" key={m.code}><h3>{m.code} · {m.name}</h3><p>{m.scope}</p></article>)}</>}
    {tab === 2 && <><h2>Telaah pertanyaan dan pilihan</h2><p>Nilai 1–4 untuk relevansi dan kejelasan. Nilai 1 atau 2 perlu usulan perbaikan.</p>{instrument.questions.map((q) => { const r = draft.reviews[q.code] ?? { relevance: null, clarity: null, suggestion: "" }; return <article className="dc-expert-item" key={q.code}><h3>{q.code} · {q.text}</h3><ol start={0}>{q.options.map((o) => <li key={o.score}>{o.label}</li>)}</ol><div className="dc-form-grid">{([['relevance','Relevansi'],['clarity','Kejelasan']] as const).map(([key,label]) => <label key={key}>{label}<select value={r[key] ?? ""} onChange={(e) => edit({ ...draft, reviews: { ...draft.reviews, [q.code]: { ...r, [key]: e.target.value === "" ? null : Number(e.target.value) } } })}><option value="">Pilih nilai</option>{[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>)}</div><label className="dc-field">Usulan perbaikan<textarea value={r.suggestion} maxLength={1500} onChange={(e) => edit({ ...draft, reviews: { ...draft.reviews, [q.code]: { ...r, suggestion: e.target.value } } })} /></label></article>; })}<label className="dc-field">Keputusan instrumen<select value={draft.decision ?? ""} onChange={(e) => edit({ ...draft, decision: (e.target.value || null) as ExpertDraft['decision'] })}><option value="">Pilih keputusan</option><option value="layak_uji_coba">Layak uji coba</option><option value="perlu_revisi">Perlu revisi</option></select></label><label className="dc-field">Catatan umum<textarea value={draft.generalNote} maxLength={3000} onChange={(e) => edit({ ...draft, generalNote: e.target.value })} /></label></>}
    {tab === 3 && <><h2>Mana yang lebih penting?</h2><p>Bandingkan kepentingan dimensi untuk menentukan pendampingan. Setara = 1; intensitas 2–9 berarti semakin kuat.</p>{PAIRS.map((p) => { const pair = draft.pairs.find((x) => x.left === p.left && x.right === p.right); const put = (preferred: string, intensity: number) => edit({ ...draft, pairs: [...draft.pairs.filter((x) => x.left !== p.left || x.right !== p.right), { ...p, preferred, intensity }] }); return <div className="dc-expert-item" key={p.left+p.right}><strong>{p.left} {instrument.dimensions.find((d) => d.code === p.left)?.internalTitle} ↔ {p.right} {instrument.dimensions.find((d) => d.code === p.right)?.internalTitle}</strong><div className="dc-form-grid"><label>Yang lebih penting<select value={pair?.preferred ?? ""} onChange={(e) => { if (e.target.value) put(e.target.value, e.target.value === "equal" ? 1 : 2); }}><option value="">Pilih</option><option value="equal">Setara</option><option value={p.left}>{p.left}</option><option value={p.right}>{p.right}</option></select></label><label>Intensitas<select disabled={!pair || pair.preferred === "equal"} value={pair?.intensity ?? ""} onChange={(e) => put(pair!.preferred, Number(e.target.value))}><option value="">Pilih</option>{[1,2,3,4,5,6,7,8,9].map((n) => <option disabled={n === 1 && pair?.preferred !== "equal"} value={n} key={n}>{n}</option>)}</select></label></div></div>; })}</>}
    {tab === 4 && <><h2>Relevansi tujuh modul</h2><p>0 tidak relevan · 1 lemah/tidak langsung · 2 cukup · 3 kuat · 4 sangat kuat/langsung.</p>{instrument.modules.map((m) => <article className="dc-expert-item" key={m.code}><h3>{m.code} · {m.name}</h3><p>{m.scope}</p><div className="dc-form-grid">{instrument.dimensions.map((d) => <label key={d.code}>{d.code} · {d.internalTitle}<select value={draft.relevance[m.code]?.[d.code] ?? ""} onChange={(e) => edit({ ...draft, relevance: { ...draft.relevance, [m.code]: { ...draft.relevance[m.code], [d.code]: e.target.value === "" ? null : Number(e.target.value) } } })}><option value="">Pilih</option>{[0,1,2,3,4].map((n) => <option value={n} key={n}>{n}</option>)}</select></label>)}</div></article>)}</>}
    {tab === 5 && <><h2>Tinjau penilaian</h2><p>Telaah: {Object.values(draft.reviews).filter((r) => r.clarity !== null && r.relevance !== null).length}/32 · Pasangan: {draft.pairs.length}/28 · Relevansi: {Object.values(draft.relevance).flatMap(Object.values).filter((v) => v !== null).length}/56.</p>{cr ? <div className="dc-note"><strong>CR: {cr.CR.toFixed(5)} · {cr.consistent ? "Konsisten" : "Perlu ditinjau"}</strong>{!cr.consistent && <p>Pasangan dengan penyimpangan relatif terbesar: {cr.reviewPairs.map((p) => `${p.left}–${p.right}`).join(", ")}. Ini bantuan tinjauan, bukan penggantian jawaban otomatis.</p>}</div> : <p>Lengkapi pasangan untuk melihat konsistensi.</p>}<label className="dc-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Penilaian sudah saya tinjau dan siap dikunci.</label><button className="dc-primary" disabled={!confirmed || !cr?.consistent || busy} onClick={async () => { if(timer.current) clearTimeout(timer.current); setBusy(true); try { await save(draft,true); } catch(e) { setNotice((e as Error).message); } finally { setBusy(false); } }}>Kirim penilaian final</button></>}
    </fieldset>{locked && tab < 6 && <p className="dc-note">Penilaian ini sudah final dan hanya dapat dibaca.</p>}
    {tab < 6 && !locked && <div className="dc-actions"><button className="dc-secondary" disabled={busy} onClick={async () => { if(timer.current) clearTimeout(timer.current); setBusy(true); try { await save(draft); } catch(e) { setNotice((e as Error).message); } finally { setBusy(false); } }}>Simpan draf</button><button className="dc-secondary" onClick={() => setTab(Math.min(5,tab+1))}>Lanjut</button></div>}
    {tab === 6 && <><h2>Validasi kasus</h2><p>Nilai prioritas modul secara mandiri. Rekomendasi modul tidak ditampilkan agar penilaianmu tetap mandiri.</p>{data.cases.length ? data.cases.map((c) => <CaseForm key={c.id} item={c} onSaved={reload} />) : <p className="dc-note">Belum ada kasus yang dibuka peneliti.</p>}</>}
    </section></>}</div></main>;
}
function CaseForm({ item, onSaved }: { item: Case; onSaved: () => Promise<void> }) {
  type Payload = { decision: string; ranks: Record<string, number>; rationale: string };
  const initial = item.payload as Partial<Payload>;
  const [payload, setPayload] = useState<Payload>({ decision: initial.decision ?? "Dinilai", ranks: initial.ranks ?? {}, rationale: initial.rationale ?? "" });
  const [confirmed, setConfirmed] = useState(false), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  const dirty = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | null>(null), queue = useRef<Promise<unknown>>(Promise.resolve());
  const latest = useRef(payload);
  useEffect(() => { latest.current = payload; }, [payload]);
  const save = (value: Payload, final: boolean) => {
    const work = queue.current.catch(() => undefined).then(async () => {
      setNotice("Menyimpan…");
      await api("expert", "POST", { kind: "case", id: item.id, final, confirmed, payload: { ...value, ranks: value.decision === "Dinilai" ? value.ranks : {} } });
      dirty.current = latest.current !== value; setNotice(dirty.current ? "Menyimpan…" : "Tersimpan");
    });
    queue.current = work; return work;
  };
  useEffect(() => {
    if (!dirty.current || item.status === "submitted") return;
    timer.current = setTimeout(() => void save(payload, false).catch((e: Error) => setNotice("Gagal disimpan: " + e.message)), 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const edit = (value: Partial<Payload>) => { dirty.current = true; setPayload((p) => ({ ...p, ...value })); };
  const send = async (final: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    try { await save(payload, final); if (final) await onSaved(); }
    catch (e) { setNotice("Gagal disimpan: " + (e as Error).message); }
    finally { setBusy(false); }
  };
  return <details className="dc-review">
    <summary>{item.code} · {item.status}</summary>
    <p>{item.metadata.sector} · Usia {item.metadata.businessAgeMonths} bulan · {item.metadata.peopleCount} orang</p>
    <div className="dc-score-list">{instrument.dimensions.map((d,i) => <div key={d.code}>{d.title}: {item.scores[i]}/100</div>)}</div>
    <details className="dc-review"><summary>Lihat 32 jawaban</summary>{instrument.questions.map((q) => <p key={q.code}>{q.code} {q.text}<br/><strong>{q.options.find((o) => o.score === item.answers[q.code])?.label}</strong></p>)}</details>
    <fieldset disabled={item.status === "submitted" || busy} style={{ border: 0, padding: 0 }}>
      <label className="dc-field">Keputusan<select value={payload.decision} onChange={(e) => edit({ decision: e.target.value })}><option>Dinilai</option><option>Tidak dapat menilai</option></select></label>
      {payload.decision === "Dinilai" && instrument.modules.map((m) => <label className="dc-field" key={m.code}>{m.code} {m.name}<small>{m.scope}</small><select value={payload.ranks[m.code] ?? ""} onChange={(e) => edit({ ranks: e.target.value ? { ...payload.ranks, [m.code]: Number(e.target.value) } : Object.fromEntries(Object.entries(payload.ranks).filter(([code]) => code !== m.code)) })}><option value="">Pilih peringkat</option>{[1,2,3,4,5,6,7].map((n) => <option value={n} key={n}>{n}</option>)}</select></label>)}
      <label className="dc-field">{payload.decision === "Dinilai" ? "Alasan pilihan pertama" : "Alasan tidak dapat menilai"}<textarea maxLength={2000} value={payload.rationale} onChange={(e) => edit({ rationale: e.target.value })}/></label>
      <label className="dc-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}/>Saya siap mengunci penilaian ini.</label>
      <div className="dc-actions"><button className="dc-secondary" onClick={() => void send(false)}>Simpan draft</button><button className="dc-primary" disabled={!confirmed} onClick={() => void send(true)}>Kirim final</button></div>
    </fieldset><p role="status" aria-live="polite">{notice}</p>
  </details>;
}
