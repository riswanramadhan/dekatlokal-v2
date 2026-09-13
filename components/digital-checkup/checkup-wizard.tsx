"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, RotateCcw, Store, Globe, ShoppingBag, Circle, Sprout, ClipboardCheck, TrendingUp, CheckCircle2 } from "lucide-react";
import { instrument, type Answers } from "@/lib/decision-engine";
import { profileSchema, type BusinessProfile } from "@/lib/digital-checkup/validation";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
import { api } from "./api";
import { Results } from "./results";
import { readLocalCheckup, saveLocalCheckup, clearLocalCheckup } from "@/lib/digital-checkup/local-draft";
import { RegionPicker } from "./region-picker";
import { WhatsAppIcon, InstagramFacebookIcon } from "./social-icons";
import { ContentLoading } from "./content-loading";

import { adminWhatsApp, businessSectors } from "@/lib/digital-checkup/contact";
import { profileProblems } from "@/lib/digital-checkup/profile-problems";
import { ScanLoading } from "./scan-loading";
import { coursePreview, resultInsight } from "@/lib/digital-checkup/result-insight";

const emptyProfile: BusinessProfile = { profileVersion: 2, businessName: "", email: "", whatsapp: "", instagram: "", tiktok: "", googleMaps: "", consent: true, sector: "", district: "", businessAgeMonths: NaN, peopleCount: NaN, respondentRole: "Pemilik", salesChannels: [], goal: "", note: "", provinceCode: "", cityCode: "" };
const channels = ["Toko / lapak", "WhatsApp", "Instagram / Facebook", "Marketplace", "Website", "Lainnya"];
const channelIcons = [Store, WhatsAppIcon, InstagramFacebookIcon, ShoppingBag, Globe, ShoppingBag];
const scoreIcons = [Circle, Sprout, ClipboardCheck, TrendingUp, CheckCircle2];
export function CheckupWizard({ configured }: { configured: boolean }) {
  const [scanning, setScanning] = useState(false);
  const focusField = (key: string, message: string, focus = true) => { if(focus) setError(message); requestAnimationFrame(() => { const target = document.querySelector<HTMLElement>(`[data-field="${key}"]`) ?? document.querySelector<HTMLElement>(`[name="${key}"]`) ?? (key === "provinceCode" || key === "cityCode" ? document.querySelector<HTMLElement>(`input[role="combobox"][aria-label="${key === "provinceCode" ? "Provinsi" : "Kota / kabupaten"}"]`) : null); const el = target?.closest<HTMLElement>(".dc-search-select") ?? target; if (!el) return; if(focus) el.scrollIntoView({block:"center",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}); const input = el.matches("input,select,textarea") ? el : el.querySelector<HTMLElement>("input,select,textarea"); if(focus) input?.focus({preventScroll:true}); input?.setAttribute("aria-invalid","true"); el.dataset.error = message; el.classList.remove("dc-field-attention"); void el.offsetWidth; el.classList.add("dc-field-attention"); }); };
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

    const problems=profileProblems(profile);
    if(problems.length){problems.forEach((issue,i)=>focusField(issue.key,issue.message,i===0));return;}
    const parsed=profileSchema.safeParse(profile);
    if(!parsed.success)return;
    setBusy(true); setError("");
    try { if (rowRef.current) await persist(profile, answers); else adopt(await api<PublicAssessment>("assessment", "POST", { profile: parsed.data })); dirty.current = false; change(0); setSaveState("Tersimpan"); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const next = async () => {
    if(step === 4) { const parsed=profileSchema.safeParse(profile); if(!parsed.success) { const issue=parsed.error.issues[0]; focusField(String(issue.path[0]),issue.message); return; } }
    const questions = instrument.questions.filter((q) => q.dimension === instrument.dimensions[step].code);
    const missing = questions.find((q) => answers[q.code] == null);
    if (missing) { focusField(missing.code,`Pilih kondisi untuk ${missing.code} dulu, ya. Belum dilakukan juga boleh dipilih.`); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    try { await persist(profile, answers); change(step + 1); } catch { /* Preserve input for retry. */ } finally { setBusy(false); }
  };
  const submit = async () => {
    if (!confirmed) { setError("Centang konfirmasi setelah mengecek jawabanmu."); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true); setError("");
    setScanning(true);
    try { await persist(profile, answers, true); change(9); } catch { /* Preserve input for retry. */ } finally { setBusy(false); setScanning(false); }
  };
  const revise = async () => {
    setBusy(true);
    try { const revised = await api<PublicAssessment>("assessment", "POST", { profile, revision: true }); adopt(revised); setAnswers(revised.payload.answers); setConfirmed(false); change(0); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const download = () => {
    if (!row) return;
    const scores = row.scores ?? Array(8).fill(0), insight = resultInsight(scores, row.payload.profile);
    const recommendations = row.run?.trace.ranking.filter((item) => item.rank <= 3).map((item) => `${item.rank}. ${coursePreview(item.code)?.title ?? item.code}`).join("\n") ?? "Sedang disiapkan.";
    const dimensions = instrument.dimensions.map((dimension, index) => `- ${dimension.title}: ${scores[index]}/100`).join("\n");
    const text = `RINGKASAN DIGITAL CHECKUP\n\nKode hasil: ${row.code}\nTanggal: ${row.submittedAt ?? "-"}\n\nYANG SUDAH JADI MODAL\n${insight.strongest.title} — ${insight.strongest.score}/100\n${insight.strongest.story}\n\nYANG PERLU DIBERESKAN\n${insight.focus.title} — ${insight.focus.score}/100\n${insight.focus.story}\n\nREKOMENDASI MODUL\n${recommendations}\n\nPELUANG WEBSITE GRATIS\n${insight.website.title}\n${insight.website.description}\n\nNILAI 8 BAGIAN USAHA\n${dimensions}\n\nHasil ini adalah panduan belajar, bukan jaminan hasil usaha.\n`;
    const href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = href; a.download = `${row.code}-ringkasan.txt`; a.click(); URL.revokeObjectURL(href);
  };
  return <main className="dc-page dc-checkup" onInput={e => { const target=e.target as HTMLElement; target.removeAttribute("aria-invalid"); const field=target.closest<HTMLElement>(".dc-field-attention"); if(field) { field.removeAttribute("data-error"); field.classList.remove("dc-field-attention"); } }}>
    {scanning && <ScanLoading/>}
    <header className="dc-topbar"><Link href="/" aria-label="Beranda DekatLokal"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} priority /></Link><span>Digital Checkup</span><Link href="/masuk">Masuk</Link></header>
    <div className="dc-workspace">
      <aside className="dc-sidebar dc-stepper"><p className="dc-eyebrow">Digital Checkup</p><h2>Satu per satu.<br />Biar makin jelas.</h2><p>Jawab sesuai kondisi usahamu hari ini.</p><ol aria-label="Tahapan checkup">{[{ code: "profil", title: "Profil usaha" }, ...instrument.dimensions, { code: "hasil", title: "Tinjauan & hasil" }].map((d, i) => { const active = Math.max(0, Math.min(9, step + 1)); return <li key={d.code} aria-current={active === i ? "step" : undefined} className={i < active ? "is-done" : ""}><span>{i < active ? <Check size={14} aria-hidden="true" /> : i + 1}</span><div>{d.title}<small>{i < active ? "Sudah diisi" : active === i ? "Kamu di sini" : "Langkah berikutnya"}</small></div></li>; })}</ol><small>Gratis · Sekitar 5–7 menit</small></aside>
      <section className="dc-panel">
        {loading ? <ContentLoading title="Sebentar, kita cek drafmu dulu." /> : <>
          {step >= 0 && step < 8 && <div className="dc-progress"><span>Bagian {step + 1} dari 8</span><span role="status" aria-live="polite">{saveState}</span><progress max={32} value={Object.values(answers).filter((v) => v !== null).length} aria-label="Pertanyaan terjawab" /></div>}
          {step === -2 && <><p className="dc-eyebrow">Mulai dari kondisi hari ini</p><h1 ref={heading} tabIndex={-1}>Usahamu mau ke mana? Yuk, cari langkahnya.</h1><p className="dc-lead">Jawab 32 pertanyaan singkat. Lihat kondisi usahamu, lalu temukan langkah belajar yang paling kamu butuhkan.</p><div className="dc-note"><strong>Jawabanmu tetap milikmu.</strong><p>Draf juga disimpan di perangkat ini selama maksimal 7 hari. Hindari perangkat bersama. Kami menyimpan nama bisnis, email, WhatsApp, jawaban, dan profil usaha untuk menyusun rekomendasi serta penelitian pendampingan UMKM. Data penelitian memakai kode usaha. Kamu tidak perlu mengisi NIK, rekening, atau omzet.</p><p>Hasil ini membantu diskusi dengan pendamping. Hasil bukan penentu kredit, bantuan, atau jaminan keberhasilan usaha.</p><Link href="https://dekatlokal.com/privacy-policy" target="_blank" rel="noopener noreferrer">Baca kebijakan privasi</Link></div><label className="dc-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />Ya, saya memahami tujuan dan penggunaan data ini, serta bersedia ikut.</label><button className="dc-primary" disabled={!consent} onClick={() => change(-1)}>Mulai Checkup Gratis <ArrowRight size={18} /></button></>}
          {step === -1 && <><p className="dc-eyebrow">Kenalan sebentar</p><h1 ref={heading} tabIndex={-1}>Ceritakan sedikit usahamu.</h1><p>Kenalan singkat dulu. Setelah ini, kita cek kondisi usahamu bareng.</p><div className="dc-form-grid">
            <label data-field="businessName">Nama bisnis<input aria-label="Nama bisnis" required autoComplete="organization" value={profile.businessName ?? ""} maxLength={150} placeholder="Nama yang dikenal pelanggan" onChange={e=>editProfile("businessName",e.target.value)}/></label>
            <label data-field="email">Email<input aria-label="Email" required type="email" inputMode="email" autoComplete="email" value={profile.email ?? ""} maxLength={254} placeholder="nama@email.com" onChange={e=>editProfile("email",e.target.value)}/></label>
            <label data-field="whatsapp">Nomor WhatsApp<input aria-label="Nomor WhatsApp" required type="tel" autoComplete="tel" value={profile.whatsapp ?? ""} maxLength={25} placeholder="08xxxxxxxxxx" onChange={e=>editProfile("whatsapp",e.target.value)}/></label>
            <label data-field="sector">Jenis usaha<select aria-label="Jenis usaha" required value={profile.sector} onChange={e=>editProfile("sector",e.target.value)}><option value="">Pilih bidang usahamu</option>{profile.sector && !businessSectors.includes(profile.sector) && <option>{profile.sector}</option>}{businessSectors.map(x=><option key={x}>{x}</option>)}</select></label>
            <RegionPicker provinceCode={profile.provinceCode ?? ""} cityCode={profile.cityCode ?? ""} onChange={(provinceCode, cityCode, district) => { dirty.current = true; setError(""); setProfile(p => ({ ...p, provinceCode, cityCode, district })); }} />
            <label data-field="businessAgeMonths">Lama usaha (bulan)<input aria-label="Lama usaha (bulan)" required type="number" inputMode="numeric" min={0} max={2400} placeholder="Contoh: 12" value={Number.isNaN(profile.businessAgeMonths) ? "" : profile.businessAgeMonths} onChange={(e) => editProfile("businessAgeMonths", e.target.value === "" ? NaN : Number(e.target.value))} /></label>
            <label data-field="peopleCount">Jumlah orang, termasuk pemilik<input aria-label="Jumlah orang, termasuk pemilik" required type="number" inputMode="numeric" min={1} max={100000} placeholder="Contoh: 1" value={Number.isNaN(profile.peopleCount) ? "" : profile.peopleCount} onChange={(e) => editProfile("peopleCount", e.target.value === "" ? NaN : Number(e.target.value))} /></label>
            <label>Peran kamu<select value={profile.respondentRole} onChange={(e) => editProfile("respondentRole", e.target.value as BusinessProfile["respondentRole"])}><option>Pemilik</option><option>Pengelola</option></select></label>
          </div><fieldset data-field="salesChannels" className="dc-channel"><legend>Biasanya jualan lewat mana? Boleh pilih lebih dari satu.</legend><div className="dc-channel-options">{channels.map((c, i) => { const Icon = channelIcons[i]; return <label className={`dc-check ${profile.salesChannels.includes(c) ? "is-selected" : ""}`} key={c}><input type="checkbox" checked={profile.salesChannels.includes(c)} onChange={(e) => editProfile("salesChannels", e.target.checked ? [...profile.salesChannels, c] : profile.salesChannels.filter((x) => x !== c))} /><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{c}</span></label>; })}</div></fieldset><label data-field="goal" className="dc-field">Apa yang ingin kamu bereskan dalam 30 hari?<textarea aria-label="Apa yang ingin kamu bereskan dalam 30 hari?" required maxLength={500} value={profile.goal} placeholder="Contoh: mulai rutin mencatat uang masuk dan keluar" onChange={(e) => editProfile("goal", e.target.value)} /></label><label className="dc-field">Ada cerita lain soal usahamu? (opsional)<textarea maxLength={1000} value={profile.note} onChange={(e) => editProfile("note", e.target.value)} placeholder="Misalnya, usaha baru mulai dua minggu lalu. Hindari data pribadi sensitif." /></label><div className="dc-actions"><button className="dc-secondary" onClick={() => change(-2)}>Kembali</button><button className="dc-primary" disabled={busy} onClick={start}>{busy ? "Menyiapkan…" : "Lanjut ke pertanyaan"}<ArrowRight size={18} /></button></div></>}
          {step >= 0 && step < 8 && <><h1 ref={heading} tabIndex={-1}>{instrument.dimensions[step].title}</h1><p>Pilih kondisi tertinggi yang <strong>semua bagiannya sudah dilakukan</strong>. Belum dilakukan juga nggak apa-apa.</p>{step === 2 || step === 6 ? <p className="dc-note">Usaha jasa? Baca “produk” sebagai layanan dan “stok” sebagai kapasitas melayani.</p> : null}{step === 5 && profile.businessAgeMonths < 1 && <p className="dc-note">Usahamu belum berjalan 30 hari. Jawab sesuai pengalaman yang ada; keterbatasan waktunya akan dicatat.</p>}
          {step === 4 && <section className="dc-digital-links"><h2>Usahamu ada di mana saja?</h2><p>Isi yang sudah kamu punya. Belum ada? Boleh dilewati dan tidak mengurangi skor.</p><div className="dc-form-grid">{([["instagram","Instagram","@namabisnis"],["tiktok","TikTok","@namabisnis"],["googleMaps","Link Google Maps","https://maps.app.goo.gl/…"]] as const).map(([key,label,placeholder])=><label data-field={key} key={key}>{label} (opsional)<input type={key==="googleMaps"?"url":"text"} autoCapitalize="none" autoCorrect="off" maxLength={key==="googleMaps"?500:100} value={profile[key]??""} placeholder={placeholder} onChange={e=>editProfile(key,e.target.value)}/></label>)}</div></section>}
          {instrument.questions.filter((q) => q.dimension === instrument.dimensions[step].code).map((q) => <fieldset data-field={q.code} className="dc-question" key={q.code}><legend><small>{q.code}</small>{q.text}</legend><div className="dc-options">{q.options.map((o) => { const Icon = scoreIcons[o.score]; return <label key={o.score} className={answers[q.code] === o.score ? "is-selected" : ""}><input id={`${q.code}-${o.score}`} type="radio" name={q.code} value={o.score} checked={answers[q.code] === o.score} onChange={() => { dirty.current = true; setError(""); setAnswers((a) => ({ ...a, [q.code]: o.score })); }} /><Icon className="dc-choice-icon" size={21} strokeWidth={1.6} aria-hidden="true" /><span>{o.label}</span></label>; })}</div><details className="dc-help"><summary>Masih ragu memilih?</summary><p>Pilih yang semua bagiannya sudah kamu jalankan. Kalau perlu diskusi, <a href={adminWhatsApp("Halo Admin DekatLokal, saya sedang mengisi Digital Checkup dan ingin bertanya kepada pendamping.")} target="_blank" rel="noopener noreferrer">tanya pendamping</a> dan lanjut isi setelah kamu yakin.</p><button className="dc-text-button" onClick={() => { dirty.current = true; setError(""); setAnswers((a) => ({ ...a, [q.code]: null })); }}>Kosongkan dulu jawaban ini</button></details></fieldset>)}<div className="dc-actions"><button className="dc-secondary" disabled={busy} onClick={() => change(step - 1)}><ArrowLeft size={16} />Kembali</button><button className="dc-primary" disabled={busy} onClick={next}>{busy ? "Menyimpan…" : step === 7 ? "Tinjau jawaban" : "Lanjut"}<ArrowRight size={16} /></button></div></>}
          {step === 8 && <><p className="dc-eyebrow">Sebentar lagi selesai</p><h1 ref={heading} tabIndex={-1}>Sudah sesuai kondisi usahamu?</h1><p>Cek sekali lagi, ya. Setelah dikirim, jawaban ini tersimpan sebagai hasil hari ini. Nanti kamu tetap bisa checkup ulang.</p>{instrument.dimensions.map((d, i) => <details className="dc-review" key={d.code}><summary>{d.title}</summary><button className="dc-text-button" onClick={() => change(i)}>Ubah jawaban</button>{instrument.questions.filter((q) => q.dimension === d.code).map((q) => <div key={q.code}><strong>{q.text}</strong><p>{q.options.find((o) => o.score === answers[q.code])?.label ?? "Belum dijawab"}</p></div>)}</details>)}<label className="dc-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Jawaban sudah saya cek dan sesuai kondisi usaha saya.</label><button className="dc-primary" disabled={busy || !confirmed} onClick={submit}>{busy ? "Mengirim jawaban…" : "Kirim dan lihat hasil"}<Check size={18} /></button></>}
          {step === 9 && row && <><div className="dc-result-ready" role="status"><CheckCircle2 size={22} /><div><strong>Checkup selesai. Ini hasilmu.</strong><p>Nilai sudah dihitung dari jawabanmu. Rekomendasi diperbarui otomatis.</p></div></div><Results assessment={row} /><section className="dc-account-cta"><span className="dc-badge">Akses gratis 7 hari</span><h2>Sudah tahu kondisimu.<br />Sekarang, ambil langkah kecil.</h2><p>{row.linked ? "Hasilmu sudah tersimpan di akun. Lanjutkan modul dan latihan dari dashboard selama masa aksesmu." : "Daftar atau masuk untuk menyimpan hasil ini. Tiga modul prioritas, latihan, dan kuis siap kamu akses gratis selama 7 hari."}</p><Link className="dc-primary" href={row.linked ? "/dashboard" : "/masuk"}>{row.linked ? "Ke ruang belajarku" : "Daftar & buka modul gratis"}<ArrowRight size={18} /></Link><small>Masuk dengan Google atau kode email. Hasil checkup langsung tersambung ke akunmu.</small></section><div className="dc-actions"><button className="dc-secondary" onClick={download}><Download size={17} />Unduh ringkasan</button><button className="dc-secondary" disabled={busy} onClick={revise}><RotateCcw size={17} />Buat revisi baru</button></div></>}
          {error && <div className="dc-error" role="alert">{error}{saveState === "Gagal disimpan" && <button className="dc-text-button" onClick={() => void persist(profile, answers).catch(() => undefined)}>Coba simpan lagi</button>}</div>}
          {!configured && <p className="dc-note">Formulir bisa kamu baca. Penyimpanan sedang dihubungkan; jawaban belum dapat dikirim saat ini.</p>}
        </>}
      </section>
    </div><footer className="dc-footer">DekatLokal · Teman bertumbuh usahamu <Link href="/">Kembali ke beranda</Link></footer>
  </main>;
}
