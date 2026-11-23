// Penulis PDF A4 kecil tanpa dependensi, gaya yang sama dengan lib/digital-checkup/report-pdf.ts
// (Helvetica bawaan, teks ASCII aman, tata letak dari atas halaman). Murni: bisa jalan di server & test.

export const PDF_COLORS = { blue: "0.008 0.333 0.961", navy: "0.067 0.141 0.243", muted: "0.325 0.392 0.490", pale: "0.933 0.961 1", line: "0.85 0.90 0.97", white: "1 1 1", track: "0.89 0.93 0.99" } as const;

export const pdfAscii = (value: string) => value.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[•·]/g, "-").replace(/×/g, "x").replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
const escapePdf = (value: string) => pdfAscii(value).replace(/([\\()])/g, "\\$1");

export function wrapText(value: string, maxCharacters: number) {
  const words = pdfAscii(value).split(" "), lines: string[] = [];
  let line = "";
  for (let word of words) {
    if (!word) continue;
    // Kata yang terlalu panjang (mis. URL) dipotong agar tidak keluar halaman.
    while (word.length > maxCharacters) { if (line) { lines.push(line); line = ""; } lines.push(word.slice(0, maxCharacters)); word = word.slice(maxCharacters); }
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxCharacters) line = next;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export interface TableColumn { label: string; width: number; align?: "left" | "right" }

export function createPdfWriter({ header, footer }: { header: string; footer: string }) {
  const width = 595, height = 842, left = 52, right = 543, contentWidth = right - left, bottom = 795;
  const { blue, navy, muted, pale, line: lineColor } = PDF_COLORS;
  const pages: string[][] = [[]];
  let page = pages[0], top = 72;
  const charWidth = (size: number) => size * 0.52;

  const line = (x1: number, y1: number, x2: number, y2: number, color: string = lineColor, lineWidth = 1) => page.push(`${color} RG ${lineWidth} w ${x1} ${height - y1} m ${x2} ${height - y2} l S`);
  const rect = (x: number, y: number, w: number, h: number, color: string) => page.push(`${color} rg ${x} ${height - y - h} ${w} ${h} re f`);
  const text = (value: string, x: number, y: number, size = 10, bold = false, color: string = navy) => page.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color} rg ${x} ${height - y} Td (${escapePdf(value)}) Tj ET`);
  const textRight = (value: string, xRight: number, y: number, size = 10, bold = false, color: string = navy) => text(value, xRight - pdfAscii(value).length * size * 0.55, y, size, bold, color);
  const newPage = () => { page = []; pages.push(page); top = 55; text(header, left, 28, 8, true, blue); line(left, 36, right, 36); };
  const ensure = (space: number) => { if (top + space > bottom) newPage(); };
  const space = (value: number) => { top += value; };
  const paragraph = (value: string, size = 10, color: string = muted, gap = 10, indent = 0) => {
    const lines = wrapText(value, Math.floor((contentWidth - indent) / charWidth(size)));
    for (const item of lines) { ensure(size + 4); text(item, left + indent, top, size, false, color); top += size + 4; }
    top += gap;
  };
  // Teks digambar pada garis dasar (baseline); beri ruang di atas judul agar tidak menempel ke blok sebelumnya.
  const heading = (value: string, size = 16, keepWith = 60) => { ensure(size + 18 + keepWith); top += 8; text(value, left, top, size, true); top += size + 10; };
  const label = (value: string) => { ensure(16); text(value.toUpperCase(), left, top, 8, true, blue); top += 14; };
  const bullet = (value: string, size = 9.5, color: string = navy) => {
    const lines = wrapText(value, Math.floor((contentWidth - 14) / charWidth(size)));
    ensure(Math.min(lines.length, 3) * (size + 4));
    lines.forEach((item, index) => { ensure(size + 4); if (index === 0) text("-", left + 2, top, size, true, blue); text(item, left + 14, top, size, false, color); top += size + 4; });
    top += 3;
  };
  const card = (eyebrow: string, title: string, body: string, side?: string) => {
    const lines = wrapText(body, Math.floor((contentWidth - 28) / charWidth(9))), cardHeight = 60 + lines.length * 12;
    ensure(cardHeight + 10); rect(left, top, contentWidth, cardHeight, pale);
    text(eyebrow.toUpperCase(), left + 14, top + 18, 8, true, blue); text(title, left + 14, top + 37, 12, true);
    if (side) textRight(side, right - 14, top + 37, 12, true, blue);
    lines.forEach((item, index) => text(item, left + 14, top + 54 + index * 12, 9, false, muted));
    top += cardHeight + 10;
  };
  const meter = (title: string, value: number, note = "") => {
    const score = Math.max(0, Math.min(100, Math.round(value)));
    const noteLines = note ? wrapText(note, Math.floor(contentWidth / charWidth(8.5))) : [];
    ensure(30 + noteLines.length * 12);
    text(title, left, top, 9.5, true, navy); textRight(`${score}/100`, right, top, 9.5, true, blue);
    rect(left, top + 7, contentWidth, 6, PDF_COLORS.track); if (score > 0) rect(left, top + 7, contentWidth * score / 100, 6, blue);
    top += 24;
    for (const item of noteLines) { text(item, left, top, 8.5, false, muted); top += 12; }
    top += 6;
  };
  /** Tabel sederhana dengan pembungkus teks per sel; header diulang di halaman baru. */
  const table = (columns: TableColumn[], rows: string[][], size = 8.5) => {
    const total = columns.reduce((sum, column) => sum + column.width, 0);
    const widths = columns.map((column) => column.width / total * contentWidth);
    const xs = widths.map((_, index) => left + widths.slice(0, index).reduce((sum, value) => sum + value, 0));
    const drawHeader = () => {
      rect(left, top, contentWidth, 20, pale);
      columns.forEach((column, index) => column.align === "right" ? textRight(column.label, xs[index] + widths[index] - 6, top + 13, 8, true, blue) : text(column.label, xs[index] + 6, top + 13, 8, true, blue));
      top += 20;
    };
    ensure(20 + size + 14); drawHeader();
    for (const row of rows) {
      const cells = row.map((cell, index) => wrapText(cell, Math.max(4, Math.floor((widths[index] - 12) / charWidth(size)))));
      const rowHeight = Math.max(...cells.map((cell) => cell.length)) * (size + 3.5) + 10;
      if (top + rowHeight > bottom) { newPage(); drawHeader(); }
      cells.forEach((cell, index) => cell.forEach((item, lineIndex) => {
        const y = top + 6 + size + lineIndex * (size + 3.5);
        if (columns[index].align === "right") textRight(item, xs[index] + widths[index] - 6, y, size, index === 0, navy);
        else text(item, xs[index] + 6, y, size, index === 0, index === 0 ? navy : muted);
      }));
      top += rowHeight; line(left, top, right, top);
    }
    top += 24;
  };

  const output = () => {
    pages.forEach((commands, index) => {
      commands.push(`${lineColor} RG 1 w ${left} ${height - 810} m ${right} ${height - 810} l S`);
      commands.push(`BT /F1 7 Tf ${muted} rg ${left} ${height - 826} Td (${escapePdf(footer)}) Tj ET`);
      commands.push(`BT /F1 7 Tf ${muted} rg ${right - 40} ${height - 826} Td (${escapePdf(`${index + 1} / ${pages.length}`)}) Tj ET`);
    });
    const objects: string[] = ["", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"], pageReferences: number[] = [];
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
  };

  return {
    width, height, left, right, contentWidth,
    get top() { return top; },
    set top(value: number) { top = value; },
    get pageCount() { return pages.length; },
    text, textRight, rect, line, newPage, ensure, space, paragraph, heading, label, bullet, card, meter, table, output,
  };
}
