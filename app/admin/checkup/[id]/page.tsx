import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCheckupDetail, summarizeSensitivity } from "@/lib/digital-checkup/admin-data";
import { fmt, fmtDate } from "@/lib/digital-checkup/format";
import { instrument } from "@/lib/decision-engine";
import { AnswersBySection } from "@/components/admin/answers-by-section";
import { CheckupActions } from "@/components/admin/checkup-actions";
import { RunSteps } from "@/components/admin/run-steps";
import { Bar, ScoreBars } from "@/components/admin/score-bars";
import { SensitivityTable } from "@/components/admin/sensitivity-table";
import { Chip, ConsistencyChip, RunStatusChip, SessionStatusChip } from "@/components/admin/status-chip";
import { VerifyVerdict } from "@/components/admin/verify-table";
import { attempt, Empty, LoadError, PageHead } from "@/components/admin/load-error";
import { TASK_LABEL, TASK_STATUS_LABEL } from "@/components/admin/usability-form";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const moduleName = (code: string) => instrument.modules.find((m) => m.code === code)?.name ?? code;
const ANCHORS = [["profil", "Profil"], ["jawaban", "Jawaban"], ["nilai", "Nilai 8 bagian"], ["bobot", "Bobot ahli"], ["hitung", "Cara hitung"], ["sensitivitas", "Sensitivitas"], ["validasi", "Validasi ahli"], ["ekspor", "Ekspor"]] as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Checkup ${id.slice(0, 8)}` };
}

export default async function CheckupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { data, error } = await attempt(() => getCheckupDetail(id));
  if (error) return <LoadError message={error} />;
  if (!data) notFound();
  const { assessment, latestRun, verification } = data, profile = assessment.payload?.profile, run = latestRun;
  const businessName = profile?.businessName?.trim() || "Usaha tanpa nama";
  const sensitivity = run ? summarizeSensitivity(run, data.label, businessName) : null;
  const contacts: [string, string | undefined][] = [["Email", profile?.email], ["WhatsApp", profile?.whatsapp], ["Instagram", profile?.instagram], ["TikTok", profile?.tiktok], ["Google Maps", profile?.googleMaps]];

  return <>
    <PageHead eyebrow={data.label} title={businessName} lead={`${profile?.sector || "Jenis usaha belum diisi"} · ${profile?.district || "Lokasi belum diisi"} · ${data.answered} / 32 jawaban`}>
      <SessionStatusChip status={assessment.status} />
      <RunStatusChip status={assessment.status === "submitted" ? run?.status ?? null : null} />
      <Link className="btn btn-ghost btn-sm" href="/admin/checkup">← Semua checkup</Link>
    </PageHead>

    <nav className="adm-anchors" aria-label="Bagian halaman">{ANCHORS.map(([anchor, label]) => <a key={anchor} href={`#${anchor}`}>{label}</a>)}</nav>

    {verification && <VerifyVerdict ok={verification.ok} total={verification.fields.length + 1} okCount={verification.fields.filter((f) => f.ok).length + (verification.hashMatch ? 1 : 0)} label={verification.ok ? "Hitung ulang hari ini cocok dengan hasil tersimpan ✔" : `Hitung ulang hari ini tidak cocok ✘ — ${[...(!verification.hashMatch ? ["sidik jari input"] : []), ...verification.fields.filter((f) => !f.ok).map((f) => f.label)].join(", ") || verification.error}`} />}

    <section className="adm-section" id="profil" aria-labelledby="judul-profil">
      <div className="adm-section-head"><div><h2 id="judul-profil">Profil usaha</h2><p>Diisi sendiri oleh UMKM saat memulai checkup.</p></div><span className="adm-muted adm-mono">{data.businessCode}</span></div>
      <dl className="adm-dl">
        <div><dt>Jenis usaha</dt><dd>{profile?.sector || "—"}</dd></div>
        <div><dt>Lokasi</dt><dd>{profile?.district || "—"}</dd></div>
        <div><dt>Usia usaha</dt><dd>{profile?.businessAgeMonths != null ? `${profile.businessAgeMonths} bulan` : "—"}</dd></div>
        <div><dt>Jumlah orang</dt><dd>{profile?.peopleCount ?? "—"}</dd></div>
        <div><dt>Yang mengisi</dt><dd>{profile?.respondentRole || "—"}</dd></div>
        <div><dt>Tempat berjualan</dt><dd>{profile?.salesChannels?.length ? profile.salesChannels.join(", ") : "—"}</dd></div>
        <div><dt>Tujuan</dt><dd>{profile?.goal || "—"}</dd></div>
        <div><dt>Catatan</dt><dd>{profile?.note || "—"}</dd></div>
        <div><dt>Mulai diisi</dt><dd>{fmtDate((assessment as unknown as { started_at?: string }).started_at)}</dd></div>
        <div><dt>Dikirim</dt><dd>{fmtDate(assessment.submitted_at)}</dd></div>
        <div><dt>Revisi</dt><dd>{assessment.revision_number}</dd></div>
      </dl>
      <h3 style={{ fontSize: 16, margin: "18px 0 8px" }}>Kontak</h3>
      <p className="adm-help" style={{ marginBottom: 10 }}>Hanya terlihat di ruang pengelola. Tidak pernah ikut dalam berkas ekspor.</p>
      <dl className="adm-dl">{contacts.map(([label, value]) => <div className="adm-contact" key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}</dl>
    </section>

    <section className="adm-section" id="jawaban" aria-labelledby="judul-jawaban">
      <div className="adm-section-head"><div><h2 id="judul-jawaban">32 jawaban</h2><p>Empat pertanyaan per bagian; skor 0–4 sesuai pilihan yang diambil UMKM.</p></div><Chip tone="primary">{data.answered} / 32 dijawab</Chip></div>
      <AnswersBySection answers={assessment.payload?.answers ?? {}} />
    </section>

    <section className="adm-section" id="nilai" aria-labelledby="judul-nilai">
      <div className="adm-section-head"><div><h2 id="judul-nilai">Nilai delapan bagian</h2><p>Jumlah skor empat jawaban dibagi 16, dikali 100.</p></div></div>
      {assessment.status !== "submitted" ? <Empty hint="Nilai dihitung setelah checkup dikirim final." /> : <ScoreBars scores={data.scores} />}
    </section>

    <section className="adm-section" id="bobot" aria-labelledby="judul-bobot">
      <div className="adm-section-head"><div><h2 id="judul-bobot">Bobot dari ahli</h2><p>Model yang dipakai untuk hasil ini beserta tiga ahli penyusunnya.</p></div>{data.modelInput && <Link className="btn btn-soft btn-sm" href={`/admin/ahli#model-${data.modelInput.id}`}>Lihat cara bobot dihitung</Link>}</div>
      {!run ? <Empty hint={data.modelReady ? "Hasil belum dihitung untuk checkup ini." : "Belum ada model yang dikunci. Kunci model di Panel ahli terlebih dahulu."} /> : <>
        <p className="adm-help" style={{ marginBottom: 12 }}>Versi model <strong>{data.modelVersionCode ?? run.canonical_input.modelVersion}</strong> · dihitung {fmtDate(run.created_at)} · build <span className="adm-mono">{run.build_id}</span></p>
        <div className="adm-experts">{data.experts.map((expert) => <article className="adm-expert" key={expert.id}><div className="adm-expert-head"><div><strong>{expert.name}</strong><small>{[expert.jobTitle, expert.institution].filter(Boolean).join(" · ") || expert.code}</small></div><ConsistencyChip consistent={expert.consistency?.consistent ?? null} /></div><ul><li><span>Rasio konsistensi (CR)</span><b>{expert.consistency ? fmt(expert.consistency.CR, 4) : "—"}</b></li></ul></article>)}</div>
        <div className="adm-score-list" style={{ marginTop: 16 }}>{instrument.dimensions.map((dimension, index) => <div className="adm-score-row" key={dimension.code}><span>{dimension.title}<small>{dimension.code}</small></span><Bar value={run.trace.w[index]} max={Math.max(...run.trace.w)} label={fmt(run.trace.w[index], 4)} /></div>)}</div>
        <p className="adm-help" style={{ marginTop: 10 }}>Delapan bobot berjumlah {fmt(run.trace.w.reduce((total, value) => total + value, 0), 6)}; bobot yang sama dipakai untuk semua usaha.</p>
      </>}
    </section>

    <section className="adm-section" id="hitung" aria-labelledby="judul-hitung">
      <div className="adm-section-head"><div><h2 id="judul-hitung">Cara hitung, langkah demi langkah</h2><p>Semua angka diambil dari jejak hasil yang tersimpan. Nyalakan “Lihat rumus” untuk melihat rumus tiap langkah.</p></div></div>
      {run ? <RunSteps trace={run.trace} answers={run.canonical_input.answers} modelHref={data.modelInput ? `/admin/ahli#model-${data.modelInput.id}` : undefined} /> : <Empty hint="Langkah hitung muncul setelah hasil tersedia." />}
      <div style={{ marginTop: 16 }}><CheckupActions assessmentId={assessment.id} canCompute={assessment.status === "submitted"} finalExpertIds={data.finalExpertIds} hasRun={Boolean(run)} /></div>
      {data.runs.length > 1 && <details className="adm-details"><summary>Riwayat {data.runs.length} hasil untuk checkup ini</summary><div><div className="adm-table-wrap" style={{ maxHeight: "none" }}><table className="adm-table"><thead><tr><th scope="col">Dihitung</th><th scope="col">Versi model</th><th scope="col">Status</th><th scope="col">Rekomendasi utama</th><th scope="col">Build</th></tr></thead><tbody>{data.runs.map((item) => <tr key={item.id}><td>{fmtDate(item.createdAt)}</td><td>{item.modelVersion}</td><td><RunStatusChip status={item.status} /></td><td>{item.topSet.map(moduleName).join(", ") || "—"}</td><td className="adm-mono">{item.buildId}</td></tr>)}</tbody></table></div></div></details>}
    </section>

    <section className="adm-section" id="sensitivitas" aria-labelledby="judul-sensitivitas">
      <div className="adm-section-head"><div><h2 id="judul-sensitivitas">Uji sensitivitas</h2><p>Bobot tiap bagian digeser ±10% dan ±20% (32 skenario) untuk melihat apakah rekomendasi utama berubah.</p></div>{sensitivity && <Chip tone={sensitivity.stableTopSet === sensitivity.ranked && sensitivity.ranked > 0 ? "mint" : "amber"}>{sensitivity.stableTopSet} / {sensitivity.scenarios.length} rekomendasi utama tetap</Chip>}</div>
      {sensitivity ? <SensitivityTable scenarios={sensitivity.scenarios} /> : <Empty hint="Uji sensitivitas tersimpan bersama hasil hitung." />}
    </section>

    <section className="adm-section" id="validasi" aria-labelledby="judul-validasi">
      <div className="adm-section-head"><div><h2 id="judul-validasi">Validasi ahli</h2><p>Ahli menilai kasus ini tanpa melihat nama usaha, lalu urutannya dibandingkan dengan urutan sistem.</p></div></div>
      {data.validations.length === 0 ? <Empty hint="Buka validasi ahli dari tombol di bagian Cara hitung." /> : <div className="adm-table-wrap" style={{ maxHeight: "none" }}>
        <table className="adm-table"><thead><tr><th scope="col">Ahli</th><th scope="col">Status</th><th scope="col">Keputusan</th><th scope="col">Pilihan pertama cocok?</th><th scope="col" className="adm-num">Sama di 3 teratas</th><th scope="col" className="adm-num">Kemiripan urutan</th><th scope="col">Alasan</th></tr></thead>
          <tbody>{data.validations.map((item) => <tr key={item.id}><td>{item.expertName}</td><td>{item.status === "submitted" ? <Chip tone="mint">Final</Chip> : <Chip tone="amber">Draf</Chip>}</td><td>{item.decision ?? "—"}</td><td>{item.metrics ? (item.metrics.firstInTopSet ? <span className="adm-mark-ok">Ya</span> : <span className="adm-mark-bad">Tidak</span>) : "—"}</td><td className="adm-num">{item.metrics ? `${item.metrics.overlapTop3} dari 3` : "—"}</td><td className="adm-num">{item.metrics?.spearman != null ? fmt(item.metrics.spearman, 4) : "—"}</td><td className="adm-wrap">{item.rationale || "—"}</td></tr>)}</tbody>
        </table>
      </div>}
      {data.usability.length > 0 && <details className="adm-details"><summary>{data.usability.length} observasi uji pakai</summary><div>{data.usability.map((item) => <p key={item.id} className="adm-help" style={{ marginBottom: 8 }}><strong>{fmtDate(item.date, false)}</strong> · {item.minutes} menit · kemudahan {item.ease}/5 · {Object.entries(item.tasks).map(([task, status]) => `${TASK_LABEL[task] ?? task}: ${TASK_STATUS_LABEL[status] ?? status}`).join("; ")}{item.note ? ` · ${item.note}` : ""}</p>)}</div></details>}
    </section>

    <section className="adm-section" id="ekspor" aria-labelledby="judul-ekspor">
      <div className="adm-section-head"><div><h2 id="judul-ekspor">Ekspor checkup ini</h2><p>Berkas tanpa nama usaha dan kontak; cocok untuk dicek ulang di Google Colab.</p></div></div>
      {run ? <div className="adm-actions"><a className="btn btn-primary btn-sm" href={`/api/digital-checkup/research?run=${run.id}&format=colab`} download>JSON siap Colab ({data.label})</a><a className="btn btn-secondary btn-sm" href={`/api/digital-checkup/research?run=${run.id}&format=canonical`} download>Input mentah (canonical)</a><Link className="btn btn-ghost btn-sm" href="/admin/ekspor">Ekspor lainnya</Link></div> : <Empty hint="Ekspor tersedia setelah hasil dihitung." />}
    </section>
  </>;
}
