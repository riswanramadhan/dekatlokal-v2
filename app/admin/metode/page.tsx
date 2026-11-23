import type { Metadata } from "next";
import Link from "next/link";
import { loadMethod } from "@/lib/digital-checkup/admin-data";
import { QUANTITY } from "@/lib/digital-checkup/labels";
import { VerifyTable, VerifyVerdict } from "@/components/admin/verify-table";
import { attempt, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Cara hitung & verifikasi" };
export const dynamic = "force-dynamic";

export default async function MethodPage() {
  const { data, error } = await attempt(loadMethod);
  if (!data) return <LoadError message={error ?? ""} />;
  const { verification } = data;
  return <>
    <PageHead eyebrow="Cara hitung & verifikasi" title="Dari jawaban sampai urutan modul" lead="Penjelasan alurnya dengan bahasa sehari-hari, lalu bukti bahwa hasil yang tersimpan sama dengan hitung ulang hari ini." />

    <section className="adm-section" aria-labelledby="judul-alur">
      <div className="adm-section-head"><div><h2 id="judul-alur">Alurnya</h2><p>Dua bahan masuk: jawaban UMKM dan penilaian tiga ahli. Keduanya diolah terpisah, lalu digabung.</p></div></div>
      <div className="adm-flow">
        <article><span>1</span><h3>Jawaban UMKM</h3><p>32 pertanyaan, empat per bagian usaha, masing-masing dijawab dengan pilihan berskor 0–4.</p></article>
        <article><span>2</span><h3>Nilai bagian</h3><p>Skor empat jawaban dijumlah, dibagi 16, dikali 100. Dari nilai ini dihitung “yang masih kurang” (1 − nilai ÷ 100).</p></article>
        <article><span>3</span><h3>Bobot ahli (Fuzzy AHP)</h3><p>Tiga ahli membandingkan pentingnya tiap bagian. Angka 1–9 diubah ke angka kabur, digabung dengan rata-rata geometrik, lalu dinormalkan menjadi delapan bobot berjumlah 1.</p></article>
        <article><span>4</span><h3>Urutan modul (TOPSIS)</h3><p>Bobot ahli × yang masih kurang menjadi bobot kebutuhan usaha ini. Tabel kecocokan modul dibuat sebanding, dikali bobot kebutuhan, lalu tiap modul diukur jaraknya ke titik terbaik dan terburuk.</p></article>
      </div>
      <div className="adm-table-wrap" style={{ maxHeight: "none", marginTop: 16 }}>
        <table className="adm-table"><thead><tr><th scope="col">Lambang</th><th scope="col">Arti</th><th scope="col">Cara menghitung</th></tr></thead>
          <tbody>{(Object.keys(QUANTITY) as (keyof typeof QUANTITY)[]).map((key) => <tr key={key}><td><strong>{QUANTITY[key].symbol}</strong> <span className="adm-sub">{QUANTITY[key].label}</span></td><td className="adm-wrap">{QUANTITY[key].hint}</td><td className="adm-wrap adm-mono">{QUANTITY[key].formula}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="adm-help" style={{ marginTop: 12 }}>Langkah lengkap dengan angka nyata ada di tiap halaman checkup (<Link className="link" href="/admin/checkup">Data checkup</Link>) dan di <Link className="link" href="/admin/ahli">Panel ahli</Link>.</p>
    </section>

    <section className="adm-section" aria-labelledby="judul-verifikasi">
      <div className="adm-section-head"><div><h2 id="judul-verifikasi">Verifikasi hari ini</h2><p>Setiap model dan setiap hasil dihitung ulang dari input mentah yang tersimpan, lalu dibandingkan angka per angka dengan toleransi 0,0000000001. Sidik jari input (hash) juga dicek supaya input tidak berubah.</p></div></div>
      <VerifyVerdict ok={verification.summary.allOk} total={verification.summary.total} okCount={verification.summary.ok} label={verification.summary.allOk ? "Semua hitung ulang cocok dengan yang tersimpan ✔" : "Ada hitung ulang yang tidak cocok ✘ — periksa rincian di bawah"} />
      <div className="adm-grid-2">
        <div><h3 style={{ fontSize: 16, margin: "0 0 10px" }}>Model ({verification.models.length})</h3><VerifyTable rows={verification.models} kind="model" /></div>
        <div><h3 style={{ fontSize: 16, margin: "0 0 10px" }}>Hasil checkup ({verification.runs.length})</h3><VerifyTable rows={verification.runs} kind="run" /></div>
      </div>
    </section>
  </>;
}
