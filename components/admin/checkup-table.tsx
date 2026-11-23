"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { instrument } from "@/lib/decision-engine";
import { fmtDate } from "@/lib/digital-checkup/format";
import type { CheckupListItem } from "@/lib/digital-checkup/admin-data";
import { RunStatusChip, SessionStatusChip } from "./status-chip";

type Filter = "semua" | "final" | "draf" | "siap" | "menunggu";
type SortKey = "label" | "businessName" | "sector" | "district" | "submittedAt" | "answered";
const FILTERS: { key: Filter; label: string }[] = [{ key: "semua", label: "Semua" }, { key: "final", label: "Final" }, { key: "draf", label: "Draf" }, { key: "siap", label: "Hasil siap" }, { key: "menunggu", label: "Menunggu model" }];
const moduleName = (code: string) => instrument.modules.find((m) => m.code === code)?.name ?? code;

function matches(item: CheckupListItem, filter: Filter) {
  if (filter === "final") return item.status === "submitted";
  if (filter === "draf") return item.status === "draft";
  if (filter === "siap") return item.runStatus === "RANKED";
  if (filter === "menunggu") return item.status === "submitted" && !item.latestRunId;
  return true;
}

export function CheckupTable({ items }: { items: CheckupListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "submittedAt", dir: -1 });
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => matches(item, filter) && (!q || [item.code ?? "", item.label, item.businessName, item.sector, item.district].some((text) => text.toLowerCase().includes(q))));
    return filtered.sort((a, b) => {
      const av = a[sort.key] ?? "", bv = b[sort.key] ?? "";
      const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "id");
      return result * sort.dir;
    });
  }, [items, query, filter, sort]);
  const toggleSort = (key: SortKey) => setSort((current) => ({ key, dir: current.key === key ? (current.dir === 1 ? -1 : 1) : key === "submittedAt" ? -1 : 1 }));
  const header = (key: SortKey, label: string, numeric = false) => <th scope="col" className={numeric ? "adm-num" : undefined} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}><button type="button" className="adm-sort" aria-pressed={sort.key === key} onClick={() => toggleSort(key)}>{label}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</button></th>;

  if (!items.length) return <div className="adm-empty"><strong>Belum ada data masuk</strong><span>Daftar terisi otomatis saat UMKM mulai mengisi checkup.</span></div>;
  return <div>
    <div className="adm-toolbar">
      <label className="adm-search"><Search aria-hidden="true" /><span className="sr-only">Cari nomor, nama usaha, jenis usaha, atau lokasi</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nomor, nama usaha, jenis, atau lokasi" /></label>
      <div className="adm-filters" role="group" aria-label="Saring daftar">{FILTERS.map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label} <span className="tabular">({items.filter((row) => matches(row, item.key)).length})</span></button>)}</div>
    </div>
    {rows.length === 0 ? <div className="adm-empty"><strong>Tidak ada yang cocok</strong><span>Coba kata kunci atau saringan lain.</span></div> : <div className="adm-table-wrap">
      <table className="adm-table">
        <thead><tr>{header("label", "Nomor")}{header("businessName", "Nama usaha")}{header("sector", "Jenis usaha")}{header("district", "Lokasi")}<th scope="col">Status</th>{header("answered", "Jawaban", true)}{header("submittedAt", "Dikirim")}<th scope="col">Hasil</th><th scope="col">Rekomendasi utama</th></tr></thead>
        <tbody>{rows.map((item) => <tr key={item.id} className="adm-row-link" onClick={() => router.push(`/admin/checkup/${item.id}`)}>
          <td><Link className="adm-rowlink" href={`/admin/checkup/${item.id}`} onClick={(event) => event.stopPropagation()}>{item.label}</Link></td>
          <td className="adm-wrap">{item.businessName}</td>
          <td>{item.sector || "—"}</td>
          <td>{item.district || "—"}</td>
          <td><SessionStatusChip status={item.status} /></td>
          <td className="adm-num">{item.answered} / 32</td>
          <td>{item.submittedAt ? fmtDate(item.submittedAt) : <span className="adm-muted">Belum dikirim</span>}</td>
          <td><RunStatusChip status={item.status === "submitted" ? item.runStatus : null} /></td>
          <td>{item.topSet.length ? item.topSet.map(moduleName).join(", ") : "—"}</td>
        </tr>)}</tbody>
      </table>
      <div className="adm-table-caption">{rows.length} dari {items.length} checkup. Klik baris untuk membuka detail.</div>
    </div>}
  </div>;
}
