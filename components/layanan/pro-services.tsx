"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight, Bot, Check, Download, FileText, LayoutTemplate, MessageCircle } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { OrderButton } from "@/components/commerce/order-button";
import { ORDER_STATUS_LABEL, formatRupiah, priceLabel, productByCode, type ProductCode } from "@/lib/commerce/catalog";
import { adminWhatsApp } from "@/lib/digital-checkup/contact";
import type { LayananOverview } from "@/lib/layanan/overview";
import { serviceState, type ServiceState } from "@/lib/layanan/service-status";
import {
  ACCESS_METHODS, MANAGER_ACCESS, OPEN_STATUSES, STATUS_LABEL, WEBSITE_PLATFORMS, storedConsultationSchema, windowLabel,
  type ConsultationPayload, type GbpPayload, type WebsiteCarePayload,
} from "@/lib/layanan/request-schema";
import { ConsultationForm, GbpForm, WebsiteCareForm } from "./request-forms";

type Request = LayananOverview["requests"][number];
const when = (iso: string | null) => iso ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Makassar" }).format(new Date(iso)) : "—";
const slotDate = (value: string) => { try { return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); } catch { return value; } };
const labelOf = (items: readonly (readonly [string, string])[], code: unknown) => items.find(([value]) => value === code)?.[1] ?? String(code ?? "—");

function StatusPill({ state }: { state: ServiceState }) {
  return <span className={`cm-pill is-${state.state}`}>{state.label}</span>;
}

function RequestStatus({ request, children }: { request: Request; children?: ReactNode }) {
  return <div className="cm-request">
    <div className="cm-request-head"><strong>{STATUS_LABEL[request.status]}</strong><span>Dikirim {when(request.createdAt)}</span></div>
    {children}
  </div>;
}

function ServiceCard({ id, product, state, intro, onOrdered, children }: { id: string; product: ProductCode; state: ServiceState; intro?: ReactNode; onOrdered: () => void; children?: ReactNode }) {
  const item = productByCode(product)!;
  return <article className={`cm-service is-${state.state}`} id={id} aria-labelledby={`${id}-title`}>
    <div className="cm-service-head">
      <div><h2 id={`${id}-title`}>{item.name}</h2><p>{item.tagline}</p></div>
      <StatusPill state={state} />
    </div>
    <p className="cm-price"><strong>{formatRupiah(item.price)}</strong><span>{item.period === "month" ? "per bulan" : "sekali bayar"}</span></p>
    <ul className="cm-bullets">{item.bullets.map((bullet) => <li key={bullet}><Check size={15} aria-hidden="true" />{bullet}</li>)}</ul>
    {intro}
    {state.state === "none" ? <OrderButton product={product} label={`Pesan · ${priceLabel(item)}`} onOrdered={onOrdered} /> : null}
    {state.state === "pending" ? <div className="cm-pending">
      <p>Pesanan <span className="cm-code">{state.pendingCode}</span> menunggu pembayaran. Kirim bukti transfer lewat WhatsApp; admin mengaktifkan setelah pembayaran diterima.</p>
      <OrderButton product={product} label="Buka WhatsApp pembayaran" className="dc-secondary" />
    </div> : null}
    {state.state === "active" ? <div className="cm-next">{children}</div> : null}
  </article>;
}

