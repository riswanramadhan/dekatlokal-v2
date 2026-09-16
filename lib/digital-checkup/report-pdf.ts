import { instrument } from "@/lib/decision-engine";
import type { PublicAssessment } from "./service";
import { coursePreview, resultInsight } from "./result-insight";

export function reportFileName(businessName: string) {
  const safe = businessName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return `digital-checkup-${safe || "usaha-saya"}.pdf`;
}

const ascii = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
const escapePdf = (value: string) => ascii(value).replace(/([\\()])/g, "\\$1");

function wrap(value: string, maxCharacters: number) {
  const words = ascii(value).split(" "), lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!word) continue;
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxCharacters) line = next;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export function createReportPdf(assessment: PublicAssessment) {
  const width = 595, height = 842, left = 52, right = 543, contentWidth = right - left;
  const blue = "0.008 0.333 0.961", navy = "0.067 0.141 0.243", muted = "0.325 0.392 0.490", pale = "0.933 0.961 1";
  const pages: string[][] = [[]];
  let page = pages[0], top = 72;
  const line = (x1: number, y1: number, x2: number, y2: number, color = "0.85 0.90 0.97", lineWidth = 1) => page.push(`${color} RG ${lineWidth} w ${x1} ${height-y1} m ${x2} ${height-y2} l S`);
  const rect = (x: number, y: number, w: number, h: number, color: string) => page.push(`${color} rg ${x} ${height-y-h} ${w} ${h} re f`);
  const text = (value: string, x: number, y: number, size = 10, bold = false, color = navy) => page.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color} rg ${x} ${height-y} Td (${escapePdf(value)}) Tj ET`);
  const finishPage = () => { line(left, 810, right, 810); text("Digital Checkup DekatLokal - panduan belajar, bukan jaminan hasil usaha.", left, 826, 7, false, muted); text(String(pages.indexOf(page) + 1), right - 4, 826, 7, false, muted); };
  const newPage = () => { finishPage(); page = []; pages.push(page); top = 55; text("DEKATLOKAL / LAPORAN DIGITAL CHECKUP", left, 28, 8, true, blue); line(left, 36, right, 36); };
  const ensure = (space: number) => { if (top + space > 795) newPage(); };
  const paragraph = (value: string, size = 10, color = muted, gap = 10) => {
    const lines = wrap(value, Math.floor(contentWidth / (size * .52)));
    ensure(lines.length * (size + 4) + gap);
    for (const item of lines) { text(item, left, top, size, false, color); top += size + 4; }
    top += gap;
  };
  const heading = (value: string, size = 17) => { ensure(25); text(value, left, top, size, true); top += size + 10; };
  const card = (label: string, title: string, body: string, score?: number) => {
    const lines = wrap(body, 82), cardHeight = 64 + lines.length * 12;
    ensure(cardHeight + 10); rect(left, top, contentWidth, cardHeight, pale);
    text(label.toUpperCase(), left + 14, top + 18, 8, true, blue); text(title, left + 14, top + 37, 12, true);
    if (score != null) text(`${Math.round(score)}/100`, right - 66, top + 37, 13, true, blue);
    lines.forEach((item, index) => text(item, left + 14, top + 56 + index * 12, 9, false, muted));
    top += cardHeight + 10;
  };

  const businessName = assessment.payload.profile.businessName?.trim() || "Usaha Saya";
  const scores = assessment.scores ?? Array(8).fill(0), insight = resultInsight(scores, assessment.payload.profile);
  const topModules = assessment.run?.trace.ranking.filter((item) => item.rank <= 3) ?? [];
  rect(0, 0, width, 185, blue);
  text("DEKATLOKAL", left, 45, 11, true, "1 1 1"); text("Laporan Digital Checkup", left, 88, 25, true, "1 1 1"); text(businessName, left, 116, 13, false, "1 1 1");
  text(new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(assessment.submittedAt ?? Date.now())), left, 142, 9, false, "1 1 1");
  top = 220; heading("Cerita usahamu hari ini"); paragraph(insight.overview, 11, navy, 14);
  card("Yang sudah jadi modal", insight.strongest.title, insight.strongest.story, insight.strongest.score);
  card("Yang perlu dibereskan", insight.focus.title, insight.focus.story, insight.focus.score);
  heading("Nilai 8 bagian usaha");
  for (const [index, dimension] of instrument.dimensions.entries()) {
    ensure(38); const score = Math.round(scores[index] ?? 0);
    text(dimension.title, left, top, 9, false, navy); text(`${score}%`, right - 28, top, 9, true, blue);
    rect(left, top + 9, contentWidth, 7, "0.89 0.93 0.99"); if (score > 0) rect(left, top + 9, contentWidth * score / 100, 7, blue);
    top += 32;
  }
  top += 8; heading("3 modul untuk mulai dulu");
  if (!topModules.length) paragraph("Rekomendasi modul masih disiapkan. Buka kembali hasil checkup saat pemrosesan selesai.");
  for (const item of topModules) {
    const course = coursePreview(item.code), reasons = assessment.run?.reasons[item.code] ?? [];
    const reason = reasons.length ? `Dipilih untuk membantu merapikan ${reasons.map((entry) => entry.toLowerCase()).join(" dan ")}. Hasil praktik: ${course?.outcome ?? "langkah usaha yang lebih rapi"}` : course?.tagline ?? "Modul dipilih sesuai kebutuhan usahamu.";
    card(`Prioritas ${item.rank}`, course?.title ?? item.code, reason);
  }
  heading("Peluang website gratis"); paragraph(`${insight.website.title}. ${insight.website.description}`);
  paragraph("Langkah berikutnya: masuk atau buat akun untuk menyimpan hasil dan membuka modul gratis selama 7 hari.", 10, navy);
  finishPage();

  const objects: string[] = ["", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"], pageReferences: number[] = [];
  for (const commands of pages) {
    const stream = commands.join("\n"), streamReference = objects.length + 1;
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageReference = objects.length + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamReference} 0 R >>`); pageReferences.push(pageReference);
  }
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>"; objects[1] = `<< /Type /Pages /Kids [${pageReferences.map((reference) => `${reference} 0 R`).join(" ")}] /Count ${pageReferences.length} >>`;
  let pdf = "%PDF-1.4\n", offset = pdf.length; const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = offset; const block = `${index + 1} 0 obj\n${object}\nendobj\n`; pdf += block; offset += block.length; });
  const xref = offset;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((value) => `${String(value).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export async function downloadCheckupPdf(assessment: PublicAssessment) {
  const file = new Blob([createReportPdf(assessment)], { type: "application/pdf" }), href = URL.createObjectURL(file);
  const anchor = document.createElement("a"); anchor.href = href; anchor.download = reportFileName(assessment.payload.profile.businessName ?? ""); anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
