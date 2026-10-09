"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CheckCircle2, Download, RotateCcw, Sparkles } from "lucide-react";
import { instrument, type Answers } from "@/lib/decision-engine";
import { profileSchema, type BusinessProfile } from "@/lib/digital-checkup/validation";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
import { api } from "@/components/digital-checkup/api";
import { Results } from "@/components/digital-checkup/results";
import { readLocalCheckup, saveLocalCheckup, clearLocalCheckup } from "@/lib/digital-checkup/local-draft";
import { ContentLoading } from "@/components/digital-checkup/content-loading";
import { ScanLoading } from "@/components/digital-checkup/scan-loading";
import { DimensionAnalysis } from "@/components/digital-checkup/dimension-analysis";
import { downloadCheckupPdf } from "@/lib/digital-checkup/report-pdf";
import { profileProblems } from "@/lib/digital-checkup/profile-problems";
import { plainDimension } from "@/lib/digital-checkup/plain-language";
import { TopBar } from "./top-bar";
import { FooterBar } from "./footer-bar";
import { WelcomeScreen } from "./welcome-screen";
import { ProfileForm, profileStages } from "./profile-form";
import { SectionDone, SectionIntro } from "./section-screens";
import { QuestionScreen } from "./question-screen";
import { ReviewScreen } from "./review-screen";

const emptyProfile: BusinessProfile = { profileVersion: 2, businessName: "", email: "", whatsapp: "", instagram: "", tiktok: "", googleMaps: "", consent: true, sector: "", district: "", businessAgeMonths: NaN, peopleCount: NaN, respondentRole: "Pemilik", salesChannels: [], goal: "", note: "", provinceCode: "", cityCode: "" };
type Phase = "intro" | "question" | "done";

