import type { Metadata } from "next";
import Link from "next/link";
import { loadSummary } from "@/lib/digital-checkup/admin-data";
import { fmtDate } from "@/lib/digital-checkup/format";
import { instrument } from "@/lib/decision-engine";
import { StatTile } from "@/components/admin/stat-tile";
import { Chip, RunStatusChip } from "@/components/admin/status-chip";
import { attempt, Empty, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Ringkasan" };
export const dynamic = "force-dynamic";
const moduleName = (code: string) => instrument.modules.find((m) => m.code === code)?.name ?? code;

export default async function AdminHomePage() {
  const { data, error } = await attempt(loadSummary);
  if (!data) return <LoadError message={error ?? ""} />;
  const verified = data.verification.total > 0 && data.verification.ok === data.verification.total;
  return <>
    <PageHead eyebrow="Ringkasan" title="Apa yang sudah masuk" lead="Angka di bawah hanya dari data nyata yang tersimpan. Belum ada data berarti memang belum ada yang masuk." />
    <div className="adm-tiles">
      <StatTile label="UMKM bernomor" value={data.codedBusinesses} note="Usaha dengan minimal satu checkup final" href="/admin/checkup" />
      <StatTile label="Checkup final" value={data.finalCheckups} note={`${data.draftCheckups} draf masih diisi`} href="/admin/checkup" />
      <StatTile label="Hasil siap" value={data.readyResults} note={data.waitingModel ? `${data.waitingModel} menunggu model` : "Semua checkup final sudah dihitung"} href="/admin/checkup" />
      <StatTile label="Ahli final" value={`${data.finalExperts} / 3`} note="Penilaian ahli yang sudah dikirim" href="/admin/ahli" />
      <StatTile label="Model aktif" value={data.activeModel ? data.activeModel.code : "—"} note={data.activeModel ? `Dikunci ${fmtDate(data.activeModel.frozenAt, false)}` : "Belum ada model yang dikunci"} href="/admin/ahli" chip={data.activeModel ? <Chip tone="mint" dot>terkunci</Chip> : undefined} />
      <StatTile label="Run tersimpan" value={data.runs} note="Hasil hitung yang disimpan permanen" href="/admin/metode" />
      <StatTile label="Verifikasi metode" value={data.verification.total ? `${data.verification.ok} / ${data.verification.total}` : "—"} note={data.verification.total ? (verified ? "Semua hitung ulang cocok" : "Ada yang tidak cocok, periksa") : "Menunggu model dan hasil"} href="/admin/metode" tone={data.verification.total ? (verified ? "ok" : "bad") : undefined} />
    </div>

    <section className="adm-section" aria-labelledby="terbaru">
      <div className="adm-section-head"><div><h2 id="terbaru">Checkup final terbaru</h2><p>Lima kiriman terakhir. Buka untuk melihat jawaban, nilai, dan cara hitungnya.</p></div><Link className="btn btn-soft btn-sm" href="/admin/checkup">Lihat semua</Link></div>
      {data.latest.length === 0 ? <Empty hint="Kiriman muncul di sini begitu UMKM mengirim checkup final." /> : <div className="adm-table-wrap" style={{ maxHeight: "none" }}>
        <table className="adm-table">
          <thead><tr><th scope="col">Nomor</th><th scope="col">Nama usaha</th><th scope="col">Jenis usaha</th><th scope="col">Dikirim</th><th scope="col">Hasil</th><th scope="col">Rekomendasi utama</th></tr></thead>
          <tbody>{data.latest.map((item) => <tr key={item.id}>
            <td><Link className="adm-rowlink" href={`/admin/checkup/${item.id}`}>{item.label}</Link></td>
            <td className="adm-wrap">{item.businessName}</td>
            <td>{item.sector || "—"}</td>
            <td>{fmtDate(item.submittedAt)}</td>
            <td><RunStatusChip status={item.runStatus} /></td>
            <td>{item.topSet.length ? item.topSet.map(moduleName).join(", ") : "—"}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>

    <section className="adm-section" aria-labelledby="cara-kerja">
      <div className="adm-section-head"><div><h2 id="cara-kerja">Cara kerjanya, singkatnya</h2><p>Empat tahap dari jawaban UMKM sampai urutan modul belajar.</p></div><Link className="btn btn-ghost btn-sm" href="/admin/metode">Penjelasan lengkap →</Link></div>
      <div className="adm-flow">
        <article><span>1</span><h3>Jawaban</h3><p>UMKM menjawab 32 pertanyaan, empat untuk tiap dari delapan bagian usaha.</p></article>
        <article><span>2</span><h3>Nilai bagian</h3><p>Tiap bagian dinilai 0–100. Dari sini terlihat apa yang masih kurang.</p></article>
        <article><span>3</span><h3>Bobot ahli</h3><p>Tiga ahli menimbang bagian mana yang paling penting (Fuzzy AHP). Bobot ini sama untuk semua usaha.</p></article>
        <article><span>4</span><h3>Urutan modul</h3><p>Kekurangan usaha dikali bobot ahli, lalu tujuh modul diurutkan dari yang paling cocok (TOPSIS).</p></article>
      </div>
    </section>
  </>;
}
