// Daftar pesanan pengunjung → pesan WhatsApp yang rapi untuk pemilik usaha. Murni (client & test).
import { formatPrice, waLink, type SiteContent } from "./schema";

export interface OrderLine {
  name: string;
  price: number | null;
  qty: number;
}

export const MAX_QTY = 99;

export function orderTotals(lines: OrderLine[]) {
  const items = lines.reduce((sum, line) => sum + line.qty, 0);
  const priced = lines.filter((line) => line.price !== null);
  const total = priced.reduce((sum, line) => sum + (line.price ?? 0) * line.qty, 0);
  return { items, total, hasUnpriced: priced.length < lines.length };
}

export function orderMessage(content: Pick<SiteContent, "businessName">, lines: OrderLine[]) {
  const rows = lines.map((line) => `• ${line.qty}× ${line.name}${line.price === null ? " (tanya harga)" : ` — ${formatPrice(line.price * line.qty)}`}`);
  const { total, hasUnpriced } = orderTotals(lines);
  return [
    `Halo ${content.businessName}, saya mau pesan:`,
    ...rows,
    "",
    `Total: ${formatPrice(total)}${hasUnpriced ? " + item yang perlu ditanyakan harganya" : ""}`,
    "",
    "Nama:",
    "Diantar ke / ambil di tempat:",
    "",
    "(Pesanan dari website, dibuat dengan DekatLokal)",
  ].join("\n");
}

/** Tautan WhatsApp berisi pesanan; null bila nomor WhatsApp belum diisi. */
export function orderLink(content: Pick<SiteContent, "businessName" | "whatsapp">, lines: OrderLine[]) {
  return waLink(content.whatsapp, orderMessage(content, lines));
}
