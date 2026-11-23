import type { Metadata } from "next";
import { loadExpertPanel } from "@/lib/digital-checkup/admin-data";
import { processExpertPanel } from "@/lib/digital-checkup/auto-panel";
import { fmtDate } from "@/lib/digital-checkup/format";
import { ExpertPanel } from "@/components/admin/expert-panel";
import { ModelSteps } from "@/components/admin/model-steps";
import { Chip } from "@/components/admin/status-chip";
import { attempt, Empty, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Panel ahli" };
export const dynamic = "force-dynamic";

export default async function ExpertPage() {
  // Freezes the model automatically once the configured three experts are final; failures never block the page.
  try { await processExpertPanel(); } catch { /* Model activation is retried on the next visit. */ }
  const { data, error } = await attempt(loadExpertPanel);
  if (!data) return <LoadError message={error ?? ""} />;
  return <>
    <PageHead eyebrow="Panel ahli" title="Tiga ahli dan bobot model" lead="Penilaian tiga ahli digabung menjadi delapan bobot bagian usaha dan satu tabel kecocokan modul. Setelah dikunci, model tidak berubah." />
    <section className="adm-section" aria-labelledby="judul-panel">
      <div className="adm-section-head"><div><h2 id="judul-panel">Penilaian ahli</h2><p>Kelengkapan isian, konsistensi jawaban, dan status pemakaian di model.</p></div></div>
      <ExpertPanel data={data} />
    </section>

    {data.reviewIssues.length > 0 && <section className="adm-section" aria-labelledby="judul-usulan">
      <div className="adm-section-head"><div><h2 id="judul-usulan">Usulan perbaikan dari ahli</h2><p>Pertanyaan yang dinilai kurang relevan atau kurang jelas, beserta saran ahli.</p></div></div>
      <div className="adm-table-wrap" style={{ maxHeight: "none" }}><table className="adm-table"><thead><tr><th scope="col">Ahli</th><th scope="col">Pertanyaan</th><th scope="col">Usulan</th><th scope="col">Catatan umum</th></tr></thead><tbody>{data.reviewIssues.map((item) => <tr key={item.expertCode + item.question}><td>{item.expertName}</td><td>{item.question}</td><td className="adm-wrap">{item.suggestion || "Belum ada usulan tertulis."}</td><td className="adm-wrap">{item.generalNote || "—"}</td></tr>)}</tbody></table></div>
    </section>}

    <section className="adm-section" aria-labelledby="judul-model">
      <div className="adm-section-head"><div><h2 id="judul-model">Cara bobot dihitung (Fuzzy AHP)</h2><p>Delapan langkah untuk tiap model yang pernah dikunci. Semua angka diambil dari jejak model yang tersimpan.</p></div></div>
      {data.models.length === 0 ? <Empty hint="Langkah hitung muncul setelah model dikunci dengan tiga ahli final." /> : <div className="adm-stack">
        {data.models.map((model) => <article key={model.id} id={`model-${model.id}`} className="adm-section" style={{ marginBottom: 0 }}>
          <div className="adm-section-head"><div><h2 style={{ fontSize: 18 }}>Model {model.versionCode || model.id.slice(0, 8)}</h2><p>Dikunci {fmtDate(model.createdAt)} · ahli: {model.expertNames.join(", ")}</p></div><Chip tone="mint" dot>terkunci</Chip></div>
          <p className="adm-hash" style={{ marginBottom: 12 }}>sidik jari input: {model.inputHash}</p>
          <ModelSteps model={model.trace} expertNames={model.expertNames} id={`model-${model.id}`} />
        </article>)}
      </div>}
    </section>
  </>;
}
