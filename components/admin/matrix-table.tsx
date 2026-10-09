import type { ReactNode } from "react";
import { fmt, pretty10 } from "@/lib/digital-checkup/format";

export type Cell = number | string | null | undefined | ReactNode;
export type MatrixColumn = { key: string; label: ReactNode; numeric?: boolean; title?: string };
export type MatrixRow = { key: string; label: ReactNode; cells: Cell[]; className?: string };

export function formatCell(cell: Cell, precise: boolean, digits = 6): ReactNode {
  if (typeof cell === "number") return precise ? pretty10(cell) : fmt(cell, digits);
  if (cell == null) return "—";
  return cell;
}

// Tabel angka: judul kolom lengket, baris selang-seling, angka rata kanan, kolom pertama lengket
// di dalam penggulir mendatar. Angka selalu diformat; tidak pernah menampilkan JSON.
export function MatrixTable({ head = "", columns, rows, footer, precise = false, digits = 6, caption, compact = false }: {
  head?: ReactNode; columns: MatrixColumn[]; rows: MatrixRow[]; footer?: MatrixRow | MatrixRow[]; precise?: boolean; digits?: number; caption?: ReactNode; compact?: boolean;
}) {
  const footers = footer ? (Array.isArray(footer) ? footer : [footer]) : [];
  if (!rows.length) return <div className="adm-empty"><strong>Belum ada data masuk</strong></div>;
  return <div className="adm-table-wrap" style={compact ? { maxHeight: "none" } : undefined}>
    <table className="adm-table">
      <thead><tr><th scope="col">{head}</th>{columns.map((column) => <th key={column.key} scope="col" className={column.numeric === false ? undefined : "adm-num"} title={column.title}>{column.label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.key} className={row.className}><th scope="row">{row.label}</th>{row.cells.map((cell, index) => <td key={columns[index]?.key ?? index} className={columns[index]?.numeric === false ? undefined : "adm-num"}>{formatCell(cell, precise, digits)}</td>)}</tr>)}</tbody>
      {footers.length > 0 && <tfoot>{footers.map((row) => <tr key={row.key}><td>{row.label}</td>{row.cells.map((cell, index) => <td key={columns[index]?.key ?? index} className={columns[index]?.numeric === false ? undefined : "adm-num"}>{formatCell(cell, precise, digits)}</td>)}</tr>)}</tfoot>}
    </table>
    {caption && <div className="adm-table-caption">{caption}</div>}
  </div>;
}
