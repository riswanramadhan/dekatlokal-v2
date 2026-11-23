"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { instrument, type Answers, type Decision } from "@/lib/decision-engine";
import { fmt, pretty10 } from "@/lib/digital-checkup/format";
import { QUANTITY, RUN_STATUS_TEXT, RUN_STEPS, type RunStatusKey } from "@/lib/digital-checkup/labels";
import { FormulaToggle } from "./formula-toggle";
import { MatrixTable, type MatrixColumn } from "./matrix-table";
import { Bar } from "./score-bars";
import { RunStatusChip } from "./status-chip";

const dims = instrument.dimensions, mods = instrument.modules;
const dimColumns: MatrixColumn[] = dims.map((d) => ({ key: d.code, label: d.code, title: d.title }));
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const moduleName = (code: string) => mods.find((m) => m.code === code)?.name ?? code;

function Step({ index, title, explanation, formula, showFormula, state, children }: { index: number; title: string; explanation: string; formula?: string; showFormula: boolean; state: "done" | "stop" | "skip"; children?: ReactNode }) {
  return <section className={`adm-step adm-step-${state}`} id={`langkah-${index}`} aria-labelledby={`langkah-${index}-judul`}>
    <div className="adm-step-head"><span className="adm-step-num" aria-hidden="true">{index}</span><div><h3 id={`langkah-${index}-judul`}>{title}</h3><p>{explanation}</p></div></div>
    {showFormula && formula && <code className="adm-formula">{formula}</code>}
    {children}
  </section>;
}

