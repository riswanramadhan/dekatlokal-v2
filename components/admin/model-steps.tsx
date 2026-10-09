"use client";

import { useState, type ReactNode } from "react";
import { instrument, toTFN, type Model } from "@/lib/decision-engine";
import { fmt, pretty10, ratio, tfn } from "@/lib/digital-checkup/format";
import { MODEL_STEPS } from "@/lib/digital-checkup/labels";
import { FormulaToggle } from "./formula-toggle";
import { MatrixTable, type MatrixColumn } from "./matrix-table";
import { Bar } from "./score-bars";
import { ConsistencyChip } from "./status-chip";

const dims = instrument.dimensions, mods = instrument.modules;
const dimColumns: MatrixColumn[] = dims.map((d) => ({ key: d.code, label: d.code, title: d.title }));
const dimLabel = (code: string) => <>{dims.find((d) => d.code === code)?.title ?? code}<span className="adm-sub">{code}</span></>;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

function Step({ index, id, title, explanation, formula, showFormula, children }: { index: number; id: string; title: string; explanation: string; formula?: string; showFormula: boolean; children?: ReactNode }) {
  return <section className="adm-step adm-step-done" id={`${id}-langkah-${index}`} aria-labelledby={`${id}-langkah-${index}-judul`}>
    <div className="adm-step-head"><span className="adm-step-num" aria-hidden="true">{index}</span><div><h3 id={`${id}-langkah-${index}-judul`}>{title}</h3><p>{explanation}</p></div></div>
    {showFormula && formula && <code className="adm-formula">{formula}</code>}
    {children}
  </section>;
}

function ExpertTabs({ names, active, onChange, label }: { names: string[]; active: number; onChange: (index: number) => void; label: string }) {
  return <div className="adm-seg" role="group" aria-label={label}>{names.map((name, index) => <button key={index} type="button" aria-pressed={active === index} onClick={() => onChange(index)}>{name}</button>)}</div>;
}

