import { CircleCheck, CircleX } from "lucide-react";
import { fmtDate } from "@/lib/digital-checkup/format";
import type { VerifyRow } from "@/lib/digital-checkup/verify-method";

function Mark({ ok }: { ok: boolean }) {
  return ok ? <span className="adm-mark-ok" aria-label="cocok">✔ cocok</span> : <span className="adm-mark-bad" aria-label="beda">✘ beda</span>;
}

export function VerifyVerdict({ ok, total, okCount, label }: { ok: boolean; total: number; okCount: number; label?: string }) {
  if (!total) return <div className="adm-verdict" style={{ background: "var(--color-surface-2)", color: "var(--color-ink-2)" }}>Belum ada data masuk<span>Verifikasi berjalan otomatis setelah ada model dan hasil tersimpan.</span></div>;
  return <div className={`adm-verdict ${ok ? "adm-verdict-ok" : "adm-verdict-bad"}`} role="status">
    {ok ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
    {label ?? (ok ? "Hitung ulang hari ini cocok dengan hasil tersimpan ✔" : "Ada bagian yang tidak cocok dengan hasil tersimpan ✘")}
    <span>{okCount} dari {total} cocok</span>
  </div>;
}

// Satu tabel per model/hasil: setiap angka dihitung ulang dan dibandingkan (toleransi 1e-10).
export function VerifyTable({ rows, kind }: { rows: VerifyRow[]; kind: "model" | "run" }) {
  if (!rows.length) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>{kind === "model" ? "Model muncul setelah tiga ahli final dikunci." : "Hasil muncul setelah checkup final dihitung."}</span></div>;
  return <div className="adm-stack">
    {rows.map((row) => <details className="adm-details" key={row.id} open={!row.ok}>
      <summary><span>{row.label} <span className="adm-sub">{fmtDate(row.createdAt)}</span></span><span>{row.ok ? <span className="adm-mark-ok">✔ semua cocok</span> : <span className="adm-mark-bad">✘ ada yang beda</span>}</span></summary>
      <div>
        {row.error && <p className="note note-danger">{row.error}</p>}
        <div className="adm-table-wrap" style={{ maxHeight: "none" }}>
          <table className="adm-table">
            <thead><tr><th scope="col">Yang dibandingkan</th><th scope="col">Hasil</th><th scope="col" className="adm-num">Selisih terbesar</th></tr></thead>
            <tbody>
              <tr><td>Sidik jari input (hash)</td><td><Mark ok={row.hashMatch} /></td><td className="adm-num">—</td></tr>
              {row.fields.map((field) => <tr key={field.key}><td>{field.label} <span className="adm-sub">{field.key}</span></td><td><Mark ok={field.ok} /></td><td className="adm-num">{Number.isFinite(field.maxDiff) ? field.maxDiff.toExponential(2) : "tidak sebanding"}</td></tr>)}
            </tbody>
          </table>
          <div className="adm-table-caption adm-hash">hash: {row.hash}</div>
        </div>
      </div>
    </details>)}
  </div>;
}
