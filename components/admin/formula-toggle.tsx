"use client";

// Dua sakelar: tampilkan rumus di tiap langkah, dan tampilkan angka dengan 10 desimal
// untuk dicocokkan dengan berkas ekspor atau notebook.
export function FormulaToggle({ formula, precise, onFormula, onPrecise }: { formula: boolean; precise: boolean; onFormula: (value: boolean) => void; onPrecise: (value: boolean) => void }) {
  return <div className="adm-toggles" role="group" aria-label="Tampilan tabel">
    <label className="adm-switch"><input type="checkbox" role="switch" checked={formula} onChange={(event) => onFormula(event.target.checked)} aria-checked={formula} />Lihat rumus</label>
    <label className="adm-switch"><input type="checkbox" role="switch" checked={precise} onChange={(event) => onPrecise(event.target.checked)} aria-checked={precise} />10 desimal</label>
  </div>;
}
