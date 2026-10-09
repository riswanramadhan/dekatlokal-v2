import { instrument } from "@/lib/decision-engine";
import { fmt } from "@/lib/digital-checkup/format";
import type { SensitivityRow } from "@/lib/digital-checkup/admin-data";

const dimensionTitle = (code: string) => instrument.dimensions.find((item) => item.code === code)?.title ?? code;
const moduleName = (code: string) => instrument.modules.find((item) => item.code === code)?.name ?? code;

// 32 skenario: tiap bobot bagian digeser ±10% dan ±20%, lalu urutan dihitung ulang.
export function SensitivityTable({ scenarios, caption }: { scenarios: SensitivityRow[]; caption?: string }) {
  if (!scenarios.length) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Uji sensitivitas tersimpan bersama hasil hitung.</span></div>;
  return <div className="adm-table-wrap">
    <table className="adm-table">
      <thead><tr><th scope="col">Bagian yang digeser</th><th scope="col" className="adm-num">Perubahan bobot</th><th scope="col">Rekomendasi utama tetap?</th><th scope="col">Rekomendasi utama</th><th scope="col" className="adm-num">Sama di 3 teratas</th><th scope="col" className="adm-num">Kemiripan urutan</th></tr></thead>
      <tbody>{scenarios.map((scenario) => <tr key={`${scenario.dimension}${scenario.change}`}>
        <td>{dimensionTitle(scenario.dimension)}<span className="adm-sub">{scenario.dimension}</span></td>
        <td className="adm-num">{scenario.change > 0 ? "+" : ""}{Math.round(scenario.change * 100)}%</td>
        <td>{scenario.sameTopSet === null ? <span className="adm-muted">Tidak diurutkan</span> : scenario.sameTopSet ? <span className="adm-mark-ok">Ya</span> : <span className="adm-mark-bad">Berubah</span>}</td>
        <td>{scenario.topSet.length ? scenario.topSet.map(moduleName).join(", ") : "—"}</td>
        <td className="adm-num">{scenario.overlapTop3 == null ? "—" : `${scenario.overlapTop3} dari 3`}</td>
        <td className="adm-num">{scenario.spearman == null ? "—" : fmt(scenario.spearman, 4)}</td>
      </tr>)}</tbody>
    </table>
    <div className="adm-table-caption">{caption ?? "Kemiripan urutan memakai korelasi Spearman: 1 berarti urutan persis sama, 0 berarti tidak berhubungan."}</div>
  </div>;
}