// Delapan langkah Fuzzy AHP dari 28 perbandingan tiap ahli sampai bobot akhir dan tabel kecocokan modul.
export function ModelSteps({ model, expertNames, id = "model" }: { model: Model; expertNames?: string[]; id?: string }) {
  const [showFormula, setShowFormula] = useState(false);
  const [precise, setPrecise] = useState(false);
  const [expert, setExpert] = useState(0);
  const names = model.crisp.map((_, index) => expertNames?.[index] || `Ahli ${index + 1}`);
  const n = (value: number) => (precise ? pretty10(value) : fmt(value));
  const tfnDigits = precise ? 10 : 4;
  const current = Math.min(expert, model.crisp.length - 1);

  return <div>
    <FormulaToggle formula={showFormula} precise={precise} onFormula={setShowFormula} onPrecise={setPrecise} />
    <div className="adm-steps">
      <Step index={1} id={id} title={MODEL_STEPS[0].title} explanation={MODEL_STEPS[0].explanation} formula="a[i][j] = seberapa penting bagian i dibanding bagian j (1–9); a[j][i] = 1 ÷ a[i][j]" showFormula={showFormula}>
        <ExpertTabs names={names} active={current} onChange={setExpert} label="Pilih ahli" />
        <MatrixTable head="Bagian usaha" columns={dimColumns} rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: model.crisp[current][i].map((value) => ratio(value)) }))} caption="Baris dibanding kolom. Angka 3 berarti baris tiga kali lebih penting dari kolom; 1/3 berarti sebaliknya." />
      </Step>

      <Step index={2} id={id} title={MODEL_STEPS[1].title} explanation={MODEL_STEPS[1].explanation} formula="CI = (λmax − 8) ÷ 7 ; CR = CI ÷ 1,41 ; konsisten jika CR ≤ 0,10" showFormula={showFormula}>
        <MatrixTable head="Ahli" compact columns={[{ key: "lambda", label: "λmax" }, { key: "ci", label: "CI" }, { key: "cr", label: "CR" }, { key: "chip", label: "Keputusan", numeric: false }]} precise={precise}
          rows={[...model.individualCR.map((cr, index) => ({ key: `e${index}`, label: names[index], cells: [cr.lambdaMax, cr.CI, cr.CR, <ConsistencyChip key="chip" consistent={cr.consistent} />] })), { key: "group", label: "Matriks gabungan tiga ahli", className: "adm-row-group", cells: [model.groupCR.lambdaMax, model.groupCR.CI, model.groupCR.CR, model.groupCR.consistent ? <span key="g" className="adm-mark-ok">Gabungan konsisten</span> : <span key="g" className="adm-mark-bad">Gabungan tidak konsisten</span>] }]} />
        <details className="adm-details"><summary>Lima pasangan yang paling menyimpang per ahli</summary><div>
          <ExpertTabs names={names} active={current} onChange={setExpert} label="Pilih ahli" />
          <MatrixTable head="Pasangan" compact columns={[{ key: "dev", label: "Simpangan (log)" }]} precise={precise} rows={model.individualCR[current].reviewPairs.map((pair) => ({ key: `${pair.left}${pair.right}`, label: `${dims.find((d) => d.code === pair.left)?.title} ↔ ${dims.find((d) => d.code === pair.right)?.title}`, cells: [pair.deviation] }))} caption="Simpangan besar berarti perbandingan ini paling tidak sejalan dengan jawaban lain dari ahli yang sama." />
        </div></details>
      </Step>

      <Step index={3} id={id} title={MODEL_STEPS[2].title} explanation={MODEL_STEPS[2].explanation} formula="k → (k−1, k, k+1) dibatasi 1–9 ; 1 → (1, 1, 1) ; 1/k → (1/(k+1), 1/k, 1/(k−1))" showFormula={showFormula}>
        <MatrixTable head="Angka ahli" compact columns={[{ key: "tfn", label: "Rendah, tengah, tinggi", numeric: false }, { key: "inv", label: "Kebalikannya", numeric: false }]} rows={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => ({ key: String(k), label: String(k), cells: [tfn(toTFN(k)), k === 1 ? "—" : `1/${k} → ${tfn(toTFN(1 / k))}`] }))} />
        <details className="adm-details"><summary>Matriks angka kabur per ahli</summary><div>
          <ExpertTabs names={names} active={current} onChange={setExpert} label="Pilih ahli" />
          <MatrixTable head="Bagian usaha" columns={dimColumns} rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: model.individualTFN[current][i].map((value) => tfn(value, tfnDigits)) }))} />
        </div></details>
      </Step>

      <Step index={4} id={id} title={MODEL_STEPS[3].title} explanation={MODEL_STEPS[3].explanation} formula="tiap angka = ∛(ahli 1 × ahli 2 × ahli 3), dihitung terpisah untuk rendah, tengah, tinggi" showFormula={showFormula}>
        <MatrixTable head="Bagian usaha" columns={dimColumns} rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: model.groupTFN[i].map((value) => tfn(value, tfnDigits)) }))} />
      </Step>

      <Step index={5} id={id} title={MODEL_STEPS[4].title} explanation={MODEL_STEPS[4].explanation} formula="r_i = (hasil kali 8 angka di baris i)^(1/8) ; jumlah = Σ r_i" showFormula={showFormula}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "l", label: "Rendah" }, { key: "m", label: "Tengah" }, { key: "u", label: "Tinggi" }]} precise={precise} rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: model.rowGM[i] }))} footer={{ key: "sum", label: "Jumlah", cells: model.sumGM }} />
      </Step>

      <Step index={6} id={id} title={MODEL_STEPS[5].title} explanation={MODEL_STEPS[5].explanation} formula="rendah = r_rendah ÷ Σtinggi ; tengah = r_tengah ÷ Σtengah ; tinggi = r_tinggi ÷ Σrendah" showFormula={showFormula}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "l", label: "Rendah" }, { key: "m", label: "Tengah" }, { key: "u", label: "Tinggi" }]} precise={precise} rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: model.fuzzyWeights[i] }))} />
      </Step>

      <Step index={7} id={id} title={MODEL_STEPS[6].title} explanation={MODEL_STEPS[6].explanation} formula="titik tengah = (rendah + tengah + tinggi) ÷ 3 ; w = titik tengah ÷ Σ titik tengah" showFormula={showFormula}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "c", label: "Titik tengah" }, { key: "w", label: "Bobot akhir (w)" }, { key: "bar", label: "", numeric: false }]} precise={precise}
          rows={dims.map((d, i) => ({ key: d.code, label: dimLabel(d.code), cells: [model.centroid[i], model.w[i], <Bar key="bar" value={model.w[i]} max={Math.max(...model.w)} label={fmt(model.w[i], 4)} />] }))}
          footer={{ key: "sum", label: "Jumlah", cells: [sum(model.centroid), sum(model.w), ""] }} caption={`Delapan bobot berjumlah ${n(sum(model.w))}. Bobot ini dipakai untuk semua usaha.`} />
      </Step>

      <Step index={8} id={id} title={MODEL_STEPS[7].title} explanation={MODEL_STEPS[7].explanation} formula="R[modul][bagian] = (nilai ahli 1 + ahli 2 + ahli 3) ÷ 3" showFormula={showFormula}>
        <ExpertTabs names={names} active={current} onChange={setExpert} label="Pilih ahli" />
        <MatrixTable head={`Modul belajar · ${names[current]}`} columns={dimColumns} rows={mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: model.individualR[current][i] }))} />
        <div style={{ height: 12 }} />
        <MatrixTable head="Modul belajar · rata-rata tiga ahli (R)" columns={dimColumns} precise={precise} rows={mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: model.R[i] }))} caption="Tabel R inilah yang dipakai di langkah 5 perhitungan hasil tiap usaha." />
      </Step>
    </div>
  </div>;
}
