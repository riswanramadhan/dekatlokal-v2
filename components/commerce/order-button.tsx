"use client";

import { useState } from "react";
import { api } from "@/components/digital-checkup/api";
import type { ProductCode } from "@/lib/commerce/catalog";

type OrderResult = { order: { code: string }; whatsappUrl: string; priceLabel: string };

/**
 * Tombol pesan produk berbayar. Membuat pesanan (dc_orders) lalu membuka WhatsApp admin
 * dengan kode pesanan supaya pembayaran manual mudah dicocokkan.
 */
export function OrderButton({ product, resourceId = null, label = "Pesan sekarang", note = "", className = "dc-primary", onOrdered }: {
  product: ProductCode;
  resourceId?: string | null;
  label?: string;
  note?: string;
  className?: string;
  onOrdered?: (code: string) => void;
}) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  const order = async () => {
    setBusy(true); setError("");
    // Buka tab dulu agar tidak diblokir browser, lalu arahkan setelah pesanan tercatat.
    const popup = window.open("", "_blank");
    try {
      const result = await api<OrderResult>("commerce", "POST", { action: "order", product, resourceId, note });
      setMessage(`Pesanan ${result.order.code} tercatat. Selesaikan pembayaran lewat WhatsApp, admin akan mengaktifkannya.`);
      onOrdered?.(result.order.code);
      if (popup) popup.location.href = result.whatsappUrl; else window.location.href = result.whatsappUrl;
    } catch (e) {
      popup?.close();
      setError(e instanceof Error ? e.message : "Pesanan belum tercatat. Coba lagi.");
    } finally { setBusy(false); }
  };
  return <div className="cm-order">
    <button className={className} disabled={busy} onClick={order} type="button">{busy ? "Mencatat pesanan…" : label}</button>
    {message ? <p className="cm-order-note" role="status">{message}</p> : null}
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
  </div>;
}

/** Tombol mulai masa coba gratis sekali pakai (mis. AI Admin 7 hari, website 14 hari). */
export function TrialButton({ feature, resourceId = null, label, className = "dc-secondary", onStarted }: {
  feature: "site_publish" | "ai_admin";
  resourceId?: string | null;
  label: string;
  className?: string;
  onStarted?: () => void;
}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const start = async () => {
    setBusy(true); setError("");
    try { await api("commerce", "POST", { action: "trial", feature, resourceId }); onStarted?.(); }
    catch (e) { setError(e instanceof Error ? e.message : "Masa coba belum bisa dimulai."); }
    finally { setBusy(false); }
  };
  return <div className="cm-order">
    <button className={className} disabled={busy} onClick={start} type="button">{busy ? "Menyiapkan…" : label}</button>
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
  </div>;
}