export function CheckupWizard({ configured }: { configured: boolean }) {
  const reduced = useReducedMotion();
  const [scanning, setScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false), [pdfBusy, setPdfBusy] = useState(false);
  const [step, setStep] = useState(-2), [consent, setConsent] = useState(false);
  const [stage, setStage] = useState(0), [phase, setPhase] = useState<Phase>("intro"), [qIndex, setQIndex] = useState(0), [direction, setDirection] = useState(1);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile), [answers, setAnswers] = useState<Answers>({});
  const [row, setRow] = useState<PublicAssessment | null>(null), [loading, setLoading] = useState(configured), [slow, setSlow] = useState(false);
  useEffect(() => { if (!loading) return; const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t); }, [loading]);
  const [saveState, setSaveState] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false);
  const rowRef = useRef<PublicAssessment | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), queue = useRef<Promise<unknown>>(Promise.resolve());
  const dirty = useRef(false), heading = useRef<HTMLHeadingElement>(null);
  const latest = useRef({ profile, answers });
  useEffect(() => { latest.current = { profile, answers }; }, [profile, answers]);

  const focusHeading = () => { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); };
  const go = (next: number, dir = 1) => { setError(""); setDirection(dir); setStep(next); focusHeading(); };
  const adopt = (r: PublicAssessment) => { rowRef.current = r; setRow(r); };

  const focusField = (key: string, message: string, focus = true) => {
    if (focus) setError(message);
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-field="${key}"]`) ?? document.querySelector<HTMLElement>(`[name="${key}"]`);
      if (!target) return;
      const input = target.matches("input,select,textarea") ? target : target.querySelector<HTMLElement>("input,select,textarea");
      input?.setAttribute("aria-invalid", "true");
      target.dataset.error = message;
      target.classList.remove("ck-field-attention"); void target.offsetWidth; target.classList.add("ck-field-attention");
      if (focus) { target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" }); input?.focus({ preventScroll: true }); }
    });
  };

  useEffect(() => {
    if (!configured) return;
    let live = true;
    api<PublicAssessment | null>("assessment").then((r) => {
      if (!live) return;
      const local = readLocalCheckup();
      if (!r) { if (local) { setProfile(local.profile); setAnswers(local.answers); setConsent(true); setStep(-1); setSaveState("Draf dipulihkan"); } return; }
      rowRef.current = r; setRow(r); setProfile(r.payload.profile); setAnswers(r.payload.answers); setConsent(true);
      setStep(r.status === "submitted" ? 9 : 0); setPhase("intro"); setSaveState("Tersimpan");
      if (r.linked) clearLocalCheckup();
      else if (r.status === "draft" && local?.sessionId === r.id && local.revision === r.revision) { setProfile(local.profile); setAnswers(local.answers); setStep(Math.min(8, local.step)); setPhase("intro"); dirty.current = true; }
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
    const poll = setInterval(() => { if (document.visibilityState === "visible") void api<PublicAssessment>("status", "POST", {}).then((next) => { if (live && rowRef.current?.id === next.id) adopt(next); }).catch(() => undefined); }, 10000);
    return () => { live = false; clearInterval(poll); };
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
  const setRegion = (provinceCode: string, cityCode: string, district: string) => { dirty.current = true; setError(""); setProfile((p) => ({ ...p, provinceCode, cityCode, district })); };
  const answer = useCallback((code: string, score: number | null) => { dirty.current = true; setError(""); setAnswers((a) => ({ ...a, [code]: score })); }, []);

  const nextProfileStage = async () => {
    const fields = profileStages[stage].fields as readonly string[];
    const problems = profileProblems(profile).filter((issue) => fields.includes(issue.key));
    if (problems.length) { problems.forEach((issue, i) => focusField(issue.key, issue.message, i === 0)); return; }
    if (stage < profileStages.length - 1) { setError(""); setDirection(1); setStage(stage + 1); focusHeading(); return; }
    const all = profileProblems(profile);
    if (all.length) { const target = profileStages.findIndex((s) => (s.fields as readonly string[]).includes(all[0].key)); setStage(Math.max(0, target)); all.forEach((issue, i) => focusField(issue.key, issue.message, i === 0)); return; }
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) { const issue = parsed.error.issues[0]; focusField(String(issue.path[0]), issue.message); return; }
    setBusy(true); setError("");
    try { if (rowRef.current) await persist(profile, answers); else adopt(await api<PublicAssessment>("assessment", "POST", { profile: parsed.data })); dirty.current = false; setPhase("intro"); setQIndex(0); go(0); setSaveState("Tersimpan"); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const prevProfileStage = () => { setError(""); setDirection(-1); if (stage === 0) go(-2, -1); else { setStage(stage - 1); focusHeading(); } };

  const questions = step >= 0 && step < 8 ? instrument.questions.filter((q) => q.dimension === instrument.dimensions[step].code) : [];
  const question = questions[qIndex];
  const answered = Object.values(answers).filter((v) => v != null).length;
  const sectionScore = (index: number) => { const qs = instrument.questions.filter((q) => q.dimension === instrument.dimensions[index].code); return (qs.reduce((sum, q) => sum + (answers[q.code] ?? 0), 0) / 16) * 100; };

  const beginSection = () => { setError(""); setDirection(1); setPhase("question"); setQIndex(0); focusHeading(); };
  const nextQuestion = async () => {
    if (!question || answers[question.code] == null) { focusField(question?.code ?? "", `Pilih salah satu jawaban untuk ${question?.code ?? "pertanyaan ini"} dulu, ya. Belum dilakukan juga boleh dipilih.`); return; }
    if (editing) { if (timer.current) clearTimeout(timer.current); setBusy(true); try { await persist(profile, answers); setEditing(false); go(8, 1); } catch { /* keep input */ } finally { setBusy(false); } return; }
    if (qIndex < questions.length - 1) { setError(""); setDirection(1); setQIndex(qIndex + 1); focusHeading(); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    try { await persist(profile, answers); setDirection(1); setPhase("done"); focusHeading(); } catch { /* Preserve input for retry. */ } finally { setBusy(false); }
  };
  const prevQuestion = () => { setError(""); setDirection(-1); if (editing) { setEditing(false); go(8, -1); return; } if (qIndex > 0) { setQIndex(qIndex - 1); focusHeading(); } else { setPhase("intro"); focusHeading(); } };
  const afterSection = () => { if (step < 7) { setPhase("intro"); setQIndex(0); go(step + 1); } else { setError(""); setAnalyzing(true); window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); } };
  const backFromIntro = () => { setDirection(-1); if (step === 0) { setStage(profileStages.length - 1); go(-1, -1); } else { setPhase("question"); setQIndex(3); go(step - 1, -1); } };
  const finishRef = useRef<() => void>(() => undefined);
  useEffect(() => { finishRef.current = () => { setAnalyzing(false); setError(""); setDirection(1); setStep(8); focusHeading(); }; });
  // Stable identity so the analysis timer is not restarted by unrelated re-renders.
  const finishAnalysis = useCallback(() => finishRef.current(), []);

  const submit = async () => {
    if (!confirmed) { setError("Centang konfirmasi setelah mengecek jawabanmu."); return; }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true); setError(""); setScanning(true);
    try { await persist(profile, answers, true); go(9); } catch { /* Preserve input for retry. */ } finally { setBusy(false); setScanning(false); }
  };
  const revise = async () => {
    setBusy(true);
    try { const revised = await api<PublicAssessment>("assessment", "POST", { profile, revision: true }); adopt(revised); setAnswers(revised.payload.answers); setConfirmed(false); setPhase("intro"); setQIndex(0); go(0); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const download = async () => {
    if (!row || pdfBusy) return;
    setPdfBusy(true); setError("");
    try { await downloadCheckupPdf(row); } catch { setError("PDF belum berhasil dibuat. Coba unduh sekali lagi, ya."); } finally { setPdfBusy(false); }
  };

  // Progress & labels for the top bar.
  const progress = step === -2 ? 0 : step === -1 ? ((stage + 1) / 3) * 8 : step >= 9 ? 100 : step === 8 ? 96 : 8 + (answered / 32) * 88;
  const topLabel = step === -1 ? `Profil ${stage + 1}/3` : step >= 0 && step < 8 ? `Bagian ${step + 1}/8` : step === 8 ? "Tinjauan" : undefined;
  const onBack = step === -1 ? prevProfileStage : step >= 0 && step < 8 && !analyzing ? (phase === "question" ? prevQuestion : phase === "intro" ? backFromIntro : undefined) : step === 8 ? () => { setPhase("question"); setQIndex(3); go(7, -1); } : undefined;
  const screenKey = `${step}:${stage}:${phase}:${qIndex}:${analyzing}`;
  const railActive = Math.max(0, Math.min(9, step + 1));

  return <main className="ck-app" onInput={(e) => { const target = e.target as HTMLElement; target.removeAttribute("aria-invalid"); const field = target.closest<HTMLElement>("[data-error]"); if (field) { field.removeAttribute("data-error"); field.classList.remove("ck-field-attention"); } }}>
    {scanning && <ScanLoading />}
    <TopBar progress={progress} label={topLabel} saveState={step >= -1 && step < 9 ? saveState : undefined} onBack={onBack} />
    <div className="ck-body">
      <aside className="ck-rail" aria-label="Tahapan checkup">
        <h2>Tahapan checkup</h2>
        <ol>{[{ code: "profil", title: "Profil usaha", emoji: "🏪" }, ...instrument.dimensions.map((d) => ({ code: d.code, title: d.title, emoji: plainDimension(d.code).emoji })), { code: "hasil", title: "Tinjauan & hasil", emoji: "🏁" }].map((d, i) => <li key={d.code} aria-current={railActive === i ? "step" : undefined} className={i < railActive ? "is-done" : ""}><span>{i < railActive ? <Check size={13} aria-hidden="true" /> : i + 1}</span>{d.title}</li>)}</ol>
        <small>Gratis · Sekitar 5–7 menit · Jawaban tersimpan otomatis</small>
      </aside>
      <div className="ck-stage">
        {loading ? <><ContentLoading title="Sebentar, kita cek drafmu dulu." />{slow && <p className="note note-warning" style={{ marginTop: 8 }}>Koneksi agak lambat. Kami masih mencoba memuat drafmu; tunggu sebentar atau muat ulang halaman.</p>}</> : <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div key={screenKey} custom={direction} initial={reduced ? false : { opacity: 0, x: direction > 0 ? 36 : -36 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }} exit={reduced ? undefined : { opacity: 0, x: direction > 0 ? -36 : 36, transition: { duration: 0.18 } }}>
            {step === -2 && <WelcomeScreen consent={consent} onConsent={setConsent} onStart={() => { setStage(0); go(-1); }} configured={configured} headingRef={heading} />}
            {step === -1 && <ProfileForm stage={stage} profile={profile} onEdit={editProfile} onRegion={setRegion} headingRef={heading} />}
            {analyzing && <DimensionAnalysis answers={answers} onComplete={finishAnalysis} />}
            {step >= 0 && step < 8 && !analyzing && phase === "intro" && <SectionIntro index={step} headingRef={heading} />}
            {step >= 0 && step < 8 && !analyzing && phase === "question" && question && <QuestionScreen question={question} index={qIndex} value={answers[question.code]} onChange={(score) => answer(question.code, score)} onClear={() => answer(question.code, null)} headingRef={heading} />}
            {step >= 0 && step < 8 && !analyzing && phase === "done" && <SectionDone index={step} score={sectionScore(step)} headingRef={heading} />}
            {step === 8 && <ReviewScreen answers={answers} confirmed={confirmed} onConfirm={setConfirmed} onEdit={(d, q) => { setEditing(true); setPhase("question"); setQIndex(q); go(d, -1); }} headingRef={heading} />}
            {step === 9 && row && <>
              <div className="rs-ready" role="status"><CheckCircle2 size={24} /><div><strong>Checkup selesai. Ini hasilmu.</strong><p>Nilai sudah dihitung dari jawabanmu. Rekomendasi diperbarui otomatis.</p></div></div>
              <Results assessment={row} />
              <section className="rs-cta"><span className="chip"><Sparkles size={14} /> Akses gratis 7 hari</span><h2>Sudah tahu kondisimu.<br />Sekarang, ambil langkah kecil.</h2><p>{row.linked ? "Hasilmu sudah tersimpan di akun. Lanjutkan modul dan latihan dari dashboard selama masa aksesmu." : "Daftar atau masuk untuk menyimpan hasil ini. Tiga modul prioritas, latihan, dan kuis siap kamu akses gratis selama 7 hari."}</p><Link className="btn btn-primary btn-lg" href={row.linked ? "/dashboard" : "/masuk"}>{row.linked ? "Ke ruang belajarku" : "Daftar & buka modul gratis"}<ArrowRight size={18} /></Link><small>Masuk dengan Google atau kode email. Hasil checkup langsung tersambung ke akunmu.</small></section>
              <div className="rs-actions"><button className="btn btn-secondary" disabled={pdfBusy} onClick={() => void download()}><Download size={17} />{pdfBusy ? "Menyiapkan PDF…" : "Unduh laporan PDF"}</button><button className="btn btn-ghost" disabled={busy} onClick={revise}><RotateCcw size={17} />Buat revisi baru</button></div>
            </>}
          </motion.div>
        </AnimatePresence>}
        {error && <div className="ck-error" role="alert">{error}{saveState === "Gagal disimpan" && <button type="button" onClick={() => void persist(profile, answers).catch(() => undefined)}>Coba simpan lagi</button>}</div>}
        {!configured && step !== -2 && <p className="note note-warning" style={{ marginTop: 16 }}>Formulir bisa kamu baca. Penyimpanan sedang dihubungkan; jawaban belum dapat dikirim saat ini.</p>}
      </div>
    </div>

    {!loading && step === -1 && <FooterBar primary={busy ? "Menyiapkan…" : stage === profileStages.length - 1 ? "Lanjut ke pertanyaan" : "Lanjut"} onPrimary={() => void nextProfileStage()} primaryDisabled={busy} onSecondary={prevProfileStage} secondaryDisabled={busy} />}
    {!loading && step >= 0 && step < 8 && !analyzing && phase === "intro" && <FooterBar primary="Mulai bagian ini" onPrimary={beginSection} onSecondary={backFromIntro} />}
    {!loading && step >= 0 && step < 8 && !analyzing && phase === "question" && <FooterBar primary={busy ? "Menyimpan…" : editing ? "Simpan & kembali ke tinjauan" : "Lanjut"} onPrimary={() => void nextQuestion()} primaryDisabled={busy} onSecondary={prevQuestion} secondaryDisabled={busy} note={question && answers[question.code] == null ? "Pilih satu jawaban untuk melanjutkan. Tekan angka 1–5 di keyboard juga bisa." : undefined} />}
    {!loading && step >= 0 && step < 8 && !analyzing && phase === "done" && <FooterBar primary={step === 7 ? "Lihat analisis" : "Lanjut ke bagian berikutnya"} onPrimary={afterSection} primaryIcon={step === 7 ? <Sparkles size={18} /> : <ArrowRight size={18} />} />}
    {!loading && step === 8 && <FooterBar primary={busy ? "Mengirim jawaban…" : "Kirim dan lihat hasil"} onPrimary={() => void submit()} primaryDisabled={busy || !confirmed} primaryIcon={<Check size={18} />} note={!confirmed ? "Centang konfirmasi di atas untuk mengirim." : undefined} />}
  </main>;
}
