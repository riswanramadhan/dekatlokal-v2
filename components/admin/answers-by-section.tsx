import { instrument } from "@/lib/decision-engine";
import { fmt } from "@/lib/digital-checkup/format";

// 8 kartu bagian × 4 baris: kode, teks pertanyaan, pilihan yang dipilih, skor; plus jumlah bagian.
export function AnswersBySection({ answers }: { answers: Record<string, number | null | undefined> }) {
  const answered = Object.values(answers ?? {}).filter((value) => value != null).length;
  if (!answered) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Jawaban akan tampil setelah UMKM mulai mengisi checkup.</span></div>;
  return <div className="adm-answer-grid">
    {instrument.dimensions.map((dimension) => {
      const questions = instrument.questions.filter((question) => question.dimension === dimension.code);
      const scores = questions.map((question) => answers?.[question.code]);
      const complete = scores.every((value) => typeof value === "number");
      const sum = scores.reduce<number>((total, value) => total + (typeof value === "number" ? value : 0), 0);
      return <article className="adm-answer-card" key={dimension.code} aria-labelledby={`answers-${dimension.code}`}>
        <header><h3 id={`answers-${dimension.code}`}>{dimension.title}<small>{dimension.code} · 4 pertanyaan</small></h3><span className="adm-chip adm-chip-primary tabular">{sum} / 16</span></header>
        <ol>{questions.map((question) => {
          const value = answers?.[question.code];
          const option = question.options.find((item) => item.score === value);
          return <li key={question.code}>
            <span>{question.code}</span>
            <div><p>{question.text}</p><small>{option ? option.label : "Belum dijawab"}</small></div>
            <span className="adm-answer-score" data-missing={value == null} aria-label={`Skor ${value ?? "belum ada"}`}>{value ?? "–"}</span>
          </li>;
        })}</ol>
        <footer><span>Jumlah bagian</span><span className="tabular">{complete ? `${sum} ÷ 16 × 100 = ${fmt(sum / 16 * 100, 2)}` : `${sum} (belum lengkap)`}</span></footer>
      </article>;
    })}
  </div>;
}
