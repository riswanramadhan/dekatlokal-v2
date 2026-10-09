import type { Metadata } from "next";
import { Download } from "lucide-react";
import { loadExports } from "@/lib/digital-checkup/admin-data";
import { ExportPicker } from "@/components/admin/export-picker";
import { attempt, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Ekspor" };
export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const { data, error } = await attempt(loadExports);
  if (!data) return <LoadError message={error ?? ""} />;
  return <>
    <PageHead eyebrow="Ekspor" title="Unduh data yang sudah diisi" lead="Dua berkas pertama mudah dibaca. Berkas teknis dipakai untuk mencocokkan hasil di Google Colab. Email, WhatsApp, token sesi, dan alasan ahli tidak pernah ikut." />
    <section className="adm-section" aria-labelledby="judul-baca">
      <div className="adm-section-head"><div><h2 id="judul-baca">Berkas yang mudah dibaca</h2><p>Struktur rapi dengan nama kolom dalam bahasa sehari-hari.</p></div></div>
      <div className="adm-export-cards">
        <article className="adm-export-card"><p className="eyebrow">Panel ahli</p><h3>Hasil penilaian ahli</h3><p>Identitas tiga ahli, status pemakaian di model, rasio konsistensi, 32 telaah pertanyaan, 28 perbandingan berpasangan, dan 56 nilai kecocokan modul.</p><a className="btn btn-primary btn-sm" href="/api/digital-checkup/research?format=expert-assessments" download><Download size={16} aria-hidden="true" />Unduh penilaian ahli</a></article>
        <article className="adm-export-card"><p className="eyebrow">Data UMKM</p><h3>Jawaban Digital Checkup</h3><p>Nomor UMKM, nama usaha, profil tanpa kontak langsung, 32 jawaban beserta label pilihan, dan nilai delapan bagian.</p><a className="btn btn-primary btn-sm" href="/api/digital-checkup/research?format=umkm-answers" download><Download size={16} aria-hidden="true" />Unduh jawaban UMKM</a></article>
      </div>
    </section>
    <section className="adm-section" aria-labelledby="judul-teknis">
      <div className="adm-section-head"><div><h2 id="judul-teknis">Berkas teknis untuk cek ulang metode</h2><p>Berisi input mentah dan jejak hitung (bobot, kecocokan, nilai bagian, kekurangan, bobot kebutuhan, nilai kedekatan, dan urutan).</p></div></div>
      <ExportPicker data={data} />
    </section>
  </>;
}