export function ProServices({ initial, name }: { initial: LayananOverview | null; name: string }) {
  const [data, setData] = useState(initial), [error, setError] = useState(initial ? "" : "Data layanan belum bisa dimuat."), [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(""), [pdfBusy, setPdfBusy] = useState(false), [pdfError, setPdfError] = useState("");

  const reload = async () => {
    try { setData(await api<LayananOverview>("layanan")); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Data layanan belum bisa dimuat."); }
  };
  const saved = (next: LayananOverview, updated: boolean) => { setData(next); setEditing(""); setNotice(updated ? "Perubahan tersimpan." : "Terkirim. Admin akan menghubungimu lewat WhatsApp."); };

  const downloadPro = async () => {
    setPdfBusy(true); setPdfError("");
    try {
      const response = await fetch("/api/digital-checkup/layanan/laporan-pro", { cache: "no-store" });
      if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error || "Laporan belum bisa diunduh. Coba lagi."); }
      const file = await response.blob(), href = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = href; anchor.download = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? "checkup-pro.pdf"; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (e) { setPdfError(e instanceof Error ? e.message : "Laporan belum bisa diunduh."); }
    finally { setPdfBusy(false); }
  };

  if (!data) return <main className="dc-page cm-pro">
    <div className="cm-pro-shell"><div className="dc-panel"><h1>Layanan Pro</h1><p className="cm-order-error" role="alert">{error}</p><button className="dc-primary" onClick={() => void reload()} type="button">Coba lagi</button></div></div>
  </main>;

  const orders = data.orders, requests = data.requests;
  const states = {
    checkup_pro: serviceState(data.access.checkup_pro, orders, "checkup_pro"),
    gbp: serviceState(data.access.gbp, orders, "gbp_optimization"),
    website_care: serviceState(data.access.website_care, orders, "website_care_monthly"),
  };
  const latest = (kind: Request["kind"], filter: (item: Request) => boolean = (item) => item.status !== "cancelled") => requests.find((item) => item.kind === kind && filter(item));
  const booking = latest("consultation"), gbp = latest("gbp"), care = latest("website_care", (item) => OPEN_STATUSES.includes(item.status));
  const careDone = requests.filter((item) => item.kind === "website_care" && item.status === "done").length;
  const bookingPayload = booking ? storedConsultationSchema.safeParse(booking.payload) : null;

  return <main className="dc-page cm-pro">
    <div className="cm-pro-shell">
      <header className="cm-pro-top">
        <Link href="/dashboard" aria-label="Kembali ke ruang belajar"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={125} height={38} priority unoptimized /></Link>
        <Link className="cm-pro-back" href="/dashboard">Ruang belajar</Link>
      </header>

      <section className="cm-pro-hero">
        <p className="dc-eyebrow">Layanan Pro</p>
        <h1>Bantuan lanjutan untuk {data.prefill.businessName || name || "usahamu"}.</h1>
        <p>Pilih yang benar-benar kamu butuhkan. Pembayaran manual lewat WhatsApp atau transfer, dan layanan aktif setelah admin mengonfirmasi pembayaranmu.</p>
        <ol className="cm-steps" aria-label="Cara kerja">
          <li><span>1</span>Pesan layanan</li>
          <li><span>2</span>Bayar lewat WhatsApp/transfer</li>
          <li><span>3</span>Admin aktifkan, lalu isi data</li>
        </ol>
      </section>

      {notice ? <p className="cm-order-note cm-banner" role="status">{notice}</p> : null}
      {error ? <p className="cm-order-error cm-banner" role="alert">{error}</p> : null}

      <div className="cm-services">
        <ServiceCard id="checkup-pro" product="checkup_pro" state={states.checkup_pro} onOrdered={() => void reload()} intro={!data.proReady ? <p className="cm-hint">Laporan Pro disusun dari hasil Digital Checkup-mu. <Link href="/mulai">Selesaikan checkup dulu</Link> supaya laporannya bisa dibuat.</p> : null}>
          <div className="cm-next-block">
            <h3><FileText size={18} aria-hidden="true" />Laporan Pro (PDF)</h3>
            <p>Skor 8 bagian, celah kebutuhan, urutan 7 modul dan alasannya, plus rencana aksi 30 hari.</p>
            <button className="dc-primary" disabled={pdfBusy || !data.proReady} onClick={() => void downloadPro()} type="button"><Download size={17} aria-hidden="true" />{pdfBusy ? "Menyusun PDF…" : "Unduh Laporan Pro"}</button>
            {pdfError ? <p className="cm-order-error" role="alert">{pdfError}</p> : null}
          </div>
          <div className="cm-next-block">
            {booking && bookingPayload?.success && editing !== "consultation" ? <RequestStatus request={booking}>
              <h3>Jadwal konsultasi</h3>
              <ul className="cm-slot-list">{bookingPayload.data.slots.map((slot, index) => <li key={index}>Pilihan {index + 1}: {slotDate(slot.date)}, {windowLabel(slot.window)}</li>)}</ul>
              <p>Topik: {bookingPayload.data.topic}</p>
              {booking.status === "new" ? <button className="dc-text-button" onClick={() => setEditing("consultation")} type="button">Ubah jadwal</button> : null}
            </RequestStatus> : <ConsultationForm key={booking?.id ?? "new"} initial={booking?.status === "new" ? booking.payload as Partial<ConsultationPayload> : undefined} whatsapp={data.prefill.whatsapp} onSaved={saved} submitLabel={booking?.status === "new" ? "Simpan jadwal baru" : undefined} />}
          </div>
        </ServiceCard>

        <ServiceCard id="gbp" product="gbp_optimization" state={states.gbp} onOrdered={() => void reload()}>
          {gbp && editing !== "gbp" ? <RequestStatus request={gbp}>
            <dl className="cm-dl">
              <div><dt>Google Maps</dt><dd>{String(gbp.payload.mapsUrl || "Belum ada")}</dd></div>
              <div><dt>Akses pengelola</dt><dd>{labelOf(MANAGER_ACCESS, gbp.payload.managerAccess)}</dd></div>
              <div><dt>Kategori</dt><dd>{String(gbp.payload.category ?? "—")}</dd></div>
            </dl>
            {gbp.status === "new" ? <button className="dc-text-button" onClick={() => setEditing("gbp")} type="button">Ubah data</button> : <p className="cm-hint">Sedang ditangani tim. Ada perubahan? <a href={adminWhatsApp("Halo Admin DekatLokal, saya mau menambahkan info untuk Optimasi Google Business Profile.")} target="_blank" rel="noopener noreferrer">Chat admin</a>.</p>}
          </RequestStatus> : <GbpForm key={gbp?.id ?? "new"} initial={gbp?.status === "new" ? gbp.payload as Partial<GbpPayload> : undefined} prefill={data.prefill} onSaved={saved} />}
        </ServiceCard>

        <ServiceCard id="website-care" product="website_care_monthly" state={states.website_care} onOrdered={() => void reload()}>
          {states.website_care.daysLeft !== null ? <p className="cm-hint">Masa aktif tersisa {states.website_care.daysLeft} hari{careDone ? ` · ${careDone} permintaan selesai` : ""}.</p> : null}
          {care && editing !== "website_care" ? <RequestStatus request={care}>
            <dl className="cm-dl">
              <div><dt>Website</dt><dd>{String(care.payload.websiteUrl ?? "—")}</dd></div>
              <div><dt>Platform</dt><dd>{labelOf(WEBSITE_PLATFORMS, care.payload.platform)}</dd></div>
              <div><dt>Akses</dt><dd>{labelOf(ACCESS_METHODS, care.payload.accessMethod)}</dd></div>
            </dl>
            {care.status === "new" ? <button className="dc-text-button" onClick={() => setEditing("website_care")} type="button">Ubah permintaan</button> : null}
          </RequestStatus> : <WebsiteCareForm key={care?.id ?? "new"} initial={care?.status === "new" ? care.payload as Partial<WebsiteCarePayload> : undefined} prefill={data.prefill} onSaved={saved} />}
          <div className="cm-renew">
            {states.website_care.pendingCode
              ? <p className="cm-hint">Perpanjangan <span className="cm-code">{states.website_care.pendingCode}</span> menunggu pembayaran.</p>
              : <OrderButton product="website_care_monthly" label="Perpanjang 1 bulan" className="dc-secondary" onOrdered={() => void reload()} />}
          </div>
        </ServiceCard>
      </div>

      <section className="cm-free" aria-labelledby="free-title">
        <h2 id="free-title">Mau mulai dari yang gratis?</h2>
        <div className="cm-free-grid">
          <Link className="cm-free-card" href="/templates"><LayoutTemplate size={22} aria-hidden="true" /><span><strong>Website gratis dari template</strong><small>Pilih template dan coba gratis dulu.</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
          <Link className="cm-free-card" href="/dashboard/website"><Bot size={22} aria-hidden="true" /><span><strong>AI Admin untuk websitemu</strong><small>Asisten chat yang menjawab pelanggan 24 jam.</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="cm-history" aria-labelledby="orders-title">
        <h2 id="orders-title">Pesanan saya</h2>
        {orders.length === 0 ? <p className="cm-hint">Belum ada pesanan.</p> : <ul className="cm-history-list">{orders.map((order) => {
          const product = productByCode(order.productCode);
          return <li key={order.id}>
            <div><strong>{product?.name ?? order.productCode}</strong><span><span className="cm-code">{order.code}</span> · {when(order.createdAt)}</span></div>
            <div><span>{formatRupiah(order.amount)}{product?.period === "month" ? "/bulan" : ""}</span><span className={`cm-pill is-${order.status === "active" ? "active" : order.status === "pending" ? "pending" : "none"}`}>{ORDER_STATUS_LABEL[order.status]}</span></div>
          </li>;
        })}</ul>}
      </section>

      <p className="cm-help"><MessageCircle size={16} aria-hidden="true" />Ada pertanyaan sebelum memesan? <a href={adminWhatsApp("Halo Admin DekatLokal, saya mau tanya tentang Layanan Pro.")} target="_blank" rel="noopener noreferrer">Chat admin di WhatsApp</a></p>
    </div>
  </main>;
}
