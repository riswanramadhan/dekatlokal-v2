"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/digital-checkup/api";
import { ORDER_STATUS_LABEL, formatRupiah, productByCode } from "@/lib/commerce/catalog";
import type { AdminOrder } from "@/lib/commerce/orders";

const FILTERS = [["pending", "Menunggu"], ["active", "Aktif"], ["cancelled", "Dibatalkan"], ["all", "Semua"]] as const;
const when = (iso: string | null) => iso ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(iso)) : "—";
const waLink = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "62");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : "";
};

export function OrdersAdmin({ name }: { name: string }) {
  const [status, setStatus] = useState<(typeof FILTERS)[number][0]>("pending");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState("");
  const fetchOrders = useCallback(() => api<{ orders: AdminOrder[] }>(`commerce/admin?status=${status}`).then((data) => data.orders), [status]);
  const load = async () => {
    setError("");
    try { setOrders(await fetchOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : "Pesanan belum bisa dimuat."); }
  };
  useEffect(() => {
    let live = true;
    fetchOrders()
      .then((next) => { if (live) { setOrders(next); setError(""); } })
      .catch((e: Error) => { if (live) setError(e.message || "Pesanan belum bisa dimuat."); });
    return () => { live = false; };
  }, [fetchOrders]);

  const act = async (order: AdminOrder, action: "activate" | "cancel") => {
    const product = productByCode(order.productCode);
    const question = action === "activate"
      ? `Aktifkan ${product?.name ?? order.productCode} untuk ${order.businessName || order.email}? Pastikan pembayaran ${formatRupiah(order.amount)} sudah diterima.`
      : `Batalkan pesanan ${order.code}?`;
    if (!window.confirm(question)) return;
    const note = window.prompt("Catatan admin (opsional), mis. bukti transfer / nama rekening:", "") ?? "";
    setBusy(order.id);
    try { await api("commerce/admin", "POST", { action, orderId: order.id, note }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Aksi gagal."); }
    finally { setBusy(""); }
  };

  const pendingTotal = (orders ?? []).filter((order) => order.status === "pending").reduce((sum, order) => sum + order.amount, 0);

  return <main className="dc-page cm-admin">
    <div className="cm-admin-top">
      <div>
        <p className="dc-eyebrow">Admin · {name || "DekatLokal"}</p>
        <h1>Pesanan & langganan</h1>
        <p className="dc-note">Pembayaran manual: cocokkan kode pesanan di WhatsApp/transfer, lalu klik Aktifkan. Hak akses pengguna langsung berlaku.</p>
      </div>
      <div className="cm-admin-links">
        <Link className="dc-secondary" href="/admin/permintaan">Permintaan layanan</Link>
        <Link className="dc-secondary" href="/admin">Dashboard riset</Link>
      </div>
    </div>
    <div className="cm-filter" role="tablist" aria-label="Filter status">
      {FILTERS.map(([value, label]) => <button key={value} role="tab" aria-selected={status === value} className={status === value ? "is-active" : ""} onClick={() => setStatus(value)} type="button">{label}</button>)}
    </div>
    {status === "pending" && orders?.length ? <p className="cm-summary">{orders.length} pesanan menunggu · potensi {formatRupiah(pendingTotal)}</p> : null}
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
    {!orders ? <p className="dc-note">Memuat pesanan…</p> : orders.length === 0 ? <div className="dc-panel"><p className="dc-note">Belum ada pesanan dengan status ini.</p></div> :
      <div className="cm-order-list">{orders.map((order) => {
        const product = productByCode(order.productCode);
        const contact = waLink(order.whatsapp, `Halo ${order.businessName || ""}, ini DekatLokal soal pesanan ${order.code} (${product?.name ?? order.productCode}).`);
        return <article key={order.id} className="cm-order-card">
          <div className="cm-order-head">
            <div><span className="cm-code">{order.code}</span><h2>{product?.name ?? order.productCode}</h2><p>{order.businessName || "Tanpa nama usaha"} · {order.email || "email tidak ada"}</p></div>
            <span className={`dc-badge${order.status === "active" ? " is-ready" : ""}`}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
          <dl className="cm-order-meta">
            <div><dt>Nominal</dt><dd>{formatRupiah(order.amount)}{product?.period === "month" ? "/bulan" : ""}</dd></div>
            <div><dt>Dipesan</dt><dd>{when(order.createdAt)}</dd></div>
            <div><dt>Diaktifkan</dt><dd>{when(order.activatedAt)}</dd></div>
            {order.resourceId ? <div><dt>Website</dt><dd><code>{order.resourceId.slice(0, 8)}</code></dd></div> : null}
          </dl>
          {order.customerNote ? <p className="dc-note">Catatan pelanggan: {order.customerNote}</p> : null}
          {order.adminNote ? <p className="dc-note">Catatan admin: {order.adminNote}</p> : null}
          <div className="cm-order-actions">
            {contact ? <a className="dc-secondary" href={contact} target="_blank" rel="noopener noreferrer">Chat pelanggan</a> : null}
            {order.status === "pending" ? <>
              <button className="dc-primary" disabled={busy === order.id} onClick={() => act(order, "activate")} type="button">{busy === order.id ? "Memproses…" : "Aktifkan"}</button>
              <button className="dc-danger-button" disabled={busy === order.id} onClick={() => act(order, "cancel")} type="button">Batalkan</button>
            </> : null}
          </div>
        </article>;
      })}</div>}
  </main>;
}
