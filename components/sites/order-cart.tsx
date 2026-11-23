"use client";

// "Keranjang WhatsApp" khas DekatLokal: pengunjung memilih beberapa produk + jumlahnya,
// lalu satu tombol mengirim daftar pesanan rapi (berikut total) ke WhatsApp pemilik.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { formatPrice, type Product, type SiteContent } from "@/lib/sites/schema";
import { MAX_QTY, orderLink, orderTotals, type OrderLine } from "@/lib/sites/order";
import s from "./parts.module.css";

type Action = { type: "add"; item: Product } | { type: "change"; name: string; delta: number } | { type: "clear" };

function reducer(lines: OrderLine[], action: Action): OrderLine[] {
  if (action.type === "clear") return [];
  if (action.type === "add") {
    const existing = lines.find((line) => line.name === action.item.name);
    if (existing) return lines.map((line) => (line === existing ? { ...line, qty: Math.min(MAX_QTY, line.qty + 1) } : line));
    return [...lines, { name: action.item.name, price: action.item.price, qty: 1 }];
  }
  return lines
    .map((line) => (line.name === action.name ? { ...line, qty: Math.min(MAX_QTY, line.qty + action.delta) } : line))
    .filter((line) => line.qty > 0);
}

const OrderContext = createContext<{ lines: OrderLine[]; dispatch: (action: Action) => void } | null>(null);

/** Dipasang di akar template (kecuali kartu galeri). */
export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const value = useMemo(() => ({ lines, dispatch }), [lines]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

/**
 * Tombol "Pesan" pada kartu produk. Tanpa provider (kartu galeri) atau tanpa nomor WhatsApp,
 * tetap menjadi tautan biasa supaya tampilan template tidak berubah.
 */
export function AddToOrder({ item, className, children, label, fallbackHref }: { item: Product; className?: string; children: ReactNode; label: string; fallbackHref: string }) {
  const context = useContext(OrderContext);
  const line = context?.lines.find((entry) => entry.name === item.name);
  if (!context) {
    return <a className={className} href={fallbackHref} {...(fallbackHref.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })} aria-label={label}>{children}</a>;
  }
  if (line) {
    return <span className={s.stepper} role="group" aria-label={`Jumlah ${item.name}`}>
      <button type="button" onClick={() => context.dispatch({ type: "change", name: item.name, delta: -1 })} aria-label={`Kurangi ${item.name}`}><Minus size={16} aria-hidden="true" /></button>
      <output aria-live="polite">{line.qty}</output>
      <button type="button" onClick={() => context.dispatch({ type: "change", name: item.name, delta: 1 })} aria-label={`Tambah ${item.name}`} disabled={line.qty >= MAX_QTY}><Plus size={16} aria-hidden="true" /></button>
    </span>;
  }
  return <button type="button" className={`${s.orderReset} ${className ?? ""}`} onClick={() => context.dispatch({ type: "add", item })} aria-label={label}>{children}</button>;
}

/** Bar pesan menempel di bawah: CTA WhatsApp biasa, atau ringkasan pesanan bila ada yang dipilih. */
export function OrderBar({ content, defaultHref, defaultLabel, className, icon }: { content: SiteContent; defaultHref: string; defaultLabel: string; className?: string; icon: ReactNode }) {
  const context = useContext(OrderContext);
  const lines = context?.lines ?? [];
  const external = (href: string) => (href.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" });
  if (!lines.length) {
    return <div className={s.stickyWrap}>
      <a className={`${s.sticky} ${className ?? ""}`} href={defaultHref} {...external(defaultHref)} data-site-order>{icon}<span>{defaultLabel}</span></a>
    </div>;
  }
  const { items, total, hasUnpriced } = orderTotals(lines);
  const href = orderLink(content, lines) ?? "#kontak";
  return <div className={s.stickyWrap}>
    <div className={s.cartBar} role="region" aria-label="Pesananmu">
      <ShoppingBag size={18} aria-hidden="true" className={s.cartIcon} />
      <span className={s.cartSummary}>
        <strong>{items} item</strong>
        <small>{formatPrice(total)}{hasUnpriced ? " + tanya harga" : ""}</small>
      </span>
      <button type="button" className={s.cartClear} onClick={() => context?.dispatch({ type: "clear" })} aria-label="Kosongkan pesanan"><X size={16} aria-hidden="true" /></button>
      <a className={`${s.sticky} ${s.cartSend} ${className ?? ""}`} href={href} {...external(href)} data-site-order>{icon}<span>Kirim pesanan</span></a>
    </div>
  </div>;
}