// Sepuluh langkah dari jawaban sampai urutan modul. Semua angka diambil langsung dari jejak
// hasil yang tersimpan; tidak ada yang dihitung ulang di sini.
export function RunSteps({ trace, answers, modelHref }: { trace: Decision; answers?: Answers; modelHref?: string }) {
  const [showFormula, setShowFormula] = useState(false);
  const [precise, setPrecise] = useState(false);
  const status = trace.status as RunStatusKey, statusText = RUN_STATUS_TEXT[status] ?? RUN_STATUS_TEXT.RANKED;
  // Langkah terakhir yang benar-benar dihitung untuk status ini.
  const lastStep = status === "NO_IDENTIFIED_GAP" ? 3 : status === "UNCOVERED_DIMENSION" ? 5 : status === "ALTERNATIVES_NOT_DISTINGUISHABLE" ? 9 : 10;
  const stateOf = (step: number): "done" | "stop" | "skip" => (step <= lastStep ? "done" : step === lastStep + 1 ? "stop" : "skip");
  const n = (value: number) => (precise ? pretty10(value) : fmt(value));
  const wg = trace.w.map((w, j) => w * trace.g[j]);
  const denom = dims.map((_, j) => Math.sqrt(sum(trace.R.map((row) => row[j] ** 2))));
  const stopNote = <p className="note note-warning adm-step-stop-note">{statusText.explanation}</p>;
  const sortedRanking = trace.ranking ?? [];

  return <div>
    <div className="adm-inline" style={{ justifyContent: "space-between", marginBottom: 12 }}>
      <FormulaToggle formula={showFormula} precise={precise} onFormula={setShowFormula} onPrecise={setPrecise} />
      <RunStatusChip status={trace.status} />
    </div>
    <div className="adm-steps">
      <Step index={1} title={RUN_STEPS[0].title} explanation={RUN_STEPS[0].explanation} formula={QUANTITY.S.formula} showFormula={showFormula} state={stateOf(1)}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "answers", label: "Skor 4 jawaban", numeric: false }, { key: "sum", label: "Jumlah" }, { key: "S", label: QUANTITY.S.label, title: QUANTITY.S.hint }, { key: "bar", label: "", numeric: false }]} precise={precise}
          rows={dims.map((d, j) => {
            const codes = instrument.questions.filter((q) => q.dimension === d.code).map((q) => q.code);
            const values = answers ? codes.map((code) => answers[code]) : null;
            const partial = values && values.every((value) => typeof value === "number") ? sum(values as number[]) : null;
            return { key: d.code, label: <>{d.title}<span className="adm-sub">{d.code}</span></>, cells: [values ? values.map((value) => value ?? "–").join(" + ") : "—", partial ?? "—", trace.S[j], <Bar key="bar" value={trace.S[j]} max={100} />] };
          })} />
      </Step>

      <Step index={2} title={RUN_STEPS[1].title} explanation={RUN_STEPS[1].explanation} formula={QUANTITY.g.formula} showFormula={showFormula} state={stateOf(2)}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "S", label: QUANTITY.S.label }, { key: "g", label: QUANTITY.g.label, title: QUANTITY.g.hint }, { key: "bar", label: "", numeric: false }]} precise={precise}
          rows={dims.map((d, j) => ({ key: d.code, label: <>{d.title}<span className="adm-sub">{d.code}</span></>, cells: [trace.S[j], trace.g[j], <Bar key="bar" value={trace.g[j]} max={1} tone="amber" label={fmt(trace.g[j], 3)} />] }))} />
      </Step>

      <Step index={3} title={RUN_STEPS[2].title} explanation={RUN_STEPS[2].explanation} formula={QUANTITY.w.formula} showFormula={showFormula} state={stateOf(3)}>
        <MatrixTable head="Bagian usaha" compact columns={[{ key: "w", label: QUANTITY.w.label, title: QUANTITY.w.hint }, { key: "bar", label: "", numeric: false }]} precise={precise}
          rows={dims.map((d, j) => ({ key: d.code, label: <>{d.title}<span className="adm-sub">{d.code}</span></>, cells: [trace.w[j], <Bar key="bar" value={trace.w[j]} max={Math.max(...trace.w)} label={fmt(trace.w[j], 4)} />] }))}
          footer={{ key: "sum", label: "Jumlah", cells: [sum(trace.w), ""] }} />
        {modelHref && <p className="adm-step-note"><Link className="link" href={modelHref}>Lihat cara bobot ini dihitung dari tiga ahli →</Link></p>}
      </Step>

      <Step index={4} title={RUN_STEPS[3].title} explanation={RUN_STEPS[3].explanation} formula={`${QUANTITY.H.formula} ; ${QUANTITY.q.formula}`} showFormula={showFormula} state={stateOf(4)}>
        {stateOf(4) === "done" ? <MatrixTable head="Bagian usaha" compact columns={[{ key: "w", label: QUANTITY.w.label }, { key: "g", label: QUANTITY.g.label }, { key: "wg", label: "w × g" }, { key: "q", label: QUANTITY.q.label, title: QUANTITY.q.hint }]} precise={precise}
          rows={dims.map((d, j) => ({ key: d.code, label: <>{d.title}<span className="adm-sub">{d.code}</span></>, cells: [trace.w[j], trace.g[j], wg[j], trace.q[j]] }))}
          footer={[{ key: "H", label: `${QUANTITY.H.label} (H)`, cells: ["", "", trace.H, ""] }, { key: "sumq", label: "Jumlah bobot kebutuhan", cells: ["", "", "", sum(trace.q)] }]} />
          : <><MatrixTable head="Bagian usaha" compact columns={[{ key: "w", label: QUANTITY.w.label }, { key: "g", label: QUANTITY.g.label }, { key: "wg", label: "w × g" }]} precise={precise} rows={dims.map((d, j) => ({ key: d.code, label: <>{d.title}<span className="adm-sub">{d.code}</span></>, cells: [trace.w[j], trace.g[j], wg[j]] }))} footer={{ key: "H", label: `${QUANTITY.H.label} (H)`, cells: ["", "", trace.H] }} />{stopNote}</>}
      </Step>

      <Step index={5} title={RUN_STEPS[4].title} explanation={RUN_STEPS[4].explanation} formula={QUANTITY.R.formula} showFormula={showFormula} state={stateOf(5)}>
        {stateOf(5) !== "skip" && <MatrixTable head="Modul belajar" columns={dimColumns} precise={precise} rows={mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: trace.R[i] }))} caption="Kolom C1–C8 adalah bagian usaha; angka 0–4 adalah rata-rata tiga ahli." />}
        {stateOf(5) === "stop" && stopNote}
      </Step>

      <Step index={6} title={RUN_STEPS[5].title} explanation={RUN_STEPS[5].explanation} formula={QUANTITY.N.formula} showFormula={showFormula} state={stateOf(6)}>
        {stateOf(6) === "done" && <MatrixTable head="Modul belajar" columns={dimColumns} precise={precise} rows={[{ key: "denom", label: "Pembagi √Σ(R²)", className: "adm-row-group", cells: denom }, ...mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: trace.N[i] }))]} />}
        {stateOf(6) === "stop" && <>{trace.uncovered?.length > 0 && <p className="adm-help">Bagian tanpa modul yang cocok: {trace.uncovered.map((code) => dims.find((d) => d.code === code)?.title ?? code).join(", ")}.</p>}{stopNote}</>}
      </Step>

      <Step index={7} title={RUN_STEPS[6].title} explanation={RUN_STEPS[6].explanation} formula={QUANTITY.V.formula} showFormula={showFormula} state={stateOf(7)}>
        {stateOf(7) === "done" && <MatrixTable head="Modul belajar" columns={dimColumns} precise={precise} rows={[{ key: "q", label: `${QUANTITY.q.label} (q)`, className: "adm-row-group", cells: trace.q }, ...mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: trace.V[i] }))]} />}
        {stateOf(7) === "stop" && stopNote}
      </Step>

      <Step index={8} title={RUN_STEPS[7].title} explanation={RUN_STEPS[7].explanation} formula={`${QUANTITY.idealPlus.formula} ; ${QUANTITY.idealMinus.formula}`} showFormula={showFormula} state={stateOf(8)}>
        {stateOf(8) === "done" && <MatrixTable head="Patokan" columns={dimColumns} precise={precise} rows={[{ key: "plus", label: `${QUANTITY.idealPlus.label} (A⁺)`, cells: trace.idealPlus }, { key: "minus", label: `${QUANTITY.idealMinus.label} (A⁻)`, cells: trace.idealMinus }]} />}
        {stateOf(8) === "stop" && stopNote}
      </Step>

      <Step index={9} title={RUN_STEPS[8].title} explanation={RUN_STEPS[8].explanation} formula={`${QUANTITY.Dplus.formula} ; ${QUANTITY.Dminus.formula}`} showFormula={showFormula} state={stateOf(9)}>
        {stateOf(9) === "done" && <MatrixTable head="Modul belajar" compact columns={[{ key: "dplus", label: `${QUANTITY.Dplus.label} (D⁺)`, title: QUANTITY.Dplus.hint }, { key: "dminus", label: `${QUANTITY.Dminus.label} (D⁻)`, title: QUANTITY.Dminus.hint }]} precise={precise} rows={mods.map((m, i) => ({ key: m.code, label: <>{m.name}<span className="adm-sub">{m.code}</span></>, cells: [trace.Dplus[i], trace.Dminus[i]] }))} />}
        {stateOf(9) === "stop" && stopNote}
      </Step>

      <Step index={10} title={RUN_STEPS[9].title} explanation={RUN_STEPS[9].explanation} formula={QUANTITY.C.formula} showFormula={showFormula} state={stateOf(10)}>
        {stateOf(10) === "done" ? <>
          <MatrixTable head="Modul belajar" compact columns={[{ key: "dplus", label: "D⁺" }, { key: "dminus", label: "D⁻" }, { key: "C", label: `${QUANTITY.C.label} (C)`, title: QUANTITY.C.hint }, { key: "rank", label: "Urutan" }, { key: "bar", label: "", numeric: false }]} precise={precise}
            rows={sortedRanking.map((item) => ({ key: item.code, label: <>{moduleName(item.code)}<span className="adm-sub">{item.code}</span></>, className: trace.topSet.includes(item.code) ? "adm-row-top" : undefined, cells: [item.Dplus, item.Dminus, item.C, `#${item.rank}`, <Bar key="bar" value={item.C} max={1} tone="mint" label={fmt(item.C, 4)} />] }))}
            caption={trace.topSet.length > 1 ? `Ada ${trace.topSet.length} modul dengan nilai kedekatan sama persis di urutan pertama (${trace.topSet.map(moduleName).join(", ")}); keduanya menjadi rekomendasi utama.` : `Rekomendasi utama: ${trace.topSet.map(moduleName).join(", ")} dengan nilai kedekatan ${n(sortedRanking[0]?.C ?? 0)}.`} />
        </> : stopNote}
      </Step>
    </div>
  </div>;
}
