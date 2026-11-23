import type { Metadata } from "next";
import Link from "next/link";
import { loadValidation } from "@/lib/digital-checkup/admin-data";
import { fmt, fmtDate } from "@/lib/digital-checkup/format";
import { SensitivityTable } from "@/components/admin/sensitivity-table";
import { StatTile } from "@/components/admin/stat-tile";
import { Chip } from "@/components/admin/status-chip";
import { TASK_LABEL, TASK_STATUS_LABEL, UsabilityForm } from "@/components/admin/usability-form";
import { attempt, Empty, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Validasi & uji" };
export const dynamic = "force-dynamic";

export default async function ValidationPage() {
  const { data, error } = await attempt(loadValidation);
  if (!data) return <LoadError message={error ?? ""} />;
  const withMetrics = data.validations.filter((item) => item.metrics);
  const spearmans = withMetrics.map((item) => item.metrics?.spearman).filter((value): value is number => typeof value === "number");
  const average = spearmans.length ? spearmans.reduce((total, value) => total + value, 0) / spearmans.length : null;
  return <>
    <PageHead eyebrow="Validasi & uji" title="Apakah hasilnya masuk akal?" lead="Tiga cara mengecek: ahli menilai kasus tanpa nama, bobot digeser untuk melihat kestabilan, dan pengguna nyata diamati saat memakai aplikasi." />

    <div className="adm-tiles">
      <StatTile label="Pasangan penilaian sah" value={data.summary.validPairs} note="Ahli menilai kasus dan sistem punya urutan" />
      <StatTile label="UMKM dinilai ahli" value={data.summary.uniqueBusinesses} note="Dihitung per usaha" />
      <StatTile label="Ahli yang menilai" value={data.summary.uniqueExperts} note={`${data.summary.abstentions} abstain`} />
      <StatTile label="Pilihan pertama cocok" value={withMetrics.length ? `${withMetrics.filter((item) => item.metrics?.firstInTopSet).length} / ${withMetrics.length}` : "—"} note={average != null ? `Rata-rata kemiripan urutan ${fmt(average, 3)}` : "Menunggu penilaian ahli"} />
    </div>

    <section className="adm-section" aria-labelledby="judul-validasi">
      <div className="adm-section-head"><div><h2 id="judul-validasi">Penilaian ahli per kasus</h2><p>Ahli melihat jawaban dan nilai bagian tanpa nama usaha, lalu mengurutkan tujuh modul sendiri. Urutan itu dibandingkan dengan urutan sistem.</p></div></div>
      {data.validations.length === 0 ? <Empty hint="Buka validasi dari halaman detail checkup agar ahli bisa menilai." /> : <div className="adm-table-wrap">
        <table className="adm-table"><thead><tr><th scope="col">UMKM</th><th scope="col">Ahli</th><th scope="col">Status</th><th scope="col">Keputusan</th><th scope="col">Pilihan pertama cocok?</th><th scope="col" className="adm-num">Sama di 3 teratas</th><th scope="col" className="adm-num">Kemiripan urutan</th><th scope="col">Alasan ahli</th></tr></thead>
          <tbody>{data.validations.map((item) => <tr key={item.id}>
            <td><Link className="adm-rowlink" href={`/admin/checkup/${item.assessmentId}#validasi`}>{item.umkmDemoCode ?? "Draf"}</Link></td>
            <td>{item.expertName}</td>
            <td>{item.status === "submitted" ? <Chip tone="mint">Final</Chip> : <Chip tone="amber">Draf</Chip>}</td>
            <td>{item.decision ?? "—"}</td>
            <td>{item.metrics ? (item.metrics.firstInTopSet ? <span className="adm-mark-ok">Ya</span> : <span className="adm-mark-bad">Tidak</span>) : "—"}</td>
            <td className="adm-num">{item.metrics ? `${item.metrics.overlapTop3} dari 3` : "—"}</td>
            <td className="adm-num">{item.metrics?.spearman != null ? fmt(item.metrics.spearman, 4) : "—"}</td>
            <td className="adm-wrap">{item.rationale || "—"}</td>
          </tr>)}</tbody>
        </table>
        <div className="adm-table-caption">Kemiripan urutan memakai korelasi Spearman (1 = persis sama). Alasan ahli hanya tampil di sini, tidak ikut diekspor.</div>
      </div>}
    </section>

    <section className="adm-section" aria-labelledby="judul-sensitivitas">
      <div className="adm-section-head"><div><h2 id="judul-sensitivitas">Kestabilan hasil (sensitivitas)</h2><p>{data.summary.sensitivityScenarios} skenario tersimpan: tiap hasil diuji dengan 32 pergeseran bobot (±10% dan ±20% per bagian).</p></div></div>
      {data.sensitivity.length === 0 ? <Empty hint="Skenario tersimpan otomatis bersama tiap hasil hitung." /> : <>
        <div className="adm-table-wrap" style={{ maxHeight: "none" }}>
          <table className="adm-table"><thead><tr><th scope="col">UMKM</th><th scope="col">Nama usaha</th><th scope="col" className="adm-num">Rekomendasi utama tetap</th><th scope="col" className="adm-num">Skenario terurut</th><th scope="col" className="adm-num">Kemiripan terendah</th></tr></thead>
            <tbody>{data.sensitivity.map((item) => <tr key={item.runId}><td><Link className="adm-rowlink" href={`/admin/checkup/${item.assessmentId}#sensitivitas`}>{item.label}</Link></td><td className="adm-wrap">{item.businessName}</td><td className="adm-num">{item.stableTopSet} / {item.scenarios.length}</td><td className="adm-num">{item.ranked} / {item.scenarios.length}</td><td className="adm-num">{item.minSpearman == null ? "—" : fmt(item.minSpearman, 4)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="adm-stack" style={{ marginTop: 12 }}>{data.sensitivity.map((item) => <details className="adm-details" key={item.runId}><summary>{item.label} · {item.businessName} · 32 skenario</summary><div><SensitivityTable scenarios={item.scenarios} /></div></details>)}</div>
      </>}
    </section>

    <section className="adm-section" aria-labelledby="judul-uji">
      <div className="adm-section-head"><div><h2 id="judul-uji">Uji pakai dengan pengguna nyata</h2><p>Catatan observasi saat UMKM memakai aplikasi. Hanya pengujian yang benar-benar dilakukan.</p></div></div>
      <div className="adm-grid-2">
        <div><UsabilityForm assessments={data.assessments} /></div>
        <div>
          <h3 style={{ fontSize: 16, margin: "0 0 10px" }}>{data.usability.length} observasi tersimpan</h3>
          {data.usability.length === 0 ? <Empty hint="Observasi yang disimpan akan tampil di sini." /> : <div className="adm-stack">{data.usability.map((item) => <article className="adm-expert" key={item.id}>
            <div className="adm-expert-head"><div><strong>{item.umkmCode ?? "Draf"}</strong><small>{fmtDate(item.date, false)} · dicatat {fmtDate(item.createdAt)}</small></div><Chip tone={item.ease >= 4 ? "mint" : item.ease >= 3 ? "amber" : "coral"}>Kemudahan {item.ease}/5</Chip></div>
            <ul>{Object.entries(item.tasks).map(([task, status]) => <li key={task}><span>{TASK_LABEL[task] ?? task}</span><b>{TASK_STATUS_LABEL[status] ?? status}</b></li>)}<li><span>Waktu total</span><b>{item.minutes} menit</b></li></ul>
            {item.note && <p className="adm-help">{item.note}</p>}
          </article>)}</div>}
        </div>
      </div>
    </section>
  </>;
}
