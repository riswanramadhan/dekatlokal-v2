"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, RotateCcw, Store, MessageCircle, Globe, ShoppingBag, Users, Circle, Sprout, ClipboardCheck, TrendingUp, CheckCircle2 } from "lucide-react";
import { instrument, type Answers } from "@/lib/decision-engine";
import { profileSchema, type BusinessProfile } from "@/lib/digital-checkup/validation";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
import { api } from "./api";
import { Results } from "./results";
import { readLocalCheckup, saveLocalCheckup, clearLocalCheckup } from "@/lib/digital-checkup/local-draft";

const emptyProfile: BusinessProfile = { consent: true, sector: "", district: "", businessAgeMonths: 0, peopleCount: 1, respondentRole: "Pemilik", salesChannels: [], goal: "", note: "" };
const channels = ["Toko / lapak", "WhatsApp", "Instagram / Facebook", "Marketplace", "Website", "Lainnya"];
const channelIcons = [Store, MessageCircle, Users, ShoppingBag, Globe, ShoppingBag];
const scoreIcons = [Circle, Sprout, ClipboardCheck, TrendingUp, CheckCircle2];
export function CheckupWizard({ configured }: { configured: boolean }) {
  const [step, setStep] = useState(-2), [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile), [answers, setAnswers] = useState<Answers>({});
  const [row, setRow] = useState<PublicAssessment | null>(null), [loading, setLoading] = useState(configured);
  const [saveState, setSaveState] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false);
  const rowRef = useRef<PublicAssessment | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), queue = useRef<Promise<unknown>>(Promise.resolve());
  const dirty = useRef(false), heading = useRef<HTMLHeadingElement>(null);
  const latest = useRef({ profile, answers });
  useEffect(() => { latest.current = { profile, answers }; }, [profile, answers]);
  const change = (next: number) => { setError(""); setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); requestAnimationFrame(() => heading.current?.focus()); };
  const adopt = (r: PublicAssessment) => { rowRef.current = r; setRow(r); };
  useEffect(() => {
    if (!configured) return;
    let live = true;
    api<PublicAssessment | null>("assessment").then((r) => {
      if (!live) return;
      const local = readLocalCheckup();
      if (!r) { if (local) { setProfile(local.profile); setAnswers(local.answers); setConsent(true); setStep(-1); setSaveState("Draf dari perangkat ini dipulihkan"); } return; }
      rowRef.current = r; setRow(r); setProfile(r.payload.profile); setAnswers(r.payload.answers); setConsent(true);
      setStep(r.status === "submitted" ? 9 : 0); setSaveState("Tersimpan");
      if (r.linked) clearLocalCheckup();
      else if (r.status === "draft" && local?.sessionId === r.id && local.revision === r.revision) { setProfile(local.profile); setAnswers(local.answers); setStep(Math.min(8, local.step)); dirty.current = true; }
    }).catch((e: Error) => { if (live) setError(e.message); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [configured]);
  useEffect(() => {
    if (loading || !consent || step < -1) return;
    if (row?.linked) { clearLocalCheckup(); return; }
    saveLocalCheckup({ version: 1, savedAt: Date.now(), sessionId: row?.id ?? null, revision: row?.revision ?? 0, step, profile, answers });
  }, [loading, consent, step, profile, answers, row]);
  useEffect(() => {
    if (row?.status !== "submitted" || row.run) return;
    let live = true;
    const timer = setInterval(() => { if (document.visibilityState === "visible") void api<PublicAssessment>("status", "POST", {}).then((next) => { if (live && rowRef.current?.id === next.id) adopt(next); }).catch(() => undefined); }, 10000);
    return () => { live = false; clearInterval(timer); };
  }, [row?.id, row?.status, row?.run]);
  const persist = (p: BusinessProfile, a: Answers, final = false) => {
    const work = queue.current.catch(() => undefined).then(async () => {
      const current = rowRef.current; if (!current || current.status !== "draft") return current;
      setSaveState("Menyimpan…");
      const saved = await api<PublicAssessment>("assessment", "PATCH", { profile: p, answers: a, revision: current.revision, final, confirmed: final });
      adopt(saved); dirty.current = latest.current.profile !== p || latest.current.answers !== a; setSaveState(dirty.current ? "Menyimpan…" : "Tersimpan"); return saved;
    });
    queue.current = work;
    return work.catch((e: Error) => { setSaveState("Gagal disimpan"); setError(e.message); throw e; });
  };
  useEffect(() => {
    if (!dirty.current || !rowRef.current || rowRef.current.status !== "draft") return;
    timer.current = setTimeout(() => { void persist(profile, answers).catch(() => undefined); }, 850);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Only input changes enqueue autosave, not the revision returned by that save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, answers]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const editProfile = (key: keyof BusinessProfile, value: BusinessProfile[keyof BusinessProfile]) => { dirty.current = true; setError(""); setProfile((p) => ({ ...p, [key]: value })); };
  const start = async () => {
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) { setError(parsed.error.issues.map((i) => `${({ sector: "Jenis usaha", district: "Kecamatan", goal: "Tujuan 30 hari", salesChannels: "Tempat jualan" } as Record<string, string>)[String(i.path[0])] || String(i.path[0])}: ${i.message}`).join(" · ")); return; }
    setBusy(true); setError("");
    try { if (rowRef.current) await persist(profile, answers); else adopt(await api<PublicAssessment>("assessment", "POST", { profile: parsed.data })); dirty.current = false; change(0); setSaveState("Tersimpan"); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const next = async () => {
    const questions = instrument.questions.filter((q) => q.dimension === instrument.dimensions[step].code);
    const missing = questions.find((q) => answers[q.code] == null);
    if (missing) { setError(`Pilih kondisi untuk ${missing.code} dulu, ya. Nilai 0 juga jawaban yang sah.`); document.getElementById(`${missing.code}-0`)?.focus(); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    try { await persist(profile, answers); change(step + 1); } catch { /* Preserve input for retry. */ } finally { setBusy(false); }
  };
  const submit = async () => {
    if (!confirmed) { setError("Centang konfirmasi setelah mengecek jawabanmu."); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true); setError("");
    try { await persist(profile, answers, true); change(9); } catch { /* Preserve input for retry. */ } finally { setBusy(false); }
  };
  const revise = async () => {
    setBusy(true);
    try { const revised = await api<PublicAssessment>("assessment", "POST", { profile, revision: true }); adopt(revised); setAnswers(revised.payload.answers); setConfirmed(false); change(0); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const download = () => {
    if (!row) return;
    const data = { code: row.code, instrument: instrument.version, submittedAt: row.submittedAt, scores: row.scores, recommendations: row.run?.trace.ranking ?? [], status: row.run?.trace.status ?? "WAITING_MODEL" };
    const href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = href; a.download = `${row.code}-ringkasan.json`; a.click(); URL.revokeObjectURL(href);
  };
  return <main className="dc-page dc-checkup">
    <header className="dc-topbar"><Link href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} priority /></Link><span>Digital Checkup</span><Link href="/masuk">Masuk</Link></header>
    <div className="dc-workspace">
      <aside className="dc-sidebar dc-stepper"><p className="dc-eyebrow">Digital Checkup</p><h2>Satu per satu.<br />Biar makin jelas.</h2><p>Jawab sesuai kondisi usahamu hari ini.</p><ol aria-label="Tahapan checkup">{[{ code: "profil", title: "Profil usaha" }, ...instrument.dimensions, { code: "hasil", title: "Tinjauan & hasil" }].map((d, i) => { const active = Math.max(0, Math.min(9, step + 1)); return <li key={d.code} aria-current={active === i ? "step" : undefined} className={i < active ? "is-done" : ""}><span>{i < active ? <Check size={14} aria-hidden="true" /> : i + 1}</span><div>{d.title}<small>{i < active ? "Sudah diisi" : active === i ? "Kamu di sini" : "Langkah berikutnya"}</small></div></li>; })}</ol><small>Gratis · Sekitar 5–7 menit</small></aside>
      <section className="dc-panel">
        {loading ? <p role="status">Mengecek jawaban tersimpan…</p> : <>
          {step >= 0 && step < 8 && <div className="dc-progress"><span>Bagian {step + 1} dari 8</span><span role="status" aria-live="polite">{saveState}</span><progress max={32} value={Object.values(answers).filter((v) => v !== null).length} aria-label="Pertanyaan terjawab" /></div>}
          {step === -2 && <><p className="dc-eyebrow">Mulai dari kondisi hari ini</p><h1 ref={heading} tabIndex={-1}>Usahamu mau ke mana? Yuk, cari langkahnya.</h1><p className="dc-lead">Jawab 32 pertanyaan singkat. Kita lihat bagian yang sudah berjalan dan pendampingan yang paling kamu butuhkan.</p><div className="dc-note"><strong>Jawabanmu tetap milikmu.</strong><p>Draf juga disimpan di perangkat ini selama maksimal 7 hari. Hindari perangkat bersama. Kami menyimpan jawaban dan profil usaha singkat untuk menyusun rekomendasi serta penelitian pendampingan UMKM. Data penelitian memakai kode usaha. Kamu tidak perlu mengisi NIK, rekening, atau omzet.</p><p>Hasil ini membantu diskusi dengan pendamping. Hasil bukan penentu kredit, bantuan, atau jaminan keberhasilan usaha.</p><Link href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Baca kebijakan privasi</Link></div><label className="dc-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />Ya, saya memahami tujuan dan penggunaan data ini, serta bersedia ikut.</label><button className="dc-primary" disabled={!consent} onClick={() => change(-1)}>Mulai Checkup Gratis <ArrowRight size={18} /></button></>}
          {step === -1 && <><p className="dc-eyebrow">Kenalan sebentar</p><h1 ref={heading} tabIndex={-1}>Ceritakan sedikit usahamu.</h1><p>Kode usahamu dibuat otomatis. Isi yang penting saja.</p><div className="dc-form-grid">
            <label>Jenis usaha<input value={profile.sector} maxLength={100} placeholder="Contoh: kuliner, jasa, kerajinan" onChange={(e) => editProfile("sector", e.target.value)} /></label>
            <label>Kecamatan<input value={profile.district} maxLength={100} placeholder="Kecamatan tempat usaha berjalan" onChange={(e) => editProfile("district", e.target.value)} /></label>
            <label>Lama usaha (bulan)<input type="number" min={0} max={2400} value={Number.isNaN(profile.businessAgeMonths) ? "" : profile.businessAgeMonths} onChange={(e) => editProfile("businessAgeMonths", e.target.value === "" ? NaN : Number(e.target.value))} /></label>
            <label>Jumlah orang, termasuk pemilik<input type="number" min={1} max={100000} value={Number.isNaN(profile.peopleCount) ? "" : profile.peopleCount} onChange={(e) => editProfile("peopleCount", e.target.value === "" ? NaN : Number(e.target.value))} /></label>
            <label>Peran kamu<select value={profile.respondentRole} onChange={(e) => editProfile("respondentRole", e.target.value as BusinessProfile["respondentRole"])}><option>Pemilik</option><option>Pengelola</option></select></label>
          </div><fieldset className="dc-channel"><legend>Biasanya jualan lewat mana? Boleh pilih lebih dari satu.</legend><div className="dc-channel-options">{channels.map((c, i) => { const Icon = channelIcons[i]; return <label className={`dc-check ${profile.salesChannels.includes(c) ? "is-selected" : ""}`} key={c}><input type="checkbox" checked={profile.salesChannels.includes(c)} onChange={(e) => editProfile("salesChannels", e.target.checked ? [...profile.salesChannels, c] : profile.salesChannels.filter((x) => x !== c))} /><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{c}</span></label>; })}</div></fieldset><label className="dc-field">Apa yang ingin kamu bereskan dalam 30 hari?<textarea maxLength={500} value={profile.goal} placeholder="Contoh: mulai rutin mencatat uang masuk dan keluar" onChange={(e) => editProfile("goal", e.target.value)} /></label><label className="dc-field">Ada konteks tambahan? (opsional)<textarea maxLength={1000} value={profile.note} onChange={(e) => editProfile("note", e.target.value)} placeholder="Misalnya, usaha baru mulai dua minggu lalu. Hindari data pribadi sensitif." /></label><div className="dc-actions"><button className="dc-secondary" onClick={() => change(-2)}>Kembali</button><button className="dc-primary" disabled={busy} onClick={start}>{busy ? "Menyiapkan…" : "Lanjut ke pertanyaan"}<ArrowRight size={18} /></button></div></>}
          {step >= 0 && step < 8 && <><h1 ref={heading} tabIndex={-1}>{instrument.dimensions[step].title}</h1><p>Pilih kondisi tertinggi yang <strong>semua bagiannya sudah dilakukan</strong>. Belum dilakukan juga nggak apa-apa.</p>{step === 2 || step === 6 ? <p className="dc-note">Usaha jasa? Baca “produk” sebagai layanan dan “stok” sebagai kapasitas melayani.</p> : null}{step === 5 && profile.businessAgeMonths < 1 && <p className="dc-note">Usahamu belum berjalan 30 hari. Jawab sesuai pengalaman yang ada; keterbatasan waktunya akan dicatat.</p>}
          {instrument.questions.filter((q) => q.dimension === instrument.dimensions[step].code).map((q) => <fieldset className="dc-question" key={q.code}><legend><small>{q.code}</small>{q.text}</legend><div className="dc-options">{q.options.map((o) => { const Icon = scoreIcons[o.score]; return <label key={o.score} className={answers[q.code] === o.score ? "is-selected" : ""}><input id={`${q.code}-${o.score}`} type="radio" name={q.code} value={o.score} checked={answers[q.code] === o.score} onChange={() => { dirty.current = true; setError(""); setAnswers((a) => ({ ...a, [q.code]: o.score })); }} /><Icon className="dc-choice-icon" size={21} strokeWidth={1.6} aria-hidden="true" /><span>{o.label}</span></label>; })}</div><details className="dc-help"><summary>Masih ragu memilih?</summary><p>Pilih yang semua bagiannya sudah kamu jalankan. Kalau perlu diskusi, <a href="mailto:hello@dekatlokal.com">tanya pendamping</a> dan lanjut isi setelah kamu yakin.</p><button className="dc-text-button" onClick={() => { dirty.current = true; setError(""); setAnswers((a) => ({ ...a, [q.code]: null })); }}>Kosongkan dulu jawaban ini</button></details></fieldset>)}<div className="dc-actions"><button className="dc-secondary" disabled={busy} onClick={() => change(step - 1)}><ArrowLeft size={16} />Kembali</button><button className="dc-primary" disabled={busy} onClick={next}>{busy ? "Menyimpan…" : step === 7 ? "Tinjau jawaban" : "Lanjut"}<ArrowRight size={16} /></button></div></>}
          {step === 8 && <><p className="dc-eyebrow">Sebentar lagi selesai</p><h1 ref={heading} tabIndex={-1}>Sudah sesuai kondisi usahamu?</h1><p>Setelah dikirim, jawaban ini dikunci. Kalau nanti ada perubahan, kamu bisa membuat revisi baru.</p>{instrument.dimensions.map((d, i) => <details className="dc-review" key={d.code}><summary>{d.title}</summary><button className="dc-text-button" onClick={() => change(i)}>Ubah jawaban</button>{instrument.questions.filter((q) => q.dimension === d.code).map((q) => <div key={q.code}><strong>{q.text}</strong><p>{q.options.find((o) => o.score === answers[q.code])?.label ?? "Belum dijawab"}</p></div>)}</details>)}<label className="dc-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Jawaban sudah saya cek dan sesuai kondisi usaha saya.</label><button className="dc-primary" disabled={busy || !confirmed} onClick={submit}>{busy ? "Mengirim jawaban…" : "Kirim dan lihat hasil"}<Check size={18} /></button></>}
          {step === 9 && row && <><div className="dc-result-ready" role="status"><CheckCircle2 size={22} /><div><strong>Checkup selesai. Ini hasilmu.</strong><p>Nilai sudah dihitung dari jawabanmu. Rekomendasi diperbarui otomatis.</p></div></div><Results assessment={row} /><section className="dc-account-cta"><span className="dc-badge">Lanjut belajar gratis</span><h2>Sudah tahu kondisimu.<br />Sekarang, ambil langkah kecil.</h2><p>{row.linked ? "Hasilmu sudah tersimpan di akun. Lanjutkan materi dan latihan dari dashboard." : "Masuk untuk menyimpan hasil ini ke akunmu. Ada 7 modul gratis, latihan, dan kuis yang bisa kamu lanjutkan kapan saja."}</p><Link className="dc-primary" href={row.linked ? "/dashboard" : "/masuk"}>{row.linked ? "Ke ruang belajarku" : "Simpan hasil & mulai belajar"}<ArrowRight size={18} /></Link><small>Google atau kode email. Tanpa biaya.</small></section><div className="dc-actions"><button className="dc-secondary" onClick={download}><Download size={17} />Unduh ringkasan</button><button className="dc-secondary" disabled={busy} onClick={revise}><RotateCcw size={17} />Buat revisi baru</button></div></>}
          {error && <div className="dc-error" role="alert">{error}{saveState === "Gagal disimpan" && <button className="dc-text-button" onClick={() => void persist(profile, answers).catch(() => undefined)}>Coba simpan lagi</button>}</div>}
          {!configured && <p className="dc-note">Formulir bisa kamu baca. Penyimpanan sedang dihubungkan; jawaban belum dapat dikirim saat ini.</p>}
        </>}
      </section>
    </div><footer className="dc-footer">DekatLokal · Teman bertumbuh usahamu <Link href="/">Kembali ke beranda</Link></footer>
  </main>;
}
