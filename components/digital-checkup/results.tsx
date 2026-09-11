import { instrument } from "@/lib/decision-engine";
import type { PublicAssessment } from "@/lib/digital-checkup/service";
const messages = {
  NO_IDENTIFIED_GAP: "Dari jawaban saat ini, belum ada gap yang teridentifikasi. Cek kembali jawaban bersama pendamping bila diperlukan.",
  UNCOVERED_DIMENSION: "Ada kebutuhan yang belum tercakup oleh daftar modul. Pendamping perlu meninjaunya.",
  ALTERNATIVES_NOT_DISTINGUISHABLE: "Data saat ini belum cukup untuk membedakan prioritas modul.",
};
export function Results({ assessment }: { assessment: PublicAssessment }) {
  const trace = assessment.run?.trace, top = trace?.ranking.filter((r) => r.rank <= 3) ?? [];
  return <><p className="dc-eyebrow">{assessment.code} · Revisi {assessment.revisionNumber}</p><h1>Ini gambaran usahamu hari ini.</h1><p>Ini gambaran kondisi usahamu dari jawaban yang kamu isi.</p><div className="dc-score-list">{instrument.dimensions.map((d, i) => <div key={d.code}><div><span>{d.title}</span><strong>{assessment.scores?.[i]} / 100</strong></div><meter min={0} max={100} value={assessment.scores?.[i] ?? 0} aria-label={d.title} /><small>{d.definition}</small></div>)}</div>
    {!trace ? <p className="dc-note" role="status">Jawabanmu sudah tersimpan. Rekomendasi sedang disiapkan.</p> : trace.status !== "RANKED" ? <p className="dc-note" role="status">{messages[trace.status]}</p> : <><h2>Mulai dari pendampingan ini</h2>{trace.topSet.length > 1 && <p className="dc-note">Ada {trace.topSet.length} modul dengan prioritas teratas yang sama. Diskusikan pilihan awal dengan pendamping.</p>}<div className="dc-recommendations">{top.map((r) => {
      const index = instrument.modules.findIndex((m) => m.code === r.code), intervention = instrument.modules[index];
      const reasons = assessment.run?.reasons[r.code] ?? [];
      return <article key={r.code}><span className="dc-badge">Prioritas {r.rank}</span><h3>{intervention.name}</h3><p>{intervention.scope}</p><p>{reasons.length ? `Panel ahli menilai modul ini kuat membantu ${reasons.map((x) => x.toLowerCase()).join(" dan ")}, bagian yang masih kamu butuhkan.` : "Urutan ini mempertimbangkan seluruh kebutuhanmu dan penilaian ahli. Belum ada hubungan kuat pada satu bagian tertentu; diskusikan kecocokannya dengan pendamping."}</p><strong>Langkah awal</strong><p>{intervention.initialAction}</p><strong>Tujuan 30 hari</strong><p>{intervention.output}</p><small>Pelaksanaannya perlu disepakati bersama pendamping.</small></article>;
    })}</div><details className="dc-review"><summary>Lihat urutan lengkap</summary><ol>{trace.ranking.map((r) => <li key={r.code}>Prioritas {r.rank} · {instrument.modules.find((m) => m.code === r.code)?.name}</li>)}</ol></details></>}
    {trace && <details className="dc-review"><summary>Lihat cara hitung</summary><p>Empat jawaban di setiap bagian dijumlahkan, lalu dibagi 16 dan dikalikan 100. Prioritas pendampingan mempertimbangkan bagian yang masih kamu butuhkan dan penilaian tiga ahli. Prioritas bukan persentase keberhasilan.</p><p>{assessment.run?.instrumentVersion} · {assessment.run?.modelVersion} · {assessment.run?.createdAt}</p><p>Rincian matriks dan bobot hanya tersedia bagi peneliti agar penilaian kasus oleh ahli tetap mandiri.</p></details>}
  </>;
}
